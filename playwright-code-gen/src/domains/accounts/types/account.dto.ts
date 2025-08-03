export interface AccountDto {
  id?: string;
  name: string;
  type: string;
  balance: number;
  currency?: string;
  description?: string;
  active?: boolean;
}

export interface AccountApiDto {
  id: string;
  accountName: string;
  type: string;
  balance: number;
  active: boolean;
}

export class AccountCreateDto {
  public readonly accountName: string;
  public readonly initBalance: number;
  public readonly type: string;
  public readonly currency: string;
  public readonly description?: string;
  public readonly active?: boolean;

  constructor(data: {
    accountName: string;
    initBalance: number;
    type: string;
    currency: string;
    description?: string;
    active?: boolean;
  }) {
    if (!data.accountName || typeof data.accountName !== 'string') {
      throw new Error('Invalid or missing accountName');
    }
    if (
      data.initBalance === undefined ||
      data.initBalance === null ||
      isNaN(Number(data.initBalance))
    ) {
      throw new Error('Invalid or missing initBalance');
    }
    if (!data.type || typeof data.type !== 'string') {
      throw new Error('Invalid or missing type');
    }
    if (!data.currency || typeof data.currency !== 'string') {
      throw new Error('Invalid or missing currency');
    }

    this.accountName = data.accountName;
    this.initBalance = Number(data.initBalance);
    this.type = data.type;
    this.currency = data.currency;
    this.description = data.description;
    this.active = data.active;
  }

  // Convert from AccountDto to AccountCreateDto
  static fromAccountDto(accountDto: AccountDto): AccountCreateDto {
    return new AccountCreateDto({
      accountName: accountDto.name,
      initBalance: accountDto.balance,
      type: accountDto.type,
      currency: accountDto.currency || 'US Dollar', // Default currency if not provided
      description: accountDto.description,
      active: accountDto.active !== undefined ? accountDto.active : true, // Default to active if not provided
    });
  }
}

// Utility functions for conversion between DTOs
export function toAccountDto(apiDto: AccountApiDto): AccountDto {
  return {
    id: apiDto.id,
    name: apiDto.accountName,
    type: apiDto.type,
    balance: apiDto.balance,
    active: apiDto.active,
  };
}

export function toAccountApiDto(accountDto: AccountDto): AccountApiDto {
  if (!accountDto.id) {
    throw new Error('Cannot convert to AccountApiDto: missing id');
  }
  return {
    id: accountDto.id,
    accountName: accountDto.name,
    type: accountDto.type,
    balance: accountDto.balance,
    active: accountDto.active !== undefined ? accountDto.active : true,
  };
}
