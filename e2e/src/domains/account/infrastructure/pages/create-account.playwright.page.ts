// e2e/src/domains/account/infrastructure/pages/create-account.playwright.page.ts

import { Page } from "@playwright/test";

import { CreateAccountUiPort } from "../../domain/ports/ui/create-account-ui.port";
import { config } from "../../../../shared/config/env.config";
import { logger } from "../../../../shared/utils/logger";

export class CreateAccountPlaywrightPage implements CreateAccountUiPort {
  private lastCreatedAccountId: string | null = null;

  constructor(private readonly page: Page) {
    // Listen for network responses to capture account creation
    this.page.on("response", async (response) => {
      if (
        response.url().includes("/api/accounts") &&
        response.request().method() === "POST" &&
        response.status() === 200
      ) {
        try {
          const responseData = await response.json();
          if (responseData && responseData.id) {
            this.lastCreatedAccountId = responseData.id;
            logger.info(`Captured created account ID: ${responseData.id}`);
          }
        } catch (error) {
          logger.warn("Failed to parse account creation response:", error);
        }
      }
    });
  }

  async navigateToApp(): Promise<void> {
    const baseUrl = config.browser.baseUrl || "http://localhost:5173";
    const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const accountsUrl = `${cleanBaseUrl}/accounts`;
    await this.page.goto(accountsUrl);
  }

  async clickButton(buttonName: string): Promise<void> {
    await this.page.click(`button:has-text("${buttonName}")`);
  }

  async fillAccountForm(data: {
    accountName: string;
    accountType: string;
    initialBalance: number;
    currency: string;
    description?: string;
  }): Promise<void> {
    logger.info(`Filling account form with data: ${JSON.stringify(data)}`);

    // Wait for form to be visible
    await this.page.waitForSelector('[data-testid="account-form"]');

    logger.info(`fill in account name`);
    await this.page.fill(
      '[data-testid="input-account-name"]',
      data.accountName
    );
    logger.info(`select account type`);
    await this.page.click('[data-testid="select-account-type"]');
    await this.page.click(`text=${data.accountType}`);
    logger.info(`fill in initial balance`);
    await this.page.fill(
      '[data-testid="input-account-balance"] input',
      data.initialBalance.toString()
    );
    logger.info(`select currency`);
    // Currency defaults to USD, skip if USD, otherwise handle Element UI select
    if (data.currency !== "USD") {
      await this.page.click(".currency-select");
      await this.page.click(`text=${data.currency}`);
    }
    if (data.description) {
      logger.info(`fill in description`);
      await this.page.fill(
        '[data-testid="input-account-description"]',
        data.description
      );
    }
  }

  async submitForm(): Promise<void> {
    await this.page.click('[data-testid="button-submit"]');
  }

  async isAccountListed(
    accountName: string,
    balance: string
  ): Promise<boolean> {
    logger.info(
      `Checking if account "${accountName}" with balance "${balance}" is listed`
    );

    // First check if account name exists
    const accountRow = await this.page.locator(`text=${accountName}`).first();
    const accountExists = (await accountRow.count()) > 0;
    logger.info(`Account row found: ${accountExists}`);

    if (!accountExists) {
      return false;
    }

    // Find the table row containing the account name
    const tableRow = this.page.locator(`tr:has-text("${accountName}")`);

    // Get the balance cell (3rd column) from that row
    const balanceCell = tableRow.locator("td").nth(2);
    const actualBalanceText = await balanceCell.textContent();

    logger.info(`Checking balance for account "${accountName}"`);
    logger.info(`Expected balance: "${balance}"`);
    logger.info(`Actual balance text: "${actualBalanceText}"`);

    if (!actualBalanceText) {
      return false;
    }

    // Extract numeric value from formatted currency (e.g., "$1,000.00" -> "1000.00")
    const numericBalance = actualBalanceText.replace(/[$,]/g, "").trim();
    const expectedNumeric = parseFloat(balance).toFixed(2);
    const actualNumeric = parseFloat(numericBalance).toFixed(2);

    logger.info(
      `Expected numeric: "${expectedNumeric}", Actual numeric: "${actualNumeric}"`
    );

    return expectedNumeric === actualNumeric;
  }

