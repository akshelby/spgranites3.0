import { toast } from 'sonner';

export class AppError extends Error {
  public code: string;
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, code: string = 'UNKNOWN', statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) return error.message;
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred. Please try again.';
}

export function getUserFriendlyMessage(error: unknown): string {
  const message = getErrorMessage(error);

  if (message.includes('Failed to fetch') || message.includes('NetworkError') || message.includes('net::ERR')) {
    return 'Unable to connect to the server. Please check your internet connection.';
  }
  if (message.includes('timeout') || message.includes('Timeout')) {
    return 'The request took too long. Please try again.';
  }
  if (message.includes('401') || message.includes('Not authenticated')) {
    return 'Your session has expired. Please sign in again.';
  }
  if (message.includes('403') || message.includes('forbidden') || message.includes('Admin access')) {
    return 'You do not have permission to perform this action.';
  }
  if (message.includes('404') || message.includes('not found')) {
    return 'The requested item could not be found.';
  }
  if (message.includes('409') || message.includes('already exists') || message.includes('duplicate')) {
    return 'This item already exists. Please use a different name or value.';
  }
  if (message.includes('413') || message.includes('too large')) {
    return 'The file or data is too large. Please reduce the size and try again.';
  }
  if (message.includes('429') || message.includes('rate limit') || message.includes('Too many')) {
    return 'Too many requests. Please wait a moment and try again.';
  }
  if (message.includes('500') || message.includes('Internal Server Error')) {
    return 'Something went wrong on our end. Please try again later.';
  }

  if (message.length > 200) {
    return 'An unexpected error occurred. Please try again.';
  }

  return message;
}

export function handleError(error: unknown, context?: string) {
  const friendlyMessage = getUserFriendlyMessage(error);
  const rawMessage = getErrorMessage(error);

  console.error(`[${context || 'App'}] Error:`, rawMessage);

  toast.error(friendlyMessage);
  return friendlyMessage;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: { retries?: number; delay?: number; backoff?: boolean; onRetry?: (attempt: number, error: unknown) => void } = {}
): Promise<T> {
  const { retries = 3, delay = 1000, backoff = true, onRetry } = options;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === retries) throw error;

      const isRetryable =
        error instanceof Error &&
        (error.message.includes('Failed to fetch') ||
          error.message.includes('NetworkError') ||
          error.message.includes('timeout') ||
          error.message.includes('429') ||
          error.message.includes('503'));

      if (!isRetryable) throw error;

      onRetry?.(attempt + 1, error);
      const waitTime = backoff ? delay * Math.pow(2, attempt) : delay;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw new Error('Max retries reached');
}

export function isNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.message.includes('Failed to fetch') ||
    error.message.includes('NetworkError') ||
    error.message.includes('net::ERR') ||
    error.message.includes('Network request failed')
  );
}

export function isAuthError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.message.includes('401') ||
    error.message.includes('Not authenticated') ||
    error.message.includes('session') ||
    error.message.includes('token')
  );
}
