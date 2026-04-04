/**
 * Domain DTO for Account operations (UI/Test layer).
 * Uses standardized field names: name, balance.
 *
 * This is the primary DTO for the test automation layer.
 * All test code should use this interface.
 */
export interface AccountDto {
  id?: string;
  name: string;
  type: string;
  balance: number;
  currency?: string;
  description?: string;
  active?: boolean;
}

/**
 * Backend API DTO for Account operations.
 * Backend format: accountName, balance (not initBalance in response).
 *
 * Used only for API responses from the backend.
 */
export interface AccountApiDto {
  id: string;
  accountName: string;
  type: string;
  balance: number;
  active: boolean;
}

/**
 * Unified DTO for account creation API requests.
 *
 * IMPORTANT: Always create instances using the fromAccountDto() factory method.
 * This ensures proper field name mapping and prevents bugs.
 *
 * Field Mapping (for reference):
 * - AccountDto.name → AccountCreateDto.accountName (backend expects this)
 * - AccountDto.balance → AccountCreateDto.initBalance (backend expects this)
 *
 * @example
 * ```typescript
 * // Correct usage - always use factory:
 * const accountDto: AccountDto = { name: "My Account", balance: 1000, type: "BANK_ACCOUNT" };
 * const createDto = AccountCreateDto.fromAccountDto(accountDto);
 * await apiUseCase.createAccount(createDto);
 *
 * // Alternative (direct construction) - ONLY if you have backend format already:
 * const createDto = new AccountCreateDto({
 *   accountName: "My Account",
 *   initBalance: 1000,
 *   type: "BANK_ACCOUNT",
 *   currency: "USD"
 * });
 * ```
 */
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
  /**
   * Factory method to create AccountCreateDto from domain AccountDto.
   *
   * This is the recommended way to construct AccountCreateDto instances.
   * It handles field name mapping and default values automatically:
   * - name → accountName
   * - balance → initBalance
   * - Defaults currency to 'US Dollar' if not provided
   * - Defaults active to true if not provided
   *
   * @param accountDto Domain DTO with standardized field names (name, balance)
   * @returns Properly formatted AccountCreateDto for backend API calls
   *
   * @example
   * ```typescript
   * const dto = AccountCreateDto.fromAccountDto({
   *   name: "My Savings",
   *   balance: 5000,
   *   type: "BANK_ACCOUNT",
   *   currency: "USD"
   * });
   * // Result: { accountName: "My Savings", initBalance: 5000, ... }
   * ```
   */
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

/**
 * Converts backend API DTO to domain DTO.
 * Maps backend field names to domain field names:
 * - accountName → name
 * - balance → balance (no change)
 *
 * Use this when converting API responses to domain models.
 *
 * @param apiDto Backend API response DTO
 * @returns Domain DTO with standardized field names
 *
 * @example
 * ```typescript
 * const apiResponse = { id: "123", accountName: "My Account", balance: 1000 };
 * const domainDto = toAccountDto(apiResponse);
 * // Result: { id: "123", name: "My Account", balance: 1000 }
 * ```
 */
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

/**
 * Reverse conversion: domain DTO to backend API DTO.
 * Maps domain field names to backend field names:
 * - name → accountName
 * - balance → balance (no change)
 *
 * IMPORTANT: Requires account to have an ID (for update operations).
 * For creation, use AccountCreateDto.fromAccountDto() instead.
 *
 * @param accountDto Domain DTO with standardized field names
 * @returns Backend API DTO format
 * @throws Error if accountDto.id is missing
 *
 * @example
 * ```typescript
 * const domainDto = { id: "123", name: "Updated Account", balance: 2000 };
 * const apiDto = toAccountApiDto(domainDto);
 * // Result: { id: "123", accountName: "Updated Account", balance: 2000 }
 * ```
 */
export function reverseToAccountApiDto(accountDto: AccountDto): AccountApiDto {
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
