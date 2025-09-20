import 'reflect-metadata';

export const SERVICE_METADATA_KEY = Symbol('di:service');
export const INJECT_METADATA_KEY = Symbol('di:inject');

export interface ServiceOptions {
  scope?: 'singleton' | 'transient';
  token?: symbol | string | Function;
}

export function Service(options: ServiceOptions = {}): ClassDecorator {
  return (target: Function) => {
    const metadata = {
      scope: options.scope || 'singleton',
      token: options.token || target,
      target,
    };

    Reflect.defineMetadata(SERVICE_METADATA_KEY, metadata, target);

    // Auto-register the service
    if (
      typeof (globalThis as { __DI_CONTAINER__?: unknown }).__DI_CONTAINER__ !==
      'undefined'
    ) {
      (
        globalThis as { __DI_CONTAINER__?: { registerService: Function } }
      ).__DI_CONTAINER__!.registerService(target, metadata);
    }
  };
}

export function Transient(
  options: Omit<ServiceOptions, 'scope'> = {}
): ClassDecorator {
  return (target: Function) => {
    const metadata = {
      scope: 'transient' as const,
      token: options.token || target,
      target,
    };
    Reflect.defineMetadata(SERVICE_METADATA_KEY, metadata, target);
    if (
      typeof (globalThis as { __DI_CONTAINER__?: unknown }).__DI_CONTAINER__ !==
      'undefined'
    ) {
      (
        globalThis as { __DI_CONTAINER__?: { registerService: Function } }
      ).__DI_CONTAINER__!.registerService(target, metadata);
    }
  };
}

export function Singleton(
  options: Omit<ServiceOptions, 'scope'> = {}
): ClassDecorator {
  return (target: Function) => {
    const metadata = {
      scope: 'singleton' as const,
      token: options.token || target,
      target,
    };
    Reflect.defineMetadata(SERVICE_METADATA_KEY, metadata, target);
    if (
      typeof (globalThis as { __DI_CONTAINER__?: unknown }).__DI_CONTAINER__ !==
      'undefined'
    ) {
      (
        globalThis as { __DI_CONTAINER__?: { registerService: Function } }
      ).__DI_CONTAINER__!.registerService(target, metadata);
    }
  };
}

export function Inject(token: symbol | string | Function): ParameterDecorator {
  return (
    target: Object,
    propertyKey: string | symbol | undefined,
    parameterIndex: number
  ) => {
    const existingInjections =
      Reflect.getMetadata(INJECT_METADATA_KEY, target) || [];
    existingInjections[parameterIndex] = token;
    Reflect.defineMetadata(INJECT_METADATA_KEY, existingInjections, target);
  };
}

export function getServiceMetadata(
  target: Function
): ServiceOptions | undefined {
  return Reflect.getMetadata(SERVICE_METADATA_KEY, target);
}

export function getInjectMetadata(
  target: Object
): (symbol | string | Function)[] {
  return Reflect.getMetadata(INJECT_METADATA_KEY, target) || [];
}
