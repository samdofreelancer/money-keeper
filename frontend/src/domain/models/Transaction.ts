import { Money, CategoryType, CategoryTypeEnum } from '../value-objects';

/**
 * Enumeration for transaction types
 */
export enum TransactionTypeEnum {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER',
  BORROW = 'BORROW',
  LEND = 'LEND',
  ADJUSTMENT = 'ADJUSTMENT',
}

/**
 * Entity representing a financial transaction
 * Part of Account aggregate, encapsulates transaction domain logic
 */
export class Transaction {
  private readonly id: string | null;
  private amount: Money;
  private type: TransactionTypeEnum;
  private categoryId: string;
  private description: string;
  private accountId: string;
  private counterpartyAccountId: string | null; // For transfers only
  private date: Date;
  private reversalId: string | null; // Links to reversal transaction
  private active: boolean;
  private createdAt: Date;

  /**
   * Private constructor - use factory methods
   */
  private constructor(
    id: string | null,
    amount: Money,
    type: TransactionTypeEnum,
    categoryId: string,
    description: string,
    accountId: string,
    counterpartyAccountId: string | null,
    date: Date,
    reversalId: string | null,
    active: boolean,
    createdAt: Date
  ) {
    this.id = id;
    this.amount = amount;
    this.type = type;
    this.categoryId = categoryId;
    this.description = description;
    this.accountId = accountId;
    this.counterpartyAccountId = counterpartyAccountId;
    this.date = date;
    this.reversalId = reversalId;
    this.active = active;
    this.createdAt = createdAt;
  }

  /**
   * Factory method to create a new transaction
   */
  static create(
    amount: Money,
    type: TransactionTypeEnum | string,
    categoryId: string,
    accountId: string,
    description?: string,
    counterpartyAccountId?: string | null,
    date?: Date
  ): Transaction {
    const transactionType =
      typeof type === 'string' ? (type.toUpperCase() as TransactionTypeEnum) : type;

    Transaction.validateCreate(
      amount,
      transactionType,
      categoryId,
      accountId,
      counterpartyAccountId
    );

    return new Transaction(
      null,
      amount,
      transactionType,
      categoryId,
      Transaction.validateDescription(description),
      accountId,
      counterpartyAccountId ?? null,
      date ?? new Date(),
      null,
      true,
      new Date()
    );
  }

  /**
   * Factory method to reconstruct from persistence
   */
  static fromData(
    id: string,
    amount: Money,
    type: TransactionTypeEnum | string,
    categoryId: string,
    accountId: string,
    description: string = '',
    counterpartyAccountId: string | null = null,
    date: Date = new Date(),
    reversalId: string | null = null,
    active: boolean = true,
    createdAt: Date = new Date()
  ): Transaction {
    const transactionType =
      typeof type === 'string' ? (type.toUpperCase() as TransactionTypeEnum) : type;

    return new Transaction(
      id,
      amount,
      transactionType,
      categoryId,
      Transaction.validateDescription(description),
      accountId,
      counterpartyAccountId,
      date,
      reversalId,
      active,
      createdAt
    );
  }

  /**
   * Validate transaction creation parameters
   */
  private static validateCreate(
    amount: Money,
    type: TransactionTypeEnum,
    categoryId: string,
    accountId: string,
    counterpartyAccountId?: string | null
  ): void {
    if (amount.getAmount() <= 0) {
      throw new Error('Transaction amount must be positive');
    }

    if (!categoryId || categoryId.trim().length === 0) {
      throw new Error('Category ID is required');
    }

    if (!accountId || accountId.trim().length === 0) {
      throw new Error('Account ID is required');
    }

    if (type === TransactionTypeEnum.TRANSFER) {
      if (!counterpartyAccountId || counterpartyAccountId.trim().length === 0) {
        throw new Error('Transfer transactions require counterparty account');
      }
      if (accountId === counterpartyAccountId) {
        throw new Error('Transfer account cannot be the same as counterparty account');
      }
    }
  }

  /**
   * Validate description
   */
  private static validateDescription(description?: string): string {
    if (!description) {
      return '';
    }
    const trimmed = description.trim();
    if (trimmed.length > 500) {
      throw new Error('Description cannot exceed 500 characters');
    }
    return trimmed;
  }

  /**
   * Get transaction ID
   */
  getId(): string | null {
    return this.id;
  }

