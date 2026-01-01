import { NextResponse } from 'next/server';
import { getIdeas, saveIdeas } from '@/lib/store';
import { isAuthenticated } from '@/lib/admin';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

async function getUserEmail() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const userPayload = token ? await verifyToken(token) : null;
  if (userPayload && typeof userPayload === 'object' && 'email' in userPayload) {
    return (userPayload as { email: string }).email;
  }
  return null;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { title, description } = body;

  const ideas = await getIdeas();
  const index = ideas.findIndex((i) => i.id === id);

  if (index === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const idea = ideas[index];
  const userEmail = await getUserEmail();
  const isAuthorized = (await isAuthenticated()) || (userEmail && idea.authorEmail === userEmail);

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
  
  const ideas = await getIdeas();
  const idea = ideas.find((i) => i.id === id);
  
  if (!idea) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const userEmail = await getUserEmail();
  const isAuthorized = (await isAuthenticated()) || (userEmail && idea.authorEmail === userEmail);
  
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const filteredIdeas = ideas.filter((i) => i.id !== id);
  await saveIdeas(filteredIdeas);
  return NextResponse.json({ success: true });
}