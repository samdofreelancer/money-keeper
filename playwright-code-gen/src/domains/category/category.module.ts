import { Module } from '@nestjs/common';
import { CategoriesPage } from './pages/categories.playwright.page';
import { CreateCategoryUseCase } from './usecases/ui/category.use-case';
import { CategoryDeletionApiUseCaseImpl } from './usecases/api/CategoryDeletionApiUseCase';
import { SharedModule } from '../../shared/di/shared.module';
import { TOKENS } from '../../shared/di/nest-tokens';

@Module({
  imports: [SharedModule],
  providers: [
    // All services are now auto-registered via @AutoInjectable()
  ],
  exports: [
    // No exports needed since services are auto-registered
  ],
})
export class CategoryModule {}
