import { NextResponse } from 'next/server';
import { voteIdea, getIdea } from '@/lib/store';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { action } = await request.json();
  
  try {
    let increment = 0;
    if (action === 'vote') {
      increment = 1;
    } else if (action === 'unvote') {
      increment = -1;
    }

    if (increment !== 0) {
        await voteIdea(id, increment);
    }
    
    const idea = await getIdea(id);
    if (idea) {
        return NextResponse.json(idea);
    }
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (error) {
      console.error(error);
      return NextResponse.json({ error: 'Failed to vote' }, { status: 500 });
  }
}