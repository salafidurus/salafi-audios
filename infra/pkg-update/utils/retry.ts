export interface RetryOptions {
  retries?: number;
  minTimeout?: number;
}

export async function retry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const { retries = 3, minTimeout = 1000 } = options;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) {
      const delay = minTimeout * 2 ** (attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    try {
      return await operation();
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError;
}
