"use client";

import { useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 서버와 클라이언트 초기 렌더링 불일치를 막기 위해
  // 클라이언트 마운트 전에는 토글을 렌더링하지 않음
  if (!mounted) {
    return null;
  }

  const toggle = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex h-10 w-10 items-center justify-center rounded-lg border transition-colors hover:bg-[var(--subtle-gray)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--background)", color: "var(--icon)" }}
      aria-label={resolvedTheme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
      title={resolvedTheme === "dark" ? "라이트 모드" : "다크 모드"}
    >
      {resolvedTheme === "dark" ? (
        <SunIcon className="h-5 w-5" />
      ) : (
        <MoonIcon className="h-5 w-5" />
      )}
    </button>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
