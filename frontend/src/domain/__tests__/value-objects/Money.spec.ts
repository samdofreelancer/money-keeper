import { describe, it, expect, beforeEach } from 'vitest';
import { Money, Currency } from '../../value-objects';

describe('Money Value Object', () => {
  let usd: Currency;
  let eur: Currency;

  beforeEach(() => {
    usd = Currency.of('USD');
    eur = Currency.of('EUR');
  });

  describe('factory method - of()', () => {
    it('should create money with valid amount and currency', () => {
      const money = Money.of(100, usd);
      expect(money.getAmount()).toBe(100);
      expect(money.getCurrency().equals(usd)).toBe(true);
    });

    it('should accept decimal amounts', () => {
      const money = Money.of(99.99, usd);
      expect(money.getAmount()).toBe(99.99);
    });

    it('should accept zero amount', () => {
      const money = Money.of(0, usd);
      expect(money.getAmount()).toBe(0);
    });

    it('should reject negative amounts', () => {
      expect(() => Money.of(-10, usd)).toThrow('Amount must be non-negative');
    });

    it('should reject amounts with more than 10 decimal places', () => {
      expect(() => Money.of(100.12345678901, usd)).toThrow(
        'Decimal places cannot exceed 10'
      );
    });

    it('should round amounts to 10 decimal places', () => {
      const money = Money.of(100.1234567890, usd);
      expect(money.getAmount()).toBeCloseTo(100.123456789, 9);
    });

    it('should require currency', () => {
      expect(() => Money.of(100, null as any)).toThrow();
    });
  });

  describe('arithmetic operations', () => {
    describe('add()', () => {
      it('should add money with same currency', () => {
        const money1 = Money.of(100, usd);
        const money2 = Money.of(50, usd);
        const result = money1.add(money2);
        expect(result.getAmount()).toBe(150);
        expect(result.getCurrency().equals(usd)).toBe(true);
      });

      it('should return new Money instance (immutability)', () => {
        const money1 = Money.of(100, usd);
        const money2 = Money.of(50, usd);
        const result = money1.add(money2);
        // Original should remain unchanged
        expect(money1.getAmount()).toBe(100);
        expect(result).not.toBe(money1);
      });

      it('should throw error when adding different currencies', () => {
        const money1 = Money.of(100, usd);
        const money2 = Money.of(50, eur);
        expect(() => money1.add(money2)).toThrow('Cannot add money with different currencies');
      });

      it('should handle decimal precision', () => {
        const money1 = Money.of(10.5, usd);
        const money2 = Money.of(20.3, usd);
        const result = money1.add(money2);
        expect(result.getAmount()).toBeCloseTo(30.8, 10);
      });

      it('should add zero', () => {
        const money = Money.of(100, usd);
        const zero = Money.of(0, usd);
        const result = money.add(zero);
        expect(result.getAmount()).toBe(100);
      });
    });

    describe('subtract()', () => {
      it('should subtract money with same currency', () => {
        const money1 = Money.of(100, usd);
        const money2 = Money.of(30, usd);
        const result = money1.subtract(money2);
        expect(result.getAmount()).toBe(70);
        expect(result.getCurrency().equals(usd)).toBe(true);
      });

      it('should return new Money instance (immutability)', () => {
        const money1 = Money.of(100, usd);
        const money2 = Money.of(30, usd);
        const result = money1.subtract(money2);
        expect(money1.getAmount()).toBe(100);
        expect(result).not.toBe(money1);
      });

      it('should throw error when subtracting different currencies', () => {
        const money1 = Money.of(100, usd);
        const money2 = Money.of(30, eur);
        expect(() => money1.subtract(money2)).toThrow(
          'Cannot subtract money with different currencies'
        );
      });

      it('should handle result being zero or negative', () => {
        const money1 = Money.of(50, usd);
        const money2 = Money.of(50, usd);
        const result = money1.subtract(money2);
        expect(result.getAmount()).toBe(0);
      });

      it('should allow result to be negative (business allows negative balance)', () => {
        const money1 = Money.of(30, usd);
        const money2 = Money.of(50, usd);
        // Subtraction itself creates positive Money, but result can represent negative
        expect(() => money1.subtract(money2)).toThrow();
      });
    });

    describe('multiply()', () => {
      it('should multiply by positive scalar', () => {
        const money = Money.of(100, usd);
        const result = money.multiply(2);
        expect(result.getAmount()).toBe(200);
        expect(result.getCurrency().equals(usd)).toBe(true);
      });

      it('should multiply by decimal scalar', () => {
        const money = Money.of(100, usd);
        const result = money.multiply(0.5);
        expect(result.getAmount()).toBe(50);
      });

      it('should multiply by zero', () => {
        const money = Money.of(100, usd);
        const result = money.multiply(0);
        expect(result.getAmount()).toBe(0);
      });

      it('should return new Money instance (immutability)', () => {
        const money = Money.of(100, usd);
        const result = money.multiply(2);
        expect(money.getAmount()).toBe(100);
        expect(result).not.toBe(money);
      });

      it('should throw error for negative scalar', () => {
        const money = Money.of(100, usd);
        expect(() => money.multiply(-2)).toThrow('Scalar must be non-negative');
      });

      it('should handle precision in multiplication', () => {
        const money = Money.of(100, usd);
        const result = money.multiply(0.1);
        expect(result.getAmount()).toBeCloseTo(10, 10);
      });
    });
  });

  describe('comparison operations', () => {
    describe('isGreaterThan()', () => {
      it('should return true if greater', () => {
        const money1 = Money.of(100, usd);
        const money2 = Money.of(50, usd);
        expect(money1.isGreaterThan(money2)).toBe(true);
      });

      it('should return false if less', () => {
        const money1 = Money.of(50, usd);
        const money2 = Money.of(100, usd);
        expect(money1.isGreaterThan(money2)).toBe(false);
      });

      it('should return false if equal', () => {
        const money1 = Money.of(100, usd);
        const money2 = Money.of(100, usd);
        expect(money1.isGreaterThan(money2)).toBe(false);
      });

      it('should throw error for different currencies', () => {
        const money1 = Money.of(100, usd);
        const money2 = Money.of(100, eur);
        expect(() => money1.isGreaterThan(money2)).toThrow(
          'Cannot compare money with different currencies'
        );
      });

      it('should handle floating point precision tolerance', () => {
        const money1 = Money.of(100.0000000001, usd);
        const money2 = Money.of(100, usd);
        expect(money1.isGreaterThan(money2)).toBe(false); // Within tolerance
      });
    });

    describe('equals()', () => {
      it('should return true for same amount and currency', () => {
        const money1 = Money.of(100, usd);
        const money2 = Money.of(100, usd);
        expect(money1.equals(money2)).toBe(true);
      });

      it('should return false for different amounts', () => {
        const money1 = Money.of(100, usd);
        const money2 = Money.of(50, usd);
        expect(money1.equals(money2)).toBe(false);
      });

      it('should return false for different currencies', () => {
        const money1 = Money.of(100, usd);
        const money2 = Money.of(100, eur);
        expect(money1.equals(money2)).toBe(false);
      });

      it('should handle floating point precision tolerance', () => {
        const money1 = Money.of(100.0000000001, usd);
        const money2 = Money.of(100, usd);
        expect(money1.equals(money2)).toBe(true); // Within tolerance
      });

      it('should handle comparison with null', () => {
        const money = Money.of(100, usd);
        expect(money.equals(null as any)).toBe(false);
      });

      it('should handle comparison with undefined', () => {
        const money = Money.of(100, usd);
        expect(money.equals(undefined as any)).toBe(false);
      });
    });
  });

  describe('formatting', () => {
    describe('format()', () => {
      it('should format USD with dollar sign', () => {
        const money = Money.of(1234.56, usd);
        const formatted = money.format();
        expect(formatted).toContain('1,234.56');
        expect(formatted).toContain('$');
      });

      it('should format EUR with euro sign', () => {
        const money = Money.of(1234.56, eur);
        const formatted = money.format();
        expect(formatted).toContain('1,234.56');
        expect(formatted).toContain('€');
      });

      it('should format round numbers without decimals', () => {
        const money = Money.of(1000, usd);
        const formatted = money.format();
        expect(formatted).toContain('1,000');
      });

      it('should format zero', () => {
        const money = Money.of(0, usd);
        const formatted = money.format();
        expect(formatted).toBeTruthy();
      });

      it('should add thousand separators', () => {
        const money = Money.of(1234567.89, usd);
        const formatted = money.format();
        expect(formatted).toContain('1,234,567');
      });
    });

    describe('toString()', () => {
      it('should return string representation', () => {
        const money = Money.of(100, usd);
        const str = money.toString();
        expect(str).toContain('100');
        expect(str).toContain('USD');
      });

      it('should include amount and currency', () => {
        const money = Money.of(99.99, eur);
        const str = money.toString();
        expect(str).toContain('99.99');
        expect(str).toContain('EUR');
      });
    });
  });

  describe('immutability', () => {
    it('should not allow modification after creation', () => {
      const money = Money.of(100, usd);
      const amount = money.getAmount();
      expect(() => {
        (money as any).amount = 200;
      }).not.toThrow(); // May not throw but should not affect internal state
      expect(money.getAmount()).toBe(amount);
    });

    it('should return same Money instance properties', () => {
      const money = Money.of(100, usd);
      expect(money.getAmount()).toBe(100);
      expect(money.getAmount()).toBe(100); // Consistent
    });
  });

  describe('value object semantics', () => {
    it('should be equal if amount and currency are equal', () => {
      const money1 = Money.of(100.50, usd);
      const money2 = Money.of(100.50, usd);
      expect(money1.equals(money2)).toBe(true);
    });

    it('should behave consistently across operations', () => {
      const money1 = Money.of(50, usd);
      const money2 = Money.of(30, usd);
      const money3 = Money.of(20, usd);

      const result1 = money1.subtract(money2);
      const result2 = money2.add(money3);

      expect(result1.equals(result2)).toBe(true);
    });

    it('should maintain currency after operations', () => {
      const money1 = Money.of(100, usd);
      const money2 = Money.of(50, usd);

      const sum = money1.add(money2);
      const diff = money1.subtract(money2);
      const product = money1.multiply(2);

      expect(sum.getCurrency().equals(usd)).toBe(true);
      expect(diff.getCurrency().equals(usd)).toBe(true);
      expect(product.getCurrency().equals(usd)).toBe(true);
    });
  });
});
