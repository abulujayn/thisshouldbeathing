
import { NextResponse } from 'next/server';
import { getIdeas, saveIdeas } from '@/lib/store';
import { isAuthenticated } from '@/lib/admin';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, commentId } = await params;
  const ideas = getIdeas();
  const idea = ideas.find((i) => i.id === id);

  if (idea) {
    idea.comments = idea.comments.filter((c) => c.id !== commentId);
    saveIdeas(ideas);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
