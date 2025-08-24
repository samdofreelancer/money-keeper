import 'reflect-metadata';
import { BaseWorld } from './base-world';
import { Logger } from './logger';
import { container } from '../di/container';
import { TOKENS } from '../di/tokens';
import { autoDiscover } from '../di/auto-discovery';
import { AccountApiClient } from '../../domains/accounts/api/account-api.client';
import { AccountCreationApiUseCase } from '../../domains/accounts/usecases/api/AccountCreationApiUseCase';
import { AccountDeletionApiUseCase } from '../../domains/accounts/usecases/api/AccountDeletionApiUseCase';
import { CategoryApiClient } from '../../domains/category/api/category-api.client';
import { CategoryDeletionApiUseCase } from '../../domains/category/usecases/api/CategoryDeletionApiUseCase';
import { CategoriesPage } from '../../domains/category/pages/categories.playwright.page';
import { AccountBalanceUiUseCase } from '../../domains/accounts/usecases/ui/AccountBalanceUiUseCase';
import { CreateCategoryUseCase } from '../../domains/category/usecases/ui/category.use-case';
import { TransactionsPage } from '../../domains/transactions/pages/transactions.playwright.page';
import { TransactionCreationUiUseCase } from '../../domains/transactions/usecases/ui/TransactionCreationUiUseCase';
import { TransactionCreationApiUseCase } from '../../domains/transactions/usecases/api/TransactionCreationApiUseCase';
import { AccountCreationUiUseCase } from '../../domains/accounts/usecases/ui/AccountCreationUiUseCase';
import { AccountsPlaywrightPage } from '../../domains/accounts/pages/accounts.playwright.page';

/**
 * World per-scenario — browser/context/page từ BaseWorld
 * Uses lightweight DI container with auto-registration
 */
export class World extends BaseWorld {
  private initialized = false;

  constructor() {
    super();
  }

  /**
   * Resolve a service from the DI container
   */
  public use<T>(token: symbol | string | (new (...args: unknown[]) => T)): T {
    if (!this.initialized) {
      throw new Error('World not initialized. Call initialize() first.');
    }
    return container.resolve(token);
  }

  // ==== API giữ nguyên: steps vẫn gọi world.xxx ====
  public get accountsPage(): AccountsPlaywrightPage {
    return this.use(TOKENS.AccountsPlaywrightPage);
  }
  public get categoriesPage(): CategoriesPage {
    return this.use(TOKENS.CategoriesPage);
  }
  public get accountApiClient(): AccountApiClient {
    return this.use(TOKENS.AccountApiClient);
  }
  public get categoryApiClient(): CategoryApiClient {
    return this.use(TOKENS.CategoryApiClient);
  }

  public get accountCreationApiUseCase(): AccountCreationApiUseCase {
    return this.use(TOKENS.AccountCreationApiUseCase);
  }
  public get accountDeletionApiUseCase(): AccountDeletionApiUseCase {
    return this.use(TOKENS.AccountDeletionApiUseCase);
  }
  public get accountBalanceUiUseCase(): AccountBalanceUiUseCase {
    return this.use(TOKENS.AccountBalanceUiUseCase);
  }
  public get accountCreationUiUseCase(): AccountCreationUiUseCase {
    return this.use(TOKENS.AccountCreationUiUseCase);
  }
  public get createCategoryUseCase(): CreateCategoryUseCase {
    return this.use(TOKENS.CreateCategoryUseCase);
  }

  public get categoryDeletionApiUseCase(): CategoryDeletionApiUseCase {
    return this.use(TOKENS.CategoryDeletionApiUseCase);
  }

  // Transaction related getters
  public get transactionsPage(): TransactionsPage {
    return this.use(TOKENS.TransactionsPage);
  }
  public get transactionCreationUiUseCase(): TransactionCreationUiUseCase {
    return this.use(TOKENS.TransactionCreationUiUseCase);
  }
  public get transactionCreationApiUseCase(): TransactionCreationApiUseCase {
    return this.use(TOKENS.TransactionCreationApiUseCase);
  }

  /**
   * Per-scenario initialization with auto-discovery DI
   */
  public async initialize(): Promise<void> {
    await super.initialize(); // create browser/context/page

    try {
      // Clear previous container state
      container.clear();

      // Register runtime instances - await the real Page first
      const page = await this.getPage();
      container.registerInstance(TOKENS.Page, page);

      container.registerInstance(TOKENS.Request, page.context().request);

      container.registerInstance(
        TOKENS.ApiBaseUrl,
        process.env.API_BASE_URL || 'http://127.0.0.1:8080/api'
      );

      // Discover services AFTER tokens are registered (lazy resolve)
      await autoDiscover();

      // Debug: log discovered services
      const discoveredServices = (
        global as { __di_registry?: Array<{ name?: string }> }
      ).__di_registry
        ?.map(c => c?.name)
        .sort();
      Logger.debug(
        `[DI] discovered services: ${JSON.stringify(discoveredServices)}`
      );

      // Debug: log container state
      Logger.debug(
        `[DI] Container has ${container.getServiceCount()} services registered`
      );
      Logger.debug(
        `[DI] Container has ${container.getInstanceCount()} instances registered`
      );

      this.initialized = true;
      Logger.info(
        'World initialized successfully with auto-registration DI container'
      );
    } catch (error) {
      Logger.error('Failed to initialize DI container', error);
      throw error;
    }
  }

  public async teardown(): Promise<void> {
    await super.teardown();
    container.clear();
    this.initialized = false;
    Logger.info('World closed successfully');
  }
}
