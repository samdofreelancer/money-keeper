// Tiny per-scenario DI container (no external deps)
export type Token<T> = symbol & { __type?: T };

export class Container {
  private singletons = new Map<symbol, unknown>();
  private factories = new Map<symbol, (c: Container) => unknown>();
  private transients = new Set<symbol>();

  registerSingleton<T>(token: Token<T>, factory: (c: Container) => T) {
    this.factories.set(token, factory);
  }
  registerTransient<T>(token: Token<T>, factory: (c: Container) => T) {
    this.factories.set(token, factory);
    this.transients.add(token);
  }
  registerInstance<T>(token: Token<T>, instance: T) {
    this.singletons.set(token, instance as unknown as object);
  }
  resolve<T>(token: Token<T>): T {
    if (!this.transients.has(token)) {
      console.log(`[DI] Resolving singleton for ${String(token.description)}`);
      if (!this.singletons.has(token)) {
        console.log(`[DI] Creating new instance for ${String(token.description)}`);
        const f = this.factories.get(token);
        if (!f) throw new Error(`No provider for ${String(token.description)}`);
        this.singletons.set(token, f(this));
      }
      console.log(`[DI] Returning cached instance for ${String(token.description)}`);
      return this.singletons.get(token) as T;
    }
    console.log(`[DI] Resolving transient for ${String(token.description)}`);
    const f = this.factories.get(token);
    if (!f) throw new Error(`No provider for ${String(token.description)}`);
    return f(this) as T;
  }
}
