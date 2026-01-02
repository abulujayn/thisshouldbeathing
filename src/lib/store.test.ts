import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { getIdeas, createIdea, voteIdea } from './store';
import { pool } from './db';

// Mock dependencies
vi.mock('./db', () => ({
  pool: {
    connect: vi.fn(),
  },
  ensureSchema: vi.fn(),
}));

vi.mock('./admin', () => ({
  getAdminData: vi.fn().mockResolvedValue({ credential: {} }), // Mock admin setup as complete
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockReturnValue({
    get: vi.fn().mockReturnValue('test-host'),
  }),
}));

interface MockClient {
    query: Mock;
    release: Mock;
}

describe('Store', () => {
  let mockClient: MockClient;

  beforeEach(() => {
    mockClient = {
      query: vi.fn(),
      release: vi.fn(),
    };
    (pool.connect as unknown as Mock).mockResolvedValue(mockClient);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getIdeas', () => {
    it('should return initial data when no ideas exist', async () => {
      mockClient.query.mockImplementation((query: string) => {
        if (query.includes('SELECT * FROM ideas')) {
          return { rows: [] }; // No ideas initially
        }
        if (query.includes('INSERT')) {
            return { rows: [] };
        }
        return { rows: [] };
      });

      const ideas = await getIdeas();

      expect(ideas).toHaveLength(1);
      expect(ideas[0].title).toBe('Light Mode by default');
      // Expect INSERTs to happen
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringMatching(/INSERT INTO ideas/),
        expect.anything()
      );
    });

    it('should return ideas with comments', async () => {
      const mockIdeas = [
        {
          id: 'idea-1',
          title: 'Idea 1',
          description: 'Desc 1',
          author_email: 'a@b.com',
          votes: 10,
          created_at: '1000',
        },
      ];
      const mockComments = [
        {
          id: 'comment-1',
          idea_id: 'idea-1',
          text: 'Comment 1',
          author_email: 'c@d.com',
          created_at: '2000',
        },
      ];

      mockClient.query.mockImplementation((query: string) => {
        if (query.includes('SELECT * FROM ideas')) {
          return { rows: mockIdeas };
        }
        if (query.includes('SELECT * FROM comments')) {
          return { rows: mockComments };
        }
        return { rows: [] };
      });

      const ideas = await getIdeas();

      expect(ideas).toHaveLength(1);
      expect(ideas[0].id).toBe('idea-1');
      expect(ideas[0].comments).toHaveLength(1);
      expect(ideas[0].comments[0].text).toBe('Comment 1');
      
      // Verify efficient querying (N+1 fix check)
      // Expect 2 queries: one for ideas, one for comments
      expect(mockClient.query).toHaveBeenCalledTimes(2);
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringMatching(/SELECT \* FROM ideas/), 
        expect.anything()
      );
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringMatching(/SELECT \* FROM comments/), 
        expect.anything()
      );
    });

    it('should handle empty ideas list efficiently', async () => {
       mockClient.query.mockImplementation((query: string) => {
        if (query.includes('SELECT * FROM ideas')) {
          return { rows: [] };
        }
         return { rows: [] };
      });
      
      await getIdeas();
      // It will init -> trigger INSERTs
       expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringMatching(/INSERT INTO ideas/),
        expect.anything()
      );
    });
  });

  describe('createIdea', () => {
      it('should insert idea and comments', async () => {
          const newIdea = {
              id: 'new-1',
              title: 'New Idea',
              description: 'Desc',
              authorEmail: 'me@test.com',
              votes: 0,
              comments: [{ id: 'c1', text: 'comm', authorEmail: 'me@test.com', createdAt: 123 }],
              createdAt: 123
          };

          await createIdea(newIdea);

          expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
          expect(mockClient.query).toHaveBeenCalledWith(expect.stringMatching(/INSERT INTO ideas/), expect.anything());
          expect(mockClient.query).toHaveBeenCalledWith(expect.stringMatching(/INSERT INTO comments/), expect.anything());
          expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      });
  });

  describe('voteIdea', () => {
      it('should increment votes', async () => {
          mockClient.query.mockResolvedValue({ rows: [{ votes: 5 }] });
          
          const votes = await voteIdea('idea-1', 1);
          
          expect(votes).toBe(5);
          expect(mockClient.query).toHaveBeenCalledWith(
              expect.stringMatching(/UPDATE ideas\s+SET votes/),
              [1, 'test-host', 'idea-1']
          );
      });
  });

});
