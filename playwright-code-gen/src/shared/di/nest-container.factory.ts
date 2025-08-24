import { NestFactory } from '@nestjs/core';
import { INestApplicationContext } from '@nestjs/common';
import { Page, APIRequestContext } from '@playwright/test';
import { Logger } from '../utilities/logger';
import { AppModule } from './app.module';
import { RuntimeProviders } from './shared.module';
import { AutoScanner } from './auto-scanner.util';
import { isAutoInjectable } from './auto-injectable.decorator';
import * as path from 'path'; // Importing path module

export class NestContainerFactory {
  private static app: INestApplicationContext | null = null;
  private static currentPage: Page | null = null;
  private static currentRequest: APIRequestContext | null = null;

  static async createContainer(page: Page, request?: APIRequestContext) {
    Logger.debug(
      'Creating NestJS container with Playwright page and request context'
    );

    if (this.app) {
      Logger.debug('NestJS app already exists, destroying it first');
      await this.destroyContainer();
    }

    this.currentPage = page;
    this.currentRequest = request || page.request;

    try {
      Logger.debug('Creating new NestJS application instance...');

      // Create runtime providers for the Playwright instances
      const runtimeProviders: RuntimeProviders = {
        page: this.currentPage,
        request: this.currentRequest,
      };

      // Scan for auto-injectable classes
      Logger.debug('Scanning for auto-injectable classes...');
      const autoInjectableClasses = await this.scanAutoInjectableClasses();
      
      if (autoInjectableClasses.length > 0) {
        Logger.debug(`Found ${autoInjectableClasses.length} auto-injectable classes`);
      }

      // Create the NestJS application with runtime providers and auto-discovered classes
      this.app = await NestFactory.createApplicationContext(
        AppModule.forRoot(runtimeProviders, autoInjectableClasses),
        {
          logger: ['error', 'warn', 'debug'],
        }
      );

      Logger.debug(
        'NestJS container created successfully with Page token injected and auto-registered services'
      );
      return this.app;
    } catch (error) {
      Logger.error(
        'Failed to create NestJS container with injected Page token',
        error
      );
      throw error;
    }
  }

  static async getContainer() {
    if (!this.app) {
      throw new Error(
        'NestJS container not initialized. Call createContainer() first.'
      );
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

  static async getService<T>(token: symbol | string | Function): Promise<T> {
    const container = await this.getContainer();
    return container.get(token);
  }

  /**
   * Scans the project for classes decorated with @AutoInjectable()
   */
  private static async scanAutoInjectableClasses(): Promise<any[]> {
    try {
      // Define directories to scan for auto-injectable classes
      const scanDirectories = [
        path.join(__dirname, '../../domains'), // All domain directories
        path.join(__dirname, '../../shared'),   // Shared utilities
      ];

      Logger.debug(`Scanning directories for auto-injectable classes: ${scanDirectories.join(', ')}`);
      
      const autoInjectableClasses = await AutoScanner.scanDirectories(scanDirectories);
      
      // Filter out any classes that might have been picked up but shouldn't be registered
      const validClasses = autoInjectableClasses.filter(cls => 
        typeof cls === 'function' && isAutoInjectable(cls)
      );

      Logger.debug(`Found ${validClasses.length} valid auto-injectable classes`);
      
      return validClasses;
    } catch (error) {
      Logger.error('Failed to scan for auto-injectable classes:', error);
      return [];
    }
  }
}
