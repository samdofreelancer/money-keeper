export const TOKENS = {
  // Core runtime tokens
  Page: Symbol.for('core:Page'),
  Request: Symbol.for('core:Request'),
  ApiBaseUrl: Symbol.for('core:ApiBaseUrl'),

  // Accounts domain tokens
  AccountsPlaywrightPage: Symbol.for('accounts:AccountsPlaywrightPage'),
  AccountApiClient: Symbol.for('accounts:AccountApiClient'),
  AccountCreationApiUseCase: Symbol.for('accounts:AccountCreationApiUseCase'),
  AccountDeletionApiUseCase: Symbol.for('accounts:AccountDeletionApiUseCase'),
  AccountBalanceUiUseCase: Symbol.for('accounts:AccountBalanceUiUseCase'),
  AccountCreationUiUseCase: Symbol.for('accounts:AccountCreationUiUseCase'),

  // Settings domain tokens
  SettingsPlaywrightPage: Symbol.for('settings:SettingsPlaywrightPage'),
  SettingsUiUseCase: Symbol.for('settings:SettingsUiUseCase'),

  // Category domain tokens
  CategoriesPage: Symbol.for('category:CategoriesPage'),
  CategoryApiClient: Symbol.for('category:CategoryApiClient'),
  CreateCategoryUseCase: Symbol.for('category:CreateCategoryUseCase'),
  CategoryDeletionApiUseCase: Symbol.for('category:CategoryDeletionApiUseCase'),

  // Transaction domain tokens
  TransactionsPage: Symbol.for('transactions:TransactionsPage'),
  TransactionCreationUiUseCase: Symbol.for(
    'transactions:TransactionCreationUiUseCase'
  ),
  TransactionCreationApiUseCase: Symbol.for(
    'transactions:TransactionCreationApiUseCase'
  ),
} as const;

export type Token = (typeof TOKENS)[keyof typeof TOKENS];
