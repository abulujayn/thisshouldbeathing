import { NextResponse } from 'next/server';
import { getIdeas, saveIdeas } from '@/lib/store';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const ideas = await getIdeas();
  const idea = ideas.find((i) => i.id === id);
  
  if (idea) {
    const newComment = {
      id: Math.random().toString(36).substring(7),
      text: body.text,
      authorEmail: body.authorEmail,
      createdAt: Date.now(),
    };
    idea.comments.push(newComment);
    await saveIdeas(ideas);
    return NextResponse.json(newComment);
  }
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}