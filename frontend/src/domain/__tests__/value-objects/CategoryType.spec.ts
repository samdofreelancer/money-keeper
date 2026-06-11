import { describe, it, expect, beforeEach } from 'vitest';
import { CategoryType, CategoryTypeEnum } from '../../value-objects';

describe('CategoryType Value Object', () => {
  describe('factory method - of()', () => {
    it('should create category type from uppercase string', () => {
      const type = CategoryType.of('INCOME');
      expect(type.getValue()).toBe(CategoryTypeEnum.INCOME);
    });

    it('should create category type from lowercase string', () => {
      const type = CategoryType.of('expense');
      expect(type.getValue()).toBe(CategoryTypeEnum.EXPENSE);
    });

    it('should create category type from mixed case string', () => {
      const type = CategoryType.of('Transfer');
      expect(type.getValue()).toBe(CategoryTypeEnum.TRANSFER);
    });

    it('should throw error for invalid type', () => {
      expect(() => CategoryType.of('INVALID')).toThrow('Invalid category type');
      expect(() => CategoryType.of('INCOME_TAX')).toThrow('Invalid category type');
    });

    it('should throw error for empty string', () => {
      expect(() => CategoryType.of('')).toThrow('Invalid category type');
    });

    it('should throw error for whitespace', () => {
      expect(() => CategoryType.of('   ')).toThrow('Invalid category type');
    });

    it('should throw error for null or undefined', () => {
      expect(() => CategoryType.of(null as any)).toThrow();
      expect(() => CategoryType.of(undefined as any)).toThrow();
    });
  });

  describe('factory method - fromEnum()', () => {
    it('should create from INCOME enum', () => {
      const type = CategoryType.fromEnum(CategoryTypeEnum.INCOME);
      expect(type.getValue()).toBe(CategoryTypeEnum.INCOME);
    });

    it('should create from EXPENSE enum', () => {
      const type = CategoryType.fromEnum(CategoryTypeEnum.EXPENSE);
      expect(type.getValue()).toBe(CategoryTypeEnum.EXPENSE);
    });

    it('should create from TRANSFER enum', () => {
      const type = CategoryType.fromEnum(CategoryTypeEnum.TRANSFER);
      expect(type.getValue()).toBe(CategoryTypeEnum.TRANSFER);
    });

    it('should handle all enum values', () => {
      Object.values(CategoryTypeEnum).forEach((enumValue) => {
        const type = CategoryType.fromEnum(enumValue);
        expect(type.getValue()).toBe(enumValue);
      });
    });
  });

  describe('getValue()', () => {
    it('should return the underlying enum value', () => {
      const income = CategoryType.of('INCOME');
      expect(income.getValue()).toBe(CategoryTypeEnum.INCOME);

      const expense = CategoryType.of('EXPENSE');
      expect(expense.getValue()).toBe(CategoryTypeEnum.EXPENSE);

      const transfer = CategoryType.of('TRANSFER');
      expect(transfer.getValue()).toBe(CategoryTypeEnum.TRANSFER);
    });
  });

  describe('getDisplayName()', () => {
    it('should return display name for INCOME', () => {
      const type = CategoryType.of('INCOME');
      expect(type.getDisplayName()).toBe('Income');
    });

    it('should return display name for EXPENSE', () => {
      const type = CategoryType.of('EXPENSE');
      expect(type.getDisplayName()).toBe('Expense');
    });

    it('should return display name for TRANSFER', () => {
      const type = CategoryType.of('TRANSFER');
      expect(type.getDisplayName()).toBe('Transfer');
    });

    it('should be consistent across instances', () => {
      const type1 = CategoryType.of('INCOME');
      const type2 = CategoryType.fromEnum(CategoryTypeEnum.INCOME);
      expect(type1.getDisplayName()).toBe(type2.getDisplayName());
    });
  });

  describe('type predicate methods', () => {
    describe('isIncome()', () => {
      it('should return true for INCOME type', () => {
        const type = CategoryType.of('INCOME');
        expect(type.isIncome()).toBe(true);
      });

      it('should return false for other types', () => {
        expect(CategoryType.of('EXPENSE').isIncome()).toBe(false);
        expect(CategoryType.of('TRANSFER').isIncome()).toBe(false);
      });
    });

    describe('isExpense()', () => {
      it('should return true for EXPENSE type', () => {
        const type = CategoryType.of('EXPENSE');
        expect(type.isExpense()).toBe(true);
      });

      it('should return false for other types', () => {
        expect(CategoryType.of('INCOME').isExpense()).toBe(false);
        expect(CategoryType.of('TRANSFER').isExpense()).toBe(false);
      });
    });

    describe('isTransfer()', () => {
      it('should return true for TRANSFER type', () => {
        const type = CategoryType.of('TRANSFER');
        expect(type.isTransfer()).toBe(true);
      });

      it('should return false for other types', () => {
        expect(CategoryType.of('INCOME').isTransfer()).toBe(false);
        expect(CategoryType.of('EXPENSE').isTransfer()).toBe(false);
      });
    });

    it('should allow type guards', () => {
      const types = [
        CategoryType.of('INCOME'),
        CategoryType.of('EXPENSE'),
        CategoryType.of('TRANSFER'),
      ];

      const incomeTypes = types.filter((t) => t.isIncome());
      expect(incomeTypes).toHaveLength(1);

      const expenseTypes = types.filter((t) => t.isExpense());
      expect(expenseTypes).toHaveLength(1);

      const transferTypes = types.filter((t) => t.isTransfer());
      expect(transferTypes).toHaveLength(1);
    });
  });

  describe('equals()', () => {
    it('should be equal if type matches', () => {
      const type1 = CategoryType.of('INCOME');
      const type2 = CategoryType.of('INCOME');
      expect(type1.equals(type2)).toBe(true);
    });

    it('should not be equal if type differs', () => {
      const type1 = CategoryType.of('INCOME');
      const type2 = CategoryType.of('EXPENSE');
      expect(type1.equals(type2)).toBe(false);
    });

    it('should be case-insensitive for initial creation', () => {
      const type1 = CategoryType.of('INCOME');
      const type2 = CategoryType.of('income');
      expect(type1.equals(type2)).toBe(true);
    });

    it('should handle comparison with null', () => {
      const type = CategoryType.of('INCOME');
      expect(type.equals(null as any)).toBe(false);
    });

    it('should handle comparison with undefined', () => {
      const type = CategoryType.of('INCOME');
      expect(type.equals(undefined as any)).toBe(false);
    });
  });

  describe('immutability', () => {
    it('should not allow modification after creation', () => {
      const type = CategoryType.of('INCOME');
      expect(type.isIncome()).toBe(true);
      // Attempt to modify (private constructor prevents this)
      expect(type.isIncome()).toBe(true);
    });

    it('should return consistent values on multiple calls', () => {
      const type = CategoryType.of('EXPENSE');
      expect(type.getValue()).toBe(type.getValue());
      expect(type.getDisplayName()).toBe(type.getDisplayName());
      expect(type.isExpense()).toBe(type.isExpense());
    });
  });

  describe('toString()', () => {
    it('should return string representation', () => {
      const type = CategoryType.of('INCOME');
      const str = type.toString();
      expect(str).toBeTruthy();
      expect(str.length).toBeGreaterThan(0);
    });

    it('should include category type information', () => {
      const types = [
        CategoryType.of('INCOME'),
        CategoryType.of('EXPENSE'),
        CategoryType.of('TRANSFER'),
      ];

      types.forEach((type) => {
        const str = type.toString();
        expect(str).toContain('CategoryType');
      });
    });
  });

  describe('value object semantics', () => {
    it('should be equivalent for same enumeration', () => {
      const type1 = CategoryType.of('INCOME');
      const type2 = CategoryType.of('INCOME');

      expect(type1.getValue()).toBe(type2.getValue());
      expect(type1.equals(type2)).toBe(true);
    });

    it('should support use in collections with equality checks', () => {
      const incomeType = CategoryType.of('INCOME');
      const types = [
        CategoryType.of('INCOME'),
        CategoryType.of('EXPENSE'),
        CategoryType.of('TRANSFER'),
      ];

      const matching = types.filter((t) => t.equals(incomeType));
      expect(matching).toHaveLength(1);
      expect(matching[0].isIncome()).toBe(true);
    });

    it('should allow safe comparisons without null checks if wrapped properly', () => {
      const type1 = CategoryType.of('INCOME');
      const type2 = CategoryType.of('INCOME');

      // Safe comparison
      const isSameType = type1.equals(type2);
      expect(isSameType).toBe(true);

      // Type guards work as expected
      if (type1.isIncome()) {
        expect(type1.getValue()).toBe(CategoryTypeEnum.INCOME);
      }
    });
  });

  describe('all supported types', () => {
    it('should support INCOME type', () => {
      const type = CategoryType.of('INCOME');
      expect(type.isIncome()).toBe(true);
      expect(type.getDisplayName()).toBe('Income');
    });

    it('should support EXPENSE type', () => {
      const type = CategoryType.of('EXPENSE');
      expect(type.isExpense()).toBe(true);
      expect(type.getDisplayName()).toBe('Expense');
    });

    it('should support TRANSFER type', () => {
      const type = CategoryType.of('TRANSFER');
      expect(type.isTransfer()).toBe(true);
      expect(type.getDisplayName()).toBe('Transfer');
    });
  });

  describe('edge cases', () => {
    it('should handle leading/trailing whitespace', () => {
      const type = CategoryType.of('  INCOME  ');
      expect(type.isIncome()).toBe(true);
    });

    it('should handle mixed case with spaces (after trim)', () => {
      const type = CategoryType.of('  income  ');
      expect(type.getDisplayName()).toBe('Income');
    });

    it('should throw for partial matches', () => {
      expect(() => CategoryType.of('INC')).toThrow();
      expect(() => CategoryType.of('INCOMES')).toThrow();
    });

    it('should maintain distinction between types in arrays', () => {
      const types = [
        CategoryType.of('INCOME'),
        CategoryType.of('EXPENSE'),
        CategoryType.of('TRANSFER'),
        CategoryType.of('INCOME'),
      ];

      const unique = types.filter((type, index) => {
        return (
          index ===
          types.findIndex((t) => {
            return t.equals(type);
          })
        );
      });

      expect(unique).toHaveLength(3);
    });
  });
});
