import { BaseWorld } from './base-world';
import { AccountsPage } from '../../domains/accounts/pages/AccountsPage';
import { AccountUsecase } from '../../domains/accounts/usecases/AccountUsecase';

/**
 * World class to encapsulate test context and state
 * This provides a single place to manage all domain-specific page objects and steps
 * Extends BaseWorld which handles browser, context, and page management
 */
export class World extends BaseWorld {
  // Domain-specific page objects and steps
  public accountsPage!: AccountsPage;
  public accountUsecase!: AccountUsecase;

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
    
    // Initialize domain-specific page objects and steps
    this.accountsPage = new AccountsPage(this.getPage());
    this.accountUsecase = new AccountUsecase(this.accountsPage);
  }
}