  async verifyAccountCreationSuccess(): Promise<boolean> {
    await this.page.waitForTimeout(1000);
    const successIndicator = await this.page
      .locator("text=Account created successfully")
      .count();
    if (successIndicator === 0) {
      // Try alternative success indicators
      const redirected = await this.page.url().includes("/accounts");
      return redirected;
    }
    return true;
  }

  async verifyTotalBalanceUpdated(): Promise<string | null> {
    logger.info(`Verifying total balance update`);
    await this.page.waitForTimeout(500);

    // Use the correct data-testid selector based on actual HTML
    const totalBalanceElement = this.page.locator(
      '[data-testid="total-balance"]'
    );
    const exists = (await totalBalanceElement.count()) > 0;

    logger.info(`Total balance element exists: ${exists}`);

    if (!exists) {
      logger.info("Total balance element not found");
      return null;
    }

    const balanceText = await totalBalanceElement.textContent();
    logger.info(`Total balance text: "${balanceText}"`);

    return balanceText;
  }

  async verifyConflictError(): Promise<string | null> {
    await this.page.waitForTimeout(1000);
    const errorElement = await this.page
      .locator(
        "text=Account name already exists, text=already exists, .error-message"
      )
      .first();
    const hasError = (await errorElement.count()) > 0;

    if (hasError) {
      return await errorElement.textContent();
    }

    return null;
  }

  async verifyValidationErrors(): Promise<string | null> {
    await this.page.waitForTimeout(1000);
    const errorElements = await this.page
      .locator(".error, .validation-error, text=required, text=invalid")
      .count();

    if (errorElements > 0) {
      const errorText = await this.page
        .locator(".error, .validation-error")
        .first()
        .textContent();
      return errorText;
    }

    return null;
  }

  async isOnFormPage(): Promise<boolean> {
    const isOnFormPage =
      (await this.page
        .locator('button:has-text("Submit"), input[name="accountName"]')
        .count()) > 0;
    return isOnFormPage;
  }

  async trySubmitInvalidForm(data: {
    accountName?: string;
    accountType?: string;
    initialBalance?: number;
    currency?: string;
    description?: string;
  }): Promise<string | null> {
    // Navigate to form first
    await this.navigateToApp();
    await this.clickButton("Add Account");

    // Fill with invalid data
    const accountData = {
      accountName: data.accountName || "",
      accountType: data.accountType || "BANK_ACCOUNT",
      initialBalance: data.initialBalance || 0,
      currency: data.currency || "USD",
      description: data.description,
    };

    await this.fillAccountForm(accountData);
    await this.submitForm();

    // Wait for validation errors and return error message
    return await this.verifyValidationErrors();
  }

  async deleteAccount(accountName: string): Promise<boolean> {
    try {
      logger.info(`Attempting to delete account: ${accountName}`);

      // Navigate to accounts page first
      await this.navigateToApp();

      // Find the account row and delete button
      const accountRow = this.page.locator(`tr:has-text("${accountName}")`);
      const deleteButton = accountRow.locator(
        '[data-testid="delete-account-button"]'
      );

      if ((await deleteButton.count()) === 0) {
        logger.warn(`Delete button not found for account: ${accountName}`);
        return false;
      }

      await deleteButton.click();

      // Handle confirmation dialog if it appears
      try {
        await this.page.waitForSelector(
          'button:has-text("Confirm"), button:has-text("Delete"), button:has-text("Yes")',
          { timeout: 3000 }
        );
        await this.page.click(
          'button:has-text("Confirm"), button:has-text("Delete"), button:has-text("Yes")'
        );
        await this.page.waitForTimeout(1000); // Wait for deletion to complete

        // Verify the account is no longer in the list
        const accountStillExists =
          (await this.page.locator(`tr:has-text("${accountName}")`).count()) >
          0;
        const success = !accountStillExists;

        if (success) {
          logger.info(`Successfully deleted account: ${accountName}`);
        } else {
          logger.warn(
            `Account still exists after deletion attempt: ${accountName}`
          );
        }

        return success;
      } catch (error) {
        logger.warn(
          `No confirmation dialog found for account: ${accountName}, assuming deletion succeeded`
        );
        return true;
      }
    } catch (error) {
      logger.error(`Failed to delete account ${accountName}: ${error}`);
      return false;
    }
  }

  async getLastCreatedAccountId(): Promise<string | null> {
    return this.lastCreatedAccountId;
  }
}
