import { NextResponse } from 'next/server';
import { getIdeas, saveIdeas } from '@/lib/store';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { action } = await request.json();
  const ideas = getIdeas();
  const idea = ideas.find((i) => i.id === id);
  
  if (idea) {
    if (action === 'vote') {
      idea.votes += 1;
    } else if (action === 'unvote') {
      idea.votes = Math.max(0, idea.votes - 1);
    }
    saveIdeas(ideas);
    return NextResponse.json(idea);
  }
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}