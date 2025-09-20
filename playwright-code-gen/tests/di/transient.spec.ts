import 'reflect-metadata';
import { test, expect } from '@playwright/test';
import { Container, Transient, Singleton, Inject } from 'shared/di';

const FOO = Symbol('Foo');

@Transient({ token: FOO })
class Foo {}

class Bar {
  constructor(@Inject(FOO) public foo: Foo) {}
}

test.describe('DI Transient', () => {
  test('resolve returns new instance each time', () => {
    const root = new Container();
    (
      globalThis as unknown as { __DI_CONTAINER__?: Container }
    ).__DI_CONTAINER__ = root;

    const scope = root.createScope();

    const b1 = scope.resolve<Bar>(
      Bar as unknown as new (...args: unknown[]) => Bar
    );
    const b2 = scope.resolve<Bar>(
      Bar as unknown as new (...args: unknown[]) => Bar
    );

    expect(b1.foo).toBeInstanceOf(Foo);
    expect(b2.foo).toBeInstanceOf(Foo);
    expect(b1.foo).not.toBe(b2.foo);
  });

  test('default token equals class when not provided', () => {
    @Transient()
    class Baz {}

    const root = new Container();
    (
      globalThis as unknown as { __DI_CONTAINER__?: Container }
    ).__DI_CONTAINER__ = root;

    class Holder {
      constructor(@Inject(Baz) public baz: Baz) {}
    }

    const scope = root.createScope();

    const h1 = scope.resolve<Holder>(
      Holder as unknown as new (...args: unknown[]) => Holder
    );
    const h2 = scope.resolve<Holder>(
      Holder as unknown as new (...args: unknown[]) => Holder
    );
    expect(h1.baz).toBeInstanceOf(Baz);
    expect(h2.baz).toBeInstanceOf(Baz);
    expect(h1.baz).not.toBe(h2.baz);
  });
});

// Additional quick tests for scoped behavior and compiled factories
test.describe('DI Scoped + Compiled Factories', () => {
  test('singleton scoped across containers (different scopes -> different instances)', () => {
    @Singleton()
    class Svc {}

    class NeedsSvc {
      constructor(@Inject(Svc) public s: Svc) {}
    }

    const root = new Container();
    (
      globalThis as unknown as { __DI_CONTAINER__?: Container }
    ).__DI_CONTAINER__ = root;

    const scopeA = root.createScope();
    const scopeB = root.createScope();

    const a1 = scopeA.resolve<NeedsSvc>(
      NeedsSvc as unknown as new (...args: unknown[]) => NeedsSvc
    );
    const b1 = scopeB.resolve<NeedsSvc>(
      NeedsSvc as unknown as new (...args: unknown[]) => NeedsSvc
    );

    expect(a1.s).toBeInstanceOf(Svc);
    expect(b1.s).toBeInstanceOf(Svc);
    expect(a1.s).not.toBe(b1.s); // scoped singleton differs across scopes
  });

  test('factory compiled once (no repeated Reflect lookups)', () => {
    let reflectCalls = 0;

    type GetMetadataFn = (...args: unknown[]) => unknown;
    const originalGetMetadata: GetMetadataFn = (
      Reflect as unknown as { getMetadata: GetMetadataFn }
    ).getMetadata;

    const wrappedGetMetadata: GetMetadataFn = (...args: unknown[]): unknown => {
      if (args && args[0] && String(args[0]).includes('di:inject')) {
        reflectCalls += 1;
      }
      return originalGetMetadata(...args);
    };

    (Reflect as unknown as { getMetadata: GetMetadataFn }).getMetadata =
      wrappedGetMetadata;

    @Transient()
    class Dep {}
    class Target {
      constructor(@Inject(Dep) public d: Dep) {}
    }

    const root = new Container();
    (
      globalThis as unknown as { __DI_CONTAINER__?: Container }
    ).__DI_CONTAINER__ = root;
    const scope = root.createScope();

    // First resolve compiles factory and may read metadata once
    scope.resolve<Target>(
      Target as unknown as new (...args: unknown[]) => Target
    );
    const callsAfterFirst = reflectCalls;

    // Subsequent resolves should NOT trigger additional metadata reads
    scope.resolve<Target>(
      Target as unknown as new (...args: unknown[]) => Target
    );
    scope.resolve<Target>(
      Target as unknown as new (...args: unknown[]) => Target
    );

    expect(reflectCalls).toBe(callsAfterFirst);

    // restore
    (Reflect as unknown as { getMetadata: GetMetadataFn }).getMetadata =
      originalGetMetadata;
  });
});
