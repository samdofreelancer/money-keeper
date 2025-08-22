import { Module } from '@nestjs/common';
import { AccountModule } from '../../domains/accounts/account.module';
import { CategoryModule } from '../../domains/category/category.module';
import { SharedModule } from './shared.module';

@Module({
  imports: [AccountModule, CategoryModule, SharedModule],
})
export class AppModule {}
