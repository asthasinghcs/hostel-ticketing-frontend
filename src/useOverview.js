import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "./api";

// Counts and ticket data always belong to the same hostel and server snapshot.
export function useOverview(block, dateFrom = "", dateTo = "") {
  const queryKey = JSON.stringify([block, dateFrom, dateTo]);
  const [result, setResult] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const request = useRef(null);
  const sequence = useRef(0);

  const load = useCallback(() => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    const version = ++sequence.current;
    return api(
      `/api/overview?${new URLSearchParams({ hostel_block: block, date_from: dateFrom, date_to: dateTo })}`,
      { signal: controller.signal },
    )
      .then((data) => {
        if (controller.signal.aborted || version !== sequence.current)
          return false;
        setResult({ queryKey, data, error: "" });
        return true;
      })
      .catch((error) => {
        if (controller.signal.aborted || version !== sequence.current)
          return false;
        setResult((previous) => ({
          queryKey,
          data: previous?.queryKey === queryKey ? previous.data : null,
          error: error.message,
        }));
        return false;
      })
      .finally(() => {
        if (version === sequence.current) {
          request.current = null;
          setRefreshing(false);
        }
      });
  }, [block, dateFrom, dateTo, queryKey]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    return load();
  }, [load]);

  useEffect(() => {
    // Initial loading is derived from the query key; only asynchronous results set state.
    load();
    const onFocus = () => {
      if (!request.current && document.visibilityState === "visible") load();
    };
    const interval = setInterval(onFocus, 30000);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      request.current?.abort();
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [load]);

  const current = result?.queryKey === queryKey ? result : null;
  return {
    data: current?.data,
    error: current?.error || "",
    loading: !current,
    refreshing,
    refresh,
  };
}
