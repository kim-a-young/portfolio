"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const PARTICLE_COUNT = 1400;
const BG = "#0c0d12";
const PARTICLE_COLOR = 0xdde3ff;

type IntroProps = {
  onMainReveal?: () => void;
  onComplete?: () => void;
};

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeInCubic(t: number): number {
  return t * t * t;
}

/** Layout `fixed` 아이콘과 동일: left-3/top-3 + 40×40 버튼 중심 (1rem=16px 가정 시 12+20) */
const ICON_INSET = 12;
const ICON_BTN = 40;
const ICON_CENTER_XY = ICON_INSET + ICON_BTN / 2;

const TEXT_IN_END = 0.5;
const TEXT_OUT_START = 2.45;
const TEXT_OUT_END = 3.05;
const PARTICLE_OUT_START = 3.05;
const PARTICLE_OUT_END = 3.7;
const MAIN_REVEAL_AT = 3.2;
const OVERLAY_OUT_START = 3.35;
const OVERLAY_OUT_END = 4.15;

export function Intro({ onMainReveal, onComplete }: IntroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const onCompleteRef = useRef(onComplete);
  const onMainRevealRef = useRef(onMainReveal);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onMainRevealRef.current = onMainReveal;
  }, [onComplete, onMainReveal]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const textEl = textRef.current;
    const overlayEl = overlayRef.current;
    if (!container || !canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
    camera.position.z = 6;

    const basePositions = new Float32Array(PARTICLE_COUNT * 3);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const t = (i + 0.5) / PARTICLE_COUNT;
      const y = 1 - t * 2;
      const rr = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = golden * i;
      const spread = 2.4 + (i % 5) * 0.08;
      basePositions[i * 3] = Math.cos(theta) * rr * spread * 1.35;
      basePositions[i * 3 + 1] = y * spread * 0.85;
      basePositions[i * 3 + 2] = Math.sin(theta * 0.7 + i * 0.02) * 0.45;
    }

    const positions = new Float32Array(basePositions);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: PARTICLE_COLOR,
      size: 0.028,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const positionAttr = geometry.getAttribute("position") as THREE.BufferAttribute;
    const posBuf = positionAttr.array as Float32Array;

    const scratchNdc = new THREE.Vector3();
    const scratchDir = new THREE.Vector3();
    const leftIconWorld = new THREE.Vector3();
    const rightIconWorld = new THREE.Vector3();

    const updateIconWorldTargets = (planeZ: number) => {
      const w = container.clientWidth;
      const h = Math.max(container.clientHeight, 1);
      const sxLeft = ICON_CENTER_XY;
      const sxRight = w - ICON_CENTER_XY;
      const sy = ICON_CENTER_XY;

      const toPlane = (sx: number, sy: number, out: THREE.Vector3) => {
        scratchNdc.set((sx / w) * 2 - 1, -(sy / h) * 2 + 1, 0.5);
        scratchNdc.unproject(camera);
        scratchDir.copy(scratchNdc).sub(camera.position);
        const dz = scratchDir.z;
        if (Math.abs(dz) < 1e-5) {
          out.copy(scratchNdc);
          return;
        }
        const tRay = (planeZ - camera.position.z) / dz;
        out.copy(camera.position).addScaledVector(scratchDir, tRay);
      };

      toPlane(sxLeft, sy, leftIconWorld);
      toPlane(sxRight, sy, rightIconWorld);
    };

    const setSize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / Math.max(h, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    setSize();

    const ro = new ResizeObserver(setSize);
    ro.observe(container);

    const start = performance.now();
    let completed = false;
    let mainRevealed = false;

    const tick = (now: number) => {
      const t = (now - start) / 1000;

      if (!mainRevealed && t >= MAIN_REVEAL_AT) {
        mainRevealed = true;
        onMainRevealRef.current?.();
      }

      if (textEl) {
        if (t < TEXT_IN_END) {
          const p = t / TEXT_IN_END;
          const e = easeOutCubic(p);
          textEl.style.opacity = String(e);
          textEl.style.filter = `blur(${10 * (1 - e)}px)`;
        } else if (t < TEXT_OUT_START) {
          textEl.style.opacity = "1";
          textEl.style.filter = "blur(0px)";
        } else if (t < TEXT_OUT_END) {
          const p = (t - TEXT_OUT_START) / (TEXT_OUT_END - TEXT_OUT_START);
          const e = easeOutCubic(p);
          textEl.style.opacity = String(1 - e);
          textEl.style.filter = `blur(${12 * e}px)`;
        } else {
          textEl.style.opacity = "0";
          textEl.style.filter = "blur(12px)";
        }
      }

      updateIconWorldTargets(0);

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const ix = i * 3;
        const off = i * 0.0317;
        const bx = basePositions[ix];
        const by = basePositions[ix + 1];
        const bz = basePositions[ix + 2];
        const w1 = t * 0.42 + off;
        const w2 = t * 0.15 + off * 1.63;
        const w3 = t * 0.09 + off * 0.41;
        let fx = bx + Math.sin(w1) * 0.22 + Math.sin(w2) * 0.11;
        let fy = by + Math.cos(w1 * 0.93) * 0.18 + Math.cos(w2 * 1.07) * 0.09;
        let fz = bz + Math.sin(w3) * 0.12 + Math.cos(t * 0.22 + off * 0.85) * 0.06;

        if (t >= PARTICLE_OUT_START && t < PARTICLE_OUT_END) {
          const u = (t - PARTICLE_OUT_START) / (PARTICLE_OUT_END - PARTICLE_OUT_START);
          const pull = easeInCubic(u);
          const toMenu = (i & 1) === 0;
          const tx = toMenu ? leftIconWorld.x : rightIconWorld.x;
          const ty = toMenu ? leftIconWorld.y : rightIconWorld.y;
          const tz = toMenu ? leftIconWorld.z : rightIconWorld.z;
          const spiral = (1 - pull) * 0.08 * Math.sin(t * 2.2 + off * 1.4);
          fx += spiral;
          fy += (1 - pull) * 0.06 * Math.cos(t * 1.9 + off * 1.1);
          fx += (tx - fx) * pull;
          fy += (ty - fy) * pull;
          fz += (tz - fz) * pull;
        }

        posBuf[ix] = fx;
        posBuf[ix + 1] = fy;
        posBuf[ix + 2] = fz;
      }
      positionAttr.needsUpdate = true;

      let particleOpacity = 0.7;
      let particleScale = 1;
      let pointSize = 0.028;
      if (t >= PARTICLE_OUT_START && t < PARTICLE_OUT_END) {
        const u = (t - PARTICLE_OUT_START) / (PARTICLE_OUT_END - PARTICLE_OUT_START);
        const pull = easeInCubic(u);
        particleOpacity = 0.7 * (1 - easeOutCubic(u));
        particleScale = 1 - 0.12 * pull;
        pointSize = 0.028 * (1 - 0.92 * pull);
      } else if (t >= PARTICLE_OUT_END) {
        particleOpacity = 0;
        particleScale = 0.88;
        pointSize = 0.002;
      }
      material.opacity = particleOpacity;
      material.size = pointSize;
      points.scale.setScalar(particleScale);

      renderer.render(scene, camera);

      let overlayOpacity = 1;
      if (t >= OVERLAY_OUT_START && t < OVERLAY_OUT_END) {
        const u = (t - OVERLAY_OUT_START) / (OVERLAY_OUT_END - OVERLAY_OUT_START);
        overlayOpacity = 1 - easeOutCubic(u);
      } else if (t >= OVERLAY_OUT_END) {
        overlayOpacity = 0;
      }
      if (overlayEl) {
        overlayEl.style.opacity = String(overlayOpacity);
        overlayEl.style.pointerEvents =
          t >= MAIN_REVEAL_AT || overlayOpacity < 0.02 ? "none" : "auto";
      }

      if (t >= OVERLAY_OUT_END && !completed) {
        completed = true;
        onCompleteRef.current?.();
      }

      if (t < OVERLAY_OUT_END || overlayOpacity > 0.001) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{
        backgroundColor: BG,
        opacity: 1,
      }}
    >
      <div ref={containerRef} className="pointer-events-none absolute inset-0">
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>
      <p
        ref={textRef}
        className="relative z-10 max-w-[min(90vw,28rem)] px-6 text-center text-[clamp(1.05rem,3.5vw,1.35rem)] font-medium leading-relaxed tracking-tight text-[#EAEAF0]"
        style={{ opacity: 0, filter: "blur(12px)" }}
      >
        담당자님, 이쪽으로 모시겠습니다
      </p>
    </div>
  );
}
