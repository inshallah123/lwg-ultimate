import { useCallback, useState } from 'react';

export function useErrorHandler() {
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleError = useCallback((error: Error) => {
    console.error('Error occurred:', error);
    setError(error);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleAsync = useCallback(async <T,>(
    asyncFunction: () => Promise<T>
  ): Promise<T | undefined> => {
    try {
      setIsLoading(true);
      setError(null);
      return await asyncFunction();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      handleError(error);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  return {
    error,
    isLoading,
    handleError,
    clearError,
    handleAsync
  };
}