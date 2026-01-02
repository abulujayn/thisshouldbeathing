import { headers } from 'next/headers';
import { getRedisClient } from './redis';
import { getAdminData } from './admin';

export interface Comment {
  id: string;
  text: string;
  authorEmail: string;
  createdAt: number;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  authorEmail: string;
  votes: number;
  comments: Comment[];
  createdAt: number;
}

const IDEAS_KEY_PREFIX = 'ideas'; // Using granular storage structure

const initialData: Idea[] = [
  {
    id: '1',
    title: 'Light Mode by default',
    description: 'The app should detect system preference and set light mode accordingly, as per the latest design guidelines.',
    authorEmail: 'admin@example.com',
    votes: 5,
    comments: [
      { id: 'c1', text: 'This should definitely be a thing!', authorEmail: 'user@example.com', createdAt: Date.now() }
    ],
    createdAt: Date.now()
  }
];

async function getHost() {
  const headerList = await headers();
  return headerList.get('host') || 'default';
}

function getIdeaKey(host: string, id: string) {
  return `${IDEAS_KEY_PREFIX}:${host}:idea:${id}`;
}

function getIdeaCommentsKey(host: string, id: string) {
  return `${IDEAS_KEY_PREFIX}:${host}:idea:${id}:comment_ids`;
}

function getCommentKey(host: string, ideaId: string, commentId: string) {
    return `${IDEAS_KEY_PREFIX}:${host}:idea:${ideaId}:comment:${commentId}`;
}

function getIdeasIdsKey(host: string) {
  return `${IDEAS_KEY_PREFIX}:${host}:ids`;
}

async function checkAdminSetup() {
  const adminData = await getAdminData();
  if (!adminData?.credential) {
    throw new Error('Cannot save data until admin is setup');
  }
}

export async function getIdea(id: string): Promise<Idea | null> {
  const client = await getRedisClient();
  const host = await getHost();
  const key = getIdeaKey(host, id);
  
  const ideaData = await client.hGetAll(key);
  if (!ideaData || Object.keys(ideaData).length === 0) return null;

  const commentsIdsKey = getIdeaCommentsKey(host, id);
  const commentIds = await client.lRange(commentsIdsKey, 0, -1);
  
  const comments: Comment[] = [];
  if (commentIds.length > 0) {
      const pipeline = client.multi();
      for (const cId of commentIds) {
          pipeline.hGetAll(getCommentKey(host, id, cId));
      }
      const commentResults = await pipeline.exec();
      if (commentResults) {
          for (const res of commentResults) {
              const cData = res as unknown as Record<string, string>;
              if (cData && Object.keys(cData).length > 0) {
                  comments.push({
                      id: cData.id,
                      text: cData.text,
                      authorEmail: cData.authorEmail,
                      createdAt: parseInt(cData.createdAt || '0', 10)
                  });
              }
          }
      }
  }

  return {
    id: ideaData.id,
    title: ideaData.title,
    description: ideaData.description,
    authorEmail: ideaData.authorEmail,
    votes: parseInt(ideaData.votes || '0', 10),
    createdAt: parseInt(ideaData.createdAt || '0', 10),
    comments
  };
}

export async function getIdeas(): Promise<Idea[]> {
  try {
    const client = await getRedisClient();
    const host = await getHost();
    const idsKey = getIdeasIdsKey(host);
    
    const ids = await client.zRange(idsKey, 0, -1, { REV: true });
    
    if (ids.length === 0) {
        const exists = await client.exists(idsKey);
        if (!exists) {
            await Promise.all(initialData.map(idea => createIdea(idea, true)));
            return initialData;
        }
        return [];
    }

    const ideas: Idea[] = [];
    // We fetch ideas one by one (or in small batches) to handle nested comments cleanly
    // A single multi pipeline for ALL ideas + ALL comments would be complex to parse.
    // For now, let's use a simpler loop with getIdea. 
    // Optimization: we can still pipeline the getIdea calls.
    for (const id of ids) {
        const idea = await getIdea(id);
        if (idea) ideas.push(idea);
    }
    
    return ideas;
  } catch (error) {
    console.error('Error reading data from Redis:', error);
    return [];
  }
}

// Deprecated: kept for signature compatibility during refactor if needed, 
// but we should replace usages.
export async function saveIdeas(ideas: Idea[]) {
    console.warn("saveIdeas is deprecated. Use granular functions.");
    throw new Error("saveIdeas is deprecated. Refactor to use createIdea/updateIdea.");
}

