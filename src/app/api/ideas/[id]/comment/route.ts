import { NextResponse } from 'next/server';
import { getIdeas, saveIdeas } from '@/lib/store';
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
  const ideas = await getIdeas();
  const idea = ideas.find((i) => i.id === id);
  
  if (idea) {
    const newComment = {
      id: Math.random().toString(36).substring(7),
      text: body.text,
      authorEmail: userEmail,
      createdAt: Date.now(),
    };
    idea.comments.push(newComment);
    await saveIdeas(ideas);
    return NextResponse.json(newComment);
  }
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}