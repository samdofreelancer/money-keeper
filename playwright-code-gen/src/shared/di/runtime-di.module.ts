// src/shared/di/runtime-di.module.ts
import { DynamicModule, Global, Module } from '@nestjs/common';
import type { APIRequestContext, Page } from 'playwright';
import { TOKENS } from './nest-tokens';

export interface RuntimeProviders {
  page: Page;
  request?: APIRequestContext;
}

@Global()
@Module({})
export class RuntimeDiModule {
  static withRuntime(runtime: RuntimeProviders): DynamicModule {
    return {
      module: RuntimeDiModule,
      providers: [
        { provide: TOKENS.Page, useValue: runtime.page },
        { provide: TOKENS.Request, useValue: runtime.request },
      ],
      exports: [TOKENS.Page, TOKENS.Request],
    };
  }
}
