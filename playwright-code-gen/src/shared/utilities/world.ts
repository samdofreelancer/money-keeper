import 'reflect-metadata';
import { BaseWorld } from './base-world';
import { Logger } from './logger';
import type { Container } from 'shared/di/container';
import { TOKENS } from 'shared/di/tokens';
import { AccountApiClient } from 'account-domains/api/account-api.client';
import { AccountCreationApiUseCase } from 'account-domains/usecases/api/AccountCreationApiUseCase';
import { AccountDeletionApiUseCase } from 'account-domains/usecases/api/AccountDeletionApiUseCase';
import { CategoryApiClient } from 'category-domain/api/category-api.client';
import { CategoryDeletionApiUseCase } from 'category-domain/usecases/api/CategoryDeletionApiUseCase';
import { CategoriesPage } from 'category-domain/pages/categories.playwright.page';
import { AccountBalanceUiUseCase } from 'account-domains/usecases/ui/AccountBalanceUiUseCase';
import { CreateCategoryUseCase } from 'category-domain/usecases/ui/category.use-case';
import { TransactionsPage } from 'transaction-domain/pages/transactions.playwright.page';
import { TransactionCreationUiUseCase } from 'transaction-domain/usecases/ui/TransactionCreationUiUseCase';
import { TransactionCreationApiUseCase } from 'transaction-domain/usecases/api/TransactionCreationApiUseCase';
import { AccountCreationUiUseCase } from 'account-domains/usecases/ui/AccountCreationUiUseCase';
import { AccountsPlaywrightPage } from 'account-domains/pages/accounts.playwright.page';
import { SettingsPlaywrightPage } from 'settings-domain/pages/settings.playwright.page';
import { SettingsUiUseCase } from 'settings-domain/usecases/ui/SettingsUiUseCase';

/**
 * World per-scenario — browser/context/page từ BaseWorld
 * Uses root/scoped DI: hooks inject a scoped container for each scenario
 */
export class World extends BaseWorld {
  private initialized = false;
  public container!: Container; // assigned in hooks Before()

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
    if (!this.container) {
      throw new Error(
        'DI scope not set. Ensure hooks created a scope and assigned it to World.container.'
      );
    }
    return this.container.resolve(token);
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
  public get settingsPage(): SettingsPlaywrightPage {
    return this.use(TOKENS.SettingsPlaywrightPage);
  }
  public get settingsUiUseCase(): SettingsUiUseCase {
    return this.use(TOKENS.SettingsUiUseCase);
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
   * Per-scenario: only create browser/context/page
   */
  public async initialize(): Promise<void> {
    await super.initialize(); // create browser/context/page

    this.initialized = true;
    Logger.info('World initialized (browser/context/page created)');
  }

  public async teardown(): Promise<void> {
    await super.teardown();
    this.initialized = false;
    Logger.info('World closed successfully');
  }
}
