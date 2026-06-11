import { describe, it, expect, beforeEach } from 'vitest';
import { Currency } from '../../value-objects';

describe('Currency Value Object', () => {
  describe('factory method - of()', () => {
    it('should create a currency with valid ISO 4217 code', () => {
      const currency = Currency.of('USD');
      expect(currency.getCode()).toBe('USD');
    });

    it('should convert lowercase to uppercase', () => {
      const currency = Currency.of('eur');
      expect(currency.getCode()).toBe('EUR');
    });

    it('should throw error for non-3-character codes', () => {
      expect(() => Currency.of('US')).toThrow('Invalid currency code');
      expect(() => Currency.of('USDA')).toThrow('Invalid currency code');
    });

    it('should throw error for non-alphabetic codes', () => {
      expect(() => Currency.of('US1')).toThrow('Invalid currency code');
      expect(() => Currency.of('U$D')).toThrow('Invalid currency code');
    });

    it('should throw error for empty string', () => {
      expect(() => Currency.of('')).toThrow('Invalid currency code');
    });

    it('should throw error for whitespace', () => {
      expect(() => Currency.of('   ')).toThrow('Invalid currency code');
    });
  });

  describe('getSymbol()', () => {
    it('should return correct symbol for known currencies', () => {
      expect(Currency.of('USD').getSymbol()).toBe('$');
      expect(Currency.of('EUR').getSymbol()).toBe('€');
      expect(Currency.of('GBP').getSymbol()).toBe('£');
      expect(Currency.of('JPY').getSymbol()).toBe('¥');
      expect(Currency.of('VND').getSymbol()).toBe('₫');
    });

    it('should return currency code for unknown currencies', () => {
      const unknownSymbol = Currency.of('XYZ').getSymbol();
      expect(unknownSymbol).toBe('XYZ');
    });
  });

  describe('equals()', () => {
    it('should be equal if code matches', () => {
      const cur1 = Currency.of('USD');
      const cur2 = Currency.of('USD');
      expect(cur1.equals(cur2)).toBe(true);
    });

    it('should not be equal if code differs', () => {
      const cur1 = Currency.of('USD');
      const cur2 = Currency.of('EUR');
      expect(cur1.equals(cur2)).toBe(false);
    });

    it('should be case-insensitive for comparison', () => {
      const cur1 = Currency.of('USD');
      const cur2 = Currency.of('usd');
      expect(cur1.equals(cur2)).toBe(true);
    });

    it('should handle comparison with null', () => {
      const currency = Currency.of('USD');
      expect(currency.equals(null as any)).toBe(false);
    });

    it('should handle comparison with undefined', () => {
      const currency = Currency.of('USD');
      expect(currency.equals(undefined as any)).toBe(false);
    });
  });

  describe('toString()', () => {
    it('should return currency code', () => {
      const currency = Currency.of('USD');
      expect(currency.toString()).toBe('USD');
    });
  });

  describe('immutability', () => {
    it('should not expose getCode property for modification', () => {
      const currency = Currency.of('USD');
      const code = currency.getCode();
      expect(code).toBe('USD');
      // Verify it's still USD after accessing
      expect(currency.getCode()).toBe('USD');
    });
  });

  describe('value object semantics', () => {
    it('should be equivalent for same currency code', () => {
      const cur1 = Currency.of('EUR');
      const cur2 = Currency.of('EUR');
      // Same semantic value
      expect(cur1.getCode()).toBe(cur2.getCode());
      expect(cur1.equals(cur2)).toBe(true);
    });

    it('should multiple instances can coexist', () => {
      const usd1 = Currency.of('USD');
      const usd2 = Currency.of('USD');
      const eur = Currency.of('EUR');

      expect(usd1.equals(usd2)).toBe(true);
      expect(usd1.equals(eur)).toBe(false);
      expect([usd1, usd2, eur].filter((c) => c.equals(usd1))).toHaveLength(2);
    });
  });

  describe('supported currencies', () => {
    it('should support major currencies', () => {
      const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CNY', 'AUD', 'CAD', 'SGD', 'VND'];

      currencies.forEach((code) => {
        const currency = Currency.of(code);
        expect(currency.getCode()).toBe(code);
        expect(currency.getSymbol()).toBeTruthy();
      });
    });
  });

  describe('edge cases', () => {
    it('should handle spaces in code', () => {
      expect(() => Currency.of('U S D')).toThrow('Invalid currency code');
    });

    it('should not accept special characters', () => {
      expect(() => Currency.of('US-D')).toThrow('Invalid currency code');
      expect(() => Currency.of('US.D')).toThrow('Invalid currency code');
    });

    it('should handle null input', () => {
      expect(() => Currency.of(null as any)).toThrow();
    });

    it('should handle undefined input', () => {
      expect(() => Currency.of(undefined as any)).toThrow();
    });
  });
});
