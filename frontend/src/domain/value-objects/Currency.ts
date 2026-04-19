/**
 * Immutable value object representing a currency code (USD, EUR, VND, etc.)
 * Follows ISO 4217 standard currency codes
 */
export class Currency {
  private readonly code: string;

  private constructor(code: string) {
    this.validateCode(code);
    this.code = code;
  }

  private validateCode(code: string): void {
    if (!code || code.trim().length === 0) {
      throw new Error('Currency code cannot be empty');
    }
    if (code.length !== 3) {
      throw new Error('Currency code must be exactly 3 characters (ISO 4217)');
    }
    if (!/^[A-Z]{3}$/.test(code)) {
      throw new Error('Currency code must be uppercase ISO 4217 format');
    }
  }

  /**
   * Factory method to create a Currency instance
   * @param code ISO 4217 currency code (e.g., 'USD', 'EUR', 'VND')
   * @returns Currency instance
   */
  static of(code: string): Currency {
    return new Currency(code.toUpperCase());
  }

  /**
   * Get the currency code
   */
  getCode(): string {
    return this.code;
  }

  /**
   * Check if this currency equals another
   */
  equals(other: Currency): boolean {
    return this.code === other.code;
  }

  /**
   * String representation
   */
  toString(): string {
    return this.code;
  }

  /**
   * Get common currency symbols for display
   */
  getSymbol(): string {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      VND: '₫',
      GBP: '£',
      JPY: '¥',
      CNY: '¥',
      CHF: 'CHF',
      AUD: 'A$',
      CAD: 'C$',
      SGD: 'S$',
    };
    return symbols[this.code] || this.code;
  }
}
