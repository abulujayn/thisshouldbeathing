
import { NextResponse } from 'next/server';

import { getIdeas, saveIdeas } from '@/lib/store';

import { isAuthenticated } from '@/lib/admin';



export async function POST(

  request: Request,

  { params }: { params: Promise<{ id: string }> }

) {

  if (!(await isAuthenticated())) {

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  }



  const { id } = await params;

  const ideas = await getIdeas();

  const idea = ideas.find((i) => i.id === id);



  if (idea) {

    idea.votes = 0;

    await saveIdeas(ideas);

    return NextResponse.json(idea);

  }



  return NextResponse.json({ error: 'Not found' }, { status: 404 });

}


