import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { getAdminData, saveAdminData } from './admin';
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
  cookies: vi.fn(),
}));

interface MockClient {
    query: Mock;
    release: Mock;
}

describe('Admin', () => {
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

  describe('getAdminData', () => {
      it('should return null if no data found', async () => {
          mockClient.query.mockResolvedValueOnce({ rows: [] });
          const result = await getAdminData();
          expect(result).toBeNull();
      });

      it('should return admin data with parsed credentials', async () => {
          const mockRow = {
              username: 'admin',
              credential_id: 'cred-id',
              credential_public_key: 'pub-key',
              credential_counter: 10,
              credential_transports: '["usb"]'
          };
          mockClient.query.mockResolvedValueOnce({ rows: [mockRow] });
          
          const result = await getAdminData();
          
          expect(result).not.toBeNull();
          expect(result?.username).toBe('admin');
          expect(result?.credential?.id).toBe('cred-id');
          expect(result?.credential?.transports).toEqual(['usb']);
      });

      it('should handle missing credential fields gracefully', async () => {
        const mockRow = {
            username: 'admin',
            credential_id: null,
        };
        mockClient.query.mockResolvedValueOnce({ rows: [mockRow] });
        
        const result = await getAdminData();
        
        expect(result?.username).toBe('admin');
        expect(result?.credential).toBeUndefined();
    });
  });

  describe('saveAdminData', () => {
      it('should save admin data', async () => {
          const data = {
              username: 'new-admin',
              credential: {
                  id: 'cid',
                  publicKey: 'pk',
                  counter: 0,
                  transports: ['nfc']
              }
          };
          
          await saveAdminData(data);
          
          expect(mockClient.query).toHaveBeenCalledWith(
              expect.stringMatching(/INSERT INTO admin_data/),
              expect.arrayContaining([
                  'test-host', 
                  'new-admin', 
                  'cid', 
                  'pk', 
                  0, 
                  '["nfc"]'
              ])
          );
      });
  });
});
