import { NextResponse } from 'next/server';
import { getIdeas, saveIdeas } from '@/lib/store';
import { isAuthenticated } from '@/lib/admin';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { title, description, authorEmail } = body;

  const ideas = await getIdeas();
  const index = ideas.findIndex((i) => i.id === id);

  if (index === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const idea = ideas[index];
  const isAuthorized = (await isAuthenticated()) || idea.authorEmail === authorEmail;

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (title !== undefined) idea.title = title;
  if (description !== undefined) idea.description = description;

  await saveIdeas(ideas);
  return NextResponse.json(idea);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const { authorEmail } = body;

  const ideas = await getIdeas();
  const idea = ideas.find((i) => i.id === id);
  
  if (!idea) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const isAuthorized = (await isAuthenticated()) || idea.authorEmail === authorEmail;
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const filteredIdeas = ideas.filter((i) => i.id !== id);
  await saveIdeas(filteredIdeas);
  return NextResponse.json({ success: true });
}
