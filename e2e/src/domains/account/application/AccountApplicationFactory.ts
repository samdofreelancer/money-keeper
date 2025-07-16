import { AccountApplicationService } from "./services/AccountApplicationService";
import { AccountRepository } from "../domain/repositories/AccountRepository";
import {
  EventPublisher,
  InMemoryEventPublisher,
} from "../../../shared/domain/EventPublisher";
import { CustomWorld } from "../../../support/world";
import { AccountApiClient } from "../infrastructure/api/account-api.client";
import { Account } from "../domain/entities/Account.entity";
import { logger } from "../../../shared/utils/logger";

/**
 * Factory for creating account application services
 * Handles dependency injection and configuration
 */
export class AccountApplicationFactory {
  private accountApplicationService?: AccountApplicationService;
  private eventPublisher?: EventPublisher;

  constructor(
    private readonly world: CustomWorld,
    private readonly accountRepository?: AccountRepository
  ) {}

  getAccountApplicationService(): AccountApplicationService {
    if (!this.accountApplicationService) {
      this.accountApplicationService = new AccountApplicationService(
        this.getAccountRepository(),
        this.getEventPublisher()
      );
    }
    return this.accountApplicationService;
  }

  private getAccountRepository(): AccountRepository {
    if (this.accountRepository) {
      return this.accountRepository;
    }

    // Create a repository implementation based on the UI port
    // This bridges the gap between the domain and the E2E test infrastructure
    return {
      save: async (account) => {
        // Use the UI port to create account through the interface
        if (!this.world.accountUiPort) {
          throw new Error("Account UI port not available");
        }

        try {
          await this.world.accountUiPort.fillAccountForm({
            accountName: account.accountName,
            accountType: account.accountType,
            initialBalance: account.initialBalance,
            currency: account.currency,
            description: account.description,
          });
          await this.world.accountUiPort.submitForm();

          // Generate an ID for the account
          const accountId = `acc_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`;

          // Create a new Account entity with the ID
          return new Account({
            _accountName: account.accountName,
            accountType: account.accountType,
            initialBalance: account.initialBalance,
            currency: account.currency,
            description: account.description,
          });
        } catch (error) {
          logger.error("Failed to save account:", error);
          throw error;
        }
      },

      findById: async (_id: string) => {
        // For E2E tests, this would typically not be implemented
        // as we're testing through the UI
        return null;
      },

      findByName: async (name: string) => {
        if (!this.world.accountUiPort) {
          throw new Error("Account UI port not available");
        }

        try {
          const isListed = await this.world.accountUiPort.isAccountListed(
            name,
            "0.00"
          );
          if (!isListed) {
            return null;
          }

          // Return a mock account for E2E testing
          return new Account({
            _accountName: name,
            accountType: "Bank Account",
            initialBalance: 0,
            currency: "USD",
            description: "",
          });
        } catch (error) {
          logger.error("Failed to find account by name:", error);
          return null;
        }
      },

      findAll: async (_options = {}) => {
        // For E2E tests, this would typically return mock data
        // or interact with the UI to get account information
        return [];
      },

      delete: async (id: string) => {
        // Implementation depends on the UI capabilities
        logger.info(`Delete account with ID: ${id}`);
      },
    };
  }

  private getEventPublisher(): EventPublisher {
    if (!this.eventPublisher) {
      this.eventPublisher = new InMemoryEventPublisher();
    }
    return this.eventPublisher;
  }

  /**
   * Setup method for initializing the application service
   */
  async setup(): Promise<void> {
    if (!this.world.accountUiPort) {
      throw new Error("Account UI port is not initialized");
    }

    // Initialize API client if needed
    const apiBaseUrl = process.env.API_BASE_URL || "http://127.0.0.1:8080/api";
    const accountApiClient = new AccountApiClient({ baseURL: apiBaseUrl });

    this.world.accountService = {
      create: async (account: unknown) => {
        logger.info("Creating account via API service:", account);
        return await accountApiClient.create(
          account as {
            accountName: string;
            type: string;
            initBalance: number;
            currency: string;
            description?: string;
            active: boolean;
          }
        );
      },
    };

    await this.world.accountUiPort.navigateToApp();
    logger.info("Account application service initialized");
  }
}
