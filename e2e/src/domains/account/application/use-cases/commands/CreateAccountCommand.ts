import { UseCase } from "../../../../../shared/application/UseCase";
import { AccountRepository } from "../../../domain/repositories/AccountRepository";
import { Account } from "../../../domain/entities/Account.entity";
import { AccountFormValue } from "../../../domain/value-objects/account-form-data.vo";
import { DomainEvent } from "../../../../../shared/domain/events";
import { EventPublisher } from "../../../../../shared/domain/EventPublisher";
import {
  CreateAccountRequest,
  CreateAccountResponse,
} from "../dto/CreateAccountDto";
import {
  ValidationError,
  DomainError,
} from "../../../domain/errors/AccountErrors";

export class CreateAccountCommand
  implements UseCase<CreateAccountRequest, CreateAccountResponse>
{
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly eventPublisher: EventPublisher
  ) {}

  async execute(request: CreateAccountRequest): Promise<CreateAccountResponse> {
    try {
      // 1. Validate input using domain value object
      const accountFormValue = this.validateInput(request);

      // 2. Check business rules (e.g., account name uniqueness)
      await this.checkAccountNameUniqueness(accountFormValue.accountName);

      // 3. Create domain entity
      const account = this.createAccountEntity(accountFormValue);

      // 4. Persist to repository
      const savedAccount = await this.accountRepository.save(account);

      // 5. Publish domain event
      await this.publishAccountCreatedEvent(savedAccount);

      return {
        success: true,
        accountId: savedAccount.id,
        accountName: savedAccount.accountName,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  private validateInput(request: CreateAccountRequest): AccountFormValue {
    try {
      return AccountFormValue.fromRawInput(request);
    } catch (error) {
      throw new ValidationError(
        "Invalid account form data",
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  private async checkAccountNameUniqueness(accountName: string): Promise<void> {
    const existingAccount = await this.accountRepository.findByName(
      accountName
    );
    if (existingAccount) {
      throw new DomainError(
        `Account with name "${accountName}" already exists`
      );
    }
  }

  private createAccountEntity(accountFormValue: AccountFormValue): Account {
    return Account.create({
      accountName: accountFormValue.accountName,
      accountType: accountFormValue.accountType,
      initialBalance: accountFormValue.initialBalance,
      currency: accountFormValue.currency,
      description: accountFormValue.description,
    });
  }

  private async publishAccountCreatedEvent(account: Account): Promise<void> {
    const event: DomainEvent = {
      type: "AccountCreated",
      payload: {
        accountId: account.id,
        accountName: account.accountName,
        accountType: account.accountType,
        initialBalance: account.initialBalance,
      },
    };

    await this.eventPublisher.publish(event);
  }

  private handleError(error: unknown): CreateAccountResponse {
    if (error instanceof ValidationError) {
      return {
        success: false,
        error: {
          type: "validation",
          message: error.message,
          details: error.details,
        },
      };
    }

    if (error instanceof DomainError) {
      return {
        success: false,
        error: {
          type: "domain",
          message: error.message,
        },
      };
    }

    return {
      success: false,
      error: {
        type: "unknown",
        message: error instanceof Error ? error.message : String(error),
      },
    };
  }
}
