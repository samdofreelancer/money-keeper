import { glob } from 'fast-glob';
import type { ServiceMetadata } from './container';
import { Logger } from 'shared/utilities/logger';

export async function autoDiscover(
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

  try {
    Logger.debug('Starting auto-discovery of services...');

    const files = await glob(patterns, {
      ignore: ignorePatterns,
      absolute: false,
      cwd: process.cwd(),
    });

    Logger.debug(`Found ${files.length} potential service files`);
    Logger.debug(`Files: ${JSON.stringify(files, null, 2)}`);

    for (const file of files) {
      try {
        // Convert to absolute path for import
        const absolutePath = `${process.cwd()}/${file}`;
        Logger.debug(`Attempting to import: ${absolutePath}`);
        // Use dynamic import to load the file and trigger decorator execution
        await import(absolutePath);
        Logger.debug(`Successfully imported: ${file}`);
      } catch (error) {
        // Skip files that can't be imported (might be type definitions or non-service files)
        if ((error as { code?: string }).code !== 'ERR_MODULE_NOT_FOUND') {
          Logger.warn(`Failed to import ${file}: ${(error as Error).message}`);
        } else {
          Logger.debug(`Skipping non-module file: ${file}`);
        }
      }
    }

    const root = (
      globalThis as {
        __DI_CONTAINER__?: {
          buildAllFromRegistry: () => void;
          getServiceCount: () => number;
        };
      }
    ).__DI_CONTAINER__;
    if (!root) throw new Error('Root DI container is not initialized');

    // Only eager-build if explicitly requested (must be after tokens are registered!)
    if (opts?.eager) {
      root.buildAllFromRegistry();
    }

    Logger.info(
      `Auto-discovery completed. Registered ${root.getServiceCount()} services`
    );
  } catch (error) {
    Logger.error('Auto-discovery failed:', error);
    throw error;
  }
}

export function getDiscoveredServices(): Map<symbol | string, ServiceMetadata> {
  const root = (
    globalThis as {
      __DI_CONTAINER__?: {
        getServiceRegistry: () => Map<symbol | string, ServiceMetadata>;
      };
    }
  ).__DI_CONTAINER__;
  if (!root) throw new Error('Root DI container is not initialized');
  // Return a copy of the service registry for inspection
  return root.getServiceRegistry();
}
