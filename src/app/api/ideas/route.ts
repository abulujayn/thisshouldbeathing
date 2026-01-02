import { NextResponse } from 'next/server';
import { getIdeas, createIdea, Idea } from '@/lib/store';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { createIdeaSchema } from '@/lib/validation';

export async function GET() {
  const ideas = await getIdeas();
  return NextResponse.json(ideas);
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const userPayload = token ? await verifyToken(token) : null;
  
  if (!userPayload || typeof userPayload !== 'object' || !('email' in userPayload)) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userEmail = (userPayload as { email: string }).email;
  const body = await request.json();

  const validation = createIdeaSchema.safeParse(body);
  if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten().fieldErrors }, { status: 400 });
  }

  const { title, description } = validation.data;

  const newIdea: Idea = {
    id: crypto.randomUUID(),
    title,
    description,
    authorEmail: userEmail,
    votes: 0,
    comments: [],
    createdAt: Date.now(),
  };
  
  await createIdea(newIdea);
  return NextResponse.json(newIdea);
}