  /**
   * Check if transaction is persisted
   */
  isPersisted(): boolean {
    return this.id !== null;
  }

  /**
   * Get transaction amount
   */
  getAmount(): Money {
    return this.amount;
  }

  /**
   * Get transaction type
   */
  getType(): TransactionTypeEnum {
    return this.type;
  }

  /**
   * Get category ID
   */
  getCategoryId(): string {
    return this.categoryId;
  }

  /**
   * Get description
   */
  getDescription(): string {
    return this.description;
  }

  /**
   * Get account ID
   */
  getAccountId(): string {
    return this.accountId;
  }

  /**
   * Get counterparty account ID (for transfers)
   */
  getCounterpartyAccountId(): string | null {
    return this.counterpartyAccountId;
  }

  /**
   * Get transaction date
   */
  getDate(): Date {
    return this.date;
  }

  /**
   * Get linked reversal transaction ID
   */
  getReversalId(): string | null {
    return this.reversalId;
  }

  /**
   * Check if transaction is active
   */
  isActive(): boolean {
    return this.active;
  }

  /**
   * Get creation date
   */
  getCreatedAt(): Date {
    return this.createdAt;
  }

  /**
   * Check if transaction is a transfer between accounts
   */
  isTransfer(): boolean {
    return this.type === TransactionTypeEnum.TRANSFER;
  }

  /**
   * Check if transaction is income
   */
  isIncome(): boolean {
    return this.type === TransactionTypeEnum.INCOME;
  }

  /**
   * Check if transaction is expense
   */
  isExpense(): boolean {
    return this.type === TransactionTypeEnum.EXPENSE;
  }

  /**
   * Check if transaction is a borrow/lend
   */
  isLiability(): boolean {
    return this.type === TransactionTypeEnum.BORROW || this.type === TransactionTypeEnum.LEND;
  }

  /**
   * Check if transaction can be reversed
   * Returns false if already reversed or is a reversal itself
   */
  canReverse(): boolean {
    if (!this.active || !this.isPersisted()) {
      return false;
    }

    // Cannot reverse if already has a reversal
    if (this.reversalId !== null) {
      return false;
    }

    // Adjustment transactions may not be reversible depending on business rules
    if (this.type === TransactionTypeEnum.ADJUSTMENT) {
      return false;
    }

    return true;
  }

  /**
   * Mark transaction as reversed by another transaction
   * Business operation used when creating a reversal
   */
  markAsReversed(reversalId: string): void {
    if (!this.canReverse()) {
      throw new Error('Transaction cannot be reversed');
    }
    this.reversalId = reversalId;
  }

  /**
   * Create a reversal transaction for this transaction
   * Returns a new Transaction that reverses this one
   */
  createReversal(): Transaction {
    if (!this.canReverse()) {
      throw new Error('Transaction cannot be reversed');
    }

    // Create reverse transaction with:
    // - Same amount and currency
    // - Opposite sign/flow (handled by business logic in service)
    // - Reference to original transaction
    // - Same category and description
    const reversal = new Transaction(
      null, // New ID assigned by persistence
      this.amount,
      this.type,
      this.categoryId,
      `[REVERSAL] ${this.description}`,
      this.counterpartyAccountId ?? this.accountId, // Swap accounts if transfer
      this.isTransfer() ? this.accountId : null,
      new Date(), // Current date for reversal
      null, // Will be linked to original after persistence
      true,
      new Date()
    );

    return reversal;
  }

  /**
   * Update transaction description (business operation)
   */
  updateDescription(newDescription: string): void {
    if (!this.active) {
      throw new Error('Cannot update inactive transaction');
    }
    if (this.reversalId !== null) {
      throw new Error('Cannot update reversed transaction');
    }
    this.description = Transaction.validateDescription(newDescription);
  }

  /**
   * Get display representation
   */
  display(): string {
    return `${this.type}: ${this.amount.format()} (${this.categoryId}) - ${this.description || 'No description'}`;
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON(): Record<string, any> {
    return {
      id: this.id,
      amount: {
        value: this.amount.getAmount(),
        currency: this.amount.getCurrency().getCode(),
      },
      type: this.type,
      categoryId: this.categoryId,
      description: this.description,
      accountId: this.accountId,
      counterpartyAccountId: this.counterpartyAccountId,
      date: this.date.toISOString(),
      reversalId: this.reversalId,
      active: this.active,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
