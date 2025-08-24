import 'reflect-metadata';
import { container } from './src/shared/di/container';
import { TOKENS } from './src/shared/di/tokens';
import { autoDiscover } from './src/shared/di/auto-discovery';
import { Logger } from './src/shared/utilities/logger';

// Make container globally available for decorators
(globalThis as any).__DI_CONTAINER__ = container;

async function testDI() {
  try {
    Logger.info('Testing DI container...');
    
    // Register some test instances
    container.registerInstance(TOKENS.Page, { test: 'mock-page' } as any);
    container.registerInstance(TOKENS.ApiBaseUrl, 'http://test:8080/api');
    
    // Auto-discover services
    await autoDiscover();
    
    Logger.info(`Registered ${container.getServiceCount()} services`);
    Logger.info(`Created ${container.getInstanceCount()} instances`);
    
    // Try to resolve a service
    try {
      const accountApiClient = container.resolve(TOKENS.AccountApiClient);
      Logger.info('Successfully resolved AccountApiClient');
      console.log('AccountApiClient:', accountApiClient);
    } catch (error) {
      Logger.error('Failed to resolve AccountApiClient:', error);
    }
    
    // Try to resolve another service
    try {
      const accountsPage = container.resolve(TOKENS.AccountsPlaywrightPage);
      Logger.info('Successfully resolved AccountsPlaywrightPage');
      console.log('AccountsPlaywrightPage:', accountsPage);
    } catch (error) {
      Logger.error('Failed to resolve AccountsPlaywrightPage:', error);
    }
    
    Logger.info('DI test completed');
    
  } catch (error) {
    Logger.error('DI test failed:', error);
  }
}

testDI();
