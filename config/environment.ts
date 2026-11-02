export interface EnvironmentConfig {
  baseURL: string;
  timeoutMs: number;
  retries: number;
  workers?: number;
}

function integer(value: string | undefined, fallback: number, name: string): number {
  if (!value) return fallback;
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n < 0) throw new Error(`${name} must be a nonnegative integer`);
  return n;
}

/** Environment variables remain the only configuration source; never log secrets. */
export function loadEnvironment(env: NodeJS.ProcessEnv = process.env): EnvironmentConfig {
  const baseURL = env.SAUCEDEMO_BASE_URL ?? 'https://www.saucedemo.com';
  const url = new URL(baseURL);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new Error('SAUCEDEMO_BASE_URL must be an HTTP(S) URL without embedded credentials');
  }
  const timeoutMs = integer(env.PLAYWRIGHT_TIMEOUT_MS, 30_000, 'PLAYWRIGHT_TIMEOUT_MS');
  const retries = integer(env.PLAYWRIGHT_RETRIES, env.CI ? 1 : 0, 'PLAYWRIGHT_RETRIES');
  const workers = env.PLAYWRIGHT_WORKERS
    ? integer(env.PLAYWRIGHT_WORKERS, 2, 'PLAYWRIGHT_WORKERS') : undefined;
  if (timeoutMs === 0 || workers === 0) throw new Error('Timeout and workers must be positive');
  return { baseURL, timeoutMs, retries, workers };
}
