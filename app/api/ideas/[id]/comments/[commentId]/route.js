import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';

export async function DELETE(request, { params }) {
    const { id: ideaId, commentId } = await params;
    const db = readDB();
    const idea = db.ideas.find(i => i.id === ideaId);
    if (idea) {
        idea.comments = idea.comments.filter(c => c.id !== commentId);
        writeDB(db);
        return NextResponse.json({ success: true });
    } else {
        return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
    }
}