export async function createIdea(idea: Idea, skipAdminCheck = false) {
  if (!skipAdminCheck) await checkAdminSetup();
  
  const client = await getRedisClient();
  const host = await getHost();
  const id = idea.id;
  
  const multi = client.multi();
  
  multi.hSet(getIdeaKey(host, id), {
    id: idea.id,
    title: idea.title,
    description: idea.description,
    authorEmail: idea.authorEmail,
    votes: idea.votes.toString(),
    createdAt: idea.createdAt.toString()
  });
  
  if (idea.comments.length > 0) {
      for (const comment of idea.comments) {
          const cKey = getCommentKey(host, id, comment.id);
          multi.hSet(cKey, {
              id: comment.id,
              text: comment.text,
              authorEmail: comment.authorEmail,
              createdAt: comment.createdAt.toString()
          });
          multi.rPush(getIdeaCommentsKey(host, id), comment.id);
      }
  }
  
  multi.zAdd(getIdeasIdsKey(host), { score: idea.createdAt, value: id });
  
  await multi.exec();
}

export async function voteIdea(id: string, increment: number) {
    await checkAdminSetup();
    const client = await getRedisClient();
    const host = await getHost();
    const key = getIdeaKey(host, id);
    
    const exists = await client.exists(key);
    if (!exists) throw new Error("Idea not found");

    const newVotes = await client.hIncrBy(key, 'votes', increment);
    if (newVotes < 0) {
        await client.hSet(key, 'votes', 0);
        return 0;
    }
    return newVotes;
}

export async function resetVotes(id: string) {
    await checkAdminSetup();
    const client = await getRedisClient();
    const host = await getHost();
    await client.hSet(getIdeaKey(host, id), 'votes', 0);
}

export async function addComment(ideaId: string, comment: Comment) {
    await checkAdminSetup();
    const client = await getRedisClient();
    const host = await getHost();
    const key = getIdeaKey(host, ideaId);
    
    const exists = await client.exists(key);
    if (!exists) throw new Error("Idea not found");
    
    const multi = client.multi();
    const cKey = getCommentKey(host, ideaId, comment.id);
    multi.hSet(cKey, {
        id: comment.id,
        text: comment.text,
        authorEmail: comment.authorEmail,
        createdAt: comment.createdAt.toString()
    });
    multi.rPush(getIdeaCommentsKey(host, ideaId), comment.id);
    await multi.exec();
}

export async function deleteComment(ideaId: string, commentId: string) {
    await checkAdminSetup();
    const client = await getRedisClient();
    const host = await getHost();
    
    const multi = client.multi();
    multi.del(getCommentKey(host, ideaId, commentId));
    multi.lRem(getIdeaCommentsKey(host, ideaId), 0, commentId);
    await multi.exec();
}

export async function deleteIdea(id: string) {
    await checkAdminSetup();
    const client = await getRedisClient();
    const host = await getHost();
    
    // Get all comment IDs first to delete them
    const commentIds = await client.lRange(getIdeaCommentsKey(host, id), 0, -1);
    
    const multi = client.multi();
    multi.del(getIdeaKey(host, id));
    for (const cId of commentIds) {
        multi.del(getCommentKey(host, id, cId));
    }
    multi.del(getIdeaCommentsKey(host, id));
    multi.zRem(getIdeasIdsKey(host), id);
    await multi.exec();
}

export async function updateIdea(id: string, updates: Partial<Pick<Idea, 'title' | 'description'>>) {
  await checkAdminSetup();
  const client = await getRedisClient();
  const host = await getHost();
  const key = getIdeaKey(host, id);

  const exists = await client.exists(key);
  if (!exists) throw new Error("Idea not found");

  const fields: Record<string, string> = {};
  if (updates.title !== undefined) fields.title = updates.title;
  if (updates.description !== undefined) fields.description = updates.description;

  if (Object.keys(fields).length > 0) {
      await client.hSet(key, fields);
  }
  
  return getIdea(id);
}

export async function updateComment(ideaId: string, commentId: string, newText: string) {
    await checkAdminSetup();
    const client = await getRedisClient();
    const host = await getHost();
    const cKey = getCommentKey(host, ideaId, commentId);
    
    const exists = await client.exists(cKey);
    if (!exists) throw new Error("Comment not found");
    
    await client.hSet(cKey, 'text', newText);
    
    const cData = await client.hGetAll(cKey);
    return {
        id: cData.id,
        text: cData.text,
        authorEmail: cData.authorEmail,
        createdAt: parseInt(cData.createdAt || '0', 10)
    };
}
