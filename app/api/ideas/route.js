import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';

export async function GET() {
    const db = readDB();
    return NextResponse.json(db.ideas);
}

export async function POST(request) {
    const body = await request.json();
    const db = readDB();
    const newIdea = {
        ...body,
        id: Date.now().toString(),
        timestamp: Date.now(),
        votes: 1, // Self vote
        comments: []
    };
    db.ideas.push(newIdea);
    writeDB(db);
    return NextResponse.json(newIdea, { status: 201 });
}
