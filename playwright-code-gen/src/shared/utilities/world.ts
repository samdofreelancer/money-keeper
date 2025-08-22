import { BaseWorld } from './base-world';
import { Logger } from './logger';
import { NestContainerFactory } from '../di/nest-container.factory';
import { TOKENS } from '../di/nest-tokens';

/**
 * World per-scenario — browser/context/page từ BaseWorld
 * Uses NestJS DI container instead of custom container
 */
export class World extends BaseWorld {
  private container: any;

  // ==== API giữ nguyên: steps vẫn gọi world.xxx ====
  public get accountsPage(): any {
    console.log('Accessing AccountsPlaywrightPage from World: ', this.container.get(TOKENS.AccountsPlaywrightPage));
    return this.container.get(TOKENS.AccountsPlaywrightPage);
  }
  public get categoriesPage(): any {
    return this.container.get(TOKENS.CategoriesPage);
  }
  public get accountApiClient(): any {
    return this.container.get(TOKENS.AccountApiClient);
  }
  public get categoryApiClient(): any {
    return this.container.get(TOKENS.CategoryApiClient);
  }

  public get accountCreationApiUseCase(): any {
    return this.container.get(TOKENS.AccountCreationApiUseCase);
  }
  public get accountDeletionApiUseCase(): any {
    return this.container.get(TOKENS.AccountDeletionApiUseCase);
  }
  public get accountBalanceUiUseCase(): any {
    return this.container.get(TOKENS.AccountBalanceUiUseCase);
  }
  public get accountCreationUiUseCase(): any {
    return this.container.get(TOKENS.AccountCreationUiUseCase);
  }
  public get createCategoryUseCase(): any {
    return this.container.get(TOKENS.CreateCategoryUseCase);
  }

  constructor() {
    super();
  }

  /**
   * Per-scenario providers using NestJS DI
   */
  public async initialize(): Promise<void> {
    await super.initialize(); // create browser/context/page

    // Initialize NestJS container with Playwright instances
    try {
      this.container = await NestContainerFactory.createContainer(this.getPage());
      Logger.info('World initialized successfully with NestJS DI container');
    } catch (error) {
      Logger.error('Failed to initialize NestJS container', error);
      throw error;
    }
  }

  public async teardown(): Promise<void> {
    await super.teardown();
    await NestContainerFactory.destroyContainer();
    Logger.info('World closed successfully');
  }
}
