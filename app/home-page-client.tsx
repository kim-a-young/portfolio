"use client";

import { useState, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { Intro } from "@/components/Intro";

/** `params` Promise를 props로 받지 않음 — Cursor/devtools 직렬화 시 enumeration 경고 방지 */
export function HomePageClient() {
  const [mainVisible, setMainVisible] = useState(false);
  const [introMounted, setIntroMounted] = useState(true);

  const handleMainReveal = useCallback(() => {
    setMainVisible(true);
  }, []);

  const handleIntroComplete = useCallback(() => {
    setIntroMounted(false);
  }, []);

  return (
    <div className="relative min-h-svh">
      <div
        className="min-h-svh transition-[opacity] duration-[800ms] ease-out"
        style={{
          opacity: mainVisible ? 1 : 0,
          pointerEvents: mainVisible ? "auto" : "none",
        }}
      >
        <Layout mainEntered={mainVisible && !introMounted} />
      </div>
      {introMounted && (
        <Intro onMainReveal={handleMainReveal} onComplete={handleIntroComplete} />
      )}
    </div>
  );
}
