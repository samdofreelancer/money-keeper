import { BaseWorld } from './base-world';
import { AccountApiClient } from '../../domains/accounts/api/account-api.client';
import { CategoryApiClient } from '../../domains/category/api/category-api.client';
import { AccountsPlaywrightPage } from '../../domains/accounts/pages/accounts.playwright.page';
import { CategoriesPage } from '../../domains/category/pages/categories.playwright.page';
import { AccountCreationApiUseCase } from '../../domains/accounts/usecases/api/AccountCreationApiUseCase';
import { AccountDeletionApiUseCase } from '../../domains/accounts/usecases/api/AccountDeletionApiUseCase';
import { AccountBalanceUiUseCase } from '../../domains/accounts/usecases/ui/AccountBalanceUiUseCase';
import { AccountCreationUiUseCase } from '../../domains/accounts/usecases/ui/AccountCreationUiUseCase';
import { CreateCategoryUseCase } from '../../domains/category/usecases/ui/category.use-case';

import { Container, Token } from '../di/container';
import { TOKENS } from '../di/tokens';

/**
 * World per-scenario — browser/context/page từ BaseWorld
 * DI container đăng ký provider nhưng lazy resolve qua getters.
 */
export class World extends BaseWorld {
  private container!: Container;

  // ==== API giữ nguyên: steps vẫn gọi world.xxx ====
  public get accountsPage(): AccountsPlaywrightPage {
    return this.resolve(TOKENS.AccountsPage);
  }
  public get categoriesPage(): CategoriesPage {
    return this.resolve(TOKENS.CategoriesPage);
  }
  public get accountApiClient(): AccountApiClient {
    return this.resolve(TOKENS.AccountApiClient);
  }
  public get categoryApiClient(): CategoryApiClient {
    return this.resolve(TOKENS.CategoryApiClient);
  }

  public get accountCreationApiUseCase(): AccountCreationApiUseCase {
    return this.resolve(TOKENS.AccountCreationApiUseCase);
  }
  public get accountDeletionApiUseCase(): AccountDeletionApiUseCase {
    return this.resolve(TOKENS.AccountDeletionApiUseCase);
  }
  public get accountBalanceUiUseCase(): AccountBalanceUiUseCase {
    return this.resolve(TOKENS.AccountBalanceUiUseCase);
  }
  public get accountCreationUiUseCase(): AccountCreationUiUseCase {
    return this.resolve(TOKENS.AccountCreationUiUseCase);
  }
  public get createCategoryUseCase(): CreateCategoryUseCase {
    return this.resolve(TOKENS.CreateCategoryUseCase);
  }

  constructor() {
    super();
  }

  private resolve<T>(token: Token<T>): T {
    return this.container.resolve(token);
  }

  /**
   * Per-scenario providers (lazy; object chỉ khởi tạo khi được gọi qua getter)
   */
  public async initialize(): Promise<void> {
    await super.initialize(); // tạo browser/context/page

    this.container = new Container();

    // Bind runtime instances có sẵn
    this.container.registerInstance(TOKENS.Page, this.getPage());
    this.container.registerInstance(TOKENS.Request, this.context.request);

    // Config API
    const apiBaseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:8080/api';

    // Clients
    this.container.registerSingleton(TOKENS.AccountApiClient, () =>
      new AccountApiClient({ baseURL: apiBaseUrl })
    );
    this.container.registerSingleton(TOKENS.CategoryApiClient, (di) =>
      new CategoryApiClient(di.resolve(TOKENS.Request))
    );

    // Pages
    this.container.registerSingleton(TOKENS.AccountsPage, (di) =>
      new AccountsPlaywrightPage(di.resolve(TOKENS.Page))
    );
    this.container.registerSingleton(TOKENS.CategoriesPage, (di) => {
      console.log('[DI] new CategoriesPage');
      return new CategoriesPage(di.resolve(TOKENS.Page));
    });

    // Use Cases
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
      console.log('[DI] new CreateCategoryUseCase');
      return new CreateCategoryUseCase(di.resolve(TOKENS.CategoriesPage));
    });
  }
}
