import { Currency } from './Currency';

/**
 * Immutable value object representing a monetary amount
 * Combines numeric value with currency information
 */
export class Money {
  private readonly amount: number;
  private readonly currency: Currency;

  private constructor(amount: number, currency: Currency) {
    this.validateAmount(amount);
    this.amount = amount;
    this.currency = currency;
  }

  private validateAmount(amount: number): void {
    if (typeof amount !== 'number' || isNaN(amount)) {
      throw new Error('Amount must be a valid number');
    }
    if (amount < 0) {
      throw new Error('Amount cannot be negative');
    }
    // Allow reasonable precision (2 decimal places typical for money)
    const decimalPlaces = (amount.toString().split('.')[1] || []).length;
    if (decimalPlaces > 10) {
      throw new Error('Amount cannot have more than 10 decimal places');
    }
  }

  /**
   * Factory method to create a Money instance
   * @param amount Numeric amount
   * @param currency Currency instance or ISO code
   * @returns Money instance
   */
  static of(amount: number, currency: Currency | string): Money {
    const currencyObj = typeof currency === 'string' ? Currency.of(currency) : currency;
    return new Money(amount, currencyObj);
  }

  /**
   * Get the numeric amount
   */
  getAmount(): number {
    return this.amount;
  }

  /**
   * Get the currency
   */
  getCurrency(): Currency {
    return this.currency;
  }

  /**
   * Add money to this amount
   * Must be in the same currency
   */
  add(other: Money): Money {
    if (!this.currency.equals(other.currency)) {
      throw new Error(`Cannot add different currencies: ${this.currency} and ${other.currency}`);
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  /**
   * Subtract money from this amount
   * Must be in the same currency
   */
  subtract(other: Money): Money {
    if (!this.currency.equals(other.currency)) {
      throw new Error(`Cannot subtract different currencies: ${this.currency} and ${other.currency}`);
    }
    const result = this.amount - other.amount;
    if (result < 0) {
      throw new Error('Result would be negative');
    }
    return new Money(result, this.currency);
  }

  /**
   * Multiply by a scalar
   */
  multiply(scalar: number): Money {
    if (typeof scalar !== 'number' || scalar < 0) {
      throw new Error('Scalar must be a non-negative number');
    }
    return new Money(this.amount * scalar, this.currency);
  }

  /**
   * Check if amount is greater than another
   * Must be in the same currency
   */
  isGreaterThan(other: Money): boolean {
    if (!this.currency.equals(other.currency)) {
      throw new Error(`Cannot compare different currencies: ${this.currency} and ${other.currency}`);
    }
    return this.amount > other.amount;
  }

  /**
   * Check if amount equals another
   * Must be in the same currency
   */
  equals(other: Money): boolean {
    if (!this.currency.equals(other.currency)) {
      return false;
    }
    return Math.abs(this.amount - other.amount) < 1e-10;
  }

  /**
   * Format for display (e.g., "$1,234.56")
   */
  format(): string {
    const formatter = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${this.currency.getSymbol()}${formatter.format(this.amount)}`;
  }

  /**
   * String representation
   */
  toString(): string {
    return `${this.amount} ${this.currency}`;
  }
}
