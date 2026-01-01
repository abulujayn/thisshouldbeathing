import { NextResponse } from 'next/server';
import { getIdeas, saveIdeas } from '@/lib/store';
import { isAuthenticated } from '@/lib/admin';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const { id, commentId } = await params;
  const body = await request.json();
  const { text, authorEmail } = body;

  const ideas = await getIdeas();
  const idea = ideas.find((i) => i.id === id);
  if (!idea) {
    return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
  }

  const comment = idea.comments.find((c) => c.id === commentId);
  if (!comment) {
    return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
  }

  const isAuthorized = (await isAuthenticated()) || comment.authorEmail === authorEmail;
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (text !== undefined) comment.text = text;

  await saveIdeas(ideas);
  return NextResponse.json(comment);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const { id, commentId } = await params;
  const body = await request.json().catch(() => ({}));
  const { authorEmail } = body;

  const ideas = await getIdeas();
  const idea = ideas.find((i) => i.id === id);
  if (!idea) {
    return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
  }

  const comment = idea.comments.find((c) => c.id === commentId);
  if (!comment) {
    return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
  }

  const isAuthorized = (await isAuthenticated()) || comment.authorEmail === authorEmail;
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  idea.comments = idea.comments.filter((c) => c.id !== commentId);
  await saveIdeas(ideas);
  return NextResponse.json({ success: true });
}