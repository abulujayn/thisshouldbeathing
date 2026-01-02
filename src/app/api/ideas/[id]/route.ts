import { NextResponse } from 'next/server';
import { getIdea, updateIdea, deleteIdea } from '@/lib/store';
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

  const idea = await getIdea(id);

  if (!idea) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const userEmail = await getUserEmail();
  const isAuthorized = (await isAuthenticated()) || (userEmail && idea.authorEmail === userEmail);

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
      const updated = await updateIdea(id, { title, description });
      return NextResponse.json(updated);
  } catch (e) {
      console.error(e);
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const idea = await getIdea(id);
  
  if (!idea) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const userEmail = await getUserEmail();
  const isAuthorized = (await isAuthenticated()) || (userEmail && idea.authorEmail === userEmail);
  
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
      await deleteIdea(id);
      return NextResponse.json({ success: true });
  } catch (e) {
      console.error(e);
      return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}