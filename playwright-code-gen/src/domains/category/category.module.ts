import { Module } from '@nestjs/common';
import { CategoryApiClient } from './api/category-api.client';
import { CategoriesPage } from './pages/categories.playwright.page';
import { CreateCategoryUseCase } from './usecases/ui/category.use-case';
import { SharedModule } from '../../shared/di/shared.module';
import { TOKENS } from '../../shared/di/nest-tokens';

@Module({
  imports: [SharedModule],
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
  ],
  exports: [
    TOKENS.CategoryApiClient,
    TOKENS.CategoriesPage,
    TOKENS.CreateCategoryUseCase,
  ],
})
export class CategoryModule {}
