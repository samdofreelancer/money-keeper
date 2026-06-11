import { Money, Currency } from '../value-objects';

/**
 * Enumeration for account types
 */
export enum AccountTypeEnum {
  CASH = 'CASH',
  BANK_ACCOUNT = 'BANK_ACCOUNT',
  CREDIT_CARD = 'CREDIT_CARD',
  INVESTMENT = 'INVESTMENT',
  E_WALLET = 'E_WALLET',
  OTHER = 'OTHER',
}

/**
 * Aggregate Root representing a financial account
 * Encapsulates business logic for account operations
 */
export class Account {
  private readonly id: string | null;
  private name: string;
  private type: AccountTypeEnum;
  private initialBalance: Money;
  private active: boolean;
  private createdAt: Date;

  /**
   * Private constructor - use factory methods
   */
  private constructor(
    id: string | null,
    name: string,
    type: AccountTypeEnum,
    initialBalance: Money,
    active: boolean,
    createdAt: Date
  ) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.initialBalance = initialBalance;
    this.active = active;
    this.createdAt = createdAt;
  }

  /**
   * Factory method to create a new account
   * Use for creating unsaved accounts
   */
  static create(
    name: string,
    type: AccountTypeEnum | string,
    initialBalance: Money
  ): Account {
    return new Account(
      null,
      Account.validateName(name),
      typeof type === 'string' ? (type.toUpperCase() as AccountTypeEnum) : type,
      initialBalance,
      true,
      new Date()
    );
  }

  /**
   * Factory method to reconstruct from persistence
   * Use when loading from database/API
   */
  static fromData(
    id: string,
    name: string,
    type: AccountTypeEnum | string,
    initialBalance: Money,
    active: boolean = true,
    createdAt: Date = new Date()
  ): Account {
    return new Account(
      id,
      Account.validateName(name),
      typeof type === 'string' ? (type.toUpperCase() as AccountTypeEnum) : type,
      initialBalance,
      active,
      createdAt
    );
  }

  /**
   * Validate account name
   */
  private static validateName(name: string): string {
    if (!name || name.trim().length === 0) {
      throw new Error('Account name cannot be empty');
    }
    const trimmed = name.trim();
    if (trimmed.length > 150) {
      throw new Error('Account name cannot exceed 150 characters');
    }
    return trimmed;
  }

  /**
   * Get account ID
   */
  getId(): string | null {
    return this.id;
  }

  /**
   * Check if account is persisted (has ID)
   */
  isPersisted(): boolean {
    return this.id !== null;
  }

  /**
   * Get account name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Get account type
   */
  getType(): AccountTypeEnum {
    return this.type;
  }

  /**
   * Get initial balance
   */
  getInitialBalance(): Money {
    return this.initialBalance;
  }

  /**
   * Check if account is active
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
   * Activate account (business operation)
   */
  activate(): void {
    if (this.active) {
      throw new Error('Account is already active');
    }
    this.active = true;
  }

  /**
   * Deactivate account (business operation)
   */
  deactivate(): void {
    if (!this.active) {
      throw new Error('Account is already inactive');
    }
    this.active = false;
  }

  /**
   * Update account name (business operation)
   */
  updateName(newName: string): void {
    if (!this.active) {
      throw new Error('Cannot update inactive account');
    }
    this.name = Account.validateName(newName);
  }

  /**
   * Check if account can be modified
   */
  canModify(): boolean {
    return this.active && this.isPersisted();
  }

  /**
   * Get display representation
   */
  display(): string {
    return `${this.name} (${this.type}) - ${this.initialBalance.format()} - ${this.active ? 'Active' : 'Inactive'}`;
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      initialBalance: {
        amount: this.initialBalance.getAmount(),
        currency: this.initialBalance.getCurrency().getCode(),
      },
      active: this.active,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
