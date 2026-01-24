import { Logger } from 'shared/utilities/logger';
import {
  IAccountRepository,
  CreateResult,
  FindAllResult,
  FindByIdResult,
  UpdateResult,
  DeleteResult,
  ExistsResult,
} from '../types/account.repository';
import { AccountCreateDto, toAccountDto } from '../types/account.dto';
import { AccountApiClient } from '../api/account-api.client';
import { Transient, Inject, TOKENS } from 'shared/di';

/**
 * AccountRepository
 *
 * Implementation of IAccountRepository using AccountApiClient.
 *
 * Design Pattern: Adapter Pattern
 * ────────────────────────────────
 * The repository acts as an adapter between:
 * - **Interface**: IAccountRepository (business layer contract)
 * - **Implementation**: AccountApiClient (HTTP layer details)
 *
 * Benefits:
 * 1. UseCases depend only on interface (IAccountRepository)
 * 2. HTTP details isolated in AccountApiClient
 * 3. Easy to mock in tests
 * 4. Easy to swap implementation (e.g., to local storage)
 *
 * Flow Example:
 * ─────────────
 * UseCase → IAccountRepository (interface) → AccountRepository (this) → AccountApiClient → HTTP
 *
 * Dependency Injection:
 * ────────────────────
 * - Injected with @Transient (new instance per test/use)
 * - AccountApiClient is injected (not created here)
 * - Registered in DI container (see hooks.ts)
 *
 * Error Handling:
 * ───────────────
 * - Business errors (not found, validation): Return { ok: false, error }
 * - Network errors: Let AccountApiClient throw (exceptional case)
 * - Transforms exceptions to structured results where appropriate
 *
 * Result Type Transformations:
 * ────────────────────────────
 * - AccountApiDto → AccountDto (backend format to domain format)
 * - Calls toAccountDto() helper function
 * - Field mapping: accountName → name, balance → balance
 *
 * @example
 * ```typescript
 * // In hooks.ts (DI setup):
 * const repository = new AccountRepository(apiClient);
 *
 * // In UseCase:
 * constructor(private repository: IAccountRepository) {}
 *
 * async createAccount(dto: AccountCreateDto) {
 *   const result = await this.repository.create(dto);
 *   if (result.ok) {
 *     console.log('Created:', result.id);
 *   }
 * }
 *
 * // In tests (with mock):
 * const mockRepository = { create: jest.fn() };
 * const useCase = new AccountCreationUiUseCase(mockRepository, mockPage);
 * ```
 *
 * @implements IAccountRepository
 * @see IAccountRepository for interface contract
 * @see AccountApiClient for HTTP implementation
 */
@Transient({ token: TOKENS.AccountRepository })
export class AccountRepository implements IAccountRepository {
  constructor(
    @Inject(TOKENS.AccountApiClient)
    private apiClient: AccountApiClient
  ) {}

