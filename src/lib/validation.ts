import { z } from 'zod';

export const createIdeaSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
});

export const updateIdeaSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().min(10).max(1000).optional(),
});

export const createCommentSchema = z.object({
  text: z.string().min(1, 'Comment cannot be empty').max(500, 'Comment must be less than 500 characters'),
});

export const updateCommentSchema = z.object({
  text: z.string().min(1).max(500),
});

export const voteSchema = z.object({
  action: z.enum(['vote', 'unvote']),
});
