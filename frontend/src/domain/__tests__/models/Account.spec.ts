import { describe, it, expect, beforeEach } from 'vitest';
import { Account, AccountTypeEnum } from '../../models';
import { Money, Currency } from '../../value-objects';

describe('Account Domain Entity', () => {
  let usd: Currency;
  let initialBalance: Money;

  beforeEach(() => {
    usd = Currency.of('USD');
    initialBalance = Money.of(1000, usd);
  });

  describe('factory method - create()', () => {
    it('should create a new unsaved account', () => {
      const account = Account.create('My Checking Account', AccountTypeEnum.BANK_ACCOUNT, initialBalance);

      expect(account.getId()).toBeNull();
      expect(account.isPersisted()).toBe(false);
      expect(account.getName()).toBe('My Checking Account');
      expect(account.getType()).toBe(AccountTypeEnum.BANK_ACCOUNT);
      expect(account.getInitialBalance().equals(initialBalance)).toBe(true);
      expect(account.isActive()).toBe(true);
    });

    it('should validate account name', () => {
      expect(() => Account.create('', AccountTypeEnum.CASH, initialBalance)).toThrow(
        'Account name cannot be empty'
      );
      expect(() => Account.create('   ', AccountTypeEnum.CASH, initialBalance)).toThrow(
        'Account name cannot be empty'
      );
    });

    it('should reject names exceeding 150 characters', () => {
      const longName = 'A'.repeat(151);
      expect(() => Account.create(longName, AccountTypeEnum.CASH, initialBalance)).toThrow(
        'Account name cannot exceed 150 characters'
      );
    });

    it('should trim whitespace from name', () => {
      const account = Account.create('  My Account  ', AccountTypeEnum.CASH, initialBalance);
      expect(account.getName()).toBe('My Account');
    });

    it('should accept account type as string (enum conversion)', () => {
      const account = Account.create('Account', 'CASH', initialBalance);
      expect(account.getType()).toBe(AccountTypeEnum.CASH);
    });

    it('should accept lowercase account type string', () => {
      const account = Account.create('Account', 'bank_account', initialBalance);
      expect(account.getType()).toBe(AccountTypeEnum.BANK_ACCOUNT);
    });

    it('should set account as active by default', () => {
      const account = Account.create('Account', AccountTypeEnum.CASH, initialBalance);
      expect(account.isActive()).toBe(true);
    });
  });

  describe('factory method - fromData()', () => {
    it('should reconstruct a persisted account', () => {
      const account = Account.fromData(
        '123',
        'My Checking',
        AccountTypeEnum.BANK_ACCOUNT,
        initialBalance,
        true
      );

      expect(account.getId()).toBe('123');
      expect(account.isPersisted()).toBe(true);
      expect(account.getName()).toBe('My Checking');
      expect(account.isActive()).toBe(true);
    });

    it('should reconstruct with inactive account', () => {
      const account = Account.fromData(
        '456',
        'Old Account',
        AccountTypeEnum.CASH,
        initialBalance,
        false
      );

      expect(account.isActive()).toBe(false);
    });

    it('should handle type conversion from string', () => {
      const account = Account.fromData(
        '789',
        'Account',
        'CREDIT_CARD',
        initialBalance
      );

      expect(account.getType()).toBe(AccountTypeEnum.CREDIT_CARD);
    });

    it('should use current date if not provided', () => {
      const account = Account.fromData('123', 'Account', AccountTypeEnum.CASH, initialBalance);
      expect(account.getCreatedAt()).toBeInstanceOf(Date);
    });

    it('should use provided creation date', () => {
      const specificDate = new Date('2024-01-15');
      const account = Account.fromData(
        '123',
        'Account',
        AccountTypeEnum.CASH,
        initialBalance,
        true,
        specificDate
      );

      expect(account.getCreatedAt()).toEqual(specificDate);
    });
  });

  describe('getters', () => {
    let account: Account;

    beforeEach(() => {
      account = Account.create('Test Account', AccountTypeEnum.SAVINGS, initialBalance);
    });

    it('should return ID', () => {
      expect(account.getId()).toBeNull(); // Not persisted
    });

    it('should return name', () => {
      expect(account.getName()).toBe('Test Account');
    });

    it('should return type', () => {
      expect(account.getType()).toBe(AccountTypeEnum.SAVINGS);
    });

    it('should return initial balance', () => {
      expect(account.getInitialBalance().equals(initialBalance)).toBe(true);
    });

    it('should return active status', () => {
      expect(account.isActive()).toBe(true);
    });

    it('should return creation date', () => {
      expect(account.getCreatedAt()).toBeInstanceOf(Date);
    });
  });

  describe('business operations', () => {
    describe('activate()', () => {
      it('should activate an inactive account', () => {
        const account = Account.fromData(
          '123',
          'Account',
          AccountTypeEnum.CASH,
          initialBalance,
          false
        );

        expect(account.isActive()).toBe(false);
        account.activate();
        expect(account.isActive()).toBe(true);
      });

      it('should throw error if already active', () => {
        const account = Account.create('Account', AccountTypeEnum.CASH, initialBalance);
        expect(() => account.activate()).toThrow('Account is already active');
      });
    });

    describe('deactivate()', () => {
      it('should deactivate an active account', () => {
        const account = Account.create('Account', AccountTypeEnum.CASH, initialBalance);
        expect(account.isActive()).toBe(true);

        account.deactivate();
        expect(account.isActive()).toBe(false);
      });

      it('should throw error if already inactive', () => {
        const account = Account.fromData(
          '123',
          'Account',
          AccountTypeEnum.CASH,
          initialBalance,
          false
        );

        expect(() => account.deactivate()).toThrow('Account is already inactive');
      });
    });

    describe('updateName()', () => {
      it('should update account name', () => {
        const account = Account.create('Old Name', AccountTypeEnum.CASH, initialBalance);
        account.updateName('New Name');
        expect(account.getName()).toBe('New Name');
      });

      it('should throw error if account is inactive', () => {
        const account = Account.fromData(
          '123',
          'Account',
          AccountTypeEnum.CASH,
          initialBalance,
          false
        );

        expect(() => account.updateName('New Name')).toThrow(
          'Cannot update inactive account'
        );
      });

      it('should validate new name', () => {
        const account = Account.create('Account', AccountTypeEnum.CASH, initialBalance);

        expect(() => account.updateName('')).toThrow('Account name cannot be empty');
        expect(() => account.updateName('A'.repeat(151))).toThrow(
          'Account name cannot exceed 150 characters'
        );
      });

      it('should trim whitespace from new name', () => {
        const account = Account.create('Account', AccountTypeEnum.CASH, initialBalance);
        account.updateName('  Updated  ');
        expect(account.getName()).toBe('Updated');
      });
    });

    describe('canModify()', () => {
      it('should return true for active persisted account', () => {
        const account = Account.fromData(
          '123',
          'Account',
          AccountTypeEnum.CASH,
          initialBalance,
          true
        );

        expect(account.canModify()).toBe(true);
      });

      it('should return false for inactive account', () => {
        const account = Account.fromData(
          '123',
          'Account',
          AccountTypeEnum.CASH,
          initialBalance,
          false
        );

        expect(account.canModify()).toBe(false);
      });

      it('should return false for unpersisted account', () => {
        const account = Account.create('Account', AccountTypeEnum.CASH, initialBalance);
        expect(account.canModify()).toBe(false);
      });
    });
  });

  describe('display and serialization', () => {
    it('should return display representation', () => {
      const account = Account.create('My Account', AccountTypeEnum.BANK_ACCOUNT, initialBalance);
      const display = account.display();

      expect(display).toContain('My Account');
      expect(display).toContain('BANK_ACCOUNT');
      expect(display).toContain('Active');
    });

    it('should show inactive status in display', () => {
      const account = Account.fromData(
        '123',
        'Old Account',
        AccountTypeEnum.CASH,
        initialBalance,
        false
      );

      expect(account.display()).toContain('Inactive');
    });

    it('should serialize to JSON', () => {
      const account = Account.fromData(
        '123',
        'Account',
        AccountTypeEnum.SAVINGS,
        initialBalance,
        true
      );

      const json = account.toJSON();

      expect(json.id).toBe('123');
      expect(json.name).toBe('Account');
      expect(json.type).toBe(AccountTypeEnum.SAVINGS);
      expect(json.active).toBe(true);
      expect(json.initialBalance).toEqual({
        amount: 1000,
        currency: 'USD',
      });
    });

    it('should include creation date in JSON', () => {
      const account = Account.create('Account', AccountTypeEnum.CASH, initialBalance);
      const json = account.toJSON();

      expect(json.createdAt).toBeTruthy();
      expect(typeof json.createdAt).toBe('string'); // ISO string
    });
  });

  describe('account types', () => {
    it('should support all account types', () => {
      const types = [
        AccountTypeEnum.CASH,
        AccountTypeEnum.BANK_ACCOUNT,
        AccountTypeEnum.CREDIT_CARD,
        AccountTypeEnum.INVESTMENT,
        AccountTypeEnum.E_WALLET,
        AccountTypeEnum.OTHER,
      ];

      types.forEach((type) => {
        const account = Account.create('Account', type, initialBalance);
        expect(account.getType()).toBe(type);
      });
    });
  });

  describe('aggregate behavior', () => {
    it('should maintain state consistency through operations', () => {
      const account = Account.create('Account', AccountTypeEnum.CASH, initialBalance);

      expect(account.isActive()).toBe(true);
      expect(account.canModify()).toBe(false); // Not persisted yet

      account.deactivate();
      expect(account.isActive()).toBe(false);
      expect(account.canModify()).toBe(false);

      account.activate();
      expect(account.isActive()).toBe(true);
    });

    it('should prevent modification of inactive account', () => {
      const account = Account.create('Account', AccountTypeEnum.CASH, initialBalance);
      account.deactivate();

      expect(() => account.updateName('New Name')).toThrow();
    });

    it('should track changes through business operations', () => {
      const account = Account.create('Original', AccountTypeEnum.CASH, initialBalance);
      expect(account.getName()).toBe('Original');

      account.updateName('Updated');
      expect(account.getName()).toBe('Updated');

      const json = account.toJSON();
      expect(json.name).toBe('Updated');
    });
  });

  describe('immutability patterns', () => {
    it('should not expose direct field modification', () => {
      const account = Account.create('Account', AccountTypeEnum.CASH, initialBalance);

      // Direct property modification should not work (TypeScript private)
      expect(() => {
        (account as any).name = 'Hacked';
      }).not.toThrow();

      // But actual name should remain unchanged through public API
      expect(account.getName()).toBe('Account');
    });
  });

  describe('edge cases', () => {
    it('should handle maximum length name', () => {
      const maxName = 'A'.repeat(150);
      const account = Account.create(maxName, AccountTypeEnum.CASH, initialBalance);
      expect(account.getName()).toHaveLength(150);
    });

    it('should handle special characters in name', () => {
      const account = Account.create("O'Reilly's Account #1", AccountTypeEnum.CASH, initialBalance);
      expect(account.getName()).toBe("O'Reilly's Account #1");
    });

    it('should handle very small balance', () => {
      const smallBalance = Money.of(0.01, usd);
      const account = Account.create('Penny Account', AccountTypeEnum.CASH, smallBalance);
      expect(account.getInitialBalance().getAmount()).toBe(0.01);
    });

    it('should handle large balance', () => {
      const largeBalance = Money.of(999999999.99, usd);
      const account = Account.create('Rich Account', AccountTypeEnum.INVESTMENT, largeBalance);
      expect(account.getInitialBalance().getAmount()).toBe(999999999.99);
    });
  });
});
