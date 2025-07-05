// This file is now merged into accounts.feature and accounts-full.steps.ts. Please use those for all account scenarios.

import { After, Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../../support/world";
import { AccountsPage } from "../../pages/accounts.page";
import axios from "axios";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { getAccountByName, deleteAccountById, createAccount } from "../../api/accountApiHelper";
import { logger } from "../../support/logger";
import { log } from "console";

dotenv.config();

Given("I am on the Accounts page", async function (this: CustomWorld) {
    await this.page.goto("http://localhost:5173/accounts");
});

Then('I should see the heading {string}', async function (this: CustomWorld, heading: string) {
    const headingLocator = this.page.getByRole('heading', { name: heading });
    await expect(headingLocator).toBeVisible();
});

Then('I should see the button {string}', async function (this: CustomWorld, button: string) {
    const buttonLocator = this.page.getByRole('button', { name: button });
    await expect(buttonLocator).toBeVisible();
});

Then('I should see the search box with placeholder {string}', async function (this: CustomWorld, placeholder: string) {
    const searchLocator = this.page.getByPlaceholder(placeholder);
    await expect(searchLocator).toBeVisible();
});

Then('I should see the table with columns:', async function (this: CustomWorld, dataTable) {
    for (const { 0: column } of dataTable.raw()) {
        const columnLocator = this.page.locator('th, td').filter({ hasText: column });
        await expect(columnLocator.first()).toBeVisible();
    }
});

When('I click the button {string}', async function (button: string) {
    const accountsPage = new AccountsPage(this.page);
    await accountsPage.page.getByRole('button', { name: button }).click();
});

When('I fill in the account form with:', { timeout: 10000 }, async function (this: CustomWorld, dataTable: any) {
    const accountsPage = new AccountsPage(this.page);
    const data = Object.fromEntries(dataTable.raw());
    // Name
    if (data.Name) {
        await this.page.locator('[data-testid="input-account-name"]').fill(data.Name, { timeout: 5000 });
    }
    // Type (custom dropdown)
    if (data.Type) {
        // Click the select wrapper to open dropdown
        await this.page.locator('[data-testid="select-account-type"] .el-select__wrapper').click({ timeout: 3000 });
        // Wait for dropdown and select option
        await this.page.waitForSelector('.el-select-dropdown__item', { timeout: 3000 });
        await this.page.locator('.el-select-dropdown__item').filter({ hasText: data.Type }).click({ timeout: 3000 });
    }
    // Balance
    if (data.Balance) {
        await this.page.locator('[data-testid="input-account-balance"] input[type="number"]').fill(data.Balance, { timeout: 5000 });
    }
});

When('I submit the account form', async function () {
    // Use the data-testid for the Save/Create button in the dialog
    await this.page.locator('[data-testid="button-submit"]').click({ timeout: 5000 });
});

Given('there is an account named {string}', async function (this: CustomWorld, name: string) {
    // Generate a unique name for the account
    const uniqueName = `${name}-${uuidv4().slice(0, 8)}`;
    this.uniqueData = this.uniqueData || new Map();
    this.uniqueData.set(name, uniqueName);

    // Track for cleanup
    if (!this.cleanupAccountNames) this.cleanupAccountNames = new Set<string>();
    this.cleanupAccountNames.add(uniqueName);

    // Use backend API to create the account if it does not exist
    const apiBase = process.env.API_BASE_URL || 'http://localhost:8080/api';
    // Check if account exists
    const existing = await axios.get(`${apiBase}/accounts`);
    const exists = existing.data.some((acc: any) => acc.name === uniqueName);
    if (!exists) {
        await createAccount({
            name: uniqueName,
            type: 'E_WALLET',
            balance: 1000, // Use a positive balance to ensure account is visible
            currency: 'USD',
            description: 'Test account created via API',
        });
    }
    // Optionally refresh the UI
    const accountsPage = new AccountsPage(this.page);
    await accountsPage.goto();
});

When('I click the edit button for account {string}', async function (this: CustomWorld, name: string) {
    const accountsPage = new AccountsPage(this.page);
    const uniqueName = this.uniqueData?.get(name) || name;
    const row = accountsPage.page.getByRole('row', { name: new RegExp(uniqueName, 'i') });
    await row.waitFor({ state: 'visible', timeout: 5000 });
    const editBtn = row.locator('[data-testid="edit-account-button"]');
    if (await editBtn.count()) {
        await editBtn.click({ timeout: 5000 });
    } else {
        await row.getByRole('button', { name: /Edit/i }).click({ timeout: 5000 });
    }
});

When('I update the account name to {string}', async function (this: CustomWorld, newName: string) {
    // Update the name in the UI
    await this.page.locator('[data-testid="input-account-name"]').fill(newName, { timeout: 5000 });
    // Track the new name for cleanup
    logger.info(`Tracking new account name for cleanup: ${newName}`);
    logger.info(`cleanupAccountNames: ${this.cleanupAccountNames ? Array.from(this.cleanupAccountNames).join(', ') : 'none'}`);
    if (!this.cleanupAccountNames) this.cleanupAccountNames = new Set<string>();
    this.cleanupAccountNames.add(newName);
    logger.info(`cleanupAccountNames: ${this.cleanupAccountNames ? Array.from(this.cleanupAccountNames).join(', ') : 'none'}`);
    // Also add the unique version if using unique names for updates
    logger.info(`Unique data before update: ${this.uniqueData ? Array.from(this.uniqueData.entries()).map(([k, v]) => `${k} -> ${v}`).join(', ') : 'none'}`);
    if (this.uniqueData) {
        for (const [original, unique] of this.uniqueData.entries()) {
            logger.info(`Adding unique account name for cleanup: ${unique}`);
            this.cleanupAccountNames.add(unique);
            logger.info(`cleanupAccountNames: ${this.cleanupAccountNames ? Array.from(this.cleanupAccountNames).join(', ') : 'none'}`);
        }
    } else {
        logger.warn("No uniqueData found, cannot add unique names for cleanup");
    }
});

When('I click the delete button for account {string}', async function (this: CustomWorld, name: string) {
    const accountsPage = new AccountsPage(this.page);
    const uniqueName = this.uniqueData?.get(name) || name;
    const row = accountsPage.page.getByRole('row', { name: new RegExp(uniqueName, 'i') });
    await row.waitFor({ state: 'visible', timeout: 10000 });
    // Use robust selector for delete button
    const deleteBtn = row.locator('[data-testid="delete-account-button"]');
    if (await deleteBtn.count()) {
        await deleteBtn.click({ timeout: 5000 });
    } else {
        await row.getByRole('button', { name: /Delete|Remove|delete/i }).click({ timeout: 5000 });
    }
});

When('I confirm the account delete action', async function () {
    const accountsPage = new AccountsPage(this.page);
    await accountsPage.page.getByRole('button', { name: /Confirm|Yes|Delete/i }).click();
});

Given('there are accounts:', async function (this: CustomWorld, dataTable: any) {
    // Prepare accounts directly via backend API for reliability
    for (const { Name, Type, Balance } of dataTable.hashes()) {
        // Use a unique name for each account to avoid collisions
        const uniqueName = `${Name}-${uuidv4().slice(0, 8)}`;
        if (!this.cleanupAccountNames) this.cleanupAccountNames = new Set<string>();
        this.cleanupAccountNames.add(uniqueName);
        // Check if account exists (by accountName)
        const existing = await getAccountByName(uniqueName);
        if (!existing) {
            // Map human-friendly type to backend enum
            let backendType = Type;
            if (/e-?wallet/i.test(Type)) backendType = 'E_WALLET';
            else if (/cash/i.test(Type)) backendType = 'CASH';
            else if (/bank/i.test(Type)) backendType = 'BANK_ACCOUNT';
            else if (/credit.?card/i.test(Type)) backendType = 'CREDIT_CARD';
            else if (/investment/i.test(Type)) backendType = 'INVESTMENT';
            else if (/other/i.test(Type)) backendType = 'OTHER';
            await createAccount({
                name: uniqueName,
                type: backendType,
                balance: Number(Balance),
                currency: 'USD',
                description: 'Test account created via API',
            });
        }
    }
    // Optionally refresh the UI
    const accountsPage = new AccountsPage(this.page);
    await accountsPage.goto();
});

When('I search accounts with query {string}', async function (query: string) {
    const accountsPage = new AccountsPage(this.page);
    await accountsPage.searchAccount(query);
});

Then('I should see {string} in the accounts table', async function (name: string) {
    const accountsPage = new AccountsPage(this.page);
    expect(await accountsPage.isAccountVisible(name)).toBeTruthy();
});

Then('I should not see {string} in the accounts table', async function (this: CustomWorld, name: string) {
    const accountsPage = new AccountsPage(this.page);
    expect(await accountsPage.isAccountVisible(name)).toBeFalsy();
});

After({ tags: "@accounts and not @no-cleanup" }, async function (this: CustomWorld) {
    // Use cleanupAccountNames set for cleanup
    if (!this.cleanupAccountNames || this.cleanupAccountNames.size === 0) return;
    try {
        for (const name of this.cleanupAccountNames) {
            const account = await getAccountByName(name);
            if (account) {
                logger.info(`Cleaning up account: ${name} (id: ${account.id})`);
                await deleteAccountById(account.id);
            }
        }
        this.cleanupAccountNames.clear();
    } catch (error) {
        logger.error("Error during account cleanup:", error);
        // Do not rethrow to avoid masking test failures
    }
});
