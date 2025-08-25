import { ServiceOptions, getInjectMetadata } from './decorators';

export interface ServiceMetadata extends ServiceOptions {
  target: new (...args: unknown[]) => unknown;
}

function normalizeToken(token: symbol | string | Function): symbol | string {
  if (typeof token === 'function') return token.name;
  return token;
}

export class Container {
  private serviceRegistry = new Map<symbol | string, ServiceMetadata>();
  private instances = new Map<symbol | string, unknown>();
  private instanceRegistry = new Map<symbol | string, unknown>();

  registerService(
    target: new (...args: unknown[]) => unknown,
    metadata: ServiceMetadata
  ): void {
    const rawToken =
      metadata.token || (typeof target === 'function' ? target.name : target);
    const token = normalizeToken(rawToken as symbol | string | Function);
    this.serviceRegistry.set(token, metadata);
  }

  registerInstance<T>(token: symbol | string | Function, instance: T): void {
    const key = normalizeToken(token);
    this.instanceRegistry.set(key, instance);
  }

  resolve<T>(token: symbol | string | (new (...args: unknown[]) => T)): T {
    // First check if we have a registered instance
    if (typeof token === 'symbol' || typeof token === 'string') {
      const instance = this.instanceRegistry.get(token);
      if (instance !== undefined) {
        return instance as T;
      }
    }

    // Handle constructor function tokens by converting them to their string representation
    let lookupToken: symbol | string;
    if (typeof token === 'function') {
      lookupToken = token.name;
    } else {
      lookupToken = token;
    }

    // Then check if we have a service registration
    const serviceMetadata = this.serviceRegistry.get(lookupToken);
    if (!serviceMetadata) {
      throw new Error(
        `No service registered for token: ${lookupToken.toString()}`
      );
    }

    // Check if we have a singleton instance already
    if (serviceMetadata.scope === 'singleton') {
      const existingInstance = this.instances.get(lookupToken);
      if (existingInstance) {
        return existingInstance as T;
      }
    }

    // Create new instance
    const instance = this.buildInstance(serviceMetadata.target);

    // Store singleton instances
    if (serviceMetadata.scope === 'singleton') {
      this.instances.set(lookupToken, instance);
    }

    return instance as T;
  }

  private buildInstance<T>(target: new (...args: unknown[]) => T): T {
    const injections = getInjectMetadata(target);
    const dependencies = injections.map(injectionToken => {
      const key = normalizeToken(injectionToken as symbol | string | Function);
      const dep = this.instanceRegistry.has(key)
        ? this.instanceRegistry.get(key)
        : this.resolve<unknown>(key);
      if (dep == null) {
        throw new Error(
          `DI resolved ${String(key)} as ${dep} for ${target.name}. Check @Inject(...) and registerInstance() order.`
        );
      }
      return dep;
    });

    return new target(...dependencies);
  }

  buildAllFromRegistry(): void {
    for (const [token, metadata] of this.serviceRegistry) {
      if (metadata.scope === 'singleton') {
        this.resolve(token);
      }
    }
  }

  clear(): void {
    this.instances.clear();
    this.instanceRegistry.clear();
  }

  getServiceCount(): number {
    return this.serviceRegistry.size;
  }

  getInstanceCount(): number {
    return this.instances.size + this.instanceRegistry.size;
  }

  getServiceRegistry(): Map<symbol | string, ServiceMetadata> {
    return new Map(this.serviceRegistry);
  }
}

// Global container instance
export const container = new Container();

// Make container globally available for auto-registration
(globalThis as { __DI_CONTAINER__?: unknown }).__DI_CONTAINER__ = container;
