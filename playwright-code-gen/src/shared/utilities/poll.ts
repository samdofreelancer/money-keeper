/**
 * Poll utility for handling eventual consistency in tests
 * Retries a condition until it's met or timeout is reached
 */

export interface PollOptions {
  timeoutMs?: number;
  intervalMs?: number;
}

export async function poll(
  condition: () => Promise<boolean>,
  options: PollOptions = {}
): Promise<void> {
  const { timeoutMs = 2000, intervalMs = 200 } = options;
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeoutMs) {
    if (await condition()) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  
  throw new Error(`Polling condition not met within ${timeoutMs}ms`);
}
