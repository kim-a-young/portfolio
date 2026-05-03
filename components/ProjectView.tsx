"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type TransitionEvent,
} from "react";
import Image from "next/image";
import { PROJECTS, type ProjectItem } from "@/lib/portfolio-projects";

interface ProjectViewProps {
  projectId: string;
  sidebarOpen?: boolean;
}

function projectHasDetailWriteup(project: ProjectItem): boolean {
  const body = project.detailDescription?.trim() ?? "";
  const hasParagraphs = Boolean(
    project.detailParagraphs?.some((p) => p.trim().length > 0)
  );
  const hasCustomMeta = Boolean(
    project.detailDesignTypes?.trim() || project.detailTools?.trim()
  );
  return Boolean(body) || hasParagraphs || hasCustomMeta;
}

function ProjectDetailDescriptionBlock({ project }: { project: ProjectItem }) {
  const normalizeSentenceBreaks = (text: string): string =>
    text
      .replace(/\. +/g, ".\n")
      .replace(/([.!?])\n(?=\n)/g, "$1");

  const rawBody = project.detailDescription?.trim() ?? "";
  const hasCustomMeta = Boolean(
    project.detailDesignTypes?.trim() || project.detailTools?.trim()
  );
  if (
    !rawBody &&
    !(project.detailParagraphs?.some((p) => p.trim().length > 0)) &&
    !hasCustomMeta
  ) {
    return null;
  }

  const designTypes =
    project.detailDesignTypes ?? "Reactive Design, UI/UX Design";
  const toolsLine =
    project.detailTools ?? "Tool : Figma, XD, Photoshop, Illustrator";
  const fromArray =
    project.detailParagraphs
      ?.map((p) => p.trim())
      .filter(Boolean) ?? [];
  const paragraphs =
    fromArray.length > 0
      ? fromArray
      : rawBody
          .split(/\n\s*\n/)
          .map((p) => p.trim())
          .filter(Boolean);
  const normalizedParagraphs = paragraphs.map(normalizeSentenceBreaks);

  const leftColumn = (
    <div className="min-w-0 md:max-w-[25vw]">
      <h3 className="text-base font-bold tracking-tight text-white">Design</h3>
      <p className="mt-4 text-sm leading-relaxed text-zinc-300">{designTypes}</p>
      <p className="mt-3 text-sm leading-relaxed text-zinc-300">{toolsLine}</p>
    </div>
  );

  return (
    <section
      className="mx-auto mt-12 w-full max-w-[1440px] border-t border-zinc-800 pt-12 pb-8"
      aria-label="프로젝트 상세 설명"
    >
      {paragraphs.length > 0 ? (
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,25vw)_minmax(0,1fr)] md:items-start md:gap-x-5 lg:gap-x-6">
          {leftColumn}
          <div className="min-w-0 space-y-4">
            {normalizedParagraphs.map((para, i) => (
              <p
                key={i}
                className="whitespace-pre-line text-sm leading-[1.75] text-zinc-200"
              >
                {para}
              </p>
            ))}
          </div>
        </div>
      ) : (
        leftColumn
      )}
    </section>
  );
}

function appendImageCacheParam(src: string, cacheBust: number): string {
  const sep = src.includes("?") ? "&" : "?";
  return `${src}${sep}v=${cacheBust}`;
}

