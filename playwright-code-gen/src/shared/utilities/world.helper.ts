import type { World } from './world';

export function getWorld(): World {
  if (!globalThis.testWorld) {
    throw new Error('World not initialized');
  }
  return globalThis.testWorld as unknown as World;
}
