
import { NextResponse } from 'next/server';
import { getIdea, resetVotes } from '@/lib/store';
import { isAuthenticated } from '@/lib/admin';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  
  try {
      await resetVotes(id);
      const idea = await getIdea(id);
      if (idea) return NextResponse.json(idea);
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (error) {
      console.error(error);
      return NextResponse.json({ error: 'Failed to reset votes' }, { status: 500 });
  }
}


