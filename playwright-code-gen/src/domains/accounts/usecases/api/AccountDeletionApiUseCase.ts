import { Logger } from 'shared/utilities/logger';
import { IAccountRepository } from 'account-domains/types/account.repository';
import { Inject, Transient, TOKENS } from 'shared/di';

/**
 * AccountDeletionApiUseCase
 *
 * Use case for account deletion via API.
 *
 * Architectural Pattern: Clean Architecture UseCase
 * ──────────────────────────────────────────────────
 * - Depends on IAccountRepository interface (not concrete implementation)
 * - Orchestrates account deletion with lookup
 * - Handles error cases gracefully with structured results
 * - Logs operations for observability
 *
 * Changes from Previous Version:
 * - Changed from AccountApiClient to IAccountRepository
 * - Returns structured results { ok: true/false, ... } instead of throwing
 * - Uses repository.findAll() + filter instead of apiClient method
 * - Enables easy mocking in tests
 * - Loose coupling: Can swap repository implementation
 *
 * @example
 * ```typescript
 * const useCase = new AccountDeletionApiUseCase(repository);
 * const result = await useCase.deleteAccount('My Account');
 * if (result.ok) {
 *   console.log('Deleted account:', result.deletedId);
 * } else {
 *   console.error('Error:', result.error);
 * }
 * ```
 *
 * @see IAccountRepository for persistence layer contract
 * @see AccountRepository for implementation details
 */
@Transient({ token: TOKENS.AccountDeletionApiUseCase })
export class AccountDeletionApiUseCase {
  constructor(
    @Inject(TOKENS.AccountRepository)
    private repository: IAccountRepository
  ) {}

  /**
   * Delete an account by name via repository
   *
   * Flow:
   * 1. Fetch all accounts from repository
   * 2. Find account by name (field name, not accountName)
   * 3. If found, delete using repository
   * 4. Return structured result
   *
   * Error Handling:
   * - Account not found: { ok: false, error }
   * - Delete failed: { ok: false, error }
   * - Success: { ok: true, deletedId }
   *
   * Logging:
   * - Info: Account deletion initiated and completed
   * - Warn: Account not found
   * - Error: Any failure during deletion
   *
   * @param name Account name to delete (domain format, not backend format)
   * @returns Promise with structured result
   *   - Success: { ok: true, deletedId }
   *   - Not found: { ok: false, error: '...' }
   *   - Failure: { ok: false, error }
   *
   * @example
   * ```typescript
   * // Account with name 'My Savings' was created
   * const result = await useCase.deleteAccount('My Savings');
   * if (result.ok) {
   *   console.log('Deleted:', result.deletedId);
   * }
   * ```
   *
   * Field Mapping:
   * - Input: name (domain format)
   * - Repository returns: data.name (domain format)
   * - Comparison: name === data.name
   */
  async deleteAccount(name: string) {
    Logger.info(`[UseCase] Deleting account by name: ${name}`);

    try {
      // Fetch all accounts
      const allResult = await this.repository.findAll();

      if (!allResult.ok) {
        Logger.warn(
          `[UseCase] Failed to fetch accounts for deletion: ${allResult.error}`
        );
        return {
          ok: false,
          error: allResult.error,
        };
      }

      // Find account by name (use domain format field name)
      const account = allResult.data.find(acc => acc.name === name);

      if (!account) {
        Logger.warn(`[UseCase] Account not found: ${name}`);
        return {
          ok: false,
          error: `Account ${name} not found`,
        };
      }

      // Delete using repository
      const deleteResult = await this.repository.delete(account.id || '');

      if (deleteResult.ok) {
        Logger.info(
          `[UseCase] Account deleted successfully: ${name} (ID: ${deleteResult.deletedId})`
        );

        return {
          ok: true,
          deletedId: deleteResult.deletedId,
        };
      } else {
        Logger.error(
          `[UseCase] Failed to delete account: ${deleteResult.error}`
        );

        return {
          ok: false,
          error: deleteResult.error,
        };
      }
    } catch (error) {
      // Unexpected error
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      Logger.error(
        `[UseCase] Unexpected error deleting account: ${name}`,
        error
      );

      return {
        ok: false,
        error: errorMessage,
      };
    }
  }
}
