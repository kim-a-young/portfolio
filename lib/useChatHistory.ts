import { useSyncExternalStore } from "react";
import type { ChatHistory } from "./chatHistory";

const CHANGE_EVENT = "chat-history:change";
const STORAGE_KEY = "chat-history";

const EMPTY_HISTORY: ChatHistory[] = [];

let cachedRaw: string | null = null;
let cachedParsed: ChatHistory[] = EMPTY_HISTORY;

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const onChange = () => callback();
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);

  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot(): ChatHistory[] {
  if (typeof window === "undefined") return EMPTY_HISTORY;

  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedParsed;

  cachedRaw = raw;
  if (!raw) {
    cachedParsed = EMPTY_HISTORY;
    return cachedParsed;
  }

  try {
    const parsed = JSON.parse(raw);
    cachedParsed = Array.isArray(parsed) ? (parsed as ChatHistory[]) : EMPTY_HISTORY;
  } catch {
    cachedParsed = EMPTY_HISTORY;
  }

  return cachedParsed;
}

function getServerSnapshot(): ChatHistory[] {
  // Must match server-rendered HTML during hydration.
  return EMPTY_HISTORY;
}

export function useChatHistory(): ChatHistory[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

