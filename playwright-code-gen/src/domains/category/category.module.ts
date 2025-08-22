import { Module } from '@nestjs/common';
import { CategoryApiClient } from './api/category-api.client';
import { CategoriesPage } from './pages/categories.playwright.page';
import { CreateCategoryUseCase } from './usecases/ui/category.use-case';

@Module({
  providers: [
    CategoryApiClient,
    CategoriesPage,
    CreateCategoryUseCase,
  ],
  exports: [
    CategoryApiClient,
    CategoriesPage,
    CreateCategoryUseCase,
  ],
})
export class CategoryModule {}
