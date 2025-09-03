import 'reflect-metadata';
import { test, expect } from '@playwright/test';
import { Container, Transient, Inject } from 'shared/di';

const TOKEN = Symbol.for('di:test:SimpleTransient');

@Transient({ token: TOKEN })
class SimpleTransient {}

class Holder {
  constructor(@Inject(TOKEN) public t: SimpleTransient) {}
}

test('Transient returns two different instances on two resolves', () => {
  const root = new Container();
  (globalThis as unknown as { __DI_CONTAINER__?: Container }).__DI_CONTAINER__ =
    root;

  const scope = root.createScope();
  const a = scope.resolve<Holder>(
    Holder as unknown as new (...args: unknown[]) => Holder
  );
  const b = scope.resolve<Holder>(
    Holder as unknown as new (...args: unknown[]) => Holder
  );

  expect(a.t).toBeInstanceOf(SimpleTransient);
  expect(b.t).toBeInstanceOf(SimpleTransient);
  expect(a.t).not.toBe(b.t);
});
