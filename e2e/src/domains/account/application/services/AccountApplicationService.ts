import { CreateAccountCommand } from "../use-cases/commands/CreateAccountCommand";
import { GetAccountListQuery } from "../use-cases/queries/GetAccountListQuery";
import { AccountRepository } from "../../domain/repositories/AccountRepository";
import { EventPublisher } from "../../../../shared/domain/EventPublisher";
import {
  CreateAccountRequest,
  CreateAccountResponse,
} from "../use-cases/dto/CreateAccountDto";
import {
  GetAccountListRequest,
  GetAccountListResponse,
} from "../use-cases/dto/GetAccountListDto";

/**
 * Application Service following DDD principles
 * - Orchestrates use cases
 * - Handles dependency injection
 * - Provides a clean API for the presentation layer
 */
export class AccountApplicationService {
  private readonly createAccountCommand: CreateAccountCommand;
  private readonly getAccountListQuery: GetAccountListQuery;

  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly eventPublisher: EventPublisher
  ) {
    this.createAccountCommand = new CreateAccountCommand(
      accountRepository,
      eventPublisher
    );
    this.getAccountListQuery = new GetAccountListQuery(accountRepository);
  }

  async createAccount(
    request: CreateAccountRequest
  ): Promise<CreateAccountResponse> {
    return await this.createAccountCommand.execute(request);
  }

  async getAccountList(
    request: GetAccountListRequest = {}
  ): Promise<GetAccountListResponse> {
    return await this.getAccountListQuery.execute(request);
  }

  async verifyAccountExists(accountName: string): Promise<boolean> {
    const response = await this.getAccountListQuery.execute({
      filter: { accountName },
    });

    return response.success && (response.accounts?.length ?? 0) > 0;
  }

  async getTotalBalance(): Promise<number> {
    const response = await this.getAccountListQuery.execute({});
    return response.totalBalance ?? 0;
  }
}
