import { AccountCreateDto, AccountDto } from './account.dto';

/**
 * Result Types for IAccountRepository Operations
 *
 * Design Pattern: Explicit Result Types
 * - All repository methods return structured results (not throwing exceptions)
 * - Business errors (validation, not found) return failure results
 * - Network/system errors may still throw (no recovery possible)
 * - Enables easier testing and error handling
 *
 * @example
 * const result = await repository.create(dto);
 * if (result.ok) {
 *   console.log('Created:', result.id, result.data);
 * } else {
 *   console.error('Failed:', result.error);
 * }
 */

export interface CreateSuccessResult {
  ok: true;
  id: string;
  data: AccountDto;
}

export interface CreateFailureResult {
  ok: false;
  error: string;
}

export type CreateResult = CreateSuccessResult | CreateFailureResult;

export interface FindAllSuccessResult {
  ok: true;
  data: AccountDto[];
}

export interface FindAllFailureResult {
  ok: false;
  error: string;
}

export type FindAllResult = FindAllSuccessResult | FindAllFailureResult;

export interface FindByIdSuccessResult {
  ok: true;
  data: AccountDto;
}

export interface FindByIdFailureResult {
  ok: false;
  error: string;
}

export type FindByIdResult = FindByIdSuccessResult | FindByIdFailureResult;

export interface UpdateSuccessResult {
  ok: true;
  data: AccountDto;
}

export interface UpdateFailureResult {
  ok: false;
  error: string;
}

export type UpdateResult = UpdateSuccessResult | UpdateFailureResult;

export interface DeleteSuccessResult {
  ok: true;
  deletedId: string;
}

export interface DeleteFailureResult {
  ok: false;
  error: string;
}

export type DeleteResult = DeleteSuccessResult | DeleteFailureResult;

export interface ExistsResult {
  exists: boolean;
}

/**
 * IAccountRepository
 *
 * Persistence Layer Contract for Account operations.
 *
 * Design Principles:
 * ─────────────────────
 * 1. **Abstraction**: Hides HTTP implementation details
 * 2. **Type Safety**: Clear result types, no exceptions for business errors
 * 3. **Testability**: All methods async, mockable, injectable
 * 4. **Loose Coupling**: Business logic (UseCase) separate from data access
 * 5. **Single Responsibility**: Only handles persistence operations
 *
 * Usage Pattern:
 * ──────────────
 * ```typescript
 * constructor(
 *   private repository: IAccountRepository,
 *   private page: AccountsPlaywrightPage
 * ) {}
 *
 * async createAccount(dto: AccountCreateDto) {
 *   const result = await this.repository.create(dto);
 *   if (result.ok) {
 *     await this.page.verifyAccountListed(result.data.name);
 *     return { ok: true, id: result.id };
 *   }
 *   return { ok: false, error: result.error };
 * }
 * ```
 *
 * Implementation (AccountRepository):
 * ───────────────────────────────────
 * - Uses injected AccountApiClient for HTTP calls
 * - Transforms API responses to domain DTOs
 * - Handles network errors gracefully
 * - Returns structured results
 *
 * Testing (Mocking):
 * ──────────────────
 * ```typescript
 * const mockRepository: IAccountRepository = {
 *   create: jest.fn().mockResolvedValue({
 *     ok: true,
 *     id: '123',
 *     data: { id: '123', name: 'Test Account', ... }
 *   }),
 *   findAll: jest.fn().mockResolvedValue({
 *     ok: true,
 *     data: [...]
 *   }),
 *   // ... other methods
 * };
 *
 * const useCase = new AccountCreationUiUseCase(mockRepository, mockPage);
 * // Easy to test - no real HTTP calls
 * ```
 *
 * @see AccountRepository for implementation
 * @see AccountCreationApiUseCase for usage example
 */
export interface IAccountRepository {
  /**
   * Create new account
   *
   * Flow:
   * 1. Validate DTO (constructor already validated)
   * 2. Send to backend API
   * 3. Transform response to AccountDto
   * 4. Return success with new ID
   *
   * @param dto Account creation data (already validated)
   * @returns Promise<CreateResult>
   *   - Success: { ok: true, id, data }
   *   - Failure: { ok: false, error }
   *
   * @example
   * ```typescript
   * const result = await repository.create(
   *   AccountCreateDto.fromAccountDto({
   *     name: 'My Account',
   *     balance: 1000,
   *     type: 'BANK_ACCOUNT',
   *     currency: 'USD'
   *   })
   * );
   *
   * if (result.ok) {
   *   console.log('Account ID:', result.id);
   *   console.log('Account data:', result.data);
   * } else {
   *   console.error('Error:', result.error);
   * }
   * ```
   *
   * Error Scenarios:
   * - Account name already exists
   * - Invalid account type
   * - Invalid currency
   * - Backend validation errors
   *
   * Async Pattern:
   * - HTTP call with 5s timeout
   * - No retry logic (UseCases handle retries if needed)
   */
  create(dto: AccountCreateDto): Promise<CreateResult>;

