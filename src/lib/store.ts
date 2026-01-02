import { headers } from 'next/headers';
import { PoolClient } from '@neondatabase/serverless';
import { pool, ensureSchema } from './db';
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

async function withDb<T>(
  operation: (client: PoolClient, host: string) => Promise<T>,
  options: { requireAdminSetup?: boolean } = {}
): Promise<T> {
  if (options.requireAdminSetup) {
    const adminData = await getAdminData();
    if (!adminData?.credential) {
      throw new Error('Cannot save data until admin is setup');
    }
  }

  await ensureSchema();
  const headerList = await headers();
  const host = headerList.get('host') || 'default';
  
  const client = await pool.connect();
  try {
    return await operation(client, host);
  } finally {
    client.release();
  }
}

export async function getIdea(id: string): Promise<Idea | null> {
  return withDb(async (client, host) => {
    const ideaRes = await client.query(
      'SELECT * FROM ideas WHERE host = $1 AND id = $2',
      [host, id]
    );

    if (ideaRes.rows.length === 0) return null;
    const row = ideaRes.rows[0];

    const commentsRes = await client.query(
      'SELECT * FROM comments WHERE host = $1 AND idea_id = $2 ORDER BY created_at ASC',
      [host, id]
    );

    const comments: Comment[] = commentsRes.rows.map(c => ({
      id: c.id,
      text: c.text,
      authorEmail: c.author_email,
      createdAt: Number(c.created_at)
    }));

    return {
      id: row.id,
      title: row.title,
      description: row.description,
      authorEmail: row.author_email,
      votes: row.votes,
      createdAt: Number(row.created_at),
      comments
    };
  });
}

export async function getIdeas(): Promise<Idea[]> {
  // We handle the try/catch inside the operation or wrapper?
  // The original function had a try/catch returning [] on error.
  // We can keep that behavior.
  try {
    return await withDb(async (client, host) => {
      const ideasRes = await client.query(
        'SELECT * FROM ideas WHERE host = $1 ORDER BY created_at DESC',
        [host]
      );
      
      if (ideasRes.rows.length === 0) {
        // If no ideas found, initialize with default data
        // Note: This calls createIdea which also uses withDb. 
        // Recursive calls to withDb are fine as they just get a new client.
        // Ideally we would reuse the client but createIdea is a separate export.
        // For initialization this overhead is acceptable.
        await Promise.all(initialData.map(idea => createIdea(idea, true)));
        return initialData;
      }

      const ideas: Idea[] = ideasRes.rows.map(row => ({
        id: row.id,
        title: row.title,
        description: row.description,
        authorEmail: row.author_email,
        votes: row.votes,
        createdAt: Number(row.created_at),
        comments: []
      }));

      const ideaIds = ideas.map(i => i.id);

      // Fetch all comments for these ideas to avoid N+1 query problem
      const commentsRes = await client.query(
        'SELECT * FROM comments WHERE host = $1 AND idea_id = ANY($2) ORDER BY created_at ASC',
        [host, ideaIds]
      );

      const commentsByIdeaId = new Map<string, Comment[]>();
      for (const c of commentsRes.rows) {
        if (!commentsByIdeaId.has(c.idea_id)) {
          commentsByIdeaId.set(c.idea_id, []);
        }
        commentsByIdeaId.get(c.idea_id)?.push({
          id: c.id,
          text: c.text,
          authorEmail: c.author_email,
          createdAt: Number(c.created_at)
        });
      }

      for (const idea of ideas) {
        idea.comments = commentsByIdeaId.get(idea.id) || [];
      }
      
      return ideas;
    });
  } catch (error) {
    console.error('Error reading data from DB:', error);
    return [];
  }
}

export async function createIdea(idea: Idea, skipAdminCheck = false) {
  return withDb(async (client, host) => {
    try {
      await client.query('BEGIN');

      await client.query(
        `INSERT INTO ideas (host, id, title, description, author_email, votes, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [host, idea.id, idea.title, idea.description, idea.authorEmail, idea.votes, idea.createdAt]
      );

      if (idea.comments.length > 0) {
        for (const comment of idea.comments) {
          await client.query(
            `INSERT INTO comments (host, idea_id, id, text, author_email, created_at)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [host, idea.id, comment.id, comment.text, comment.authorEmail, comment.createdAt]
          );
        }
      }

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    }
  }, { requireAdminSetup: !skipAdminCheck });
}