function MainProjectDetailGalleryCarousel({
  slides,
  alt,
}: {
  slides: string[];
  alt: string;
}) {
  const touchStartX = useRef<number | null>(null);
  const slideSig = slides.join("|");
  const n = slides.length;

  const extended = useMemo(() => {
    if (n <= 1) return slides;
    return [slides[n - 1]!, ...slides, slides[0]!];
  }, [slides, n]);

  const nExt = extended.length;
  const stepPct = nExt > 0 ? 100 / nExt : 100;

  const [pos, setPos] = useState(1);
  const [transitionOn, setTransitionOn] = useState(true);

  useEffect(() => {
    setPos(1);
    setTransitionOn(true);
  }, [slideSig]);

  const jumpWithoutTransition = useCallback((nextPos: number) => {
    setTransitionOn(false);
    setPos(nextPos);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setTransitionOn(true));
    });
  }, []);

  const go = useCallback(
    (delta: number) => {
      if (n <= 1) return;
      setPos((p) => p + delta);
    },
    [n]
  );

  useEffect(() => {
    if (n <= 1) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [n, slideSig, go]);

  const onTrackTransitionEnd = useCallback(
    (e: TransitionEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget) return;
      if (e.propertyName !== "transform") return;
      if (n <= 1) return;
      if (pos === nExt - 1) {
        jumpWithoutTransition(1);
      } else if (pos === 0) {
        jumpWithoutTransition(n);
      }
    },
    [n, nExt, pos, jumpWithoutTransition]
  );

  const dotActiveIndex =
    n <= 1 ? 0 : pos === 0 ? n - 1 : pos === nExt - 1 ? 0 : pos - 1;

  const goToSlide = useCallback(
    (slideIndex: number) => {
      if (n <= 1) return;
      setTransitionOn(true);
      setPos(slideIndex + 1);
    },
    [n]
  );

  const [pauseRoll, setPauseRoll] = useState(false);

  useEffect(() => {
    if (n <= 1 || pauseRoll) return;
    const id = window.setInterval(() => go(1), 5000);
    return () => window.clearInterval(id);
  }, [n, slideSig, go, pauseRoll]);

  if (n === 1) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={slides[0]}
        alt={alt}
        className="h-auto w-full object-contain"
        decoding="async"
      />
    );
  }

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setPauseRoll(true)}
      onMouseLeave={() => setPauseRoll(false)}
    >
      <div className="overflow-hidden">
        <div
          className={`flex ${transitionOn ? "duration-300 ease-out transition-transform" : ""}`}
          style={{
            width: `${nExt * 100}%`,
            transform: `translateX(-${pos * stepPct}%)`,
          }}
          onTransitionEnd={onTrackTransitionEnd}
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            const start = touchStartX.current;
            touchStartX.current = null;
            if (start == null) return;
            const dx = e.changedTouches[0].clientX - start;
            if (dx > 60) go(-1);
            else if (dx < -60) go(1);
          }}
        >
          {extended.map((src, i) => (
            <div
              key={`${slideSig}-${i}-${src}`}
              className="flex shrink-0 items-center justify-center bg-black/15 px-2 py-4"
              style={{ width: `${stepPct}%` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className="max-h-[min(85vh,1400px)] w-auto max-w-full object-contain"
                decoding={i === 1 ? "sync" : "async"}
                loading={i === 1 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-1 sm:px-2">
        <button
          type="button"
          onClick={() => go(-1)}
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-zinc-100 backdrop-blur-md transition-colors hover:bg-white/20"
          aria-label="이전 이미지"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-zinc-100 backdrop-blur-md transition-colors hover:bg-white/20"
          aria-label="다음 이미지"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <div className="mt-4 flex justify-center gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goToSlide(i)}
            className={`h-2 w-2 rounded-full transition-colors ${
              i === dotActiveIndex ? "bg-white shadow" : "bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`이미지 ${i + 1} / ${n}`}
            aria-current={i === dotActiveIndex}
          />
        ))}
      </div>
    </div>
  );
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
        break;
      case gn:
        h = ((bn - rn) / d + 2) / 6;
        break;
      default:
        h = ((rn - gn) / d + 4) / 6;
        break;
    }
  }
  return { h: h * 360, s, l };
}

/** 썸네일에서 하늘색·시안 블루 계열 픽셀 평균 (미래에셋 등) */
function extractSkyBlueAccentFromImageData(imageData: Uint8ClampedArray): string | null {
  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  let count = 0;

  for (let i = 0; i < imageData.length; i += 4) {
    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];
    const { h, s, l } = rgbToHsl(r, g, b);
    if (h < 180 || h > 240) continue;
    if (l < 0.32 || l > 0.95) continue;
    if (s < 0.06) continue;
    if (b < Math.max(r, g) - 18) continue;

    sumR += r;
    sumG += g;
    sumB += b;
    count++;
  }

  if (count < 4) return null;

  return `rgb(${Math.round(sumR / count)}, ${Math.round(sumG / count)}, ${Math.round(sumB / count)})`;
}

/** 16번 등: 썸네일 배경의 브라운·베이지·황토 톤 픽셀 평균 */
function extractBrownBackgroundAccentFromImageData(imageData: Uint8ClampedArray): string | null {
  const tryPass = (opts: {
    hMin: number;
    hMax: number;
    lMin: number;
    lMax: number;
    sMin: number;
    sMax: number;
    minRGAboveB: number;
  }): string | null => {
    let sumR = 0;
    let sumG = 0;
    let sumB = 0;
    let count = 0;

    for (let i = 0; i < imageData.length; i += 4) {
      const r = imageData[i];
      const g = imageData[i + 1];
      const b = imageData[i + 2];
      const { h, s, l } = rgbToHsl(r, g, b);

      if (h < opts.hMin || h > opts.hMax) continue;
      if (l < opts.lMin || l > opts.lMax) continue;
      if (s < opts.sMin || s > opts.sMax) continue;
      if (r < b + opts.minRGAboveB || g < b + Math.max(4, opts.minRGAboveB - 12)) continue;

      sumR += r;
      sumG += g;
      sumB += b;
      count++;
    }

    if (count < 8) return null;

    return `rgb(${Math.round(sumR / count)}, ${Math.round(sumG / count)}, ${Math.round(sumB / count)})`;
  };

  return (
    tryPass({
      hMin: 14,
      hMax: 52,
      lMin: 0.3,
      lMax: 0.9,
      sMin: 0.09,
      sMax: 0.7,
      minRGAboveB: 18,
    }) ??
    tryPass({
      hMin: 6,
      hMax: 62,
      lMin: 0.24,
      lMax: 0.93,
      sMin: 0.055,
      sMax: 0.78,
      minRGAboveB: 12,
    })
  );
}

/** 16·19번 hover 배경: 살짝 파스텔(채도 완화) + 아주 약간 어둡게 */
function applySubtlePastelDarker(r: number, g: number, b: number): string {
  const gray = (r + g + b) / 3;
  const towardGray = 0.2;
  let r2 = r * (1 - towardGray) + gray * towardGray;
  let g2 = g * (1 - towardGray) + gray * towardGray;
  let b2 = b * (1 - towardGray) + gray * towardGray;
  const darken = 0.88;
  r2 *= darken;
  g2 *= darken;
  b2 *= darken;
  const clamp = (n: number) => Math.min(255, Math.max(0, Math.round(n)));
  return `rgb(${clamp(r2)}, ${clamp(g2)}, ${clamp(b2)})`;
}

function parseRgbStringToPastelDarker(rgb: string): string {
  const m = rgb.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
  if (!m) return rgb;
  return applySubtlePastelDarker(Number(m[1]), Number(m[2]), Number(m[3]));
}

/** hover 배경: 이미지 색 추출 대신 프로젝트 accent 고정 (브랜드 컬러·배포/로컬 추출 편차 방지) */
const ACCENT_FROM_PROJECT_IDS = [1, 7, 8, 10, 12, 13, 14, 17];

export function ProjectView({ projectId, sidebarOpen = false }: ProjectViewProps) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [projectId]);

  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [openProject, setOpenProject] = useState<ProjectItem | null>(null);
  const [imageColors, setImageColors] = useState<Record<number, string>>({});
  const [cacheBust] = useState(() => Date.now());
  const modalScrollRef = useRef<HTMLDivElement | null>(null);
  const [imageOrientation, setImageOrientation] = useState<
    Record<number, "landscape" | "portrait" | "square">
  >({});

  // 이미지 로드 전 fallback: 가로형으로 알려진 프로젝트 (orientation 설정되면 실제 비율 사용)
  const LANDSCAPE_PROJECT_IDS = [4, 6, 8, 9, 10, 11];

  // 모달 열릴 때 배경 스크롤 잠금
  useEffect(() => {
    if (typeof document === "undefined") return;

    const originalOverflow = document.body.style.overflow;
    if (openProject) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = originalOverflow || "";
    }

    return () => {
      document.body.style.overflow = originalOverflow || "";
    };
  }, [openProject]);

  const openProjectIndex = openProject
    ? PROJECTS.findIndex((p) => p.id === openProject.id)
    : -1;

  const detailCarouselSlides = openProject
    ? (openProject.detailImages?.filter(Boolean).length ?? 0) >= 2
      ? openProject.detailImages!.filter(Boolean).map((src) =>
          appendImageCacheParam(src, cacheBust)
        )
      : null
    : null;

  useEffect(() => {
    if (!openProject || !modalScrollRef.current) return;
    modalScrollRef.current.scrollTo({ top: 0, behavior: "auto" });
  }, [openProject?.id]);

  // 각 프로젝트 이미지에서 대표 색상 추출 (클라이언트 전용)
  useEffect(() => {
    if (typeof window === "undefined") return;

    PROJECTS.forEach((project) => {
      const img = new window.Image();
      img.src = `${project.image}?v=${cacheBust}`;

      img.onload = () => {
        try {
          // 가로/세로 비율 계산
          const { naturalWidth, naturalHeight } = img;
          const orientation: "landscape" | "portrait" | "square" =
            naturalWidth > naturalHeight
              ? "landscape"
              : naturalWidth < naturalHeight
              ? "portrait"
              : "square";

          setImageOrientation((prev) => ({
            ...prev,
            [project.id]: orientation,
          }));

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!context) return;

          // 16번만 브라운 배경 추출을 위해 조금 더 촘촘히 샘플링, 나머지는 기존 32×32 유지
          const sampleSize = project.id === 16 ? 56 : 32;
          canvas.width = sampleSize;
          canvas.height = sampleSize;

          context.drawImage(img, 0, 0, sampleSize, sampleSize);
          const imageData = context.getImageData(0, 0, sampleSize, sampleSize).data;

          let color: string;

          // 15 미래에셋: 하늘색 계열 픽셀을 모아 배경에 반영
          if (project.id === 15) {
            const sky = extractSkyBlueAccentFromImageData(imageData);
            if (sky) {
              color = sky;
            } else {
              color = project.accent;
            }
          } else if (project.id === 16) {
            // 16 베페몰: 이미지 배경 브라운·베이지 톤 우선
            const brown = extractBrownBackgroundAccentFromImageData(imageData);
            if (brown) {
              color = brown;
            } else {
              let sumR = 0;
              let sumG = 0;
              let sumB = 0;
              let count = 0;
              for (let i = 0; i < imageData.length; i += 4) {
                sumR += imageData[i];
                sumG += imageData[i + 1];
                sumB += imageData[i + 2];
                count++;
              }
              color = `rgb(${Math.round(sumR / Math.max(count, 1))}, ${Math.round(sumG / Math.max(count, 1))}, ${Math.round(sumB / Math.max(count, 1))})`;
            }
          } else {
            // 기존과 동일: 4픽셀 간격 샘플링, 채도·중간 밝기 우선 (15·16 제외 전체)
            let bestR = 0;
            let bestG = 0;
            let bestB = 0;
            let bestScore = -1;

            for (let i = 0; i < imageData.length; i += 4 * 4) {
              const r = imageData[i];
              const g = imageData[i + 1];
              const b = imageData[i + 2];

              const rn = r / 255;
              const gn = g / 255;
              const bn = b / 255;

              const max = Math.max(rn, gn, bn);
              const min = Math.min(rn, gn, bn);
              const l = (max + min) / 2;
              const s = max === min ? 0 : (l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min));

              // 너무 어둡거나 밝은 영역은 제외하고, 채도가 어느 정도 있는 픽셀을 우선
              // (정관장처럼 채도가 상대적으로 낮은 컬러도 잡아주기 위해 s 임계값을 0.15로 완화)
              if (l < 0.18 || l > 0.85 || s < 0.15) continue;

              const score = s * (1 - Math.abs(l - 0.55)); // 채도 + 중간 밝기 우선
              if (score > bestScore) {
                bestScore = score;
                bestR = r;
                bestG = g;
                bestB = b;
              }
            }

            if (bestScore >= 0) {
              color = `rgb(${bestR}, ${bestG}, ${bestB})`;
            } else {
              let sumR = 0;
              let sumG = 0;
              let sumB = 0;
              let count = 0;

              for (let i = 0; i < imageData.length; i += 4 * 4) {
                sumR += imageData[i];
                sumG += imageData[i + 1];
                sumB += imageData[i + 2];
                count++;
              }

              const avgR = Math.round(sumR / Math.max(count, 1));
              const avgG = Math.round(sumG / Math.max(count, 1));
              const avgB = Math.round(sumB / Math.max(count, 1));

              color = `rgb(${avgR}, ${avgG}, ${avgB})`;
            }
          }

          if (project.id === 16 || project.id === 19) {
            color = parseRgbStringToPastelDarker(color);
          }

          setImageColors((prev) => ({
            ...prev,
            [project.id]: ACCENT_FROM_PROJECT_IDS.includes(project.id)
              ? project.accent
              : color,
          }));
        } catch {
          // 캔버스 접근이 막힌 경우에는 accent 값으로 폴백
          setImageColors((prev) => ({
            ...prev,
            [project.id]: project.accent,
          }));
        }
      };
    });
  }, [cacheBust]);

  const activeProject =
    hoveredId != null
      ? PROJECTS.find((project) => project.id === hoveredId) ?? null
      : null;

  const hasHover = hoveredId != null;

  const activeAccent =
    hasHover && activeProject
      ? ACCENT_FROM_PROJECT_IDS.includes(activeProject.id)
        ? activeProject.accent
        : imageColors[hoveredId!] ?? activeProject.accent
      : "#ffffff";

  return (
    <div
      className="relative min-h-screen text-black transition-colors duration-700"
      style={{ backgroundColor: activeAccent }}
    >
      {/* 배경 이미지 레이어 - 사이드바 열림 시 가시 영역 기준 센터 */}
      <div
        className={`pointer-events-none fixed flex items-center justify-center transition-[left] duration-200 ${
          sidebarOpen ? "top-0 right-0 bottom-0 left-0 md:left-[260px]" : "inset-0"
        }`}
      >
        {PROJECTS.map((project) => {
          const isActive = hoveredId != null && project.id === hoveredId;

          // 이미지 실제 비율로 자동: 가로 0.5, 세로 0.35. 로드 전에는 LANDSCAPE_PROJECT_IDS면 0.5
          const orientation = imageOrientation[project.id];
          const isLandscape =
            orientation === "landscape" ||
            (orientation == null && LANDSCAPE_PROJECT_IDS.includes(project.id));
          const scale = isLandscape ? 0.5 : 0.35;

          return (
            <div
              key={project.id}
              className={`absolute flex max-h-[80vh] max-w-[90vw] items-center justify-center transition-all duration-700 ease-out ${
                isActive ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${project.image}?v=${cacheBust}`}
                alt={project.name}
                className="max-h-full max-w-full w-auto h-auto object-scale-down origin-center"
                style={{ transform: `scale(${scale})` }}
              />
            </div>
          );
        })}
      </div>

      {/* 텍스트 가독성을 위한 반투명 오버레이 (hover 중에만 표시) */}
      {hasHover && (
        <div
          className={`pointer-events-none fixed bg-black/50 transition-[left] duration-200 ${
            sidebarOpen ? "top-0 right-0 bottom-0 left-0 md:left-[260px]" : "inset-0"
          }`}
        />
      )}

      {/* 콘텐츠 레이어 */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col px-4 pb-[30px] pt-[30px] sm:px-6 lg:px-8">
        <header className="mb-16 space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            DESIGN PROJECT
          </p>
        </header>

        {/* 라인 리스트 */}
        <nav aria-label="프로젝트 목록">
          <ul onMouseLeave={() => setHoveredId(null)}>
            {PROJECTS.map((project, index) => {
              const isActive = hasHover && project.id === hoveredId;
              const isDimmed = hasHover && !isActive;

              return (
                <li
                  key={project.id}
                  className={`-mt-px border-y border-zinc-200 first:mt-0 first:border-t last:border-b transition-opacity duration-300 ${
                    isDimmed ? "opacity-10" : "opacity-100"
                  }`}
                >
                  <button
                    type="button"
                    onMouseEnter={() => setHoveredId(project.id)}
                    onFocus={() => setHoveredId(project.id)}
                    onClick={() => setOpenProject(project)}
                    className={`group flex w-full items-baseline justify-between gap-4 pt-[30px] pb-[24px] text-left transition-colors duration-300 ${
                      hasHover ? "text-white" : "text-black"
                    }`}
                  >
                    <div className="flex items-baseline gap-6">
                      <span
                        className={`text-xs tabular-nums transition-colors duration-300 ${
                          hasHover ? "text-white" : "text-zinc-400"
                        }`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="space-y-1">
                        <p
                          className={`text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight transition-transform duration-300 ${
                            isActive ? "translate-x-1" : "translate-x-0"
                          }`}
                        >
                          {project.name}
                        </p>
                        {project.meta && (
                          <p
                            className={`text-xs transition-colors duration-300 ${
                              hasHover ? "text-white" : "text-zinc-500"
                            }`}
                          >
                            {project.meta}
                          </p>
                        )}
                      </div>
                    </div>

                    <span
                      className={`hidden text-xs uppercase tracking-[0.25em] sm:inline transition-opacity duration-300 ${
                        hasHover ? "text-white" : "text-zinc-400"
                      } ${isActive ? "opacity-100" : "opacity-0"}`}
                    >
                      VIEW
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {openProject && (
        <div className="fixed inset-0 z-40 bg-black/[0.97]">
          {/* 딤 영역 클릭 시 닫기 */}
          <button
            type="button"
            className="absolute inset-0 h-full w-full cursor-default"
            aria-label="프로젝트 상세 닫기"
            onClick={() => setOpenProject(null)}
          />

          {/* 이미지 전용 스크롤 컨테이너 (배경은 고정, 이 영역만 스크롤) */}
          <div
            ref={modalScrollRef}
            className="relative z-10 flex h-full w-full flex-col overflow-auto bg-transparent"
          >
            {/* 닫기 버튼 - 모드 버튼과 유사한 위치 */}
            <button
              type="button"
              onClick={() => setOpenProject(null)}
              className="fixed right-3 top-3 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-zinc-200 backdrop-blur-md transition-colors hover:bg-white/20 hover:text-white"
              aria-label="닫기"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex items-end justify-between px-3 pb-3">
              <button
                type="button"
                disabled={openProjectIndex <= 0}
                onClick={() => {
                  if (openProjectIndex <= 0) return;
                  setOpenProject(PROJECTS[openProjectIndex - 1]);
                }}
                className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-zinc-200 backdrop-blur-md transition-colors hover:bg-white/20 hover:text-white disabled:pointer-events-none disabled:opacity-30"
                aria-label="이전 프로젝트"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M15 6 9 12 15 18" />
                </svg>
              </button>
              <button
                type="button"
                disabled={openProjectIndex < 0 || openProjectIndex >= PROJECTS.length - 1}
                onClick={() => {
                  if (
                    openProjectIndex < 0 ||
                    openProjectIndex >= PROJECTS.length - 1
                  ) {
                    return;
                  }
                  setOpenProject(PROJECTS[openProjectIndex + 1]);
                }}
                className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-zinc-200 backdrop-blur-md transition-colors hover:bg-white/20 hover:text-white disabled:pointer-events-none disabled:opacity-30"
                aria-label="다음 프로젝트"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M9 6 15 12 9 18" />
                </svg>
              </button>
            </div>

            <div className="w-full bg-transparent px-4 py-8 sm:px-6 md:px-8">
              <div className="mx-auto w-full max-w-[1440px]">
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                    PROJECT DETAIL
                  </p>
                  <h2 className="mt-2 text-lg font-semibold text-white">
                    {openProject.name}
                  </h2>
                  {openProject.meta && (
                    <p className="mt-1 text-xs text-zinc-400">
                      {openProject.meta}
                    </p>
                  )}
                </div>

                {detailCarouselSlides ? (
                  <MainProjectDetailGalleryCarousel
                    slides={detailCarouselSlides}
                    alt={openProject.name}
                  />
                ) : (
                  <Image
                    src={appendImageCacheParam(
                      openProject.detailImage ?? openProject.image,
                      cacheBust
                    )}
                    alt={openProject.name}
                    width={1600}
                    height={4000}
                    className="h-auto w-full object-contain"
                    priority
                    unoptimized
                  />
                )}

                {projectHasDetailWriteup(openProject) &&
                  (!openProject.detailImage ||
                    (openProject.detailImages?.filter(Boolean).length ?? 0) >=
                      2) && (
                    <ProjectDetailDescriptionBlock project={openProject} />
                  )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
