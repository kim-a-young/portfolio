"use client";

import { useHydrated } from "@/lib/useHydrated";

function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return "하루 잘 시작하셨나요";
  if (hour >= 11 && hour < 17) return "좋은 오후에요";
  if (hour >= 17 && hour < 21) return "편안한 저녁이에요";
  return "하루 잘 보내셨나요";
}

/**
 * Time-based greeting.
 * Uses server snapshot during hydration to avoid mismatch.
 */
export function Greeting() {
  const hydrated = useHydrated();
  if (!hydrated) return null;
  return <>{`${getTimeBasedGreeting()}, 담당자님`}</>;
}
