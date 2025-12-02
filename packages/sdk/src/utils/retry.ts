/**
 * Retry utilities for SDK operations.
 */

export type RetryOptions = {
  maxAttempts?: number;
  delay?: number;
  backoff?: number;
  onRetry?: (attempt: number, error: Error) => void;
};

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, "onRetry">> = {
  maxAttempts: 3,
  delay: 1000,
  backoff: 2,
};

/**
 * Retry a function with exponential backoff.
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxAttempts, delay, backoff, onRetry } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxAttempts) {
        throw lastError;
      }

      if (onRetry) {
        onRetry(attempt, lastError);
      }

      // Exponential backoff
      const waitTime = delay * Math.pow(backoff, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw lastError!;
}

/**
 * Retry with exponential backoff, but only for specific error types.
 */
export async function retryOnErrors<T>(
  fn: () => Promise<T>,
  retryableErrors: (error: unknown) => boolean,
  options: RetryOptions = {}
): Promise<T> {
  const { maxAttempts, delay, backoff, onRetry } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry if error is not retryable
      if (!retryableErrors(error)) {
        throw lastError;
      }

      if (attempt === maxAttempts) {
        throw lastError;
      }

      if (onRetry) {
        onRetry(attempt, lastError);
      }

      const waitTime = delay * Math.pow(backoff, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw lastError!;
}

