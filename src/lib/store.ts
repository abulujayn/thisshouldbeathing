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

const IDEAS_KEY_PREFIX = 'ideas_data';

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

async function getIdeasKey() {
  const headerList = await headers();
  const host = headerList.get('host') || 'default';
  return `${IDEAS_KEY_PREFIX}:${host}`;
}

export async function getIdeas(): Promise<Idea[]> {
  try {
    const client = await getRedisClient();
    const key = await getIdeasKey();
    const data = await client.get(key);
    
    if (!data) {
      await saveIdeas(initialData);
      return initialData;
    }
    
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data from Redis:', error);
    return initialData;
  }
}

export async function saveIdeas(ideas: Idea[]) {
  const adminData = await getAdminData();
  if (!adminData?.credential) {
    throw new Error('Cannot save data until admin is setup');
  }

  try {
    const client = await getRedisClient();
    const key = await getIdeasKey();
    await client.set(key, JSON.stringify(ideas));
  } catch (error) {
    console.error('Error saving data to Redis:', error);
  }
}
