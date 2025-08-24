import { Module, DynamicModule, Provider } from '@nestjs/common';
import { Page, APIRequestContext } from '@playwright/test';
import { TOKENS } from './nest-tokens';

export interface RuntimeProviders {
  page: Page;
  request?: APIRequestContext;
}

@Module({})
export class SharedModule {
  static forRoot(providers: RuntimeProviders): DynamicModule {
    const runtimeProviders: Provider[] = [
      {
        provide: TOKENS.Page,
        useValue: providers.page,
      },
      {
        provide: TOKENS.Request,
        useValue: providers.request || providers.page.request,
      },
      {
        provide: TOKENS.ApiBaseUrl,
        useFactory: () =>
          process.env.API_BASE_URL || 'http://127.0.0.1:8080/api',
      },
    ];

    return {
      module: SharedModule,
      providers: runtimeProviders,
      exports: [TOKENS.Page, TOKENS.Request, TOKENS.ApiBaseUrl],
    };
  }
}
