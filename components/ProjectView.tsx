"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface ProjectViewProps {
  projectId: string;
  sidebarOpen?: boolean;
}

type ProjectItem = {
  id: number;
  name: string;
  url: string;
  image: string;
  accent: string;
  meta?: string;
  detailImage?: string;
  /** 상세 팝업 하단: Design 첫 줄 (없으면 공통 더미) */
  detailDesignTypes?: string;
  /** 상세 팝업 하단: Tool 줄 */
  detailTools?: string;
  /** 상세 팝업 하단: 본문. 빈 줄로 문단 구분 가능. 없으면 공통 더미 */
  detailDescription?: string;
};

function projectHasDetailWriteup(project: ProjectItem): boolean {
  const body = project.detailDescription?.trim() ?? "";
  const hasCustomMeta = Boolean(
    project.detailDesignTypes?.trim() || project.detailTools?.trim()
  );
  return Boolean(body) || hasCustomMeta;
}

function ProjectDetailDescriptionBlock({ project }: { project: ProjectItem }) {
  const rawBody = project.detailDescription?.trim() ?? "";
  const hasCustomMeta = Boolean(
    project.detailDesignTypes?.trim() || project.detailTools?.trim()
  );
  if (!rawBody && !hasCustomMeta) return null;

  const designTypes =
    project.detailDesignTypes ?? "Reactive Design, UI/UX Design";
  const toolsLine =
    project.detailTools ?? "Tool : Figma, XD, Photoshop, Illustrator";
  const paragraphs = rawBody
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const leftColumn = (
    <div className="min-w-0 md:max-w-[25vw]">
      <h3 className="text-base font-bold tracking-tight text-white">Design</h3>
      <p className="mt-4 text-sm leading-relaxed text-zinc-300">{designTypes}</p>
      <p className="mt-3 text-sm leading-relaxed text-zinc-300">{toolsLine}</p>
    </div>
  );

  return (
    <section
      className="mt-12 w-full max-w-[1440px] border-t border-zinc-800 pt-12 pb-8"
      aria-label="프로젝트 상세 설명"
    >
      {paragraphs.length > 0 ? (
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,25vw)_minmax(0,1fr)] md:items-start md:gap-x-5 lg:gap-x-6">
          {leftColumn}
          <div className="min-w-0 space-y-4">
            {paragraphs.map((para, i) => (
              <p key={i} className="text-sm leading-[1.75] text-zinc-200">
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

const PROJECTS: ProjectItem[] = [
  {
    id: 1,
    name: "항공정보포털 UI/UX 개편",
    url: "#",
    image: "/images/pf_airportal_m.png",
    accent: "#0369a1", // 딥 블루
    meta: "웹 · 공공서비스",
    detailImage: "/images/pf_airportal.png",
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
    image: "/images/pf_redconnect_m.png",
    accent: "#dc2626", // 레드
    meta: "앱 · 고도화",
    detailDesignTypes: "App, BackOffice UI/UX Design 100%",
    detailTools: "Tool : XD, Photoshop, Illustrator",
    detailDescription: `대한적십자사의 공식 헌혈 앱 '레드커넥트'는 비대면 서비스 확대와 함께 사용자 경험 개선이 필요한 프로젝트였습니다. 기존 서비스는 사용자 동선이 분절되어 있고 접근성 기준을 충족하지 못한 화면이 존재하여 UX 개선이 요구되었습니다.

고객사의 요구사항과 서비스 방향을 반영하여 헌혈 예약부터 방문, 결과 확인, 증서 발급까지 이어지는 흐름을 정리하고, 비대면 중심의 서비스 화면으로 UI 구조 정의 및 접근성 개선을 전반적으로 담당하며, 공공 서비스 기준에 맞는 인터페이스로 정비하였습니다.

또한 기존 UI 패턴을 유지하면서 사용성을 개선하고, 백오피스 설계에 참여하여 운영 효율성과 관리 편의성을 고려한 서비스 구축에 기여하였습니다.

그 결과, 접근성 인증 마크를 획득하며 서비스 신뢰도를 강화하였고, 예약부터 발급까지 이어지는 비대면 헌혈 서비스 경험을 보다 안정적으로 제공할 수 있도록 개선하였습니다.`,
  },
  {
    id: 4,
    name: "헤르지온 앱 구축",
    url: "#",
    image: "/images/pf_herzion_m.png",
    accent: "#4f46e5", // 보라/블루
    meta: "앱 · 구축",
    detailDesignTypes: "UI/UX Design 100%, Brand Identity, Character Design, Motion Graphic Design",
    detailTools: "Tool : XD, Photoshop, Illustrator, After Effects",
    detailDescription: `퇴행성 뇌질환 예방을 위한 음향진동 케어 디바이스의 전용 앱 ‘헤르지온’은 웰니스 서비스로서 사용자에게 안정감과 신뢰를 전달하는 경험 설계가 중요한 프로젝트였습니다. 특히 비전문가와 중장년층 사용자도 쉽게 사용할 수 있도록 단순하고 직관적인 구조 설계가 주요 과제로 주어졌습니다.
서비스 구조를 단순화하고, 사용 목적에 따라 쉽게 선택할 수 있는 흐름으로 UI를 구성하였습니다. 또한 헤르지온만의 아이덴티티를 전달할 수 있도록 캐릭터를 기획 및 디자인하고, 서비스 전반에 일관되게 적용하였습니다.
디바이스와의 연결 경험에서는 인터렉션과 애니메이션을 활용하여 사용자에게 자연스럽고 연결감 있는 경험으로 확장하였습니다.
그 결과, 앱과 홍보 영상 전반에 활용 가능한 브랜딩 기반을 구축하였으며, 신규 헬스케어 디바이스 전용 앱 수주 및 디자인 수행으로 이어지며 서비스 확장에 기여하였습니다.`,
 
  },
  {
    id: 5,
    name: "구루핀월렛 앱 UI 리뉴얼",
    url: "#",
    image: "/images/pf_gurufin_m.png",
    accent: "#1d4ed8", // 블루
    meta: "앱 · 금융",
    detailDesignTypes: "UI Design 100%",
    detailTools: "Tool : XD, Photoshop, Illustrator",
    detailDescription: `블록체인 기반 디지털 자산 관리 서비스 '구루핀월렛'은 결제와 자산 관리를 동시에 제공하는 핀테크 앱으로, 사용자에게 신뢰감 있는 금융 경험을 전달하는 것이 중요한 서비스입니다. 기존 앱은 전반적으로 디자인 요소가 정돈되어 있지 않고 딱딱한 인상을 주어, 서비스 특성에 맞는 시각적 개선이 필요했습니다.

컬러, 타이포그래피, 컴포넌트 등 UI 전반의 디자인 요소를 체계화하고, 일관된 스타일 가이드를 정의하여 인터페이스를 정리하였습니다. 또한 금융 서비스의 신뢰감은 유지하면서도 과도하게 딱딱한 인상을 완화할 수 있도록 시각적 톤을 조정하였습니다.

화면 구성을 보다 명확하고 직관적으로 개선하였으며, 일관된 디자인 시스템을 기반으로 서비스 전반의 완성도와 가독성을 향상시켰습니다.`,
  },
  {
    id: 6,
    name: "KB손해보험 전채널 서비스 운영",
    url: "#",
    image: "/images/pf_kb_m.png",
    accent: "#f97316", // 이미지 계열에 맞춘 오렌지 톤
    meta: "웹 · 금융",
    detailDesignTypes: "Web/Mobile/App Maintenance Design, Publishing",
    detailTools: "Tool : Photoshop, Illustrator",
    detailDescription: `KB손해보험의 서비스 운영 디자이너로 참여하여 보험 상품 및 이벤트 운영 디자인을 담당하였습니다. 주간 및 월간 단위로 진행되는 이벤트와 프로모션에 맞춰 메인 키비주얼 이미지를 제작하고, 배너·아이콘 등 서비스 전반의 시각 요소를 지속적으로 관리 및 개선하였습니다.

고객사의 디자인 가이드를 기반으로 일관된 비주얼 톤을 유지하면서, 보험 상품 특성상 빈번하게 발생하는 콘텐츠 추가 및 변경 요청에 대응하여 신속하게 수정안을 반영하였고, HTML/CSS 퍼블리싱을 통해 실제 서비스에 적용될 수 있도록 지원하였습니다.

웹사이트, 모바일, 앱 등 다양한 플랫폼의 운영 특성을 고려하여 각 환경에 맞는 디자인을 제공하고, 반복적인 운영 환경에서도 일관된 디자인 품질을 유지하며 안정적인 서비스 운영을 유연하게 지원하였습니다.`,
  },
  {
    id: 7,
    name: "헤이폴 앱 구축",
    url: "#",
    image: "/images/pf_heypoll_m.png",
    accent: "#C52AD9", // 보라/핑크 계열 고정 컬러
    meta: "앱 · 구축",
    detailDesignTypes: "App UI/UX Design 100%",
    detailTools: "Tool : Photoshop, Illustrator",
    detailDescription: `리워드 기반 설문 참여 플랫폼 '헤이폴'은 사용자의 의견 참여를 콘텐츠화하고 포인트 보상을 통해 반복 사용을 유도하는 서비스로, 앱 런칭 단계에서 신규 BI를 반영한 UI 구축이 중요한 프로젝트였습니다.

신규 BI를 바탕으로 컬러, 타이포그래피, 컴포넌트 등 시각 요소를 정의하여 일관된 UI 스타일을 구축하고, 전체 페이지 디자인을 수행하였습니다.

또한 다양한 설문 및 이벤트 콘텐츠가 유연하게 적용될 수 있도록 화면 구조를 설계하여 서비스 전반의 일관성과 확장성을 고려한 디자인 기반을 마련하였습니다.

그 결과, 신규 브랜드 아이덴티티가 반영된 통일된 디자인 기반을 마련하여 서비스 런칭에 기여하였습니다.`,
  },
  {
    id: 8,
    name: "LG OLED SPACE 사이트 구축",
    url: "#",
    image: "/images/pf_oled_m.png",
    accent: "#BE1441", // 고정 배경 컬러
    meta: "모바일 · 전시",
    detailDesignTypes: "Web, Mobile Design 100%",
    detailTools: "Tool : Photoshop, Illustrator",
    detailDescription: `LG OLED SPACE 웹사이트는 OLED 기술의 강점과 차별성을 사용자에게 직관적으로 전달하기 위해 기획된 브랜드 콘텐츠 플랫폼입니다. 기술 중심의 정보를 나열하기보다, 비주얼 중심의 UI를 통해 OLED의 색감과 명암, 선명도를 감각적으로 전달하는 것이 중요한 프로젝트였습니다.

고해상도 이미지와 영상 중심의 인터페이스를 설계하여 OLED의 표현력을 효과적으로 드러내고, 콘텐츠 흐름에 따라 브랜드 메시지가 자연스럽게 전달될 수 있도록 웹과 모바일 환경에 맞는 화면을 구성하였습니다. 또한 다양한 디바이스 환경에서도 일관된 경험이 제공될 수 있도록 반응형 웹을 고려한 UI를 설계하였습니다.

그 결과, OLED 기술의 강점을 시각적으로 강조한 콘텐츠 중심의 웹사이트를 완성하였으며, 브랜드 메시지를 직관적으로 전달할 수 있는 비주얼 중심 UI를 구축하였습니다.`,
  },
  {
    id: 9,
    name: "정관장몰 상세페이지 UI/UX 개선",
    url: "#",
    image: "/images/pf_kgcshop_m.png",
    accent: "#b91c1c", // 레드 계열
    meta: "웹 · 커머스",
    detailDesignTypes: "Detail Page UI/UX Design, Graphic Design",
    detailTools: "Tool : Photoshop, Illustrator",
    detailDescription: `건강기능식품 전문 쇼핑 플랫폼 ‘정관장몰’은 다양한 상품 정보를 신뢰감 있게 전달하고 구매로 이어지도록 하는 상세페이지 설계가 중요한 서비스입니다. 기존에는 자사몰과 외부몰 간 상세페이지 구성과 톤앤매너가 일관되지 않아 브랜드 경험이 분산되는 문제가 있었습니다.

이에 고객사의 요구사항을 바탕으로 상세페이지 구조와 비주얼 톤을 재정비하고, 상품군(건강식품, 화장품, 반려동물식품)별 콘셉트를 구분하여 각 제품의 특징이 명확하게 전달될 수 있도록 콘텐츠 구성을 정리하였습니다. 또한 제형, 크기 등 핵심 정보를 직관적으로 전달할 수 있도록 아이콘 에셋을 제작하고, 다양한 환경에서도 일관된 표현이 가능하도록 디자인 가이드를 수립하였습니다.

이후 2명의 디자이너가 약 250여 개 상품의 상세페이지를 모바일, 웹, 외부몰, 중국어 버전으로 확장 적용할 수 있도록 체계적인 베리에이션 작업을 진행하며, 가이드 기반의 운영이 가능하도록 디자인을 정리하였습니다.

그 결과, 브랜드 일관성이 강화된 상세페이지를 구축하였으며 다양한 플랫폼과 상품군에서도 안정적으로 확장 및 운영이 가능한 콘텐츠 디자인 체계를 마련하였습니다.`,
  },
  {
    id: 10,
    name: "영진전문대학 & 입학처 사이트 구축",
    url: "#",
    image: "/images/pf_yju_m.png",
    accent: "#007fa0", // 대학 마크 컬러
    meta: "웹 · 교육",
    detailDesignTypes: "Web, Mobile Design 100%",
    detailTools: "Tool : Photoshop, Illustrator",
    detailDescription: `영진전문대학 웹사이트 및 입학처 사이트는 입학, 학과, 공지 등 다양한 정보를 사용자에게 명확하게 전달하는 것이 중요한 교육 서비스 플랫폼입니다. 특히 방대한 정보 구조와 복잡한 메뉴 체계를 효율적으로 정리하여 가독성과 접근성이 필요했습니다.

대학의 심벌마크와 시그니처 컬러를 디자인 요소로 활용하여 브랜드 아이덴티티를 UI 전반에 반영하고, 정보의 우선순위를 고려한 레이아웃과 텍스트 구조를 설계하여 사용자가 필요한 정보를 빠르게 탐색할 수 있도록 화면을 구성하였습니다.

또한 PC와 모바일 환경을 고려한 반응형 웹 디자인을 적용하여 다양한 디바이스에서도 일관된 정보 전달이 가능하도록 UI를 구축하였습니다.`,
  },
  {
    id: 11,
    name: "전통시장화재공제 사이트 구축",
    url: "#",
    image: "/images/pf_semas_m.png",
    accent: "#ea580c", // 오렌지
    meta: "웹 · 공공서비스",
    detailDesignTypes: "Web Design 100%",
    detailTools: "Tool : Photoshop, Illustrator",
    detailDescription: `전통시장화재공제 웹사이트는 전통시장 상인을 대상으로 화재 피해를 대비할 수 있는 공제 제도를 안내하고 가입을 유도하는 공공 서비스 플랫폼으로, 복잡한 제도를 쉽고 직관적으로 전달하는 것이 중요한 프로젝트였습니다.

사용자의 이해도를 높이기 위해 정보 구조를 단순화하고, 공제 개념과 가입 절차를 직관적으로 전달할 수 있도록 전체 페이지 UI를 설계하였습니다. 특히 가입 과정에서의 진입 장벽을 낮추기 위해 단계별 흐름을 간소화하고, 사용자가 자연스럽게 선택하며 진행할 수 있는 인터페이스를 구성하였습니다.

또한 디자인 가이드를 수립하여 퍼블리싱 및 개발 과정에서도 일관된 UI가 유지될 수 있도록 기반을 마련하고, 서비스 전반에 걸쳐 안정적인 디자인 품질을 유지할 수 있도록 하였습니다.

그 결과, 복잡한 공제 서비스에 대한 이해도를 높이는 접근성 웹사이트를 구축하였으며, 사용자 친화적인 가입 흐름을 통해 서비스 이용 활성화에 기여할 수 있는 기반을 마련하였습니다.`,
  },
  {
    id: 13,
    name: "SK엔카 사업관리시스템 구축",
    url: "#",
    image: "/images/pf_skncar_m.png",
    accent: "#ea580c", // 오렌지 (기존 다크 브라운보다 밝게, 다른 프로젝트 톤과 맞춤)
    meta: "웹 · 시스템 구축",
    detailTools: "Tool : Nexacro, Photoshop, Illustrator",
    detailDescription: `SK엔카의 사업 운영을 지원하는 내부 관리 시스템은 방대한 거래 데이터와 지점별 운영 현황을 효율적으로 관리하는 것이 중요한 플랫폼으로, 분산된 업무 환경에서도 일관된 사용 경험과 높은 가독성에 집중하였습니다.

넥사크로 기반의 인터페이스와 컴포넌트를 설계하고, 대시보드를 통해 지점별 판매 현황을 직관적으로 비교하고 빠르게 파악할 수 있도록 데이터 시각화 중심의 UI를 구성하였습니다. 또한 반복적으로 사용되는 UI 요소를 체계화하여 화면 간 일관성을 유지하고, 사용자의 학습 부담을 줄일 수 있도록 인터페이스를 정리하였습니다.

더불어 시스템 전반에 적용 가능한 디자인 가이드를 수립하여 지점 및 조직별로 동일한 UI 환경을 유지하여 지점 간 업무 환경의 차이를 줄이고 일관된 사용자 경험과 업무 수행 방식을 지원할 수 있는 UI 체계를 마련하였습니다.`,
  },
  {
    id: 15,
    name: "미래에셋 OMS 구축",
    url: "#",
    image: "/images/pf_miraeasset_m.png",
    accent: "#1d4ed8", // 블루
    meta: "웹 · 금융 시스템",
    detailTools: "Tool : Nexacro, Photoshop, Illustrator",
    detailDescription: `미래에셋증권의 OMS(Order Management System)는 대량의 금융 데이터를 기반으로 빠른 의사결정과 정확한 업무 처리가 요구되는 내부 업무 시스템으로, 장시간 사용 환경에서도 효율적이고 일관된 UI를 제공하는 것이 중요한 프로젝트였습니다.

이에 넥사크로 기반의 인터페이스와 컴포넌트를 설계하고, 사용자 업무 유형과 개인 선호에 따라 화면 구성이 가능하도록 Floating Mode와 Frame Mode의 2가지 레이아웃 구조를 정의하였습니다. 또한 4가지 컬러 테마를 제공하여 사용자 환경에 맞춘 개인화 UI를 구현하고, MindMap 기반의 메뉴 구조를 통해 주요 기능에 빠르게 접근할 수 있도록 인터페이스를 설계하였습니다.

더불어 시스템 전반에 적용 가능한 디자인 가이드를 수립하여 화면 간 일관성을 유지하고, 반복 업무에 대한 학습 부담을 줄일 수 있도록 UI 표준을 정리하였습니다.

그 결과, 사용자 맞춤형 UI 환경을 통해 업무 몰입도와 처리 효율을 향상시켰으며, 데이터 중심 업무에 적합한 정보 구조와 인터페이스를 기반으로 빠른 정보 파악과 의사결정을 지원할 수 있는 확장 가능한 시스템을 구축하였습니다.`,
  },
  {
    id: 12,
    name: "현대자동차연구소 표준개발시스템 구축",
    url: "#",
    image: "/images/pf_hyundaimotorgroup_m.png",
    accent: "#0A2366", // 현대 브랜드 딥 블루 (hover 배경 고정)
    meta: "웹 · 시스템 구축",
    detailTools: "Tool : Nexacro, Photoshop, Illustrator",
  },
  {
    id: 14,
    name: "한국스마트카드 사업관리시스템 구축",
    url: "#",
    image: "/images/pf_tmoney_m.png",
    accent: "#898989", // RGB 137,137,137 (hover 배경 고정)
    meta: "웹 · 시스템 구축",
    detailTools: "Tool : Nexacro, Photoshop, Illustrator",
  },
  {
    id: 16,
    name: "베페몰 앱 구축",
    url: "#",
    image: "/images/pf_befemall_m.png",
    accent: "#fb7185", // 코랄/핑크
    meta: "앱 · 커머스",
    detailDesignTypes: "App Design 100%",
    detailTools: "Tool : Photoshop, Illustrator",
  },
  {
    id: 17,
    name: "LG U+ 모바일웹 구축 서브디자인",
    url: "#",
    image: "/images/pf_lguplus_m.png",
    accent: "#898989", // RGB 137,137,137 (hover 배경 고정)
    meta: "모바일 · 서브페이지",
    detailDesignTypes: "Mobile Sub Design, Graphic Design",
    detailTools: "Tool : Photoshop, Illustrator",
  },
  {
    id: 18,
    name: "풀무원 아미오 사이트 구축",
    url: "#",
    image: "/images/pf_amio_m.png",
    accent: "#16a34a", // 그린
    meta: "웹 · 커머스",
    detailDesignTypes: "Web Design 100%, Visual Design",
    detailTools: "Tool : Photoshop, Illustrator",
  },
  {
    id: 19,
    name: "경희대학교 국문사이트 구축",
    url: "#",
    image: "/images/pf_kyunghee_m.png",
    accent: "#334155", // 블루 그레이
    meta: "웹 · 교육",
    detailDesignTypes: "Web Design 100%",
    detailTools: "Tool : Photoshop, Illustrator",
  },
];

/** hover 배경: 이미지 색 추출 대신 프로젝트 accent 고정 (브랜드 컬러 유지) */
const ACCENT_FROM_PROJECT_IDS = [7, 8, 10, 12, 13, 14, 17];

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

            <button
              type="button"
              onClick={() =>
                modalScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })
              }
              className="fixed bottom-3 right-3 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-zinc-200 backdrop-blur-md transition-colors hover:bg-white/20 hover:text-white"
              aria-label="맨 위로 이동"
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
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>

            <div className="w-full py-8 pl-2 pr-4 sm:pl-3 sm:pr-5 md:pl-4 md:pr-6 bg-transparent">
              <div className="mb-4 max-w-5xl">
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

              <div className="w-full max-w-[1440px]">
                <Image
                  src={`${
                    openProject.detailImage ?? openProject.image
                  }?v=${cacheBust}`}
                  alt={openProject.name}
                  width={1600}
                  height={4000}
                  className="h-auto w-full object-contain"
                  priority
                  unoptimized
                />
              </div>

              {!openProject.detailImage &&
                projectHasDetailWriteup(openProject) && (
                  <ProjectDetailDescriptionBlock project={openProject} />
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
