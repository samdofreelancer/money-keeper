// src/shared/di/external-page.module.ts
import { DynamicModule, Global, Module } from '@nestjs/common';
import type { Page } from 'playwright';
import { TOKENS } from './nest-tokens';

@Global()
@Module({})
export class ExternalPageModule {
  static withPage(page: Page): DynamicModule {
    return {
      module: ExternalPageModule,
      providers: [{ provide: TOKENS.Page, useValue: page }],
      exports: [TOKENS.Page],
    };
  }
}
