type RawAccountFormValue = {
  [key: string]: any;
};

function normalizeKey(key: string): string {
  // Normalize keys to camelCase without spaces
  const lowerKey = key.toLowerCase().replace(/\s+/g, '');
  switch (lowerKey) {
    case 'accountname':
      return 'accountName';
    case 'accounttype':
      return 'accountType';
    case 'initialbalance':
      return 'initialBalance';
    case 'currency':
      return 'currency';
    case 'description':
      return 'description';
    default:
      return key;
  }
}

export class AccountFormValue {
  public readonly accountName: string;
  public readonly accountType: string;
  public readonly initialBalance: number;
  public readonly currency: string;
  public readonly description?: string;

  constructor(raw: RawAccountFormValue) {
    const normalized: { [key: string]: any } = {};

    // Normalize keys and assign values
    for (const key in raw) {
      if (Object.prototype.hasOwnProperty.call(raw, key)) {
        const normalizedKey = normalizeKey(key);
        normalized[normalizedKey] = raw[key];
      }
    }

    // Validate required fields presence
    if (!normalized.accountName || typeof normalized.accountName !== 'string') {
      throw new Error('Invalid or missing accountName');
    }
    if (!normalized.accountType || typeof normalized.accountType !== 'string') {
      throw new Error('Invalid or missing accountType');
    }
    if (
      normalized.initialBalance === undefined ||
      normalized.initialBalance === null ||
      isNaN(Number(normalized.initialBalance))
    ) {
      throw new Error('Invalid or missing initialBalance');
    }
    if (!normalized.currency || typeof normalized.currency !== 'string') {
      throw new Error('Invalid or missing currency');
    }

    // Assign normalized and validated values
    this.accountName = normalized.accountName;
    this.accountType = normalized.accountType;
    this.initialBalance = Number(normalized.initialBalance);
    this.currency = normalized.currency;
    this.description =
      normalized.description && typeof normalized.description === 'string'
        ? normalized.description
        : undefined;
  }
}
