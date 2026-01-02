import { NextResponse } from 'next/server';
import { addComment, getIdea, Comment } from '@/lib/store';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const userPayload = token ? await verifyToken(token) : null;
  
  if (!userPayload || typeof userPayload !== 'object' || !('email' in userPayload)) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userEmail = (userPayload as { email: string }).email;

  const { id } = await params;
  const body = await request.json();
  
  // Check existence
  const idea = await getIdea(id);
  if (!idea) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const newComment: Comment = {
    id: Math.random().toString(36).substring(7),
    text: body.text,
    authorEmail: userEmail,
    createdAt: Date.now(),
  };
  
  await addComment(id, newComment);
  return NextResponse.json(newComment);
}