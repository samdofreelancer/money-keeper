import { BaseWorld } from './base-world';
import { AccountApiClient } from '../../domains/accounts/api/account-api.client';
import { CategoryApiClient } from '../../domains/category/api/category-api.client';
import { AccountsPlaywrightPage } from '../../domains/accounts/pages/accounts.playwright.page';
import { AccountCreationApiUseCase } from '../../domains/accounts/usecases/api/AccountCreationApiUseCase';
import { AccountDeletionApiUseCase } from '../../domains/accounts/usecases/api/AccountDeletionApiUseCase';
import { AccountBalanceUiUseCase } from '../../domains/accounts/usecases/ui/AccountBalanceUiUseCase';
import { AccountCreationUiUseCase } from '../../domains/accounts/usecases/ui/AccountCreationUiUseCase';

/**
 * World class to encapsulate test context and state
 * This provides a single place to manage all domain-specific page objects and steps
 * Extends BaseWorld which handles browser, context, and page management
 */
export class World extends BaseWorld {
  // Domain-specific page objects and steps
  public accountsPage!: AccountsPlaywrightPage;
  public accountApiClient!: AccountApiClient;
  public categoryApiClient!: CategoryApiClient;

  public accountCreationApiUseCase!: AccountCreationApiUseCase;
  public accountDeletionApiUseCase!: AccountDeletionApiUseCase;
  public accountBalanceUiUseCase!: AccountBalanceUiUseCase;
  public accountCreationUiUseCase!: AccountCreationUiUseCase;

  constructor() {
    super();
    // Page objects will be initialized when the page is created in initialize()
  }

  /**
   * Initialize the world with domain-specific page objects and steps
   * Extends the BaseWorld initialize method
   */
  public async initialize(): Promise<void> {
    // Initialize browser context and page from BaseWorld
    await super.initialize();

    // Initialize API client
    const apiBaseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:8080/api';
    this.accountApiClient = new AccountApiClient({ baseURL: apiBaseUrl });
    this.categoryApiClient = new CategoryApiClient(this.context.request);

    // Initialize domain-specific page objects and steps
    this.accountsPage = new AccountsPlaywrightPage(this.getPage());

    // Initialize new use cases
    this.accountCreationApiUseCase = new AccountCreationApiUseCase(
      this.accountApiClient
    );
    this.accountDeletionApiUseCase = new AccountDeletionApiUseCase(
      this.accountApiClient
    );
    this.accountBalanceUiUseCase = new AccountBalanceUiUseCase(
      this.accountsPage
    );
    this.accountCreationUiUseCase = new AccountCreationUiUseCase(
      this.accountsPage
    );
  }
}
