import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { safeToISOString, formatDate } from '../../utils/timeHelpers';

describe('Time Helper Functions', () => {
  describe('safeToISOString', () => {
    it('converts Date objects to ISO string', () => {
      const date = new Date('2023-01-01T12:00:00Z');
      expect(safeToISOString(date)).toBe('2023-01-01T12:00:00.000Z');
    });

    it('converts string dates to ISO string', () => {
      expect(safeToISOString('2023-01-01')).toBe('2023-01-01T00:00:00.000Z');
      // Note: Time strings without timezone are interpreted as local time
      const result = safeToISOString('2023-01-01T12:00:00');
      expect(result).toMatch(/2023-01-01T\d{2}:00:00\.000Z/); // Accept any hour due to timezone
    });

    it('converts number timestamps to ISO string', () => {
      const timestamp = Date.parse('2023-01-01T12:00:00Z');
      expect(safeToISOString(timestamp)).toBe('2023-01-01T12:00:00.000Z');
    });

    it('handles Firebase Timestamp objects', () => {
      const mockFirebaseTimestamp = {
        toDate: () => new Date('2023-01-01T12:00:00Z')
      };
      expect(safeToISOString(mockFirebaseTimestamp)).toBe('2023-01-01T12:00:00.000Z');
    });

    it('handles null and undefined', () => {
      expect(safeToISOString(null)).toBeUndefined();
      expect(safeToISOString(undefined)).toBeUndefined();
      expect(safeToISOString('')).toBeUndefined();
    });

    it('handles invalid dates gracefully', () => {
      expect(safeToISOString('invalid-date')).toBeUndefined();
      expect(safeToISOString({})).toBeUndefined();
    });

    it('handles edge cases', () => {
      // The function returns undefined for 0 because it's falsy
      expect(safeToISOString(0)).toBeUndefined();
      expect(safeToISOString(new Date('invalid'))).toBeUndefined();
    });
  });

  describe('formatDate', () => {
    it('formats Date objects with default options', () => {
      const date = new Date('2023-01-15T12:00:00Z');
      const formatted = formatDate(date);
      expect(formatted).toBe('January 15, 2023');
    });

    it('formats string dates', () => {
      const formatted = formatDate('2023-01-15');
      expect(formatted).toBe('January 15, 2023');
    });

    it('formats number timestamps', () => {
      const timestamp = Date.parse('2023-01-15T12:00:00Z');
      const formatted = formatDate(timestamp);
      expect(formatted).toBe('January 15, 2023');
    });

    it('handles Firebase Timestamp objects', () => {
      const mockFirebaseTimestamp = {
        toDate: () => new Date('2023-01-15T12:00:00Z')
      };
      const formatted = formatDate(mockFirebaseTimestamp);
      expect(formatted).toBe('January 15, 2023');
    });

    it('handles custom formatting options', () => {
      const date = new Date('2023-01-15T12:00:00Z');
      const shortFormat = formatDate(date, {
        year: '2-digit',
        month: 'short',
        day: 'numeric'
      });
      expect(shortFormat).toBe('Jan 15, 23');
    });

    it('formats with time included', () => {
      const date = new Date('2023-01-15T14:30:00Z');
      const withTime = formatDate(date, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC'
      });
      expect(withTime).toBe('Jan 15, 2023, 02:30 PM');
    });

    it('handles null and undefined gracefully', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
      expect(formatDate('')).toBe('');
    });

    it('handles invalid dates gracefully', () => {
      expect(formatDate('invalid-date')).toBe('');
      expect(formatDate({})).toBe('');
      expect(formatDate(new Date('invalid'))).toBe('');
    });

    it('handles different locales', () => {
      const date = new Date('2023-01-15T12:00:00Z');

      // Test with different month formats
      const longMonth = formatDate(date, { month: 'long', day: 'numeric', year: 'numeric' });
      expect(longMonth).toBe('January 15, 2023');

      const shortMonth = formatDate(date, { month: 'short', day: 'numeric', year: 'numeric' });
      expect(shortMonth).toBe('Jan 15, 2023');

      const numericMonth = formatDate(date, { month: 'numeric', day: 'numeric', year: 'numeric' });
      expect(numericMonth).toBe('1/15/2023');
    });

    it('formats edge case dates', () => {
      // Leap year date
      const leapDate = new Date('2024-02-29T12:00:00Z');
      expect(formatDate(leapDate)).toBe('February 29, 2024');

      // New Year's Day
      const newYear = new Date('2023-01-01T00:00:00Z');
      expect(formatDate(newYear)).toBe('January 1, 2023');

      // End of year - account for timezone differences
      const endYear = new Date('2023-12-31T23:59:59Z');
      const formatted = formatDate(endYear);
      expect(formatted).toMatch(/December 31, 2023|January 1, 2024/); // Accept either due to timezone
    });
  });
});