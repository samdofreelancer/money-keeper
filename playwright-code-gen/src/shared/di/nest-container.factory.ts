import { Container } from './container';
import { Page, APIRequestContext } from '@playwright/test';
import { Logger } from '../utilities/logger';
import { TOKENS } from './tokens';
import { AccountApiClient } from '../../domains/accounts/api/account-api.client';
import { CategoryApiClient } from '../../domains/category/api/category-api.client';
import { AccountsPlaywrightPage } from '../../domains/accounts/pages/accounts.playwright.page';
import { CategoriesPage } from '../../domains/category/pages/categories.playwright.page';
import { AccountCreationApiUseCase } from '../../domains/accounts/usecases/api/AccountCreationApiUseCase';
import { AccountDeletionApiUseCase } from '../../domains/accounts/usecases/api/AccountDeletionApiUseCase';
import { AccountBalanceUiUseCase } from '../../domains/accounts/usecases/ui/AccountBalanceUiUseCase';
import { AccountCreationUiUseCase } from '../../domains/accounts/usecases/ui/AccountCreationUiUseCase';
import { CreateCategoryUseCase } from '../../domains/category/usecases/ui/category.use-case';

export class NestContainerFactory {
  private static container: Container | null = null;
  private static currentPage: Page | null = null;
  private static currentRequest: APIRequestContext | null = null;

  static async createContainer(page: Page, request?: APIRequestContext) {
    Logger.debug('Creating hybrid NestJS-style container with Playwright page and request context');
    
    if (this.container) {
      Logger.debug('Container already exists, destroying it first');
      await this.destroyContainer();
    }

    this.currentPage = page;
    this.currentRequest = request || page.request;

    try {
      Logger.debug('Creating new container instance...');
      this.container = new Container();

      // Register runtime instances
      this.container.registerInstance(TOKENS.Page, this.currentPage);
      this.container.registerInstance(TOKENS.Request, this.currentRequest);

      // Register API_BASE_URL
      const apiBaseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:8080/api';

      // Register API_BASE_URL as a string
      this.container.registerInstance('API_BASE_URL' as any, apiBaseUrl);

      // Register API Clients
      this.container.registerSingleton(TOKENS.AccountApiClient, (di) =>
        new AccountApiClient(di.resolve('API_BASE_URL' as any))
      );
      this.container.registerSingleton(TOKENS.CategoryApiClient, (di) =>
        new CategoryApiClient(di.resolve(TOKENS.Request))
      );

      // Register Pages
      this.container.registerSingleton(TOKENS.AccountsPage, (di) =>
        new AccountsPlaywrightPage(di.resolve(TOKENS.Page))
      );
      this.container.registerSingleton(TOKENS.CategoriesPage, (di) => {
        Logger.debug('[DI] new CategoriesPage');
        return new CategoriesPage(di.resolve(TOKENS.Page));
      });

      // Register Use Cases
      this.container.registerSingleton(TOKENS.AccountCreationApiUseCase, (di) =>
        new AccountCreationApiUseCase(di.resolve(TOKENS.AccountApiClient))
      );
      this.container.registerSingleton(TOKENS.AccountDeletionApiUseCase, (di) =>
        new AccountDeletionApiUseCase(di.resolve(TOKENS.AccountApiClient))
      );
      this.container.registerSingleton(TOKENS.AccountBalanceUiUseCase, (di) =>
        new AccountBalanceUiUseCase(di.resolve(TOKENS.AccountsPage))
      );
      this.container.registerSingleton(TOKENS.AccountCreationUiUseCase, (di) =>
        new AccountCreationUiUseCase(di.resolve(TOKENS.AccountsPage))
      );
      this.container.registerSingleton(TOKENS.CreateCategoryUseCase, (di) => {
        Logger.debug('[DI] new CreateCategoryUseCase');
        return new CreateCategoryUseCase(di.resolve(TOKENS.CategoriesPage));
      });

      Logger.debug('Hybrid container created successfully');
      return this.container;
    } catch (error) {
      Logger.error('Failed to create hybrid container', error);
      throw error;
    }
  }

  static async getContainer() {
    if (!this.container) {
      throw new Error('Container not initialized. Call createContainer() first.');
    }
    return this.container;
  }

  static async destroyContainer() {
    if (this.container) {
      this.container = null;
      this.currentPage = null;
      this.currentRequest = null;
      Logger.debug('Container destroyed');
    }
  }

  static async getService<T>(token: any): Promise<T> {
    const container = await this.getContainer();
    return container.resolve(token);
  }
}
