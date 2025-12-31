import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';

export async function POST(request, { params }) {
    const { id } = await params;
    const { text, author } = await request.json();
    const db = readDB();
    const idea = db.ideas.find(i => i.id === id);
    if (idea) {
        const newComment = {
            id: Date.now().toString(),
            text,
            author: author || 'Anonymous',
            timestamp: Date.now()
        };
        idea.comments.push(newComment);
        writeDB(db);
        return NextResponse.json(newComment);
    } else {
        return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
    }
}
