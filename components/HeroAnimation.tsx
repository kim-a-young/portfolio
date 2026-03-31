"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Lottie, { type LottieRefCurrentProps } from "lottie-react";

const LOTTIE_PATH = "/lottie/hero_ai.json";

const MAX_TILT_DEG = 14;
const PERSPECTIVE_PX = 560;

export function HeroAnimation() {
  const [animationData, setAnimationData] = useState<object | null>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [hover, setHover] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    fetch(LOTTIE_PATH)
      .then((res) => res.json())
      .then(setAnimationData)
      .catch(() => setAnimationData(null));
  }, []);

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = frameRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({
      ry: Math.max(-1, Math.min(1, px * 2)) * MAX_TILT_DEG,
      rx: -Math.max(-1, Math.min(1, py * 2)) * MAX_TILT_DEG,
    });
  }, []);

  const onEnter = useCallback(() => {
    setHover(true);
    lottieRef.current?.pause();
  }, []);
  const onLeave = useCallback(() => {
    setHover(false);
    setTilt({ rx: 0, ry: 0 });
    lottieRef.current?.play();
  }, []);

  if (!animationData) return null;

  const scale = hover ? 1.07 : 1;

  return (
    <div
      ref={frameRef}
      className="relative flex cursor-pointer justify-center p-3"
      style={{ perspective: `${PERSPECTIVE_PX}px` }}
      aria-hidden
      onMouseMove={onMove}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <div
        className="origin-center will-change-transform"
        style={{
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale3d(${scale}, ${scale}, 1)`,
          transformStyle: "preserve-3d",
          transition:
            "transform 0.22s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <Lottie
          lottieRef={lottieRef}
          animationData={animationData}
          loop
          className="pointer-events-none h-[72px] w-[72px] select-none md:h-[88px] md:w-[88px]"
        />
      </div>
    </div>
  );
}
