"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

const EMPTY_RECORD = "{}";

export function useLocalRecord<T extends Record<string, unknown>>(key: string) {
  const subscribe = useCallback(
    (listener: () => void) => {
      const onStorage = (event: StorageEvent) => {
        if (event.key === key) listener();
      };
      window.addEventListener("storage", onStorage);
      window.addEventListener(`aa-storage:${key}`, listener);
      return () => {
        window.removeEventListener("storage", onStorage);
        window.removeEventListener(`aa-storage:${key}`, listener);
      };
    },
    [key]
  );

  const getSnapshot = useCallback(
    () => window.localStorage.getItem(key) || EMPTY_RECORD,
    [key]
  );
  const getServerSnapshot = useCallback(() => EMPTY_RECORD, []);
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const value = useMemo(() => {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return {} as T;
    }
  }, [raw]);

  const setValue = useCallback(
    (next: T) => {
      window.localStorage.setItem(key, JSON.stringify(next));
      window.dispatchEvent(new Event(`aa-storage:${key}`));
    },
    [key]
  );

  return [value, setValue] as const;
}
