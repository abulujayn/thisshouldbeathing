
import { NextResponse } from 'next/server';
import { getIdeas, saveIdeas } from '@/lib/store';
import { isAuthenticated } from '@/lib/admin';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const ideas = getIdeas();
  const filteredIdeas = ideas.filter((i) => i.id !== id);
  
  if (ideas.length !== filteredIdeas.length) {
    saveIdeas(filteredIdeas);
    return NextResponse.json({ success: true });
  }
  
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
