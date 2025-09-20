import { ServiceOptions, getInjectMetadata } from './decorators';

export interface ServiceMetadata extends ServiceOptions {
  target: new (...args: unknown[]) => unknown;
}

function normalizeToken(token: symbol | string | Function): symbol | string {
  if (typeof token === 'function') return token.name;
  return token;
}

export class Container {
  private readonly parent?: Container;
  private readonly root: Container;

  // Registry of service metadata is owned by root (shared for all scopes)
  private readonly serviceRegistry: Map<symbol | string, ServiceMetadata>;

  // Pre-compiled factories, owned by root
  private readonly compiledFactories: Map<
    symbol | string,
    (scope: Container) => unknown
  >;

  // Scoped singleton instances cache (per-container)
  private readonly scopedSingletons = new Map<symbol | string, unknown>();

  // Per-scope runtime instance registry (Page, Request, etc.)
  private readonly instanceRegistry = new Map<symbol | string, unknown>();

  constructor(parent?: Container) {
    this.parent = parent;
    this.root = parent ? parent.root : this;

    // Share registries/factories with root
    if (!parent) {
      this.serviceRegistry = new Map();
      this.compiledFactories = new Map();
    } else {
      this.serviceRegistry = parent.serviceRegistry;
      this.compiledFactories = parent.compiledFactories;
    }
  }

  registerService(
    target: new (...args: unknown[]) => unknown,
    metadata: ServiceMetadata
  ): void {
    const rawToken =
      metadata.token || (typeof target === 'function' ? target.name : target);
    const token = normalizeToken(rawToken as symbol | string | Function);

    // Store metadata at root registry
    this.root.serviceRegistry.set(token, { ...metadata, target });

    // Compile factory once based on current decorator metadata
    if (!this.root.compiledFactories.has(token)) {
      // Extract constructor injection tokens once to avoid repeated Reflect lookups
      const injectionTokens = getInjectMetadata(target);
      const normalizedDeps = injectionTokens.map(t =>
        normalizeToken(t as symbol | string | Function)
      );

      const factory = (scope: Container) => {
        const resolvedDeps = normalizedDeps.map(depToken => {
          const runtimeInstance = scope.getInstance(depToken);
          if (runtimeInstance !== undefined) return runtimeInstance;
          // Delegate to container resolution for nested services
          return scope.resolve<unknown>(depToken);
        });

        return new target(...resolvedDeps);
      };

      this.root.compiledFactories.set(token, factory);
    }
  }

  registerInstance<T>(token: symbol | string | Function, instance: T): void {
    const key = normalizeToken(token);
    this.instanceRegistry.set(key, instance);
  }

  // Internal helper to read per-scope instance without falling back
  private getInstance(key: symbol | string): unknown | undefined {
    if (this.instanceRegistry.has(key)) return this.instanceRegistry.get(key);
    // If not present in this scope, check parent scope for runtime tokens
    if (this.parent) return this.parent.getInstance(key);
    return undefined;
  }

  resolve<T>(token: symbol | string | (new (...args: unknown[]) => T)): T {
    // Handle constructor function tokens by converting them to their string representation
    const lookupToken: symbol | string =
      typeof token === 'function' ? token.name : token;

    // First: runtime instance in current scope chain
    const runtimeInstance = this.getInstance(lookupToken);
    if (runtimeInstance !== undefined) return runtimeInstance as T;

    // Find service registration at root
    const serviceMetadata = this.root.serviceRegistry.get(lookupToken);
    if (!serviceMetadata) {
      throw new Error(
        `No service registered for token: ${lookupToken.toString()}`
      );
    }

    // Singletons are cached per scope
    if (serviceMetadata.scope === 'singleton') {
      const existing = this.scopedSingletons.get(lookupToken);
      if (existing) return existing as T;
    }

    // Build using compiled factory
    const factory = this.root.compiledFactories.get(lookupToken);
    if (!factory) {
      throw new Error(
        `Factory not compiled for token: ${lookupToken.toString()}`
      );
    }
    const instance = factory(this);

    if (serviceMetadata.scope === 'singleton') {
      this.scopedSingletons.set(lookupToken, instance);
    }

    return instance as T;
  }

  createScope(): Container {
    return new Container(this);
  }

  // Eagerly instantiate all singletons in THIS scope (optional warm-up)
  buildAllFromRegistry(): void {
    for (const [token, metadata] of this.root.serviceRegistry) {
      if (metadata.scope === 'singleton') {
        this.resolve(token);
      }
    }
  }

  // Clear only runtime instances in this scope
  clearRuntimeInstances(): void {
    this.instanceRegistry.clear();
  }

  // Introspection helpers
  getServiceCount(): number {
    return this.root.serviceRegistry.size;
  }

  getInstanceCount(): number {
    // runtime instances count for this scope only + scoped singletons count
    return this.instanceRegistry.size + this.scopedSingletons.size;
  }

  getServiceRegistry(): Map<symbol | string, ServiceMetadata> {
    return new Map(this.root.serviceRegistry);
  }
}
