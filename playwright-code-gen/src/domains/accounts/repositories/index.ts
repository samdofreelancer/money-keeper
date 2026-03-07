/**
 * Account Domain - Repositories
 *
 * This folder contains repository implementations for the account domain.
 *
 * Pattern: Repository Pattern with Dependency Injection
 * ─────────────────────────────────────────────────────
 *
 * What is a Repository?
 * - Abstraction layer between business logic (UseCases) and data access (API)
 * - Implements a well-defined interface (IAccountRepository)
 * - Makes testing easier by allowing mocking
 * - Isolates infrastructure concerns (HTTP, error handling)
 *
 * Files in This Folder:
 * ────────────────────
 * - account.repository.ts: Implementation of IAccountRepository
 *
 * How to Use:
 * ───────────
 * 1. Depend on IAccountRepository interface (not implementation)
 * 2. Get from DI container via World.accountRepository getter
 * 3. All methods return structured results (not exceptions)
 *
 * @example
 * ```typescript
 * // In UseCase constructor:
 * constructor(
 *   @Inject(TOKENS.AccountRepository)
 *   private repository: IAccountRepository,
 *   private page: AccountsPlaywrightPage
 * ) {}
 *
 * // Usage in method:
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
 * Testing with Mocks:
 * ──────────────────
 * ```typescript
 * const mockRepository: IAccountRepository = {
 *   create: jest.fn().mockResolvedValue({
 *     ok: true,
 *     id: '123',
 *     data: { id: '123', name: 'Test' }
 *   }),
 *   // ... other methods
 * };
 *
 * const useCase = new AccountCreationUiUseCase(mockRepository, mockPage);
 * // Now test without HTTP calls
 * ```
 *
 * @see ../types/account.repository.ts for IAccountRepository interface
 * @see ../api/account-api.client.ts for HTTP implementation
 * @see ../usecases for UseCase examples using repository
 */

export { AccountRepository } from './account.repository';
