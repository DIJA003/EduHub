import { useState, useEffect, useCallback, useRef } from "react";

export function useApi(apiFn, immediate = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const apiFnRef = useRef(apiFn);
  useEffect(() => {
    apiFnRef.current = apiFn;
  }, [apiFn]);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFnRef.current(...args);
      setData(result.data ?? result);
      return result.data ?? result;
    } catch (err) {
      setError(err.message || "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (immediate) execute();
  }, [immediate]);

  return { data, loading, error, execute, setData };
}