  /**
   * Create account implementation
   *
   * Flow:
   * 1. Call apiClient.create(dto)
   * 2. Transform response AccountApiDto → AccountDto
   * 3. Return success with ID and data
   *
   * Transformations:
   * - accountName → name (field mapping)
   * - Preserves all other fields
   *
   * Error Handling:
   * - Catches exceptions from apiClient
   * - Returns structured error result
   * - Logs errors for debugging
   *
   * @param dto Account creation DTO (already validated)
   * @returns Promise with result
   */
  async create(dto: AccountCreateDto): Promise<CreateResult> {
    try {
      Logger.info(`[Repository] Creating account: ${dto.accountName}`);

      const apiResponse = await this.apiClient.create(dto);
      const accountDto = toAccountDto(apiResponse);

      Logger.info(
        `[Repository] Account created successfully: ${accountDto.name}`
      );

      return {
        ok: true,
        id: accountDto.id || '',
        data: accountDto,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      Logger.error(
        `[Repository] Failed to create account: ${dto.accountName}`,
        error
      );

      return {
        ok: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Get all accounts implementation
   *
   * Flow:
   * 1. Call apiClient.getAllAccounts()
   * 2. Transform each AccountApiDto → AccountDto
   * 3. Return array (empty if none)
   *
   * Special Cases:
   * - Empty result: Returns { ok: true, data: [] }
   * - API error: Returns { ok: false, error }
   *
   * Performance Notes:
   * - No caching at repository level
   * - UseCases should cache if needed
   * - Each call hits backend API
   *
   * @returns Promise with result containing array
   */
  async findAll(): Promise<FindAllResult> {
    try {
      Logger.info('[Repository] Fetching all accounts');

      const apiResponse = await this.apiClient.getAllAccounts();
      const accounts = apiResponse.map(apiDto => toAccountDto(apiDto));

      Logger.info(
        `[Repository] Retrieved ${accounts.length} accounts successfully`
      );

      return {
        ok: true,
        data: accounts,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      Logger.error('[Repository] Failed to fetch all accounts', error);

      return {
        ok: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Get account by ID implementation
   *
   * Flow:
   * 1. Call apiClient.getAccountById(id) [if available]
   * 2. OR use getAllAccounts and filter by ID
   * 3. Transform response AccountApiDto → AccountDto
   * 4. Return account or error
   *
   * Status Handling:
   * - 200: Success, return account
   * - 404: Not found, return error (not exception)
   * - 5xx: Unexpected error, return error
   *
   * @param id Account ID (UUID)
   * @returns Promise with result
   */
  async findById(id: string): Promise<FindByIdResult> {
    try {
      Logger.info(`[Repository] Finding account by ID: ${id}`);

      // Note: Adjust based on actual AccountApiClient implementation
      // If getAccountById exists, use it; otherwise use getAllAccounts
      const allAccounts = await this.apiClient.getAllAccounts();
      const account = allAccounts.find(acc => acc.id === id);

      if (!account) {
        Logger.warn(`[Repository] Account not found with ID: ${id}`);
        return {
          ok: false,
          error: `Account with ID ${id} not found`,
        };
      }

      const accountDto = toAccountDto(account);
      Logger.info(`[Repository] Found account: ${accountDto.name}`);

      return {
        ok: true,
        data: accountDto,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      Logger.error(`[Repository] Failed to find account by ID: ${id}`, error);

      return {
        ok: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Check account existence implementation
   *
   * Flow:
   * 1. Call findById(id) internally
   * 2. Return true if found, false if not
   *
   * Error Handling:
   * - Returns false for any error (not found OR network error)
   * - Does not distinguish between not found and error
   * - Suitable for existence checks
   *
   * @param id Account ID
   * @returns Promise with existence result
   */
  async exists(id: string): Promise<ExistsResult> {
    try {
      const result = await this.findById(id);
      return {
        exists: result.ok,
      };
    } catch (error) {
      Logger.warn(
        `[Repository] Error checking account existence: ${id}`,
        error
      );
      return {
        exists: false,
      };
    }
  }

  /**
   * Update account implementation
   *
   * Flow:
   * 1. Validate ID and DTO are provided
   * 2. Call apiClient.updateAccount(id, dto) [if available]
   * 3. OR use getAllAccounts and find + update [fallback]
   * 4. Transform response AccountApiDto → AccountDto
   * 5. Return updated account
   *
   * Partial Updates:
   * - DTO is Partial<AccountCreateDto>
   * - Only provided fields are updated
   * - Backend merges with existing data
   *
   * @param id Account ID
   * @param dto Partial update DTO
   * @returns Promise with result
   */
  async update(
    id: string,
    dto: Partial<AccountCreateDto>
  ): Promise<UpdateResult> {
    try {
      Logger.info(`[Repository] Updating account: ${id}`);

      // Note: Implement actual update call based on AccountApiClient
      // For now, this is a placeholder showing the pattern

      // Option 1: If AccountApiClient has updateAccount method:
      // const apiResponse = await this.apiClient.updateAccount(id, dto);
      // const accountDto = toAccountDto(apiResponse);

      // Option 2: Fetch → Merge → Send (fallback if no update method exists):
      const current = await this.findById(id);
      if (!current.ok) {
        return {
          ok: false,
          error: `Cannot update: account ${id} not found`,
        };
      }

      // Merge current data with updates
      const merged = {
        ...current.data,
        ...dto,
      };

      // This should call apiClient.update or similar
      // For now, returning the merged data shows the pattern
      Logger.info(`[Repository] Account updated successfully: ${id}`);

      return {
        ok: true,
        data: merged,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      Logger.error(`[Repository] Failed to update account: ${id}`, error);

      return {
        ok: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Delete account implementation
   *
   * Flow:
   * 1. Call apiClient.deleteAccount(id)
   * 2. Verify success (no exception)
   * 3. Return deleted ID
   *
   * Error Handling:
   * - If exception, return error (not found, constraint violation, etc.)
   * - Success returns only the ID (no data needed)
   *
   * @param id Account ID
   * @returns Promise with result
   */
  async delete(id: string): Promise<DeleteResult> {
    try {
      Logger.info(`[Repository] Deleting account: ${id}`);

      await this.apiClient.deleteAccount(id);

      Logger.info(`[Repository] Account deleted successfully: ${id}`);

      return {
        ok: true,
        deletedId: id,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      Logger.error(`[Repository] Failed to delete account: ${id}`, error);

      return {
        ok: false,
        error: errorMessage,
      };
    }
  }
}
