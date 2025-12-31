import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';

export async function DELETE(request, { params }) {
    const { id } = await params;
    const db = readDB();
    db.ideas = db.ideas.filter(i => i.id !== id);
    writeDB(db);
    return NextResponse.json({ success: true });
}
