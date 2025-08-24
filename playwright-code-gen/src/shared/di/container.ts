import { ServiceOptions, getInjectMetadata } from './decorators';

export interface ServiceMetadata extends ServiceOptions {
  target: new (...args: any[]) => unknown;
}

export class Container {
  private serviceRegistry = new Map<symbol | string, ServiceMetadata>();
  private instances = new Map<symbol | string, unknown>();
  private instanceRegistry = new Map<symbol | string, unknown>();

  registerService(
    target: new (...args: unknown[]) => unknown,
    metadata: ServiceMetadata
  ): void {
    const token =
      metadata.token || (typeof target === 'function' ? target.name : target);
    this.serviceRegistry.set(token, metadata);
  }

  registerInstance<T>(token: symbol | string, instance: T): void {
    this.instanceRegistry.set(token, instance);
  }

  resolve<T>(token: symbol | string | (new (...args: any[]) => T)): T {
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
      const dep = this.instanceRegistry.has(injectionToken)
        ? this.instanceRegistry.get(injectionToken)
        : this.resolve<unknown>(injectionToken);
      if (dep == null) {
        throw new Error(
          `DI resolved ${String(injectionToken)} as ${dep} for ${target.name}. Check @Inject(...) and registerInstance() order.`
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
}

// Global container instance
export const container = new Container();

// Make container globally available for auto-registration
(globalThis as any).__DI_CONTAINER__ = container;
