import 'reflect-metadata';
import { test, expect } from '@playwright/test';
import { Container } from 'shared/di';
import { Singleton, Inject, Transient } from 'shared/di';

@Singleton()
class OnlyOne {}

class NeedsOnlyOne {
  constructor(@Inject(OnlyOne) public s: OnlyOne) {}
}

@Transient()
class AnyTime {}

class NeedsAnyTime {
  constructor(@Inject(AnyTime) public t: AnyTime) {}
}

test.describe('DI Scoped Singleton', () => {
  test('same scope -> same instance; different scopes -> different', () => {
    const root = new Container();
    (
      globalThis as unknown as { __DI_CONTAINER__?: Container }
    ).__DI_CONTAINER__ = root;

    const s1 = root.createScope();
    const s2 = root.createScope();

    const a1 = s1.resolve(
      NeedsOnlyOne as unknown as new (...args: unknown[]) => NeedsOnlyOne
    );
    const a2 = s1.resolve(
      NeedsOnlyOne as unknown as new (...args: unknown[]) => NeedsOnlyOne
    );
    const b1 = s2.resolve(
      NeedsOnlyOne as unknown as new (...args: unknown[]) => NeedsOnlyOne
    );

    expect(a1.s).toBe(a2.s);
    expect(a1.s).not.toBe(b1.s);
  });

  test('transient remains new per resolve regardless of scope', () => {
    const root = new Container();
    (
      globalThis as unknown as { __DI_CONTAINER__?: Container }
    ).__DI_CONTAINER__ = root;

    const s1 = root.createScope();

    const t1 = s1.resolve(
      NeedsAnyTime as unknown as new (...args: unknown[]) => NeedsAnyTime
    );
    const t2 = s1.resolve(
      NeedsAnyTime as unknown as new (...args: unknown[]) => NeedsAnyTime
    );
    expect(t1.t).not.toBe(t2.t);
  });
});
