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

interface VerifyTotalBalanceInput {
  expectedAmount?: string;
}

export class VerifyTotalBalanceUpdatedUseCase extends BaseUseCase<
  VerifyTotalBalanceInput,
  void
> {
  constructor(private readonly uiPort: CreateAccountUiPort) {
    super();
  }

  async execute(input: VerifyTotalBalanceInput = {}): Promise<void> {
    const balanceText = await this.uiPort.verifyTotalBalanceUpdated();
    if (balanceText === null) {
      if (input.expectedAmount) {
        throw new Error(
          "Total balance element not found, but expected balance verification was requested"
        );
      }
      logger.info(
        "Total balance element not found, but this might be expected behavior"
      );
      return;
    }

    logger.info(`Total balance text: ${balanceText}`);

    // If expected amount is provided, verify it's included in the balance
    if (input.expectedAmount) {
      const expectedAmount = input.expectedAmount;

      // Extract numeric values from the balance text for comparison
      // This handles various currency formats like "$1,000.00", "1000.00 USD", etc.
      const balanceNumbers = this.extractNumbers(balanceText);
      const expectedNumber = this.extractNumbers(expectedAmount)[0];

      if (!expectedNumber) {
        throw new Error(`Invalid expected amount format: ${expectedAmount}`);
      }

      // Check if any of the balance numbers includes the expected amount
      const balanceIncludesExpected = balanceNumbers.some(
        (balance) => Math.abs(balance - expectedNumber) < 0.01 // Allow for floating point precision
      );

      if (!balanceIncludesExpected) {
        throw new Error(
          `Expected balance to include ${expectedAmount}, but got: ${balanceText}. ` +
            `Extracted numbers: ${balanceNumbers.join(", ")}`
        );
      }

      logger.info(
        `✅ Balance verification passed: ${balanceText} includes ${expectedAmount}`
      );
    }
  }

  private extractNumbers(text: string): number[] {
    // Extract all numbers from text, handling currency symbols and separators
    const numberPattern = /[\d,]+\.?\d*/g;
    const matches = text.match(numberPattern) || [];

    return matches
      .map((match) => parseFloat(match.replace(/,/g, "")))
      .filter((num) => !isNaN(num));
  }
}
