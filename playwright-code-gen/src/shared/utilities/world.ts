import { BaseWorld } from './base-world';
import { AccountUseCase } from '../../domains/accounts/usecases/account.use-case';
import { AccountApiClient } from '../../domains/accounts/api/account-api.client';
import { AccountsPlaywrightPage } from '../../domains/accounts/pages/accounts.playwright.page';

/**
 * World class to encapsulate test context and state
 * This provides a single place to manage all domain-specific page objects and steps
 * Extends BaseWorld which handles browser, context, and page management
 */
export class World extends BaseWorld {
  // Domain-specific page objects and steps
  public accountsPage!: AccountsPlaywrightPage;
  public accountUsecase!: AccountUseCase;
  public accountApiClient!: AccountApiClient;

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

    // Initialize domain-specific page objects and steps
    this.accountsPage = new AccountsPlaywrightPage(this.getPage());
    this.accountUsecase = new AccountUseCase(
      this.accountsPage,
      this.accountApiClient
    );
  }
}
