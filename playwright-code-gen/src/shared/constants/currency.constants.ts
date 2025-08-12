export const CurrencyConstants = {
  // Currency parsing patterns
  PATTERNS: {
    USD: /\$([\d,]+(?:\.\d{2})?)/,
    EUR: /€([\d,.]+)/,
    GBP: /£([\d,.]+)/,
    JPY: /¥([\d,]+)/,
    // Generic currency pattern that matches most formats
    GENERIC: /([A-Z]{3})?\s?([\d,]+(?:\.\d{2})?)/,
  },

  // Currency symbols
  SYMBOLS: {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
  },

  // Default settings
  DEFAULT_CURRENCY: 'USD' as const,
  DEFAULT_LOCALE: 'en-US' as const,

  // Decimal and thousand separators by locale
  THOUSAND_SEPARATOR: ',',
  DECIMAL_SEPARATOR: '.',
} as const;

export type CurrencyCode = keyof typeof CurrencyConstants.SYMBOLS;
