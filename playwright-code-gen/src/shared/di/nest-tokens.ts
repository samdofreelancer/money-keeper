export const TOKENS = {
  AccountsPlaywrightPage: Symbol('AccountsPlaywrightPage'),
  CategoriesPage: Symbol('CategoriesPage'),
  AccountApiClient: Symbol('AccountApiClient'),
  CategoryApiClient: Symbol('CategoryApiClient'),
  AccountCreationApiUseCase: Symbol('AccountCreationApiUseCase'),
  AccountDeletionApiUseCase: Symbol('AccountDeletionApiUseCase'),
  AccountBalanceUiUseCase: Symbol('AccountBalanceUiUseCase'),
  AccountCreationUiUseCase: Symbol('AccountCreationUiUseCase'),
  CreateCategoryUseCase: Symbol('CreateCategoryUseCase'),
  Page: Symbol('PAGE'),
  Request: Symbol('REQUEST'),

  // Transaction related tokens
  TransactionsPage: Symbol('TransactionsPage'),
  TransactionCreationUiUseCase: Symbol('TransactionCreationUiUseCase'),
  TransactionCreationApiUseCase: Symbol('TransactionCreationApiUseCase'),
} as const;
