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
  detailImage?: string;
};

const PROJECTS: ProjectItem[] = [
  {
    id: 1,
    name: "항공정보포털 UI/UX 개편",
    url: "#",
    image: "/images/happyhabit.png",
    accent: "#0369a1", // 딥 블루
    meta: "웹 · 공공서비스",
  },
  {
    id: 2,
    name: "해피해빗 앱 리뉴얼",
    url: "#",
    image: "/images/pf_happyhabit_m.png",
    accent: "#f97316", // 오렌지
    meta: "앱 · 리뉴얼",
    detailImage: "/images/pf_happyhabit.png",
  },
  {
    id: 3,
    name: "레드커넥트 앱 고도화",
    url: "#",
    image: "/images/redconnect-default.png",
    accent: "#dc2626", // 레드
    meta: "앱 · 고도화",
  },
  {
    id: 4,
    name: "헤르지온 앱 구축",
    url: "#",
    image: "/images/herzion.png",
    accent: "#4f46e5", // 보라/블루
    meta: "앱 · 구축",
  },
  {
    id: 5,
    name: "구루핀월렛 앱 UI 리뉴얼",
    url: "#",
    image: "/images/happyhabit.png",
    accent: "#1d4ed8", // 블루
    meta: "앱 · 금융",
  },
  {
    id: 6,
    name: "KB손해보험 전채널 서비스 운영",
    url: "#",
    image: "/images/happyhabit.png",
    accent: "#b45309", // 브라운/골드
    meta: "웹 · 금융",
  },
  {
    id: 7,
    name: "헤이폴 앱 구축",
    url: "#",
    image: "/images/happyhabit.png",
    accent: "#22c55e", // 그린
    meta: "앱 · 구축",
  },
  {
    id: 8,
    name: "OLED Space 모바일 구축",
    url: "#",
    image: "/images/happyhabit.png",
    accent: "#047857", // 그린
    meta: "모바일 · 전시",
  },
  {
    id: 9,
    name: "정관장몰 상세페이지 UI/UX 개선",
    url: "#",
    image: "/images/happyhabit.png",
    accent: "#b91c1c", // 레드 계열
    meta: "웹 · 커머스",
  },
  {
    id: 10,
    name: "영진전문대학 & 입학처 사이트 구축",
    url: "#",
    image: "/images/happyhabit.png",
    accent: "#0f172a", // 남색
    meta: "웹 · 교육",
  },
  {
    id: 11,
    name: "전통시장화재공제 사이트 구축",
    url: "#",
    image: "/images/happyhabit.png",
    accent: "#ea580c", // 오렌지
    meta: "웹 · 공공서비스",
  },
  {
    id: 12,
    name: "현대자동차연구소 표준개발시스템 구축",
    url: "#",
    image: "/images/happyhabit.png",
    accent: "#1e293b", // 진한 블루/그레이
    meta: "웹 · 시스템 구축",
  },
  {
    id: 13,
    name: "SK엔카 사업관리시스템 구축",
    url: "#",
    image: "/images/happyhabit.png",
    accent: "#7c2d12", // 브라운
    meta: "웹 · 시스템 구축",
  },
  {
    id: 14,
    name: "한국스마트카드 사업관리시스템 구축",
    url: "#",
    image: "/images/happyhabit.png",
    accent: "#059669", // 그린
    meta: "웹 · 시스템 구축",
  },
  {
    id: 15,
    name: "미래에셋 OMS 구축",
    url: "#",
    image: "/images/happyhabit.png",
    accent: "#1d4ed8", // 블루
    meta: "웹 · 금융 시스템",
  },
  {
    id: 16,
    name: "베이비페어몰 앱 구축",
    url: "#",
    image: "/images/happyhabit.png",
    accent: "#fb7185", // 코랄/핑크
    meta: "앱 · 커머스",
  },
  {
    id: 17,
    name: "LG + 모바일 서브페이지 디자인",
    url: "#",
    image: "/images/happyhabit.png",
    accent: "#4b5563", // 그레이
    meta: "모바일 · 서브페이지",
  },
  {
    id: 18,
    name: "풀무원 아미오 사이트 구축",
    url: "#",
    image: "/images/happyhabit.png",
    accent: "#16a34a", // 그린
    meta: "웹 · 커머스",
  },
  {
    id: 19,
    name: "경희대학교(국) 사이트 리뉴얼",
    url: "#",
    image: "/images/happyhabit.png",
    accent: "#334155", // 블루 그레이
    meta: "웹 · 교육",
  },
];

export function ProjectView({ projectId }: ProjectViewProps) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [projectId]);

  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [openProject, setOpenProject] = useState<ProjectItem | null>(null);
  const [imageColors, setImageColors] = useState<Record<number, string>>({});

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

  // 각 프로젝트 이미지에서 대표 색상 추출 (클라이언트 전용)
  useEffect(() => {
    if (typeof window === "undefined") return;

    PROJECTS.forEach((project) => {
      // 이미 계산된 색상은 건너뜀
      if (imageColors[project.id]) return;

      const img = new window.Image();
      img.src = project.image;

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!context) return;

          const width = 32;
          const height = 32;
          canvas.width = width;
          canvas.height = height;

          context.drawImage(img, 0, 0, width, height);
          const imageData = context.getImageData(0, 0, width, height).data;

          // 대표 포인트 컬러 = 가장 채도가 높은 픽셀(중간 밝기 범위)
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

            // 너무 어둡거나 밝은 영역은 제외하고, 채도가 높은 픽셀을 우선
            if (l < 0.18 || l > 0.85 || s < 0.25) continue;

            const score = s * (1 - Math.abs(l - 0.55)); // 채도 + 중간 밝기 우선
            if (score > bestScore) {
              bestScore = score;
              bestR = r;
              bestG = g;
              bestB = b;
            }
          }

          let color: string;

          if (bestScore >= 0) {
            color = `rgb(${bestR}, ${bestG}, ${bestB})`;
          } else {
            // 후보가 없으면 전체 평균값 사용 (fallback)
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

          setImageColors((prev) => ({
            ...prev,
            [project.id]: color,
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
  }, [imageColors]);

  const activeProject =
    hoveredId != null
      ? PROJECTS.find((project) => project.id === hoveredId) ?? null
      : null;

  const hasHover = hoveredId != null;

  const activeAccent =
    hasHover && activeProject
      ? imageColors[hoveredId!] ?? activeProject.accent
      : "#ffffff";

  return (
    <div
      className="relative min-h-screen text-black transition-colors duration-700"
      style={{ backgroundColor: activeAccent }}
    >
      {/* 배경 이미지 레이어 */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center">
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

      {/* 텍스트 가독성을 위한 반투명 오버레이 (hover 중에만 표시) */}
      {hasHover && (
        <div className="pointer-events-none fixed inset-0 bg-black/50" />
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
        <div className="fixed inset-0 z-40 bg-black/90">
          {/* 딤 영역 클릭 시 닫기 */}
          <button
            type="button"
            className="absolute inset-0 h-full w-full cursor-default"
            aria-label="프로젝트 상세 닫기"
            onClick={() => setOpenProject(null)}
          />

          {/* 이미지 전용 스크롤 컨테이너 (배경은 고정, 이 영역만 스크롤) */}
          <div className="relative z-10 flex h-full w-full flex-col overflow-auto bg-transparent">
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

            <div className="mx-auto w-full max-w-5xl px-4 py-8 bg-transparent">
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

              <div className="flex justify-center">
                <Image
                  src={openProject.detailImage ?? openProject.image}
                  alt={openProject.name}
                  width={1600}
                  height={4000}
                  className="h-auto w-auto max-w-none"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
