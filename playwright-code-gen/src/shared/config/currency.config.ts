/**
 * Currency configuration for locale-specific settings
 */
export interface CurrencyLocaleConfig {
  currency: string;
  symbol: string;
  thousandSeparator: string;
  decimalSeparator: string;
  pattern: RegExp;
}

export interface CurrencyConfigType {
  defaultLocale: string;
  supportedLocales: Record<string, CurrencyLocaleConfig>;
  getLocaleConfig: (locale: string) => CurrencyLocaleConfig;
  parseCurrency: (value: string, locale?: string) => number | null;
}

export const CurrencyConfig: CurrencyConfigType = {
  defaultLocale: 'en-US',

  supportedLocales: {
    'en-US': {
      currency: 'USD',
      symbol: '$',
      thousandSeparator: ',',
      decimalSeparator: '.',
      pattern: /\$([\d,]+(?:\.\d{2})?)/,
    },
    'en-GB': {
      currency: 'GBP',
      symbol: '£',
      thousandSeparator: ',',
      decimalSeparator: '.',
      pattern: /£([\d,]+(?:\.\d{2})?)/,
    },
    'de-DE': {
      currency: 'EUR',
      symbol: '€',
      thousandSeparator: '.',
      decimalSeparator: ',',
      pattern: /€([\d.]+(?:,\d{2})?)/,
    },
    'fr-FR': {
      currency: 'EUR',
      symbol: '€',
      thousandSeparator: ' ',
      decimalSeparator: ',',
      pattern: /€([\d\s]+(?:,\d{2})?)/,
    },
  },

  getLocaleConfig(locale: string): CurrencyLocaleConfig {
    return (
      this.supportedLocales[locale] ||
      this.supportedLocales[CurrencyConfig.defaultLocale]
    );
  },

  parseCurrency(
    value: string,
    locale: string = CurrencyConfig.defaultLocale
  ): number | null {
    const config = this.getLocaleConfig(locale);
    const match = value.match(config.pattern);

    if (!match) return null;

    // Remove thousand separators and replace decimal separator
    const numericString = match[1]
      .replace(new RegExp(`\\${config.thousandSeparator}`, 'g'), '')
      .replace(config.decimalSeparator, '.');

    return parseFloat(numericString);
  },
};
