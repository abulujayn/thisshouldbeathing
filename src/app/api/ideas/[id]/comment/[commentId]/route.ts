import { NextResponse } from 'next/server';
import { getIdea, deleteComment, updateComment } from '@/lib/store';
import { isAuthenticated } from '@/lib/admin';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { updateCommentSchema } from '@/lib/validation';

async function getUserEmail() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const userPayload = token ? await verifyToken(token) : null;
  if (userPayload && typeof userPayload === 'object' && 'email' in userPayload) {
    return (userPayload as { email: string }).email;
  }
  return null;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const { id, commentId } = await params;
  const body = await request.json();

  const validation = updateCommentSchema.safeParse(body);
  if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten().fieldErrors }, { status: 400 });
  }

  const { text } = validation.data;

  const idea = await getIdea(id);
  if (!idea) {
    return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
  }

  const comment = idea.comments.find((c) => c.id === commentId);
  if (!comment) {
    return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
  }

  const userEmail = await getUserEmail();
  const isAuthorized = (await isAuthenticated()) || (userEmail && comment.authorEmail === userEmail);

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const updated = await updateComment(id, commentId, text);
    return NextResponse.json(updated);
  } catch (e) {
      console.error(e);
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const { id, commentId } = await params;

  const idea = await getIdea(id);
  if (!idea) {
    return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
  }

  const comment = idea.comments.find((c) => c.id === commentId);
  if (!comment) {
    return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
  }

  const userEmail = await getUserEmail();
  const isAuthorized = (await isAuthenticated()) || (userEmail && comment.authorEmail === userEmail);

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
      await deleteComment(id, commentId);
      return NextResponse.json({ success: true });
  } catch (e) {
      console.error(e);
      return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
