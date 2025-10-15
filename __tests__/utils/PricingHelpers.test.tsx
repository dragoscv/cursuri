import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { getCoursePrice, formatPrice, hasValidPrice } from '../../utils/pricing';

describe('Pricing Utility Functions', () => {
  describe('getCoursePrice', () => {
    it('returns free pricing for free courses', () => {
      const freeCourse = { id: 'test-course', isFree: true };
      const priceInfo = getCoursePrice(freeCourse);

      expect(priceInfo.amount).toBe(0);
      expect(priceInfo.currency).toBe('RON');
      expect(priceInfo.formatted).toBe('Free');
    });

    it('handles courses with priceProduct and specific price ID', () => {
      const course = {
        id: 'test-course',
        price: 'price_123',
        priceProduct: { id: 'prod_123' }
      };

      const products = [{
        id: 'prod_123',
        prices: [{
          id: 'price_123',
          unit_amount: 9999, // $99.99
          currency: 'ron'
        }]
      }];

      const priceInfo = getCoursePrice(course, products);

      expect(priceInfo.amount).toBe(99.99);
      expect(priceInfo.currency).toBe('RON');
      expect(priceInfo.priceId).toBe('price_123');
      expect(priceInfo.formatted).toContain('99,99');
    });

    it('falls back to first available price when specific price not found', () => {
      const course = {
        id: 'test-course',
        priceProduct: {
          id: 'prod_123',
          prices: [{
            id: 'price_fallback',
            unit_amount: 4999, // $49.99
            currency: 'ron'
          }]
        }
      };

      const priceInfo = getCoursePrice(course);

      expect(priceInfo.amount).toBe(49.99);
      expect(priceInfo.currency).toBe('RON');
      expect(priceInfo.priceId).toBe('price_fallback');
    });

    it('handles legacy numeric price property', () => {
      const course = {
        id: 'test-course',
        price: 75.50,
        // Real implementation requires priceProduct to be present for legacy support
        priceProduct: { id: 'test-product', prices: [] }
      };

      const priceInfo = getCoursePrice(course);

      expect(priceInfo.amount).toBe(75.50);
      expect(priceInfo.currency).toBe('RON');
      expect(priceInfo.formatted).toContain('75,50');
    });

    it('handles legacy string price property', () => {
      const course = {
        id: 'test-course',
        price: '89.99',
        // Real implementation requires priceProduct to be present for legacy support
        priceProduct: { id: 'test-product', prices: [] }
      };

      const priceInfo = getCoursePrice(course);

      expect(priceInfo.amount).toBe(89.99);
      expect(priceInfo.currency).toBe('RON');
      expect(priceInfo.formatted).toContain('89,99');
    });

    it('returns default pricing for courses without valid price info', () => {
      const course = {
        id: 'test-course'
        // No pricing information
      };

      const priceInfo = getCoursePrice(course);

      expect(priceInfo.amount).toBe(0);
      expect(priceInfo.currency).toBe('RON');
      expect(priceInfo.formatted).toBe('Free');
    });

    it('handles different currencies correctly', () => {
      const course = {
        id: 'test-course',
        priceProduct: {
          id: 'prod_123',
          prices: [{
            id: 'price_usd',
            unit_amount: 2999, // $29.99
            currency: 'usd'
          }]
        }
      };

      const priceInfo = getCoursePrice(course);

      expect(priceInfo.amount).toBe(29.99);
      expect(priceInfo.currency).toBe('USD');
    });

    it('ignores invalid string prices', () => {
      const course = {
        id: 'test-course',
        price: 'invalid-price'
      };

      const priceInfo = getCoursePrice(course);

      expect(priceInfo.amount).toBe(0);
      expect(priceInfo.formatted).toBe('Free');
    });

    it('ignores Stripe price IDs as legacy prices', () => {
      const course = {
        id: 'test-course',
        price: 'price_1234567890' // Stripe price ID should not be parsed as numeric
      };

      const priceInfo = getCoursePrice(course);

      expect(priceInfo.amount).toBe(0);
      expect(priceInfo.formatted).toBe('Free');
    });
  });

  describe('formatPrice', () => {
    it('formats RON currency correctly', () => {
      expect(formatPrice(99.99, 'RON')).toContain('99,99');
      expect(formatPrice(100, 'RON')).toContain('100,00');
    });

    it('formats USD currency correctly', () => {
      expect(formatPrice(99.99, 'USD')).toContain('99,99');
    });

    it('defaults to RON when currency not specified', () => {
      const formatted = formatPrice(50);
      expect(formatted).toContain('50,00');
    });

    it('handles zero amounts', () => {
      expect(formatPrice(0)).toContain('0,00');
    });

    it('handles large amounts', () => {
      expect(formatPrice(1000000)).toContain('1.000.000,00');
    });

    it('handles decimal amounts correctly', () => {
      expect(formatPrice(99.95)).toContain('99,95');
      expect(formatPrice(12.5)).toContain('12,50');
    });

    it('handles case insensitive currency codes', () => {
      expect(formatPrice(100, 'usd')).toContain('100,00');
      expect(formatPrice(100, 'ron')).toContain('100,00');
    });
  });

  describe('hasValidPrice', () => {
    it('returns true for free courses', () => {
      const freeCourse = { id: 'test', isFree: true };
      expect(hasValidPrice(freeCourse)).toBe(true);
    });

    it('returns true for courses with valid pricing', () => {
      const paidCourse = {
        id: 'test',
        priceProduct: {
          prices: [{
            unit_amount: 9999,
            currency: 'ron'
          }]
        }
      };
      expect(hasValidPrice(paidCourse)).toBe(true);
    });

    it('returns true for legacy courses with numeric price', () => {
      const legacyCourse = { id: 'test', price: 99.99, priceProduct: { id: 'test-product', prices: [] } };
      const result = hasValidPrice(legacyCourse);
      expect(result).toBe(true);
    });

    it('returns false for courses without valid pricing', () => {
      const invalidCourse = { id: 'test', priceProduct: null };
      const result = hasValidPrice(invalidCourse);
      expect(result).toBe(false);
    });

    it('returns false for courses with zero price (not explicitly free)', () => {
      const zeroCourse = { id: 'test', price: 0, priceProduct: null };
      const result = hasValidPrice(zeroCourse);
      expect(result).toBe(false);
    });

    it('returns false for courses with invalid string prices', () => {
      const invalidStringCourse = { id: 'test', price: 'invalid', priceProduct: null };
      const result = hasValidPrice(invalidStringCourse);
      expect(result).toBe(false);
    });
  });
});