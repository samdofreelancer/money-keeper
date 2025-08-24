// src/shared/utilities/poll.ts
export class PollTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PollTimeoutError';
  }
}

export interface PollOptions {
  /** Tổng thời gian chờ (ms). Mặc định 2000. */
  timeoutMs?: number;
  /** Khoảng lặp (ms). Mặc định 200. */
  intervalMs?: number;
  /** Thêm jitter ngẫu nhiên ±jitterMs vào interval, giảm đụng độ. */
  jitterMs?: number;
  /** Chạy check ngay lần đầu (true) hay đợi interval đầu tiên (false). Mặc định true. */
  immediate?: boolean;
  /** Nếu true thì throw khi hết thời gian; nếu false trả về false. Mặc định true. */
  throwOnTimeout?: boolean;
  /** Huỷ bỏ bằng AbortController. */
  signal?: AbortSignal;
  /** Mô tả ngắn cho thông báo lỗi. Ví dụ: "categories to be absent". */
  reason?: string;
}

/**
 * Lặp gọi `predicate` cho tới khi trả về true hoặc hết timeout.
 * - `predicate` có thể sync/async, trả boolean hoặc "truthy".
 * - Mặc định: ném `PollTimeoutError` khi hết hạn.
 */
export async function poll(
  predicate: () => boolean | Promise<boolean | unknown>,
  {
    timeoutMs = 2000,
    intervalMs = 200,
    jitterMs = 0,
    immediate = true,
    throwOnTimeout = true,
    signal,
    reason,
  }: PollOptions = {}
): Promise<boolean> {
  const start = Date.now();
  const deadline = start + Math.max(0, timeoutMs);

  const sleep = (ms: number) =>
    new Promise<void>((resolve, reject) => {
      const t = setTimeout(resolve, ms);
      if (signal) {
        const onAbort = () => {
          clearTimeout(t);
          reject(new Error('Polling aborted'));
        };
        if (signal.aborted) {
          clearTimeout(t);
          reject(new Error('Polling aborted'));
        } else {
          signal.addEventListener('abort', onAbort, { once: true });
        }
      }
    });

  async function checkOnce(): Promise<boolean> {
    const res = await predicate();
    return !!res;
  }

  if (immediate) {
    if (await checkOnce()) return true;
  }

  // bảo vệ interval tối thiểu 10ms
  const baseInterval = Math.max(10, intervalMs);

  while (Date.now() < deadline) {
    // tính interval có jitter (±jitterMs)
    const j = jitterMs > 0 ? (Math.random() * 2 - 1) * jitterMs : 0;
    const wait = Math.max(5, baseInterval + j);
    const remaining = deadline - Date.now();
    await sleep(Math.min(wait, Math.max(0, remaining)));

    if (await checkOnce()) return true;
  }

  // timeout
  if (throwOnTimeout) {
    const spent = Date.now() - start;
    const hint = reason ? ` while waiting for ${reason}` : '';
    throw new PollTimeoutError(
      `Polling timed out after ${spent}ms${hint} (timeout=${timeoutMs}ms, interval=${intervalMs}ms).`
    );
  }
  return false;
}
