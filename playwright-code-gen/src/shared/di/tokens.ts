export const TOKENS = {
  Page: Symbol('Page'),
  Request: Symbol('Request'),

  AccountsPage: Symbol('AccountsPlaywrightPage'),
  CategoriesPage: Symbol('CategoriesPage'),

  AccountApiClient: Symbol('AccountApiClient'),
  CategoryApiClient: Symbol('CategoryApiClient'),

  AccountCreationApiUseCase: Symbol('AccountCreationApiUseCase'),
  AccountDeletionApiUseCase: Symbol('AccountDeletionApiUseCase'),
  AccountBalanceUiUseCase: Symbol('AccountBalanceUiUseCase'),
  AccountCreationUiUseCase: Symbol('AccountCreationUiUseCase'),
  CreateCategoryUseCase: Symbol('CreateCategoryUseCase'),
} as const;

export type Tokens = typeof TOKENS;
