import 'reflect-metadata';

export const SERVICE_METADATA_KEY = Symbol('di:service');
export const INJECT_METADATA_KEY = Symbol('di:inject');

export interface ServiceOptions {
  scope?: 'singleton' | 'transient';
  token?: symbol | string;
}

export function Service(options: ServiceOptions = {}): ClassDecorator {
  return (target: any) => {
    const metadata = {
      scope: options.scope || 'singleton',
      token: options.token || target,
      target,
    };

    Reflect.defineMetadata(SERVICE_METADATA_KEY, metadata, target);

    // Auto-register the service
    if (typeof (globalThis as any).__DI_CONTAINER__ !== 'undefined') {
      (globalThis as any).__DI_CONTAINER__.registerService(target, metadata);
    }
  };
}

export function Inject(token: symbol | string): ParameterDecorator {
  return (
    target: any,
    propertyKey: string | symbol | undefined,
    parameterIndex: number
  ) => {
    const existingInjections =
      Reflect.getMetadata(INJECT_METADATA_KEY, target) || [];
    existingInjections[parameterIndex] = token;
    Reflect.defineMetadata(INJECT_METADATA_KEY, existingInjections, target);
  };
}

export function getServiceMetadata(target: any): ServiceOptions | undefined {
  return Reflect.getMetadata(SERVICE_METADATA_KEY, target);
}

export function getInjectMetadata(target: any): (symbol | string)[] {
  return Reflect.getMetadata(INJECT_METADATA_KEY, target) || [];
}
