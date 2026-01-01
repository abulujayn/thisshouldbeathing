import { NextResponse } from 'next/server';
import { getIdeas, saveIdeas, Idea } from '@/lib/store';

export async function GET() {
  const ideas = await getIdeas();
  return NextResponse.json(ideas);
}

export async function POST(request: Request) {
  const body = await request.json();
  const ideas = await getIdeas();
  const newIdea: Idea = {
    id: Math.random().toString(36).substring(7),
    title: body.title,
    description: body.description,
    votes: 0,
    comments: [],
    createdAt: Date.now(),
  };
  ideas.unshift(newIdea);
  await saveIdeas(ideas);
  return NextResponse.json(newIdea);
}