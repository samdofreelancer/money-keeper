import { Container } from './container';
import { Page, APIRequestContext } from '@playwright/test';
import { Logger } from '../utilities/logger';
import { AppModule } from './app.module';

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
      this.container.registerInstance('PAGE' as any, this.currentPage);
      this.container.registerInstance('REQUEST' as any, this.currentRequest);

      // Register API_BASE_URL
      this.container.registerInstance('API_BASE_URL' as any, 
        process.env.API_BASE_URL || 'http://127.0.0.1:8080/api');

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
