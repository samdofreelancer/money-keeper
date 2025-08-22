import { NestFactory } from '@nestjs/core';
import { Page, APIRequestContext } from '@playwright/test';
import { Logger } from '../utilities/logger';
import { AppModule } from './app.module';
import { Container } from './container';

export class NestContainerFactory {
  private static app: any = null;
  private static currentPage: Page | null = null;
  private static currentRequest: APIRequestContext | null = null;

  static async createContainer(page: Page, request?: APIRequestContext) {
    Logger.debug('Creating NestJS container with Playwright page and request context');
    
    if (this.app) {
      Logger.debug('NestJS app already exists, destroying it first');
      await this.destroyContainer();
    }

    this.currentPage = page;
    this.currentRequest = request || page.request;

    try {
      Logger.debug('Creating new NestJS application instance...');
      
      // Create the NestJS application with custom providers for runtime instances
      this.app = await NestFactory.createApplicationContext(AppModule, {
        logger: ['error', 'warn', 'debug'],
      });
      
      // Register runtime instances
      this.app.registerInstance('PAGE' as any, this.currentPage);
      this.app.registerInstance('REQUEST' as any, this.currentRequest);

      // Register API_BASE_URL
      this.app.registerInstance('API_BASE_URL' as any, 
        process.env.API_BASE_URL || 'http://127.0.0.1:8080/api');
      
      Logger.debug('NestJS container created successfully');
      return this.app;
    } catch (error) {
      Logger.error('Failed to create NestJS container', error);
      throw error;
    }
  }

  static async getContainer() {
    if (!this.app) {
      throw new Error('NestJS container not initialized. Call createContainer() first.');
    }
    return this.app;
  }

  static async destroyContainer() {
    if (this.app) {
      await this.app.close();
      this.app = null;
      this.currentPage = null;
      this.currentRequest = null;
      Logger.debug('NestJS container destroyed');
    }
  }

  static async getService<T>(token: any): Promise<T> {
    const container = await this.getContainer();
    return container.get(token);
  }
}
