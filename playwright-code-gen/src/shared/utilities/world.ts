import { BaseWorld } from './base-world';
import { Logger } from './logger';
import { NestContainerFactory } from '../di/nest-container.factory';
import { TOKENS } from '../di/nest-tokens';
import { INestApplicationContext } from '@nestjs/common';

/**
 * World per-scenario — browser/context/page từ BaseWorld
 * Uses NestJS DI container instead of custom container
 */
export class World extends BaseWorld {
  private container!: INestApplicationContext;

  // ==== API giữ nguyên: steps vẫn gọi world.xxx ====
  public get accountsPage() {
    return this.container.get(TOKENS.AccountsPlaywrightPage);
  }
  public get categoriesPage() {
    return this.container.get(TOKENS.CategoriesPage);
  }
  public get accountApiClient() {
    return this.container.get(TOKENS.AccountApiClient);
  }
  public get categoryApiClient() {
    return this.container.get(TOKENS.CategoryApiClient);
  }

  public get accountCreationApiUseCase() {
    return this.container.get(TOKENS.AccountCreationApiUseCase);
  }
  public get accountDeletionApiUseCase() {
    return this.container.get(TOKENS.AccountDeletionApiUseCase);
  }
  public get accountBalanceUiUseCase() {
    return this.container.get(TOKENS.AccountBalanceUiUseCase);
  }
  public get accountCreationUiUseCase() {
    return this.container.get(TOKENS.AccountCreationUiUseCase);
  }
  public get createCategoryUseCase() {
    return this.container.get(TOKENS.CreateCategoryUseCase);
  }

  public get categoryDeletionApiUseCase() {
    return this.container.get(TOKENS.CategoryDeletionApiUseCase);
  }

  // Transaction related getters
  public get transactionsPage() {
    return this.container.get(TOKENS.TransactionsPage);
  }
  public get transactionCreationUiUseCase() {
    return this.container.get(TOKENS.TransactionCreationUiUseCase);
  }
  public get transactionCreationApiUseCase() {
    return this.container.get(TOKENS.TransactionCreationApiUseCase);
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
      this.container = await NestContainerFactory.createContainer(
        this.getPage()
      );
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
