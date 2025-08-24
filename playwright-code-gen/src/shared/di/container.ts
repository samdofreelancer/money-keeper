import { ServiceOptions, getServiceMetadata, getInjectMetadata } from './decorators';

export interface ServiceMetadata extends ServiceOptions {
  target: any;
}

export class Container {
  private serviceRegistry = new Map<any, ServiceMetadata>();
  private instances = new Map<any, any>();
  private instanceRegistry = new Map<symbol | string, any>();

  registerService(target: any, metadata: ServiceMetadata): void {
    this.serviceRegistry.set(metadata.token || target, metadata);
  }

  registerInstance(token: symbol | string, instance: any): void {
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

    // Then check if we have a service registration
    const serviceMetadata = this.serviceRegistry.get(token);
    if (!serviceMetadata) {
      throw new Error(`No service registered for token: ${token.toString()}`);
    }

    // Check if we have a singleton instance already
    if (serviceMetadata.scope === 'singleton') {
      const existingInstance = this.instances.get(serviceMetadata.target);
      if (existingInstance) {
        return existingInstance as T;
      }
    }

    // Create new instance
    const instance = this.buildInstance(serviceMetadata.target);
    
    // Store singleton instances
    if (serviceMetadata.scope === 'singleton') {
      this.instances.set(serviceMetadata.target, instance);
    }

    return instance as T;
  }

  private buildInstance<T>(target: new (...args: any[]) => T): T {
    const injections = getInjectMetadata(target);
    const dependencies = injections.map(injectionToken => {
      const dep = this.instanceRegistry.has(injectionToken) ? this.instanceRegistry.get(injectionToken) : this.resolve<any>(injectionToken);
      if (dep == null) {
        throw new Error(`DI resolved ${String(injectionToken)} as ${dep} for ${target.name}. Check @Inject(...) and registerInstance() order.`);
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
