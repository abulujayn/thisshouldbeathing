import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { signToken, verifyToken, storeAuthCode, verifyAuthCode } from './auth';
import { pool } from './db';

// Mock dependencies
vi.mock('./db', () => ({
  pool: {
    connect: vi.fn(),
  },
  ensureSchema: vi.fn(),
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

describe('Auth', () => {
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

  describe('JWT', () => {
    it('should sign and verify token', async () => {
      const payload = { email: 'test@example.com' };
      const token = await signToken(payload);
      expect(typeof token).toBe('string');

      const decoded = await verifyToken(token) as { email: string };
      expect(decoded.email).toBe('test@example.com');
    });

    it('should return null for invalid token', async () => {
      const result = await verifyToken('invalid-token');
      expect(result).toBeNull();
    });
  });

  describe('storeAuthCode', () => {
      it('should store auth code with expiration', async () => {
          await storeAuthCode('test@example.com', '123456');

          expect(mockClient.query).toHaveBeenCalledWith(
              expect.stringMatching(/INSERT INTO auth_codes/),
              expect.arrayContaining(['test-host', 'test@example.com', '123456', expect.any(Number)])
          );
      });
  });

  describe('verifyAuthCode', () => {
      it('should verify valid code', async () => {
          const future = Date.now() + 10000;
          mockClient.query.mockResolvedValueOnce({
              rows: [{ code: '123456', expires_at: future }]
          });

          const result = await verifyAuthCode('test@example.com', '123456');

          expect(result).toBe(true);
          // Should delete after successful verification
          expect(mockClient.query).toHaveBeenCalledWith(
              expect.stringMatching(/DELETE FROM auth_codes/),
              ['test-host', 'test@example.com']
          );
      });

      it('should reject invalid code', async () => {
        const future = Date.now() + 10000;
        mockClient.query.mockResolvedValueOnce({
            rows: [{ code: '123456', expires_at: future }]
        });

        const result = await verifyAuthCode('test@example.com', '654321'); // Wrong code

        expect(result).toBe(false);
        expect(mockClient.query).not.toHaveBeenCalledWith(
            expect.stringMatching(/DELETE FROM auth_codes/),
            expect.anything()
        );
      });

      it('should reject expired code', async () => {
        const past = Date.now() - 10000;
        mockClient.query.mockResolvedValueOnce({
            rows: [{ code: '123456', expires_at: past }]
        });

        const result = await verifyAuthCode('test@example.com', '123456');

        expect(result).toBe(false);
      });

      it('should return false if no code found', async () => {
        mockClient.query.mockResolvedValueOnce({
            rows: []
        });

        const result = await verifyAuthCode('test@example.com', '123456');

        expect(result).toBe(false);
      });
  });
});