export async function voteIdea(id: string, increment: number) {
  return withDb(async (client, host) => {
    const res = await client.query(
      `UPDATE ideas 
       SET votes = GREATEST(0, votes + $1) 
       WHERE host = $2 AND id = $3 
       RETURNING votes`,
      [increment, host, id]
    );
    
    if (res.rows.length === 0) throw new Error("Idea not found");
    return res.rows[0].votes;
  }, { requireAdminSetup: true });
}

export async function resetVotes(id: string) {
  return withDb(async (client, host) => {
    await client.query(
      'UPDATE ideas SET votes = 0 WHERE host = $1 AND id = $2',
      [host, id]
    );
  }, { requireAdminSetup: true });
}

export async function addComment(ideaId: string, comment: Comment) {
  return withDb(async (client, host) => {
    const existRes = await client.query('SELECT 1 FROM ideas WHERE host = $1 AND id = $2', [host, ideaId]);
    if (existRes.rows.length === 0) throw new Error("Idea not found");

    await client.query(
      `INSERT INTO comments (host, idea_id, id, text, author_email, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [host, ideaId, comment.id, comment.text, comment.authorEmail, comment.createdAt]
    );
  }, { requireAdminSetup: true });
}

export async function deleteComment(ideaId: string, commentId: string) {
  return withDb(async (client, host) => {
    await client.query(
      'DELETE FROM comments WHERE host = $1 AND idea_id = $2 AND id = $3',
      [host, ideaId, commentId]
    );
  }, { requireAdminSetup: true });
}

export async function deleteIdea(id: string) {
  return withDb(async (client, host) => {
    // Cascade delete will handle comments
    await client.query(
      'DELETE FROM ideas WHERE host = $1 AND id = $2',
      [host, id]
    );
  }, { requireAdminSetup: true });
}

export async function updateIdea(id: string, updates: Partial<Pick<Idea, 'title' | 'description'>>) {
  return withDb(async (client, host) => {
    const fields: string[] = [];
    const values: string[] = [];
    let idx = 1;

    if (updates.title !== undefined) {
      fields.push(`title = $${idx++}`);
      values.push(updates.title);
    }
    if (updates.description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(updates.description);
    }

    if (fields.length > 0) {
      values.push(host);
      values.push(id);
      const res = await client.query(
        `UPDATE ideas SET ${fields.join(', ')} WHERE host = $${idx} AND id = $${idx+1}`,
        values
      );
      if (res.rowCount === 0) throw new Error("Idea not found");
    } else {
      // Check existence even if no updates
      const existRes = await client.query('SELECT 1 FROM ideas WHERE host = $1 AND id = $2', [host, id]);
      if (existRes.rows.length === 0) throw new Error("Idea not found");
    }
    
    // We need to fetch the updated idea to return it.
    // getIdea uses withDb internally, so we can't reuse `client` easily without refactoring getIdea to accept a client.
    // However, since we are inside withDb, we *could* just run the query directly here or call getIdea which gets a NEW connection.
    // For simplicity and correctness (less code change), calling getIdea is fine, though slightly inefficient (2 connections).
    // Optimally: refactor logic to be client-agnostic. But that's a bigger refactor.
    // Let's just return getIdea(id).
    return getIdea(id);
  }, { requireAdminSetup: true });
}

export async function updateComment(ideaId: string, commentId: string, newText: string) {
  return withDb(async (client, host) => {
    const res = await client.query(
      `UPDATE comments SET text = $1 WHERE host = $2 AND idea_id = $3 AND id = $4 RETURNING *`,
      [newText, host, ideaId, commentId]
    );
    
    if (res.rows.length === 0) throw new Error("Comment not found");
    
    const row = res.rows[0];
    return {
      id: row.id,
      text: row.text,
      authorEmail: row.author_email,
      createdAt: Number(row.created_at)
    };
  }, { requireAdminSetup: true });
}
