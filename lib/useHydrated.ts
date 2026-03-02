import { useSyncExternalStore } from "react";

function subscribe(onStoreChange: () => void) {
  // Fire exactly once after hydration to switch snapshot from false -> true.
  const t = window.setTimeout(onStoreChange, 0);
  return () => window.clearTimeout(t);
}

function getSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

