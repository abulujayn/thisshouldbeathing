import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';

export async function POST(request, { params }) {
    const { id } = await params;
    const db = readDB();
    const idea = db.ideas.find(i => i.id === id);
    if (idea) {
        idea.votes = 0;
        writeDB(db);
        return NextResponse.json(idea);
    } else {
        return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
    }
}
