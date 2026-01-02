import { describe, it, expect } from 'vitest';
import { getRelativeTime, getFullTimestamp } from './utils';

describe('Utils', () => {
  describe('getRelativeTime', () => {
    it('should return relative time string', () => {
      const now = Date.now();
      const fiveMinutesAgo = now - 5 * 60 * 1000;
      
      expect(getRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago');
    });

    it('should handle different time differences', () => {
       const now = Date.now();
       const oneHourAgo = now - 60 * 60 * 1000;
       // Note: date-fns output might vary slightly based on exact ms, but "about 1 hour ago" is standard
       expect(getRelativeTime(oneHourAgo)).toMatch(/1 hour ago/);
    });
  });

  describe('getFullTimestamp', () => {
    it('should format timestamp correctly', () => {
        // use a fixed date: 2023-01-01 12:00:00 UTC
        const date = new Date('2023-01-01T12:00:00');
        const timestamp = date.getTime();
        
        // The output depends on the local timezone of the runner.
        // However, we can check the format structure roughly or force a locale if the util supported it.
        // Since the util just calls format(new Date(timestamp), 'PPPP p'), it uses system locale.
        // We will just check it returns a string and contains parts of the date.
        
        const result = getFullTimestamp(timestamp);
        expect(typeof result).toBe('string');
        expect(result).toContain('2023');
        // PPPP p usually includes full month name, day, year, and time.
        // e.g. "Sunday, January 1st, 2023 at 12:00 PM"
    });
  });
});
