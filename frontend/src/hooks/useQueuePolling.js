// src/hooks/useQueuePolling.js
import { useCallback, useEffect, useState } from "react";
import { http } from "../api/http";

export function useQueuePolling({ autoStart = true, intervalMs = 4000 } = {}) {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchQueue = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await http.get("/queue");
      setQueue(data || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!autoStart) return;
    fetchQueue();
    const id = setInterval(fetchQueue, intervalMs);
    return () => clearInterval(id);
  }, [autoStart, intervalMs, fetchQueue]);

  return { queue, loading, error, reload: fetchQueue };
}

export default useQueuePolling;
