"use client";

import { useEffect, useRef } from "react";

/**
 * Motion Trails 등 Spline **Public URL** 페이지를 iframe으로만 넣습니다.
 * (씬 데이터가 HTML에 인라인되어 `scene.splinecode` 불일치로 생기던
 * "Data read, but end of buffer not reached" 오류를 피할 수 있습니다.)
 *
 * 문구는 Spline 에디터에서 씬 **중앙**에 직접 배치한 3D/UI 텍스트가 그대로 보입니다.
 *
 * Public URL 워터마크는 iframe 안이라 제거 불가. 우하단을 패치로 가리며,
 * 완전 제거는 Spline Export **Logo → No**(플랜/설정)이 정석입니다.
 *
 * @see https://my.spline.design/motiontrails-FnQ1EVac8PrRbG6QFMRhVUjK/
 */
export const INTRO_SPLINE_PUBLIC_URL =
  process.env.NEXT_PUBLIC_SPLINE_INTRO_PUBLIC_URL ??
  "https://my.spline.design/motiontrails-FnQ1EVac8PrRbG6QFMRhVUjK/";

type IntroProps = {
  onMainReveal?: () => void;
  onComplete?: () => void;
};

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/** 인트로만의 타이밍 (본문 노출·오버레이 해제). 문구 애니메이션 없음 */
const MAIN_REVEAL_AT_S = 4.25;
const OVERLAY_FADE_START_S = 4.4;
const OVERLAY_FADE_END_S = 5.2;

export function Intro({ onMainReveal, onComplete }: IntroProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const onCompleteRef = useRef(onComplete);
  const onMainRevealRef = useRef(onMainReveal);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onMainRevealRef.current = onMainReveal;
  }, [onComplete, onMainReveal]);

  useEffect(() => {
    const overlayEl = overlayRef.current;
    if (!overlayEl) return;

    const start = performance.now();
    let completed = false;
    let mainRevealed = false;

    const tick = (now: number) => {
      const t = (now - start) / 1000;

      if (!mainRevealed && t >= MAIN_REVEAL_AT_S) {
        mainRevealed = true;
        onMainRevealRef.current?.();
      }

      let overlayOpacity = 1;
      if (t >= OVERLAY_FADE_START_S && t < OVERLAY_FADE_END_S) {
        const u =
          (t - OVERLAY_FADE_START_S) /
          (OVERLAY_FADE_END_S - OVERLAY_FADE_START_S);
        overlayOpacity = 1 - easeOutCubic(u);
      } else if (t >= OVERLAY_FADE_END_S) {
        overlayOpacity = 0;
      }
      overlayEl.style.opacity = String(overlayOpacity);
      overlayEl.style.pointerEvents =
        t >= MAIN_REVEAL_AT_S || overlayOpacity < 0.02 ? "none" : "auto";

      if (t >= OVERLAY_FADE_END_S && !completed) {
        completed = true;
        onCompleteRef.current?.();
      }

      if (t < OVERLAY_FADE_END_S || overlayOpacity > 0.001) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={overlayRef}
      className="pointer-events-none fixed inset-0 z-[100]"
      style={{ opacity: 1 }}
    >
      {/* pointer-events:auto로 Spline 씬(중앙 텍스트 포함)만 상호작용 */}
      <div className="pointer-events-auto absolute inset-0 overflow-hidden bg-black">
        {/* 블러·스케일·노출: Spline 중앙 텍스트/버튼이 한꺼번에 부드럽게 드리워짐 */}
        <div className="intro-spline-stage absolute inset-0">
          <iframe
            title="Spline intro"
            src={INTRO_SPLINE_PUBLIC_URL}
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; gyroscope; xr-spatial-tracking; fullscreen"
            loading="eager"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <div
          className="intro-spline-vignette pointer-events-none absolute inset-0 z-[1]"
          aria-hidden
        />
        {/* Spline Public URL 워터마크: 우하단 ~137×36px, bottom/right 20px — 시야만 차단 */}
        <div
          className="pointer-events-none absolute bottom-2 right-2 z-10 h-11 w-[10.5rem] rounded-[13px] bg-black max-[480px]:bottom-1 max-[480px]:right-1"
          aria-hidden
        />
      </div>
    </div>
  );
}
