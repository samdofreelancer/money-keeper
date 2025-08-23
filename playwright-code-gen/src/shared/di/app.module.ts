import { DynamicModule, Module } from '@nestjs/common';
import { AccountModule } from '../../domains/accounts/account.module';
import { CategoryModule } from '../../domains/category/category.module';
import { SharedModule, RuntimeProviders } from './shared.module';
import { RuntimeDiModule } from './runtime-di.module';

@Module({})
export class AppModule {
  static forRoot(runtime: RuntimeProviders): DynamicModule {
    return {
      module: AppModule,
      imports: [
        RuntimeDiModule.withRuntime(runtime),
        AccountModule,
        CategoryModule,
      ],
    };
  }
}
