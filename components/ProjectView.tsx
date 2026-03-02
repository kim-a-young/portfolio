"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface ProjectViewProps {
  projectId: string;
}

type ProjectItem = {
  id: number;
  name: string;
  url: string;
  image: string;
  accent: string;
  meta?: string;
};

const PROJECTS: ProjectItem[] = [
  {
    id: 1,
    name: "GS아트센터 메인 페이지",
    url: "https://creatoom.com/shop/iphone-16-pro-mockup-on-the-bench-isometric/",
    image: "/images/project-view-1.png",
    accent: "#0f172a", // 남색 계열
    meta: "웹 · 티켓 예매",
  },
  {
    id: 2,
    name: "GS아트센터 공지·FAQ 화면",
    url: "https://creatoom.com/shop/iphone-16-pro-mockup-on-the-bench-isometric/",
    image: "/images/project-view-2.png",
    accent: "#e5e5e5", // 밝은 그레이
    meta: "웹 · 공지/FAQ",
  },
  {
    id: 3,
    name: "해피해빗 앱 리뉴얼",
    url: "#",
    image: "/images/happyhabit.png",
    accent: "#f97316", // 오렌지
    meta: "앱 · 리뉴얼",
  },
  {
    id: 4,
    name: "레드커넥트 캠페인 화면",
    url: "#",
    image: "/images/redconnect-default.png",
    accent: "#dc2626", // 레드
    meta: "앱 · 캠페인",
  },
  {
    id: 5,
    name: "헤르지온 온보딩 화면",
    url: "#",
    image: "/images/herzion.png",
    accent: "#4f46e5", // 보라/블루
    meta: "앱 · 온보딩",
  },
  {
    id: 6,
    name: "항공정보포털 메인 개편",
    url: "#",
    image: "/images/happyhabit.png",
    accent: "#0369a1", // 딥 블루
    meta: "웹 · 공공서비스",
  },
  {
    id: 7,
    name: "KB손해보험 상품 안내",
    url: "#",
    image: "/images/happyhabit.png",
    accent: "#b45309", // 브라운/골드
    meta: "웹 · 금융",
  },
  {
    id: 8,
    name: "정관장몰 상세페이지",
    url: "#",
    image: "/images/happyhabit.png",
    accent: "#b91c1c", // 레드 계열
    meta: "웹 · 커머스",
  },
  {
    id: 9,
    name: "구루핀 월렛 대시보드",
    url: "#",
    image: "/images/happyhabit.png",
    accent: "#1d4ed8", // 블루
    meta: "앱 · 금융",
  },
  {
    id: 10,
    name: "OLED Space 전시 페이지",
    url: "#",
    image: "/images/happyhabit.png",
    accent: "#047857", // 그린
    meta: "웹 · 전시",
  },
];

export function ProjectView({ projectId }: ProjectViewProps) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [projectId]);

  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const activeProject =
    hoveredId != null
      ? PROJECTS.find((project) => project.id === hoveredId) ?? null
      : null;

  const activeAccent =
    hoveredId != null && activeProject?.accent
      ? activeProject.accent
      : "#ffffff";

  return (
    <div
      className="relative min-h-screen text-black transition-colors duration-700"
      style={{ backgroundColor: activeAccent }}
    >
      {/* 배경 이미지 레이어 */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {PROJECTS.map((project) => {
          const isActive = hoveredId != null && project.id === hoveredId;
          return (
            <div
              key={project.id}
              className={`absolute transition-all duration-700 ease-out ${
                isActive ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
            >
              <Image
                src={project.image}
                alt={project.name}
                width={1600}
                height={900}
                className="h-auto max-h-[80vh] w-auto object-contain"
                sizes="80vw"
                priority={project.id === 1}
              />
            </div>
          );
        })}
      </div>

      {/* 콘텐츠 레이어 */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col px-4 pb-[30px] pt-[72px] sm:px-6 md:pt-[30px] lg:px-8">
        <header className="mb-16 space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            PROJECT INDEX
          </p>
        </header>

        {/* 라인 리스트 */}
        <nav aria-label="프로젝트 목록">
          <ul onMouseLeave={() => setHoveredId(null)}>
            {PROJECTS.map((project, index) => {
              const hasHover = hoveredId != null;
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
                    onClick={() => {
                      if (project.url.startsWith("http")) {
                        window.open(project.url, "_blank", "noreferrer");
                      }
                    }}
                    className={`group flex w-full items-baseline justify-between gap-4 py-6 text-left transition-colors duration-300 ${
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
    </div>
  );
}
