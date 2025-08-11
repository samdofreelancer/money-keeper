/**
 * Currency-related constants for parsing and formatting
 */
export const CurrencyConstants = {
  /**
   * Regex patterns for currency parsing
   */
  PATTERNS: {
    /**
     * Pattern for USD currency format: $1,234.56
     * Captures the numeric value including commas
     */
    USD: /\$([\d,]+(?:\.\d{2})?)/,
    
    /**
     * Pattern for EUR currency format: €1.234,56
     * Captures the numeric value including dots as thousand separators
     */
    EUR: /€([\d.]+(?:,\d{2})?)/,
    
    /**
     * Pattern for GBP currency format: £1,234.56
     * Captures the numeric value including commas
     */
    GBP: /£([\d,]+(?:\.\d{2})?)/,
    
    /**
     * Generic currency pattern that captures any currency symbol
     * Format: [CurrencySymbol][Amount]
     */
    GENERIC: /([^\d\s])\s*([\d,.]+)/,
  },

  /**
   * Currency symbols for different locales
   */
  SYMBOLS: {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
  },

  /**
   * Default currency format
   */
  DEFAULT_CURRENCY: 'USD' as const,

  /**
   * Thousand separators by locale
   */
  THOUSAND_SEPARATORS: {
    US: ',',
    EU: '.',
    UK: ',',
  },

  /**
   * Decimal separators by locale
   */
  DECIMAL_SEPARATORS: {
    US: '.',
    EU: ',',
    UK: '.',
  },
} as const;

/**
 * Type for currency codes
 */
export type CurrencyCode = keyof typeof CurrencyConstants.SYMBOLS;
