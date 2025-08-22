import { Module } from '@nestjs/common';

@Module({
  providers: [
    {
      provide: 'PAGE',
      useValue: null, // Will be overridden at runtime
    },
    {
      provide: 'REQUEST',
      useValue: null, // Will be overridden at runtime
    },
    {
      provide: 'API_BASE_URL',
      useFactory: () => process.env.API_BASE_URL || 'http://127.0.0.1:8080/api',
    },
  ],
  exports: ['PAGE', 'REQUEST', 'API_BASE_URL'],
})
export class SharedModule {}
