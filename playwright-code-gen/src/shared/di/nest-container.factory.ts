import { NestFactory } from '@nestjs/core';
import { Page, APIRequestContext } from '@playwright/test';
import { Logger } from '../utilities/logger';
import { AppModule } from './app.module';

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
      
      // For NestJS, we need to use a different approach since registerInstance doesn't exist
      // We'll store the runtime instances as properties and use a custom get method
      // that checks for overrides before delegating to the NestJS container
      const overrides = new Map<any, any>();
      
      const containerWithOverrides = {
        // Override the get method to check for runtime overrides first
        get: <T>(token: any): T => {
          // Check if we have a runtime override for this token
          if (overrides.has(token)) {
            return overrides.get(token);
          }
          
          // Fall back to the NestJS container
          return this.app.get(token);
        },
        
        // Method to override providers at runtime
        overrideProvider: (token: any, value: any) => {
          overrides.set(token, value);
        },
        
        // Delegate close method to the NestJS container
        close: () => this.app.close()
      };
      
      // Set up runtime overrides
      containerWithOverrides.overrideProvider('PAGE', this.currentPage);
      containerWithOverrides.overrideProvider('REQUEST', this.currentRequest);
      containerWithOverrides.overrideProvider('API_BASE_URL', 
        process.env.API_BASE_URL || 'http://127.0.0.1:8080/api');
      
      Logger.debug('NestJS container created successfully');
      return containerWithOverrides;
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
