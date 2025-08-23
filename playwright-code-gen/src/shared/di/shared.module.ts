import { Module, DynamicModule, Provider } from '@nestjs/common';
import { Page, APIRequestContext } from '@playwright/test';

export interface RuntimeProviders {
  page: Page;
  request?: APIRequestContext;
}

@Module({})
export class SharedModule {
  static forRoot(providers: RuntimeProviders): DynamicModule {
    const runtimeProviders: Provider[] = [
      {
        provide: 'PAGE',
        useValue: providers.page,
      },
      {
        provide: 'REQUEST',
        useValue: providers.request || providers.page.request,
      },
      {
        provide: 'API_BASE_URL',
        useFactory: () =>
          process.env.API_BASE_URL || 'http://127.0.0.1:8080/api',
      },
    ];

    return {
      module: SharedModule,
      providers: runtimeProviders,
      exports: runtimeProviders,
    };
  }
}
