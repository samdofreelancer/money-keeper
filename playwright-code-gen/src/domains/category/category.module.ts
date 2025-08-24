import { Module } from '@nestjs/common';
import { CategoryApiClient } from './api/category-api.client';
import { CategoriesPage } from './pages/categories.playwright.page';
import { CreateCategoryUseCase } from './usecases/ui/category.use-case';
import { CategoryDeletionApiUseCaseImpl } from './usecases/api/CategoryDeletionApiUseCase';
import { TOKENS } from '../../shared/di/tokens';

@Module({
  providers: [
    {
      provide: TOKENS.CategoryApiClient,
      useClass: CategoryApiClient,
    },
    {
      provide: TOKENS.CategoriesPage,
      useClass: CategoriesPage,
    },
    {
      provide: TOKENS.CreateCategoryUseCase,
      useClass: CreateCategoryUseCase,
    },
    {
      provide: TOKENS.CategoryDeletionApiUseCase,
      useClass: CategoryDeletionApiUseCaseImpl,
    },
  ],
  exports: [
    TOKENS.CategoryApiClient,
    TOKENS.CategoriesPage,
    TOKENS.CreateCategoryUseCase,
    TOKENS.CategoryDeletionApiUseCase,
  ],
})
export class CategoryModule {}
