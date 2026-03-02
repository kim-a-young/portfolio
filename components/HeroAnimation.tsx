"use client";

import { useEffect, useState } from "react";
import Lottie from "lottie-react";

const LOTTIE_PATH = "/lottie/hero_ai.json";

export function HeroAnimation() {
  const [animationData, setAnimationData] = useState<object | null>(null);

  useEffect(() => {
    fetch(LOTTIE_PATH)
      .then((res) => res.json())
      .then(setAnimationData)
      .catch(() => setAnimationData(null));
  }, []);

  if (!animationData) return null;

  return (
    <div className="relative flex justify-center" aria-hidden>
      <Lottie
        animationData={animationData}
        loop
        className="h-[72px] w-[72px] md:h-[88px] md:w-[88px]"
        style={{ cursor: "default" }}
      />
    </div>
  );
}
