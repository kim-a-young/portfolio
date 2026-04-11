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
import type { ProjectItem } from "@/lib/portfolio-projects";
import { NEW_SHOWCASE_PROJECTS } from "@/lib/new-showcase-projects";
import { ShowcaseChatDock } from "@/components/ShowcaseChatDock";

const SHOWCASE_TABS = [
  { id: "all" as const, label: "전체" },
  { id: "app" as const, label: "앱 · 모바일" },
  { id: "web" as const, label: "웹 · 시스템" },
];

function projectMatchesTab(
  p: ProjectItem,
  tab: (typeof SHOWCASE_TABS)[number]["id"]
): boolean {
  if (tab === "all") return true;
  const m = p.meta ?? "";
  const isAppMobile = /앱|모바일/.test(m);
  if (tab === "app") return isAppMobile;
  return !isAppMobile;
}

function projectTagChips(p: ProjectItem, max = 6): string[] {
  const raw = p.detailDesignTypes?.trim();
  if (!raw) {
    const head = p.meta?.split("·")[0]?.trim();
    return head ? [head] : [];
  }
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, max);
}

function cardCategoryLine(p: ProjectItem): string {
  return p.meta?.trim() ?? "";
}

function detailBodyParagraphs(p: ProjectItem): string[] {
  if (p.detailParagraphs?.length) {
    return p.detailParagraphs.map((t) => t.trim()).filter(Boolean);
  }
  const d = p.detailDescription?.trim();
  if (!d) return [];
  return d
    .split(/\n\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function detailGallerySlides(p: ProjectItem): string[] {
  const list = p.detailImages?.filter(Boolean);
  if (list?.length) return list;
  return [p.detailImage ?? p.image];
}

/**
 * HIVELAB WORK 참고: 흰 배경 · 해시 필터 · 카드(요약 없음) · 클릭 시 상세 팝업.
 */
export function NewShowcaseClient() {
  const [activeTab, setActiveTab] =
    useState<(typeof SHOWCASE_TABS)[number]["id"]>("all");
  const [detailProject, setDetailProject] = useState<ProjectItem | null>(null);

  const filtered = useMemo(
    () => NEW_SHOWCASE_PROJECTS.filter((p) => projectMatchesTab(p, activeTab)),
    [activeTab]
  );

  const closeDetail = useCallback(() => setDetailProject(null), []);

  return (
    <div className="min-h-svh bg-white text-neutral-900 antialiased">
      <main className="mx-auto w-full max-w-[100rem] px-5 pb-20 pt-10 sm:px-8 sm:pt-12 md:px-12 md:pt-14 lg:px-16 lg:pt-16 2xl:max-w-[min(133.33rem,calc(100vw-2.5rem))]">
        <nav
          className="flex flex-wrap gap-x-5 gap-y-3 border-b border-neutral-200 pb-8 md:gap-x-7 md:pb-10"
          aria-label="프로젝트 필터"
        >
          {SHOWCASE_TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`text-[15px] transition-colors md:text-base ${
                  active
                    ? "font-bold text-neutral-900"
                    : "font-normal text-neutral-500 hover:text-neutral-800"
                }`}
              >
                #{tab.label.replace(/\s+/g, "")}
              </button>
            );
          })}
        </nav>

        <div className="pt-10 md:pt-12 lg:pt-14">
          {filtered.length === 0 ? (
            <p className="py-16 text-center text-[15px] text-neutral-500">
              이 탭에 해당하는 프로젝트가 없습니다.
            </p>
          ) : (
            <ul className="grid list-none grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 sm:gap-y-16 md:gap-x-10 lg:grid-cols-3 lg:gap-x-12 lg:gap-y-20 2xl:grid-cols-4">
              {filtered.map((p, index) => (
                <li
                  key={`${activeTab}-${p.id}`}
                  className="showcase-card-enter"
                  style={{
                    animationDelay: `${Math.min(index, 18) * 48}ms`,
                  }}
                >
                  <ProjectCard project={p} onOpen={() => setDetailProject(p)} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      <ProjectDetailModal
        project={detailProject}
        onClose={closeDetail}
        navigableProjects={filtered}
        onNavigateProject={setDetailProject}
      />
      <ShowcaseChatDock />
    </div>
  );
}

function slideNeedsUnoptimized(src: string) {
  return /\.gif($|\?)/i.test(src);
}

function ProjectCard({
  project: p,
  onOpen,
}: {
  project: ProjectItem;
  onOpen: () => void;
}) {
  const category = cardCategoryLine(p);
  const chips = projectTagChips(p);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex h-full w-full flex-col bg-white text-left focus-visible:outline focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-neutral-100">
        <Image
          src={p.image}
          alt=""
          fill
          className="object-cover object-top transition-transform duration-500 ease-out will-change-transform group-hover:scale-[1.045] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, (max-width: 2400px) 25vw, 400px"
          unoptimized={slideNeedsUnoptimized(p.image)}
        />
      </div>
      <div className="flex flex-1 flex-col pt-4 sm:pt-5 md:pt-5">
        {category ? (
          <p className="text-[15px] font-semibold leading-snug tracking-tight text-neutral-900 md:text-base">
            {category}
          </p>
        ) : null}
        <h2
          className={`text-lg font-bold leading-snug tracking-tight text-neutral-900 md:text-xl ${
            category ? "mt-1" : ""
          }`}
        >
          {p.name}
        </h2>
        {chips.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2 md:mt-5">
            {chips.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded bg-neutral-100 px-2.5 py-1 text-[13px] font-medium leading-none text-neutral-700 md:px-3 md:py-1.5 md:text-sm"
              >
                #{tag.replace(/^#/, "").trim()}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </button>
  );
}

function DetailImageCarousel({
  slides,
  sizes,
}: {
  slides: string[];
  sizes: string;
}) {
  const touchStartX = useRef<number | null>(null);
  const slideSig = slides.join("|");
  const n = slides.length;

  /** 양끝에 클론을 붙여 마지막→첫(또는 첫→마지막) 이동도 같은 방향으로만 스크롤되게 함 */
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
    n <= 1
      ? 0
      : pos === 0
        ? n - 1
        : pos === nExt - 1
          ? 0
          : pos - 1;

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
    const id = window.setInterval(() => {
      go(1);
    }, 5000);
    return () => window.clearInterval(id);
  }, [n, slideSig, go, pauseRoll]);

  if (n === 1) {
    return (
      <Image
        src={slides[0]}
        alt=""
        fill
        className="object-cover object-top"
        sizes={sizes}
        priority
        unoptimized={slideNeedsUnoptimized(slides[0])}
      />
    );
  }

  return (
    <div
      className="relative h-full min-h-[160px] w-full"
      onMouseEnter={() => setPauseRoll(true)}
      onMouseLeave={() => setPauseRoll(false)}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={`flex h-full will-change-transform ${transitionOn ? "duration-300 ease-out transition-transform" : ""}`}
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
              className="relative h-full shrink-0"
              style={{ width: `${stepPct}%` }}
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover object-top"
                sizes={sizes}
                priority={i === 1}
                unoptimized={slideNeedsUnoptimized(src)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2">
        <button
          type="button"
          onClick={() => go(-1)}
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
          aria-label="이전 장"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
          aria-label="다음 장"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goToSlide(i)}
            className={`h-2 w-2 rounded-full transition-colors ${
              i === dotActiveIndex ? "bg-white shadow" : "bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`이미지 ${i + 1} / ${n}`}
            aria-current={i === dotActiveIndex}
          />
        ))}
      </div>
    </div>
  );
}

function ProjectDetailModal({
  project,
  onClose,
  navigableProjects,
  onNavigateProject,
}: {
  project: ProjectItem | null;
  onClose: () => void;
  navigableProjects: ProjectItem[];
  onNavigateProject: (p: ProjectItem) => void;
}) {
  const detailScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [project, onClose]);

  useEffect(() => {
    if (project) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [project]);

  useEffect(() => {
    detailScrollRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [project?.id]);

  if (!project) return null;

  const gallerySlides = detailGallerySlides(project);
  const chips = projectTagChips(project, 12);
  const paragraphs = detailBodyParagraphs(project);

  const detailIndex = navigableProjects.findIndex((p) => p.id === project.id);
  const canPrev = detailIndex > 0;
  const canNext =
    detailIndex >= 0 && detailIndex < navigableProjects.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8"
      role="presentation"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-neutral-900/40 backdrop-blur-[2px] transition-colors hover:bg-neutral-900/50"
        aria-label="닫기"
      />

      <div
        className="relative z-10 flex h-[min(90dvh,calc(100dvh-2rem))] max-h-[min(90dvh,calc(100dvh-2rem))] w-full max-w-[min(100rem,calc(100vw-2rem))] flex-col overflow-hidden bg-white shadow-2xl ring-1 ring-black/[0.06]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-detail-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center bg-white/95 text-neutral-700 shadow-sm ring-1 ring-black/5 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
          aria-label="닫기"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <div className="relative h-[38vh] min-h-[200px] w-full shrink-0 bg-neutral-100 md:h-full md:w-1/2 md:flex-none md:min-h-[min(45vh,420px)]">
            <DetailImageCarousel
              slides={gallerySlides}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          <div className="flex min-h-0 w-full flex-1 flex-col md:w-1/2 md:min-w-0">
            <div className="shrink-0 border-b border-neutral-100 px-5 pb-4 pt-4 pr-14 sm:px-8 sm:pb-5 sm:pt-5 md:px-10 md:pb-5 md:pt-6 lg:px-12">
              <h2
                id="project-detail-title"
                className="text-xl font-bold leading-snug tracking-tight text-neutral-900 sm:text-2xl"
              >
                {project.name}
              </h2>
              {project.detailTools?.trim() ? (
                <p className="mt-2 text-sm text-neutral-500 sm:text-[15px]">
                  {project.detailTools.trim()}
                </p>
              ) : null}
            </div>

            <div
              ref={detailScrollRef}
              className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain"
            >
              <div className="mx-auto w-full max-w-3xl px-5 py-5 sm:px-8 sm:py-6 md:max-w-none md:px-10 md:py-8 lg:px-12">
                {paragraphs.length > 0 ? (
                  <div className="space-y-4 text-[13px] leading-[1.7] text-neutral-700 sm:text-[14px]">
                    {paragraphs.map((para, i) => (
                      <p key={i} className="whitespace-pre-line">
                        {para}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-[15px] text-neutral-500 sm:text-base">
                    등록된 상세 본문이 없습니다.
                  </p>
                )}

                {chips.length > 0 ? (
                  <div className="mt-6 flex flex-wrap gap-2 sm:mt-7">
                    {chips.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded bg-neutral-100 px-2.5 py-1 text-[13px] font-medium text-neutral-700 sm:text-sm"
                      >
                        #{tag.replace(/^#/, "").trim()}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <nav
              className="shrink-0 border-t border-neutral-200 bg-white px-5 py-4 sm:px-8 md:px-10 lg:px-12"
              aria-label="프로젝트 이전·다음"
            >
              <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 md:max-w-none">
                <button
                  type="button"
                  disabled={!canPrev}
                  onClick={() => {
                    if (!canPrev || detailIndex <= 0) return;
                    onNavigateProject(navigableProjects[detailIndex - 1]!);
                  }}
                  className="-ml-2 inline-flex min-w-[5rem] items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50 disabled:text-neutral-300 disabled:hover:bg-white sm:-ml-4 md:-ml-6 lg:-ml-8"
                >
                  <span aria-hidden className="mr-1.5 text-neutral-500">
                    ‹
                  </span>
                  이전
                </button>
                <button
                  type="button"
                  disabled={!canNext}
                  onClick={() => {
                    if (!canNext || detailIndex < 0) return;
                    onNavigateProject(
                      navigableProjects[detailIndex + 1]!
                    );
                  }}
                  className="-mr-2 inline-flex min-w-[5rem] items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50 disabled:text-neutral-300 disabled:hover:bg-white sm:-mr-4 md:-mr-6 lg:-mr-8"
                >
                  다음
                  <span aria-hidden className="ml-1.5 text-neutral-500">
                    ›
                  </span>
                </button>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
