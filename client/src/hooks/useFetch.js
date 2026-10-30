import { useCallback, useEffect, useState } from 'react';

// Runs an async API function when the component mounts and keeps three pieces
// of state for the screen: data, isLoading and error. `refetch()` runs it again.
//
//   const { data, isLoading, error, refetch } = useFetch(fetchHealth);
//
// `fetcher` receives an AbortSignal so an unfinished request is cancelled when
// the component unmounts.
export const useFetch = (fetcher) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const result = await fetcher(controller.signal);
        setData(result);
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [fetcher, reloadCount]);

  const refetch = useCallback(() => setReloadCount((count) => count + 1), []);

  return { data, error, isLoading, refetch };
};
