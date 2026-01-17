import { Logger } from 'shared/utilities/logger';
import { AccountCreateDto } from 'account-domains/types/account.dto';
import { IAccountRepository } from 'account-domains/types/account.repository';
import { Inject, Transient, TOKENS } from 'shared/di';

/**
 * AccountCreationApiUseCase
 *
 * Use case for account creation via API.
 *
 * Architectural Pattern: Clean Architecture UseCase
 * ──────────────────────────────────────────────────
 * - Depends on IAccountRepository interface (not concrete implementation)
 * - Orchestrates business logic for account creation
 * - Handles error cases gracefully with structured results
 * - Logs operations for observability
 *
 * Changes from Previous Version:
 * - Changed from AccountApiClient to IAccountRepository
 * - Returns structured results { ok: true/false, ... } instead of throwing
 * - Enables easy mocking in tests
 * - Loose coupling: Can swap repository implementation
 *
 * @example
 * ```typescript
 * const useCase = new AccountCreationApiUseCase(repository);
 * const result = await useCase.createAccount(accountDto);
 * if (result.ok) {
 *   console.log('Created account:', result.account.name);
 * } else {
 *   console.error('Error:', result.error);
 * }
 * ```
 *
 * @see IAccountRepository for persistence layer contract
 * @see AccountRepository for implementation details
 */
@Transient({ token: TOKENS.AccountCreationApiUseCase })
export class AccountCreationApiUseCase {
  constructor(
    @Inject(TOKENS.AccountRepository)
    private repository: IAccountRepository
  ) {}

  /**
   * Create an account via repository (abstracted data layer)
   *
   * Flow:
   * 1. Validate input (AccountCreateDto constructor already validates)
   * 2. Call repository.create()
   * 3. Handle result (ok: true or ok: false)
   * 4. Return structured result
   *
   * Error Handling:
   * - Business errors (validation, duplicate): { ok: false, error }
   * - System errors: May throw (no recovery possible)
   *
   * Logging:
   * - Info: Account creation initiated and completed
   * - Error: Any failure during creation
   *
   * @param accountData Account creation data (already validated by constructor)
   * @returns Promise with structured result
   *   - Success: { ok: true, id, account }
   *   - Failure: { ok: false, error }
   *
   * @example
   * ```typescript
   * const dto = AccountCreateDto.fromAccountDto({
   *   name: 'My Account',
   *   balance: 1000,
   *   type: 'BANK_ACCOUNT',
   *   currency: 'USD'
   * });
   * const result = await useCase.createAccount(dto);
   * ```
   */
  async createAccount(accountData: AccountCreateDto) {
    Logger.info(`[UseCase] Creating account: ${accountData.accountName}`);

    try {
      // Use repository instead of direct API client
      const result = await this.repository.create(accountData);

      if (result.ok) {
        Logger.info(
          `[UseCase] Account created successfully: ${result.data.name}`
        );

        // Return success result with account data
        return {
          ok: true,
          id: result.id,
          account: result.data,
        };
      } else {
        // Handle failure from repository
        Logger.warn(`[UseCase] Failed to create account: ${result.error}`);

        return {
          ok: false,
          error: result.error,
        };
      }
    } catch (error) {
      // Unexpected error (system error, not business error)
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      Logger.error(
        `[UseCase] Unexpected error creating account: ${accountData.accountName}`,
        error
      );

      return {
        ok: false,
        error: errorMessage,
      };
    }
  }
}
