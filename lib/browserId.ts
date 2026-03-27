const BROWSER_ID_KEY = "browser_id";

function newBrowserId(): string {
  const suffix =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
  return `browser-${suffix}`;
}

/** 브라우저 단위 고정 id (Supabase session_id / x-session-id 전용). chat-history와 무관. */
export function getOrCreateBrowserId(): string {
  if (typeof window === "undefined") {
    return "browser-ssr";
  }
  try {
    const existing = localStorage.getItem(BROWSER_ID_KEY);
    if (existing && /^browser-.+/.test(existing)) {
      return existing;
    }
    const id = newBrowserId();
    localStorage.setItem(BROWSER_ID_KEY, id);
    return id;
  } catch {
    return newBrowserId();
  }
}
