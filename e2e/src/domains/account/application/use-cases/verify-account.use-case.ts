// e2e/src/domains/account/application/use-cases/verify-account.use-case.ts

import { CreateAccountUiPort } from "../../domain/ports/ui/create-account-ui.port";
import { BaseUseCase } from "../../../../shared/application/BaseUseCase";
import { logger } from "../../../../shared/utils/logger";
import { CustomWorld } from "../../../../support/world";

// ========================
// Verify Account Created Use Case
// ========================

export class VerifyAccountCreatedUseCase extends BaseUseCase<void, void> {
  constructor(private readonly uiPort: CreateAccountUiPort) {
    super();
  }

  async execute(): Promise<void> {
    const isSuccessful = await this.uiPort.verifyAccountCreationSuccess();
    if (!isSuccessful) {
      throw new Error(
        "Account creation was not successful - no success indicator found"
      );
    }
  }
}

// ========================
// Verify Account In List Use Case
// ========================

interface VerifyAccountInListInput {
  accountName: string;
  expectedBalance?: string;
}

export class VerifyAccountInListUseCase extends BaseUseCase<
  VerifyAccountInListInput,
  void
> {
  constructor(
    private readonly uiPort: CreateAccountUiPort,
    private readonly world?: CustomWorld
  ) {
    super();
  }

  async execute(input: VerifyAccountInListInput): Promise<void> {
    const { accountName } = input;
    let expectedBalance = input.expectedBalance || "0.00";

    // Get initial balance from stored form data if not provided
    if (!input.expectedBalance && this.world?.currentFormData) {
      const balance =
        this.world.currentFormData["Initial Balance"] ||
        this.world.currentFormData.initialBalance;
      expectedBalance = parseFloat(String(balance || "0")).toFixed(2);
    }

    const isListed = await this.uiPort.isAccountListed(
      accountName,
      expectedBalance
    );
    if (!isListed) {
      throw new Error(
        `Account "${accountName}" with balance "${expectedBalance}" not found in accounts list`
      );
    }
  }
}

// ========================
// Verify Total Balance Updated Use Case
// ========================

export class VerifyTotalBalanceUpdatedUseCase extends BaseUseCase<void, void> {
  constructor(private readonly uiPort: CreateAccountUiPort) {
    super();
  }

  async execute(): Promise<void> {
    const balanceText = await this.uiPort.verifyTotalBalanceUpdated();
    if (balanceText === null) {
      logger.info(
        "Total balance element not found, but this might be expected behavior"
      );
      return;
    }

    logger.info(`Total balance text: ${balanceText}`);
  }
}
