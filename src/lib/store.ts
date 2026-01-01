import { getRedisClient } from './redis';

export interface Comment {
  id: string;
  text: string;
  createdAt: number;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  votes: number;
  comments: Comment[];
  createdAt: number;
}

const IDEAS_KEY = 'ideas_data';

const initialData: Idea[] = [
  {
    id: '1',
    title: 'Light Mode by default',
    description: 'The app should detect system preference and set light mode accordingly, as per the latest design guidelines.',
    votes: 5,
    comments: [
      { id: 'c1', text: 'This should definitely be a thing!', createdAt: Date.now() }
    ],
    createdAt: Date.now()
  }
];

export async function getIdeas(): Promise<Idea[]> {
  try {
    const client = await getRedisClient();
    const data = await client.get(IDEAS_KEY);
    
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
  try {
    const client = await getRedisClient();
    await client.set(IDEAS_KEY, JSON.stringify(ideas));
  } catch (error) {
    console.error('Error saving data to Redis:', error);
  }
}
