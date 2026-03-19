"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type IntroParticleProps = {
  children: React.ReactNode;
};

enum Phase {
  TEXT_APPEAR = 0,
  TEXT_SCALE = 1,
  TEXT_TO_PARTICLES = 2,
  PARTICLE_FLOW = 3,
  FADE_OUT = 4,
  DONE = 5,
}

const DURATION = {
  TEXT_APPEAR: 900,
  TEXT_SCALE: 900,
  TEXT_TO_PARTICLES: 700,
  PARTICLE_FLOW: 900,
  FADE_OUT: 400,
};

const TOTAL_DURATION =
  DURATION.TEXT_APPEAR +
  DURATION.TEXT_SCALE +
  DURATION.TEXT_TO_PARTICLES +
  DURATION.PARTICLE_FLOW +
  DURATION.FADE_OUT;

export function IntroParticle({ children }: IntroParticleProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [phase, setPhase] = useState<Phase>(Phase.TEXT_APPEAR);
  const [fadeOut, setFadeOut] = useState(false);
  const [showMain, setShowMain] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    el.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(
      42,
      el.clientWidth / el.clientHeight,
      0.1,
      2000
    );
    camera.position.set(0, 0, 220);
    camera.lookAt(0, 0, 0);

    // --- Text texture + sampling canvas ---
    const textCanvas = document.createElement("canvas");
    const textCtx = textCanvas.getContext("2d");
    const C_W = 1024;
    const C_H = 256;
    textCanvas.width = C_W;
    textCanvas.height = C_H;

    if (!textCtx) return;

    textCtx.clearRect(0, 0, C_W, C_H);
    textCtx.fillStyle = "#ffffff";
    textCtx.textAlign = "center";
    textCtx.textBaseline = "middle";
    textCtx.font =
      "700 170px system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
    textCtx.fillText("AYOUNG KIM", C_W / 2, C_H / 2);

    const textTexture = new THREE.CanvasTexture(textCanvas);
    textTexture.needsUpdate = true;

    const planeW = 170;
    const planeH = (C_H / C_W) * planeW;
    const textMat = new THREE.MeshBasicMaterial({
      map: textTexture,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const textMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(planeW, planeH),
      textMat
    );
    scene.add(textMesh);

    // Sub caption as separate crisp text mesh
    const subCanvas = document.createElement("canvas");
    const subCtx = subCanvas.getContext("2d");
    subCanvas.width = 1024;
    subCanvas.height = 96;
    if (!subCtx) return;
    subCtx.clearRect(0, 0, 1024, 96);
    subCtx.fillStyle = "#c8c8c8";
    subCtx.textAlign = "center";
    subCtx.textBaseline = "middle";
    subCtx.font =
      "500 36px system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
    subCtx.fillText("담당자님, 이쪽으로 모시겠습니다", 512, 48);

    const subTexture = new THREE.CanvasTexture(subCanvas);
    subTexture.needsUpdate = true;
    const subMat = new THREE.MeshBasicMaterial({
      map: subTexture,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const subMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(140, (96 / 1024) * 140),
      subMat
    );
    subMesh.position.y = -32;
    scene.add(subMesh);

    // sample text pixels -> particle targets
    const imgData = textCtx.getImageData(0, 0, C_W, C_H).data;
    const targets: THREE.Vector3[] = [];
    const step = 3; // thousands of particles
    for (let y = 0; y < C_H; y += step) {
      for (let x = 0; x < C_W; x += step) {
        const idx = (y * C_W + x) * 4;
        if (imgData[idx + 3] > 120) {
          const nx = (x / C_W - 0.5) * planeW;
          const ny = (0.5 - y / C_H) * planeH;
          targets.push(new THREE.Vector3(nx, ny, 0));
        }
      }
    }

    const count = targets.length;
    const positions = new Float32Array(count * 3);
    const origin = new Float32Array(count * 3);
    const target = new Float32Array(count * 3);
    const seed = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const t = targets[i];
      positions[i3] = t.x;
      positions[i3 + 1] = t.y;
      positions[i3 + 2] = t.z;
      origin[i3] = t.x;
      origin[i3 + 1] = t.y;
      origin[i3 + 2] = t.z;
      target[i3] = t.x;
      target[i3 + 1] = t.y;
      target[i3 + 2] = t.z;
      seed[i] = Math.random() * 1000;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.8,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const pMesh = new THREE.Points(pGeo, pMat);
    scene.add(pMesh);

    let mouseX = 0;
    let mouseY = 0;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      mouseX = ((e.clientX - r.left) / r.width - 0.5) * 2;
      mouseY = ((e.clientY - r.top) / r.height - 0.5) * -2;
    };
    window.addEventListener("mousemove", onMove);

    // lightweight smooth pseudo noise
    const noise3 = (x: number, y: number, z: number) =>
      Math.sin(x * 1.9 + z * 0.7) *
      Math.cos(y * 1.7 - z * 0.4) *
      Math.sin(x * 0.8 + y * 0.6 + z * 0.3);

    const t0 = performance.now();
    let raf = 0;

    const animate = () => {
      const t = performance.now() - t0;

      const p1 = DURATION.TEXT_APPEAR;
      const p2 = p1 + DURATION.TEXT_SCALE;
      const p3 = p2 + DURATION.TEXT_TO_PARTICLES;
      const p4 = p3 + DURATION.PARTICLE_FLOW;
      const p5 = p4 + DURATION.FADE_OUT;

      // timeline phase
      let current = Phase.TEXT_APPEAR;
      if (t >= p5) current = Phase.DONE;
      else if (t >= p4) current = Phase.FADE_OUT;
      else if (t >= p3) current = Phase.PARTICLE_FLOW;
      else if (t >= p2) current = Phase.TEXT_TO_PARTICLES;
      else if (t >= p1) current = Phase.TEXT_SCALE;
      setPhase(current);

      // reset baseline visuals per frame
      textMesh.visible = true;
      subMesh.visible = true;
      pMesh.visible = true;

      if (current === Phase.TEXT_APPEAR) {
        const u = easeInOut(t / p1);
        textMat.opacity = u;
        subMat.opacity = u * 0.9;
        pMat.opacity = 0;
        textMesh.scale.setScalar(1);
      } else if (current === Phase.TEXT_SCALE) {
        const u = easeInOut((t - p1) / DURATION.TEXT_SCALE);
        textMat.opacity = 1;
        subMat.opacity = 1;
        pMat.opacity = 0;
        textMesh.scale.setScalar(1 + 0.8 * u); // 1 -> 1.8
      } else if (current === Phase.TEXT_TO_PARTICLES) {
        const u = easeInOut((t - p2) / DURATION.TEXT_TO_PARTICLES);
        textMat.opacity = 1 - u;
        subMat.opacity = 1 - u;
        pMat.opacity = u;
        // particles bloom from exact text positions (no random skip)
        const attr = pGeo.getAttribute("position") as THREE.BufferAttribute;
        for (let i = 0; i < count; i++) {
          const i3 = i * 3;
          const tx = target[i3];
          const ty = target[i3 + 1];
          const ang = seed[i] * 0.5;
          const r = 5 + (i % 5) * 0.6;
          attr.array[i3] = tx + Math.cos(ang) * r * u;
          attr.array[i3 + 1] = ty + Math.sin(ang) * r * u;
          attr.array[i3 + 2] = 0;
        }
        attr.needsUpdate = true;
      } else if (current === Phase.PARTICLE_FLOW || current === Phase.FADE_OUT) {
        textMesh.visible = false;
        subMesh.visible = false;

        const flowT = THREE.MathUtils.clamp(
          (t - p3) / DURATION.PARTICLE_FLOW,
          0,
          1
        );
        const fadeT =
          current === Phase.FADE_OUT
            ? THREE.MathUtils.clamp((t - p4) / DURATION.FADE_OUT, 0, 1)
            : 0;

        // guided camera forward movement
        camera.position.z = THREE.MathUtils.lerp(220, 120, easeInOut(flowT));
        camera.position.x = THREE.MathUtils.lerp(0, mouseX * 8, 0.08);
        camera.position.y = THREE.MathUtils.lerp(0, mouseY * 6, 0.08);
        camera.lookAt(0, 0, 0);

        const attr = pGeo.getAttribute("position") as THREE.BufferAttribute;
        const time = t * 0.0012;

        for (let i = 0; i < count; i++) {
          const i3 = i * 3;
          const ox = origin[i3];
          const oy = origin[i3 + 1];
          const s = seed[i];

          // forward guided path (curved lane), not random scatter
          const lane =
            Math.sin((oy * 0.03 + flowT * 3.0) + s * 0.02) * 6 +
            Math.cos((ox * 0.02 + flowT * 2.2) + s * 0.015) * 4;
          const forwardY = -flowT * 44; // guiding downward-forward perspective
          const forwardZ = -flowT * 85;

          // fluid organic perturbation with smooth noise
          const n = noise3(ox * 0.02 + time, oy * 0.02 - time * 0.7, s * 0.02);
          const fx = Math.cos(n * Math.PI * 2) * 5.2;
          const fy = Math.sin(n * Math.PI * 2) * 4.6;

          // subtle cursor interaction
          const mx = mouseX * 28;
          const my = mouseY * 18;
          const dx = ox - mx;
          const dy = oy - my;
          const d = Math.sqrt(dx * dx + dy * dy) + 0.001;
          const repel = THREE.MathUtils.clamp(1 - d / 130, 0, 1) * 7;

          attr.array[i3] = ox + lane + fx + (dx / d) * repel;
          attr.array[i3 + 1] = oy + forwardY + fy + (dy / d) * repel;
          attr.array[i3 + 2] = forwardZ;
        }
        attr.needsUpdate = true;

        pMat.opacity = current === Phase.FADE_OUT ? 1 - fadeT : 1;
      }

      if (current === Phase.DONE) {
        setFadeOut(true);
        setShowMain(true);
        renderer.render(scene, camera);
        return;
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);

    const onResize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      scene.clear();
      textMat.dispose();
      subMat.dispose();
      pMat.dispose();
      pGeo.dispose();
      textTexture.dispose();
      subTexture.dispose();
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  if (showMain) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen bg-black">
      <div
        ref={wrapRef}
        className={`fixed inset-0 z-40 transition-opacity duration-700 ${
          fadeOut || phase === Phase.DONE ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      />
      <div
        className={`relative z-10 transition-opacity duration-700 ${
          fadeOut || phase === Phase.DONE ? "opacity-100" : "opacity-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function easeInOut(t: number) {
  const x = THREE.MathUtils.clamp(t, 0, 1);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

