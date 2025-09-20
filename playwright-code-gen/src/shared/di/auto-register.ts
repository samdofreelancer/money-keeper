import { glob } from 'fast-glob';
import { Logger } from 'shared/utilities/logger';
import type { Container } from './container';

export async function autoImportDomains(
  globs: string[] = [
    'src/domains/**/{pages,usecases,api,services}/**/*.{ts,tsx,js}',
    'src/shared/**/{services,clients}/**/*.{ts,tsx,js}',
  ],
  opts?: { eager?: boolean }
): Promise<void> {
  const patterns = globs;

  const ignorePatterns = [
    '**/*.d.ts',
    '**/*.spec.*',
    '**/__tests__/**',
    '**/test/**',
  ];

  const root = (globalThis as { __DI_CONTAINER__?: Container })
    .__DI_CONTAINER__;
  if (!root) throw new Error('Root DI container is not initialized');

  try {
    Logger.debug('[DI] auto-import: scanning for decorated modules...');

    const files = await glob(patterns, {
      ignore: ignorePatterns,
      absolute: false,
      cwd: process.cwd(),
    });

    Logger.debug(`[DI] auto-import: found ${files.length} files`);

    for (const file of files) {
      try {
        const absolutePath = `${process.cwd()}/${file}`;
        Logger.debug(`[DI] importing: ${absolutePath}`);
        await import(absolutePath);
      } catch (error) {
        const code = (error as { code?: string }).code;
        if (code !== 'ERR_MODULE_NOT_FOUND') {
          Logger.warn(
            `[DI] failed to import ${file}: ${(error as Error).message}`
          );
        }
      }
    }

    if (opts?.eager) {
      // Warm-up singletons in a temporary scope (per-scope cache)
      root.createScope().buildAllFromRegistry();
    }

    Logger.info('[DI] auto-import completed');
  } catch (error) {
    Logger.error('[DI] auto-import failed:', error);
    throw error;
  }
}
