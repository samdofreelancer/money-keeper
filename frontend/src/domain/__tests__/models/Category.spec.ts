import { describe, it, expect, beforeEach } from 'vitest';
import { Category } from '../../models';
import { CategoryType, CategoryTypeEnum } from '../../value-objects';

describe('Category Domain Entity', () => {
  let incomeType: CategoryType;
  let expenseType: CategoryType;

  beforeEach(() => {
    incomeType = CategoryType.of('INCOME');
    expenseType = CategoryType.of('EXPENSE');
  });

  describe('factory method - create()', () => {
    it('should create a new unsaved category', () => {
      const category = Category.create('Salary', '💰', incomeType);

      expect(category.getId()).toBeNull();
      expect(category.isPersisted()).toBe(false);
      expect(category.getName()).toBe('Salary');
      expect(category.getIcon()).toBe('💰');
      expect(category.getType().equals(incomeType)).toBe(true);
      expect(category.isActive()).toBe(true);
      expect(category.hasParent()).toBe(false);
    });

    it('should create category with string type', () => {
      const category = Category.create('Groceries', '🛒', 'EXPENSE');
      expect(category.getType().isExpense()).toBe(true);
    });

    it('should create category with optional parent', () => {
      const category = Category.create('Groceries', '🛒', expenseType, 'food-parent-id');
      expect(category.getParentId()).toBe('food-parent-id');
      expect(category.hasParent()).toBe(true);
    });

    it('should validate category name', () => {
      expect(() => Category.create('', '💰', incomeType)).toThrow(
        'Category name cannot be empty'
      );
      expect(() => Category.create('   ', '💰', incomeType)).toThrow(
        'Category name cannot be empty'
      );
    });

    it('should reject names exceeding 100 characters', () => {
      const longName = 'A'.repeat(101);
      expect(() => Category.create(longName, '💰', incomeType)).toThrow(
        'Category name cannot exceed 100 characters'
      );
    });

    it('should validate icon', () => {
      expect(() => Category.create('Category', '', incomeType)).toThrow(
        'Category icon cannot be empty'
      );
      expect(() => Category.create('Category', '   ', incomeType)).toThrow(
        'Category icon cannot be empty'
      );
    });

    it('should reject icons exceeding 50 characters', () => {
      const longIcon = 'A'.repeat(51);
      expect(() => Category.create('Category', longIcon, incomeType)).toThrow(
        'Category icon cannot exceed 50 characters'
      );
    });

    it('should trim whitespace from name and icon', () => {
      const category = Category.create('  Salary  ', '  💰  ', incomeType);
      expect(category.getName()).toBe('Salary');
      expect(category.getIcon()).toBe('💰');
    });
  });

  describe('factory method - fromData()', () => {
    it('should reconstruct a persisted category', () => {
      const category = Category.fromData(
        '123',
        'Salary',
        '💰',
        CategoryTypeEnum.INCOME,
        null,
        true
      );

      expect(category.getId()).toBe('123');
      expect(category.isPersisted()).toBe(true);
      expect(category.getName()).toBe('Salary');
      expect(category.isActive()).toBe(true);
    });

    it('should reconstruct with parent category', () => {
      const category = Category.fromData(
        '123',
        'Fast Food',
        '🍔',
        CategoryTypeEnum.EXPENSE,
        'food-parent-id'
      );

      expect(category.getParentId()).toBe('food-parent-id');
      expect(category.hasParent()).toBe(true);
    });

    it('should reconstruct as inactive category', () => {
      const category = Category.fromData(
        '456',
        'Old Category',
        '❌',
        CategoryTypeEnum.EXPENSE,
        null,
        false
      );

      expect(category.isActive()).toBe(false);
    });

    it('should handle type conversion from string', () => {
      const category = Category.fromData(
        '789',
        'Category',
        '📌',
        'TRANSFER',
        null
      );

      expect(category.getType().isTransfer()).toBe(true);
    });
  });

  describe('getters', () => {
    let category: Category;

    beforeEach(() => {
      category = Category.create('Groceries', '🛒', expenseType);
    });

    it('should return all properties', () => {
      expect(category.getId()).toBeNull();
      expect(category.getName()).toBe('Groceries');
      expect(category.getIcon()).toBe('🛒');
      expect(category.getType().equals(expenseType)).toBe(true);
      expect(category.isActive()).toBe(true);
      expect(category.getCreatedAt()).toBeInstanceOf(Date);
    });

    it('should return null for parent if not set', () => {
      expect(category.getParentId()).toBeNull();
    });

    it('should return parent if set', () => {
      const parentCategory = Category.create('Food', '🍎', expenseType, 'parent-id');
      expect(parentCategory.getParentId()).toBe('parent-id');
    });
  });

  describe('hierarchy methods', () => {
    describe('hasParent()', () => {
      it('should return true if parentId is set', () => {
        const category = Category.create('Subcategory', '📌', expenseType, 'parent-id');
        expect(category.hasParent()).toBe(true);
      });

      it('should return false if no parent', () => {
        const category = Category.create('Root Category', '📌', expenseType);
        expect(category.hasParent()).toBe(false);
      });
    });

    describe('canHaveParent()', () => {
      it('should return true if no parent (can accept one)', () => {
        const category = Category.create('Category', '📌', expenseType);
        expect(category.canHaveParent()).toBe(true);
      });

      it('should return false if already has parent', () => {
        const category = Category.create('Subcategory', '📌', expenseType, 'parent-id');
        expect(category.canHaveParent()).toBe(false);
      });
    });

    describe('setParent()', () => {
      it('should set parent for category without one', () => {
        const category = Category.create('Category', '📌', expenseType);
        category.setParent('parent-123');

        expect(category.getParentId()).toBe('parent-123');
        expect(category.hasParent()).toBe(true);
      });

      it('should remove parent when set to null', () => {
        const category = Category.create('Subcategory', '📌', expenseType, 'parent-id');
        category.setParent(null);

        expect(category.getParentId()).toBeNull();
        expect(category.hasParent()).toBe(false);
      });

      it('should throw error for self-reference', () => {
        const category = Category.fromData('123', 'Category', '📌', CategoryTypeEnum.EXPENSE);
        expect(() => category.setParent('123')).toThrow('Category cannot be its own parent');
      });

      it('should throw error if inactive', () => {
        const category = Category.fromData(
          '123',
          'Category',
          '📌',
          CategoryTypeEnum.EXPENSE,
          null,
          false
        );

        expect(() => category.setParent('parent-id')).toThrow('Cannot modify inactive category');
      });

      it('should prevent setting parent when category already has one', () => {
        const category = Category.create('Subcategory', '📌', expenseType, 'parent-1');
        expect(() => category.setParent('parent-2')).toThrow(
          'Category cannot have children if it has a parent'
        );
      });
    });
  });

  describe('business operations', () => {
    describe('activate()', () => {
      it('should activate an inactive category', () => {
        const category = Category.fromData(
          '123',
          'Category',
          '📌',
          CategoryTypeEnum.EXPENSE,
          null,
          false
        );

        expect(category.isActive()).toBe(false);
        category.activate();
        expect(category.isActive()).toBe(true);
      });

      it('should throw error if already active', () => {
        const category = Category.create('Category', '📌', expenseType);
        expect(() => category.activate()).toThrow('Category is already active');
      });
    });

    describe('deactivate()', () => {
      it('should deactivate an active category', () => {
        const category = Category.create('Category', '📌', expenseType);
        expect(category.isActive()).toBe(true);

        category.deactivate();
        expect(category.isActive()).toBe(false);
      });

      it('should throw error if already inactive', () => {
        const category = Category.fromData(
          '123',
          'Category',
          '📌',
          CategoryTypeEnum.EXPENSE,
          null,
          false
        );

        expect(() => category.deactivate()).toThrow('Category is already inactive');
      });
    });

    describe('updateName()', () => {
      it('should update category name', () => {
        const category = Category.create('Old Name', '📌', expenseType);
        category.updateName('New Name');
        expect(category.getName()).toBe('New Name');
      });

      it('should throw error if inactive', () => {
        const category = Category.fromData(
          '123',
          'Category',
          '📌',
          CategoryTypeEnum.EXPENSE,
          null,
          false
        );

        expect(() => category.updateName('New Name')).toThrow(
          'Cannot update inactive category'
        );
      });

      it('should validate new name', () => {
        const category = Category.create('Category', '📌', expenseType);

        expect(() => category.updateName('')).toThrow('Category name cannot be empty');
        expect(() => category.updateName('A'.repeat(101))).toThrow(
          'Category name cannot exceed 100 characters'
        );
      });

      it('should trim whitespace', () => {
        const category = Category.create('Category', '📌', expenseType);
        category.updateName('  Updated  ');
        expect(category.getName()).toBe('Updated');
      });
    });

    describe('updateIcon()', () => {
      it('should update category icon', () => {
        const category = Category.create('Category', '📌', expenseType);
        category.updateIcon('🎯');
        expect(category.getIcon()).toBe('🎯');
      });

      it('should throw error if inactive', () => {
        const category = Category.fromData(
          '123',
          'Category',
          '📌',
          CategoryTypeEnum.EXPENSE,
          null,
          false
        );

        expect(() => category.updateIcon('🎯')).toThrow('Cannot update inactive category');
      });

      it('should validate new icon', () => {
        const category = Category.create('Category', '📌', expenseType);

        expect(() => category.updateIcon('')).toThrow('Category icon cannot be empty');
        expect(() => category.updateIcon('A'.repeat(51))).toThrow(
          'Category icon cannot exceed 50 characters'
        );
      });

      it('should trim whitespace', () => {
        const category = Category.create('Category', '📌', expenseType);
        category.updateIcon('  🎯  ');
        expect(category.getIcon()).toBe('🎯');
      });
    });

    describe('canDelete()', () => {
      it('should return true for active persisted category', () => {
        const category = Category.fromData(
          '123',
          'Category',
          '📌',
          CategoryTypeEnum.EXPENSE,
          null,
          true
        );

        expect(category.canDelete()).toBe(true);
      });

      it('should return false for inactive category', () => {
        const category = Category.fromData(
          '123',
          'Category',
          '📌',
          CategoryTypeEnum.EXPENSE,
          null,
          false
        );

        expect(category.canDelete()).toBe(false);
      });

      it('should return false for unpersisted category', () => {
        const category = Category.create('Category', '📌', expenseType);
        expect(category.canDelete()).toBe(false);
      });
    });
  });

  describe('display and serialization', () => {
    it('should return display representation', () => {
      const category = Category.create('Salary', '💰', incomeType);
      const display = category.display();

      expect(display).toContain('Salary');
      expect(display).toContain('Income');
      expect(display).toContain('Active');
    });

    it('should show hierarchy in display', () => {
      const category = Category.create('Fast Food', '🍔', expenseType, 'food-parent');
      const display = category.display();

      expect(display).toContain('child of food-parent');
    });

    it('should show inactive status in display', () => {
      const category = Category.fromData(
        '123',
        'Old Category',
        '❌',
        CategoryTypeEnum.EXPENSE,
        null,
        false
      );

      expect(category.display()).toContain('Inactive');
    });

    it('should serialize to JSON', () => {
      const category = Category.fromData(
        '123',
        'Groceries',
        '🛒',
        CategoryTypeEnum.EXPENSE,
        null,
        true
      );

      const json = category.toJSON();

      expect(json.id).toBe('123');
      expect(json.name).toBe('Groceries');
      expect(json.icon).toBe('🛒');
      expect(json.type).toBe(CategoryTypeEnum.EXPENSE);
      expect(json.parentId).toBeNull();
      expect(json.active).toBe(true);
    });

    it('should include parent in JSON if set', () => {
      const category = Category.fromData(
        '123',
        'Fast Food',
        '🍔',
        CategoryTypeEnum.EXPENSE,
        'food-parent-id'
      );

      const json = category.toJSON();
      expect(json.parentId).toBe('food-parent-id');
    });
  });

  describe('category types', () => {
    it('should support INCOME categories', () => {
      const category = Category.create('Salary', '💰', incomeType);
      expect(category.getType().isIncome()).toBe(true);
    });

    it('should support EXPENSE categories', () => {
      const category = Category.create('Groceries', '🛒', expenseType);
      expect(category.getType().isExpense()).toBe(true);
    });

    it('should support TRANSFER categories', () => {
      const transferType = CategoryType.of('TRANSFER');
      const category = Category.create('Account Transfer', '↔️', transferType);
      expect(category.getType().isTransfer()).toBe(true);
    });
  });

  describe('aggregate behavior', () => {
    it('should maintain consistency through operations', () => {
      const category = Category.create('Groceries', '🛒', expenseType);

      expect(category.isActive()).toBe(true);
      expect(category.canDelete()).toBe(false); // Not persisted

      category.updateName('Foods & Groceries');
      expect(category.getName()).toBe('Foods & Groceries');

      category.deactivate();
      expect(category.isActive()).toBe(false);
      expect(category.canDelete()).toBe(false);
    });

    it('should prevent operations on inactive category', () => {
      const category = Category.create('Category', '📌', expenseType);
      category.deactivate();

      expect(() => category.updateName('New Name')).toThrow();
      expect(() => category.updateIcon('🎯')).toThrow();
      expect(() => category.setParent('parent-id')).toThrow();
    });

    it('should track state through business methods', () => {
      const category = Category.create('Food', '🍎', expenseType);
      expect(category.hasParent()).toBe(false);

      category.setParent('groceries-id');
      expect(category.hasParent()).toBe(true);

      const json = category.toJSON();
      expect(json.parentId).toBe('groceries-id');
    });
  });

  describe('edge cases', () => {
    it('should handle maximum length name', () => {
      const maxName = 'A'.repeat(100);
      const category = Category.create(maxName, '📌', expenseType);
      expect(category.getName()).toHaveLength(100);
    });

    it('should handle emoji icons', () => {
      const icons = ['💰', '🛒', '🍎', '🚗', '🏠', '❤️', '🎮'];
      icons.forEach((icon) => {
        const category = Category.create('Category', icon, expenseType);
        expect(category.getIcon()).toBe(icon);
      });
    });

    it('should handle special characters in name', () => {
      const category = Category.create("O'Reilly's Food & Drinks", '🍽️', expenseType);
      expect(category.getName()).toBe("O'Reilly's Food & Drinks");
    });

    it('should handle null parent gracefully', () => {
      const category = Category.create('Category', '📌', expenseType, null);
      expect(category.hasParent()).toBe(false);
    });
  });
});
