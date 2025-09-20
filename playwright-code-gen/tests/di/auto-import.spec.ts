import 'reflect-metadata';
import { test, expect } from '@playwright/test';
import { Container, Transient, Inject } from 'shared/di';
import { autoImportDomains } from 'shared/di';

// Define a local transient using a symbol token to simulate discovery by glob
const LOCAL_TOKEN = Symbol.for('di:test:LocalFoo');

@Transient({ token: LOCAL_TOKEN })
class LocalFoo {}

class UsesLocal {
  constructor(@Inject(LOCAL_TOKEN) public foo: LocalFoo) {}
}

test('autoImportDomains registers decorated classes found by glob', async () => {
  const root = new Container();
  (globalThis as unknown as { __DI_CONTAINER__?: Container }).__DI_CONTAINER__ =
    root;

  // Restrict glob to current tests file directory to ensure import of this module itself
  await autoImportDomains(['playwright-code-gen/tests/di/**/*.{ts,tsx,js}']);

  const scope = root.createScope();
  const instance = scope.resolve<UsesLocal>(
    UsesLocal as unknown as new (...args: unknown[]) => UsesLocal
  );

  expect(instance.foo).toBeInstanceOf(LocalFoo);
});