  /**
   * Get all accounts
   *
   * Flow:
   * 1. Fetch all accounts from backend
   * 2. Transform each to AccountDto
   * 3. Return array (empty if no accounts)
   *
   * @returns Promise<FindAllResult>
   *   - Success: { ok: true, data: AccountDto[] }
   *   - Failure: { ok: false, error }
   *
   * @example
   * ```typescript
   * const result = await repository.findAll();
   * if (result.ok) {
   *   result.data.forEach(account => {
   *     console.log(account.name, account.balance);
   *   });
   * }
   * ```
   *
   * Special Cases:
   * - Empty result (no accounts): { ok: true, data: [] }
   * - Backend error: { ok: false, error }
   *
   * Async Pattern:
   * - HTTP GET with 5s timeout
   * - May be called frequently (consider caching in UseCase)
   */
  findAll(): Promise<FindAllResult>;

  /**
   * Get account by ID
   *
   * Flow:
   * 1. Send GET request with ID
   * 2. Transform response if found
   * 3. Return result
   *
   * @param id Account ID (UUID format)
   * @returns Promise<FindByIdResult>
   *   - Success: { ok: true, data: AccountDto }
   *   - Not found: { ok: false, error: '...' }
   *   - Failure: { ok: false, error }
   *
   * @example
   * ```typescript
   * const result = await repository.findById('550e8400-e29b-41d4-a716-446655440000');
   * if (result.ok) {
   *   console.log('Found:', result.data);
   * } else {
   *   console.log('Not found or error');
   * }
   * ```
   *
   * Status Codes:
   * - 200: Account found
   * - 404: Account not found
   * - 5xx: Backend error
   */
  findById(id: string): Promise<FindByIdResult>;

  /**
   * Check if account exists without fetching full data
   *
   * Flow:
   * 1. Attempt to fetch account
   * 2. Return true/false based on result
   *
   * @param id Account ID
   * @returns Promise<ExistsResult>
   *   - Exists: { exists: true }
   *   - Not exists: { exists: false }
   *
   * @example
   * ```typescript
   * const result = await repository.exists('550e8400-e29b-41d4-a716-446655440000');
   * if (result.exists) {
   *   console.log('Account exists');
   * }
   * ```
   *
   * Implementation Notes:
   * - Can use findById internally
   * - No separate API call needed if findById available
   * - False for not found AND errors
   */
  exists(id: string): Promise<ExistsResult>;

  /**
   * Update account
   *
   * Flow:
   * 1. Validate update DTO (partial allowed)
   * 2. Send PATCH/PUT request
   * 3. Transform updated account to AccountDto
   * 4. Return success
   *
   * @param id Account ID to update
   * @param dto Partial update data (can omit unchanged fields)
   * @returns Promise<UpdateResult>
   *   - Success: { ok: true, data: AccountDto }
   *   - Failure: { ok: false, error }
   *
   * @example
   * ```typescript
   * const result = await repository.update('550e8400-e29b-41d4-a716-446655440000', {
   *   accountName: 'Updated Name',
   *   initBalance: 2000
   * });
   *
   * if (result.ok) {
   *   console.log('Updated:', result.data);
   * }
   * ```
   *
   * Error Scenarios:
   * - Account not found
   * - Validation errors on update data
   * - Concurrent update conflict
   *
   * Async Pattern:
   * - HTTP PATCH/PUT with 5s timeout
   * - Uses partial update (only changed fields)
   */
  update(id: string, dto: Partial<AccountCreateDto>): Promise<UpdateResult>;

  /**
   * Delete account
   *
   * Flow:
   * 1. Send DELETE request with ID
   * 2. Verify success
   * 3. Return deleted ID
   *
   * @param id Account ID to delete
   * @returns Promise<DeleteResult>
   *   - Success: { ok: true, deletedId: id }
   *   - Failure: { ok: false, error }
   *
   * @example
   * ```typescript
   * const result = await repository.delete('550e8400-e29b-41d4-a716-446655440000');
   * if (result.ok) {
   *   console.log('Deleted account:', result.deletedId);
   * }
   * ```
   *
   * Error Scenarios:
   * - Account not found
   * - Foreign key constraint (accounts with transactions)
   * - Permission denied
   *
   * Async Pattern:
   * - HTTP DELETE with 5s timeout
   * - Returns only ID (no data returned from server)
   */
  delete(id: string): Promise<DeleteResult>;
}
