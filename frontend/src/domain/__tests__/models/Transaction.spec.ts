import { describe, it, expect, beforeEach } from 'vitest';
import { Transaction, TransactionTypeEnum } from '../../models';
import { Money, Currency } from '../../value-objects';

describe('Transaction Domain Entity', () => {
  let usd: Currency;
  let txnAmount: Money;
  const categoryId = 'cat-grocery';
  const accountId = 'acc-checking';
  const counterpartyAccountId = 'acc-savings';

  beforeEach(() => {
    usd = Currency.of('USD');
    txnAmount = Money.of(50, usd);
  });

  describe('factory method - create()', () => {
    it('should create a new expense transaction', () => {
      const txn = Transaction.create(
        txnAmount,
        TransactionTypeEnum.EXPENSE,
        categoryId,
        accountId,
        'Weekly groceries'
      );

      expect(txn.getId()).toBeNull();
      expect(txn.isPersisted()).toBe(false);
      expect(txn.getAmount().equals(txnAmount)).toBe(true);
      expect(txn.getType()).toBe(TransactionTypeEnum.EXPENSE);
      expect(txn.getCategoryId()).toBe(categoryId);
      expect(txn.getAccountId()).toBe(accountId);
      expect(txn.getDescription()).toBe('Weekly groceries');
      expect(txn.isActive()).toBe(true);
    });

    it('should create an income transaction', () => {
      const txn = Transaction.create(
        Money.of(2000, usd),
        TransactionTypeEnum.INCOME,
        'cat-salary',
        accountId,
        'Monthly salary'
      );

      expect(txn.isIncome()).toBe(true);
      expect(txn.getType()).toBe(TransactionTypeEnum.INCOME);
    });

    it('should create a transfer transaction', () => {
      const txn = Transaction.create(
        txnAmount,
        TransactionTypeEnum.TRANSFER,
        'cat-transfer',
        accountId,
        'Savings transfer',
        counterpartyAccountId
      );

      expect(txn.isTransfer()).toBe(true);
      expect(txn.getCounterpartyAccountId()).toBe(counterpartyAccountId);
    });

    it('should accept type as string', () => {
      const txn = Transaction.create(
        txnAmount,
        'EXPENSE',
        categoryId,
        accountId
      );

      expect(txn.getType()).toBe(TransactionTypeEnum.EXPENSE);
    });

    it('should accept lowercase type string', () => {
      const txn = Transaction.create(
        txnAmount,
        'expense',
        categoryId,
        accountId
      );

      expect(txn.getType()).toBe(TransactionTypeEnum.EXPENSE);
    });

    it('should validate amount is positive', () => {
      expect(() => 
        Transaction.create(
          Money.of(0, usd),
          TransactionTypeEnum.EXPENSE,
          categoryId,
          accountId
        )
      ).toThrow('Transaction amount must be positive');

      expect(() =>
        Transaction.create(
          Money.of(-100, usd),
          TransactionTypeEnum.EXPENSE,
          categoryId,
          accountId
        )
      ).toThrow('Transaction amount must be positive');
    });

    it('should require category ID', () => {
      expect(() =>
        Transaction.create(
          txnAmount,
          TransactionTypeEnum.EXPENSE,
          '',
          accountId
        )
      ).toThrow('Category ID is required');
    });

    it('should require account ID', () => {
      expect(() =>
        Transaction.create(
          txnAmount,
          TransactionTypeEnum.EXPENSE,
          categoryId,
          ''
        )
      ).toThrow('Account ID is required');
    });

    it('should require counterparty for transfers', () => {
      expect(() =>
        Transaction.create(
          txnAmount,
          TransactionTypeEnum.TRANSFER,
          categoryId,
          accountId
        )
      ).toThrow('Transfer transactions require counterparty account');
    });

    it('should prevent transfer to same account', () => {
      expect(() =>
        Transaction.create(
          txnAmount,
          TransactionTypeEnum.TRANSFER,
          categoryId,
          accountId,
          'Self transfer',
          accountId // Same as source
        )
      ).toThrow('Transfer account cannot be the same as counterparty account');
    });

    it('should validate description length', () => {
      const longDescription = 'A'.repeat(501);
      expect(() =>
        Transaction.create(
          txnAmount,
          TransactionTypeEnum.EXPENSE,
          categoryId,
          accountId,
          longDescription
        )
      ).toThrow('Description cannot exceed 500 characters');
    });

    it('should trim description', () => {
      const txn = Transaction.create(
        txnAmount,
        TransactionTypeEnum.EXPENSE,
        categoryId,
        accountId,
        '  Weekly groceries  '
      );

      expect(txn.getDescription()).toBe('Weekly groceries');
    });
  });

  describe('factory method - fromData()', () => {
    it('should reconstruct a persisted transaction', () => {
      const txn = Transaction.fromData(
        'txn-123',
        txnAmount,
        TransactionTypeEnum.EXPENSE,
        categoryId,
        accountId,
        'Weekly groceries'
      );

      expect(txn.getId()).toBe('txn-123');
      expect(txn.isPersisted()).toBe(true);
      expect(txn.isActive()).toBe(true);
    });

    it('should reconstruct with all fields', () => {
      const date = new Date('2024-01-15');
      const txn = Transaction.fromData(
        'txn-456',
        txnAmount,
        TransactionTypeEnum.TRANSFER,
        'cat-transfer',
        accountId,
        'To savings',
        counterpartyAccountId,
        date,
        null,
        true
      );

      expect(txn.getCounterpartyAccountId()).toBe(counterpartyAccountId);
      expect(txn.getDate()).toEqual(date);
      expect(txn.getReversalId()).toBeNull();
    });

    it('should reconstruct with reversal link', () => {
      const txn = Transaction.fromData(
        'txn-789',
        txnAmount,
        TransactionTypeEnum.EXPENSE,
        categoryId,
        accountId,
        'Original transaction',
        null,
        new Date(),
        'reversal-txn-999',
        false // Reversed
      );

      expect(txn.getReversalId()).toBe('reversal-txn-999');
      expect(txn.isActive()).toBe(false);
    });
  });

  describe('getters', () => {
    let txn: Transaction;

    beforeEach(() => {
      txn = Transaction.create(
        txnAmount,
        TransactionTypeEnum.EXPENSE,
        categoryId,
        accountId,
        'Weekly groceries'
      );
    });

    it('should return all properties', () => {
      expect(txn.getId()).toBeNull();
      expect(txn.getAmount().equals(txnAmount)).toBe(true);
      expect(txn.getType()).toBe(TransactionTypeEnum.EXPENSE);
      expect(txn.getCategoryId()).toBe(categoryId);
      expect(txn.getAccountId()).toBe(accountId);
      expect(txn.getDescription()).toBe('Weekly groceries');
      expect(txn.isActive()).toBe(true);
      expect(txn.getDate()).toBeInstanceOf(Date);
    });

    it('should return null for counterparty if not set', () => {
      expect(txn.getCounterpartyAccountId()).toBeNull();
    });

    it('should return null for reversal if not set', () => {
      expect(txn.getReversalId()).toBeNull();
    });
  });

  describe('type checking methods', () => {
    it('should correctly identify income', () => {
      const income = Transaction.create(
        Money.of(1000, usd),
        TransactionTypeEnum.INCOME,
        'cat-salary',
        accountId
      );

      expect(income.isIncome()).toBe(true);
      expect(income.isExpense()).toBe(false);
      expect(income.isTransfer()).toBe(false);
    });

    it('should correctly identify expense', () => {
      const expense = Transaction.create(
        txnAmount,
        TransactionTypeEnum.EXPENSE,
        categoryId,
        accountId
      );

      expect(expense.isExpense()).toBe(true);
      expect(expense.isIncome()).toBe(false);
      expect(expense.isTransfer()).toBe(false);
    });

    it('should correctly identify transfer', () => {
      const transfer = Transaction.create(
        txnAmount,
        TransactionTypeEnum.TRANSFER,
        'cat-transfer',
        accountId,
        '',
        counterpartyAccountId
      );

      expect(transfer.isTransfer()).toBe(true);
      expect(transfer.isIncome()).toBe(false);
      expect(transfer.isExpense()).toBe(false);
    });

    it('should correctly identify liability (borrow/lend)', () => {
      const borrow = Transaction.create(
        txnAmount,
        TransactionTypeEnum.BORROW,
        'cat-borrow',
        accountId
      );

      const lend = Transaction.create(
        txnAmount,
        TransactionTypeEnum.LEND,
        'cat-lend',
        accountId
      );

      expect(borrow.isLiability()).toBe(true);
      expect(lend.isLiability()).toBe(true);
    });
  });

  describe('reversal operations', () => {
    describe('canReverse()', () => {
      it('should return true for active persisted expense', () => {
        const txn = Transaction.fromData(
          'txn-123',
          txnAmount,
          TransactionTypeEnum.EXPENSE,
          categoryId,
          accountId
        );

        expect(txn.canReverse()).toBe(true);
      });

      it('should return false for inactive transaction', () => {
        const txn = Transaction.fromData(
          'txn-123',
          txnAmount,
          TransactionTypeEnum.EXPENSE,
          categoryId,
          accountId,
          '',
          null,
          new Date(),
          null,
          false
        );

        expect(txn.canReverse()).toBe(false);
      });

      it('should return false for unpersisted transaction', () => {
        const txn = Transaction.create(
          txnAmount,
          TransactionTypeEnum.EXPENSE,
          categoryId,
          accountId
        );

        expect(txn.canReverse()).toBe(false);
      });

      it('should return false if already reversed', () => {
        const txn = Transaction.fromData(
          'txn-123',
          txnAmount,
          TransactionTypeEnum.EXPENSE,
          categoryId,
          accountId,
          '',
          null,
          new Date(),
          'reversal-txn'
        );

        expect(txn.canReverse()).toBe(false);
      });

      it('should return false for adjustment transactions', () => {
        const txn = Transaction.fromData(
          'txn-123',
          txnAmount,
          TransactionTypeEnum.ADJUSTMENT,
          categoryId,
          accountId
        );

        expect(txn.canReverse()).toBe(false);
      });
    });

    describe('markAsReversed()', () => {
      it('should mark transaction as reversed', () => {
        const txn = Transaction.fromData(
          'txn-123',
          txnAmount,
          TransactionTypeEnum.EXPENSE,
          categoryId,
          accountId
        );

        expect(txn.getReversalId()).toBeNull();
        txn.markAsReversed('reversal-txn');
        expect(txn.getReversalId()).toBe('reversal-txn');
      });

      it('should throw error if cannot reverse', () => {
        const txn = Transaction.create(
          txnAmount,
          TransactionTypeEnum.EXPENSE,
          categoryId,
          accountId
        );

        expect(() => txn.markAsReversed('reversal')).toThrow('Transaction cannot be reversed');
      });
    });

    describe('createReversal()', () => {
      it('should create a reversal transaction', () => {
        const original = Transaction.fromData(
          'txn-123',
          Money.of(100, usd),
          TransactionTypeEnum.EXPENSE,
          categoryId,
          accountId,
          'Original purchase'
        );

        const reversal = original.createReversal();

        expect(reversal.getId()).toBeNull(); // New transaction
        expect(reversal.getAmount().equals(original.getAmount())).toBe(true);
        expect(reversal.getType()).toBe(original.getType());
        expect(reversal.getCategoryId()).toBe(original.getCategoryId());
        expect(reversal.getDescription()).toContain('[REVERSAL]');
        expect(reversal.getDescription()).toContain('Original purchase');
      });

      it('should swap accounts for transfer reversals', () => {
        const transfer = Transaction.fromData(
          'txn-transfer',
          txnAmount,
          TransactionTypeEnum.TRANSFER,
          'cat-transfer',
          accountId,
          'To savings',
          counterpartyAccountId
        );

        const reversal = transfer.createReversal();

        expect(reversal.getAccountId()).toBe(counterpartyAccountId);
        expect(reversal.getCounterpartyAccountId()).toBe(accountId);
      });

      it('should throw error if cannot reverse', () => {
        const txn = Transaction.create(
          txnAmount,
          TransactionTypeEnum.EXPENSE,
          categoryId,
          accountId
        );

        expect(() => txn.createReversal()).toThrow('Transaction cannot be reversed');
      });
    });
  });

  describe('business operations', () => {
    describe('updateDescription()', () => {
      it('should update description', () => {
        const txn = Transaction.fromData(
          'txn-123',
          txnAmount,
          TransactionTypeEnum.EXPENSE,
          categoryId,
          accountId,
          'Original description'
        );

        txn.updateDescription('Updated description');
        expect(txn.getDescription()).toBe('Updated description');
      });

      it('should throw error if inactive', () => {
        const txn = Transaction.fromData(
          'txn-123',
          txnAmount,
          TransactionTypeEnum.EXPENSE,
          categoryId,
          accountId,
          '',
          null,
          new Date(),
          null,
          false
        );

        expect(() => txn.updateDescription('New')).toThrow('Cannot update inactive transaction');
      });

      it('should throw error if reversed', () => {
        const txn = Transaction.fromData(
          'txn-123',
          txnAmount,
          TransactionTypeEnum.EXPENSE,
          categoryId,
          accountId,
          '',
          null,
          new Date(),
          'reversal-txn'
        );

        expect(() => txn.updateDescription('New')).toThrow(
          'Cannot update reversed transaction'
        );
      });

      it('should validate description', () => {
        const txn = Transaction.fromData(
          'txn-123',
          txnAmount,
          TransactionTypeEnum.EXPENSE,
          categoryId,
          accountId
        );

        expect(() => txn.updateDescription('A'.repeat(501))).toThrow(
          'Description cannot exceed 500 characters'
        );
      });

      it('should trim description', () => {
        const txn = Transaction.fromData(
          'txn-123',
          txnAmount,
          TransactionTypeEnum.EXPENSE,
          categoryId,
          accountId
        );

        txn.updateDescription('  Updated  ');
        expect(txn.getDescription()).toBe('Updated');
      });
    });
  });

  describe('display and serialization', () => {
    it('should return display representation', () => {
      const txn = Transaction.create(
        txnAmount,
        TransactionTypeEnum.EXPENSE,
        categoryId,
        accountId,
        'Weekly groceries'
      );

      const display = txn.display();
      expect(display).toContain('EXPENSE');
      expect(display).toContain('50');
      expect(display).toContain('Weekly groceries');
    });

    it('should show [No description] for empty', () => {
      const txn = Transaction.create(
        txnAmount,
        TransactionTypeEnum.EXPENSE,
        categoryId,
        accountId
      );

      expect(txn.display()).toContain('No description');
    });

    it('should serialize to JSON', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const txn = Transaction.fromData(
        'txn-123',
        txnAmount,
        TransactionTypeEnum.EXPENSE,
        categoryId,
        accountId,
        'Weekly groceries',
        null,
        date
      );

      const json = txn.toJSON();

      expect(json.id).toBe('txn-123');
      expect(json.amount).toEqual({
        value: 50,
        currency: 'USD',
      });
      expect(json.type).toBe(TransactionTypeEnum.EXPENSE);
      expect(json.categoryId).toBe(categoryId);
      expect(json.accountId).toBe(accountId);
      expect(json.description).toBe('Weekly groceries');
      expect(json.date).toBe('2024-01-15T10:30:00.000Z');
    });
  });

  describe('transaction types', () => {
    it('should support all transaction types', () => {
      const types = [
        TransactionTypeEnum.INCOME,
        TransactionTypeEnum.EXPENSE,
        TransactionTypeEnum.TRANSFER,
        TransactionTypeEnum.BORROW,
        TransactionTypeEnum.LEND,
        TransactionTypeEnum.ADJUSTMENT,
      ];

      types.forEach((type) => {
        const txn = type === TransactionTypeEnum.TRANSFER
          ? Transaction.create(
              txnAmount,
              type,
              'cat-id',
              accountId,
              '',
              counterpartyAccountId
            )
          : Transaction.create(
              txnAmount,
              type,
              'cat-id',
              accountId
            );

        expect(txn.getType()).toBe(type);
      });
    });
  });

  describe('aggregate behavior', () => {
    it('should maintain consistency through operations', () => {
      const txn = Transaction.fromData(
        'txn-123',
        Money.of(100, usd),
        TransactionTypeEnum.EXPENSE,
        categoryId,
        accountId,
        'Original'
      );

      expect(txn.canReverse()).toBe(true);
      expect(txn.getDescription()).toBe('Original');

      txn.updateDescription('Updated');
      expect(txn.getDescription()).toBe('Updated');

      txn.markAsReversed('reversal-txn');
      expect(txn.canReverse()).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle very large amounts', () => {
      const largeAmount = Money.of(999999999.99, usd);
      const txn = Transaction.create(
        largeAmount,
        TransactionTypeEnum.EXPENSE,
        categoryId,
        accountId
      );

      expect(txn.getAmount().equals(largeAmount)).toBe(true);
    });

    it('should handle small amounts', () => {
      const smallAmount = Money.of(0.01, usd);
      const txn = Transaction.create(
        smallAmount,
        TransactionTypeEnum.EXPENSE,
        categoryId,
        accountId
      );

      expect(txn.getAmount().getAmount()).toBe(0.01);
    });

    it('should handle maximum description length', () => {
      const maxDesc = 'A'.repeat(500);
      const txn = Transaction.create(
        txnAmount,
        TransactionTypeEnum.EXPENSE,
        categoryId,
        accountId,
        maxDesc
      );

      expect(txn.getDescription()).toHaveLength(500);
    });
  });
});
