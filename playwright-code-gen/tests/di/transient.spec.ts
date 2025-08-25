import 'reflect-metadata';
import { test, expect } from '@playwright/test';
import { Container } from '../../src/shared/di/container';
import { Transient, Inject } from '../../src/shared/di';

const FOO = Symbol('Foo');

@Transient({ token: FOO })
class Foo {}

class Bar {
  constructor(@Inject(FOO) public foo: Foo) {}
}

test.describe('DI Transient', () => {
  test('resolve returns new instance each time', () => {
    const c = new Container();
    (
      globalThis as unknown as { __DI_CONTAINER__?: Container }
    ).__DI_CONTAINER__ = c;

    const b1 = c.resolve<Bar>(
      Bar as unknown as new (...args: unknown[]) => Bar
    );
    const b2 = c.resolve<Bar>(
      Bar as unknown as new (...args: unknown[]) => Bar
    );

    expect(b1.foo).toBeInstanceOf(Foo);
    expect(b2.foo).toBeInstanceOf(Foo);
    expect(b1.foo).not.toBe(b2.foo);
  });

  test('default token equals class when not provided', () => {
    @Transient()
    class Baz {}

    const c = new Container();
    (
      globalThis as unknown as { __DI_CONTAINER__?: Container }
    ).__DI_CONTAINER__ = c;

    class Holder {
      constructor(@Inject(Baz) public baz: Baz) {}
    }

    const h1 = c.resolve<Holder>(
      Holder as unknown as new (...args: unknown[]) => Holder
    );
    const h2 = c.resolve<Holder>(
      Holder as unknown as new (...args: unknown[]) => Holder
    );
    expect(h1.baz).toBeInstanceOf(Baz);
    expect(h2.baz).toBeInstanceOf(Baz);
    expect(h1.baz).not.toBe(h2.baz);
  });
});
