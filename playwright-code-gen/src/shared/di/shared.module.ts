import { Module } from '@nestjs/common';
import { Page, Request } from '@playwright/test';

@Module({
  providers: [
    {
      provide: 'PAGE',
      useFactory: () => {
        // This will be set dynamically in the World class
        throw new Error('Page instance must be provided by World class');
      },
    },
    {
      provide: 'REQUEST',
      useFactory: () => {
        // This will be set dynamically in the World class
        throw new Error('Request instance must be provided by World class');
      },
    },
    {
      provide: 'API_BASE_URL',
      useFactory: () => process.env.API_BASE_URL || 'http://127.0.0.1:8080/api',
    },
  ],
  exports: ['PAGE', 'REQUEST', 'API_BASE_URL'],
})
export class SharedModule {}
