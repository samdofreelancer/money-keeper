import { AccountsPlaywrightPage } from '@/domains/accounts/pages/accounts.playwright.page';
import { AccountApiClient } from '@/domains/accounts/api/account-api.client';
import { AccountCreationApiUseCase } from '@/domains/accounts/usecases/api/AccountCreationApiUseCase';
import { AccountDeletionApiUseCase } from '@/domains/accounts/usecases/api/AccountDeletionApiUseCase';
import { AccountBalanceUiUseCase } from '@/domains/accounts/usecases/ui/AccountBalanceUiUseCase';
import { AccountCreationUiUseCase } from '@/domains/accounts/usecases/ui/AccountCreationUiUseCase';
import { CategoriesPage } from '@/domains/category/pages/categories.playwright.page';
import { CategoryApiClient } from '@/domains/category/api/category-api.client';
import { CreateCategoryUseCase } from '@/domains/category/usecases/ui/category.use-case';

export interface WorldServices {
  accountsPage: AccountsPlaywrightPage;
  categoriesPage: CategoriesPage;
  accountApiClient: AccountApiClient;
  categoryApiClient: CategoryApiClient;
  accountCreationApiUseCase: AccountCreationApiUseCase;
  accountDeletionApiUseCase: AccountDeletionApiUseCase;
  accountBalanceUiUseCase: AccountBalanceUiUseCase;
  accountCreationUiUseCase: AccountCreationUiUseCase;
  createCategoryUseCase: CreateCategoryUseCase;
}
