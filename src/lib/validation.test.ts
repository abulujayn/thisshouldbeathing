import { describe, it, expect } from 'vitest';
import { createIdeaSchema, updateIdeaSchema, createCommentSchema, updateCommentSchema, voteSchema } from './validation';

describe('Validation Schemas', () => {
  describe('createIdeaSchema', () => {
    it('should validate valid idea', () => {
      const validIdea = {
        title: 'Valid Title',
        description: 'This is a valid description with enough characters.',
      };
      const result = createIdeaSchema.safeParse(validIdea);
      expect(result.success).toBe(true);
    });

    it('should fail if title is too short', () => {
      const invalidIdea = {
        title: 'Hi',
        description: 'This is a valid description with enough characters.',
      };
      const result = createIdeaSchema.safeParse(invalidIdea);
      expect(result.success).toBe(false);
      if (!result.success) {
          expect(result.error.issues[0].message).toContain('at least 3 characters');
      }
    });

    it('should fail if description is too short', () => {
        const invalidIdea = {
          title: 'Valid Title',
          description: 'Short',
        };
        const result = createIdeaSchema.safeParse(invalidIdea);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toContain('at least 10 characters');
        }
      });
  });

  describe('updateIdeaSchema', () => {
    it('should validate partial updates', () => {
        const validUpdate = { title: 'New Title' };
        expect(updateIdeaSchema.safeParse(validUpdate).success).toBe(true);
    });

    it('should allow empty update (optional fields)', () => {
        expect(updateIdeaSchema.safeParse({}).success).toBe(true);
    });
  });

  describe('createCommentSchema', () => {
      it('should validate valid comment', () => {
          const valid = { text: 'This is a comment' };
          const result = createCommentSchema.safeParse(valid);
          expect(result.success).toBe(true);
      });

      it('should fail empty comment', () => {
          const invalid = { text: '' };
          const result = createCommentSchema.safeParse(invalid);
          expect(result.success).toBe(false);
      });
  });

  describe('updateCommentSchema', () => {
    it('should validate valid update', () => {
        const valid = { text: 'Updated comment' };
        expect(updateCommentSchema.safeParse(valid).success).toBe(true);
    });
  });

  describe('voteSchema', () => {
      it('should validate vote action', () => {
          expect(voteSchema.safeParse({ action: 'vote' }).success).toBe(true);
      });
      it('should validate unvote action', () => {
          expect(voteSchema.safeParse({ action: 'unvote' }).success).toBe(true);
      });
      it('should fail invalid action', () => {
          expect(voteSchema.safeParse({ action: 'something_else' }).success).toBe(false);
      });
  });
});