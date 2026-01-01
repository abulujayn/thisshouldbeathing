import fs from 'fs';
import path from 'path';

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

const DATA_FILE = path.join(process.cwd(), 'ideas_data.json');

// Initialize with some data if the file doesn't exist
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

export function getIdeas(): Idea[] {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data:', error);
    return initialData;
  }
}

export function saveIdeas(ideas: Idea[]) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(ideas, null, 2));
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

// For compatibility with existing imports during transition
export const ideas = getIdeas();