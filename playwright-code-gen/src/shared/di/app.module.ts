import { DynamicModule, Module, Provider } from '@nestjs/common';
import { RuntimeProviders } from './shared.module';
import { RuntimeDiModule } from './runtime-di.module';
import { isAutoInjectable } from './auto-injectable.decorator';

@Module({})
export class AppModule {
  static forRoot(runtime: RuntimeProviders, autoInjectableClasses: any[] = []): DynamicModule {
    // Create providers from auto-injectable classes
    const autoInjectableProviders: Provider[] = autoInjectableClasses
      .filter(cls => typeof cls === 'function' && isAutoInjectable(cls))
      .map(cls => ({
        provide: TOKENS[cls.name], // Register with the corresponding token
        useClass: cls,
      }));

    // Extract the provide tokens for exports
    const autoInjectableTokens = autoInjectableProviders.map(provider => 
      (provider as any).provide
    );

    return {
      module: AppModule,
      imports: [
        RuntimeDiModule.withRuntime(runtime),
      ],
      providers: [
        ...autoInjectableProviders,
      ],
      exports: [
        ...autoInjectableTokens,
      ],
    };
  }
}
