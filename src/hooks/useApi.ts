import { useState, useCallback } from 'react';
import { handleApiError, ApiError } from '../utils/errorHandler';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
}

export const useApi = <T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options?: UseApiOptions<T>
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const execute = useCallback(async (...args: any[]) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction(...args);
      setData(result);
      options?.onSuccess?.(result);
      return result;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      options?.onError?.(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, options]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
};
