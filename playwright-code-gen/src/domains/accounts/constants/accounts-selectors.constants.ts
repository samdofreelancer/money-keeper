/**
 * Central constants file for all Accounts page UI selectors
 * This file contains all CSS, XPath, and text-based locators used in the Accounts domain
 */

export const AccountsSelectors = {
  buttons: {
    addAccount: 'button:has-text("Add Account")',
    create: 'button:has-text("Create")',
    confirm: 'button:has-text("Confirm")',
    accountsTab: 'text=Accounts',
  },
  inputs: {
    accountName: 'input[placeholder="Enter account name"]',
    accountType: '.el-select',
    balance: 'input[type="number"]',
    description: 'input[placeholder="Enter description (optional)"]',
  },
  messages: {
    success: '.el-message--success',
  },
  accountElements: {
    accountRow: '.account-row',
    accountDescription: '.account-description',
    deleteButton: '.delete-account-button',
  },
  navigation: {
    categoriesPage: '/categories',
    accountsPage: '/accounts',
  },
  text: {
    totalBalanceLabel: 'text=Total Balance of Active Accounts:',
  },
  dynamic: {
    accountByName: (name: string) => `text=${name}`,
    accountTypeOption: (type: string) => `span:text('${type}')`,
    accountRowWithName: (name: string) => `text=${name} >> .. >> .account-description`,
    deleteButtonForAccount: (name: string) => `text=${name} >> .. >> .delete-account-button`,
  }
} as const;
