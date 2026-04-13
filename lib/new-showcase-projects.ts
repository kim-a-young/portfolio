import type { ProjectItem } from "./portfolio-projects";
import { SHOWCASE_PROJECTS } from "./portfolio-projects";
import { HABITICT_IMAGES, HABITICT_THUM } from "./showcaseHabitictAsset";
import { MONOPLEX_DETAIL1, MONOPLEX_THUM } from "./showcaseMonoplexAsset";
import { REDCONNECT_IMAGES, REDCONNECT_THUM } from "./showcaseRedconnectAsset";
import { GURUFIN_THUM } from "./showcaseGurufinAsset";
import { AIRPORTAL_IMAGES } from "./showcaseAirportalAsset";
import { RTC_THUM } from "./showcaseRtcAsset";

/** 해피해빗 썸네일·상세 이미지 교체 시 숫자만 올리세요. */
const HAPPYHABIT_ASSET_VER = "1";

const HAPPYHABIT_IMAGES = [
  `/images/happyhabit_thum.png?v=${HAPPYHABIT_ASSET_VER}`,
  `/images/happyhabit_detail1.png?v=${HAPPYHABIT_ASSET_VER}`,
  `/images/happyhabit_detail2.png?v=${HAPPYHABIT_ASSET_VER}`,
] as const;

const MONOPLEX_IMAGES = [MONOPLEX_THUM, MONOPLEX_DETAIL1] as const;

/**
 * /v2 쇼케이스 탭 전용 프로젝트 목록.
 * `SHOWCASE_PROJECTS`와 이미지·상세 갤러리 경로를 분리해 관리합니다.
 */
export const NEW_SHOWCASE_PROJECTS: ProjectItem[] = SHOWCASE_PROJECTS.map((p) => {
  if (p.id === 1) {
    return {
      ...p,
      image: AIRPORTAL_IMAGES[0],
      detailImages: [...AIRPORTAL_IMAGES],
    };
  }
  if (p.id === 21) {
    return {
      ...p,
      image: RTC_THUM,
    };
  }
  if (p.id === 2) {
    return {
      ...p,
      image: HAPPYHABIT_IMAGES[0],
      detailImages: [...HAPPYHABIT_IMAGES],
    };
  }
  if (p.id === 22) {
    return {
      ...p,
      image: HABITICT_THUM,
      detailImages: [...HABITICT_IMAGES],
    };
  }
  if (p.id === 20) {
    return {
      ...p,
      image: MONOPLEX_IMAGES[0],
      detailImages: [...MONOPLEX_IMAGES],
    };
  }
  if (p.id === 3) {
    return {
      ...p,
      image: REDCONNECT_THUM,
      detailImages: [...REDCONNECT_IMAGES],
    };
  }
  if (p.id === 5) {
    return {
      ...p,
      image: GURUFIN_THUM,
      detailImages: [GURUFIN_THUM],
    };
  }
  if (p.id !== 4) return p;
  return {
    ...p,
    image: "/images/pf_herzion_m.png",
    detailImages: [
      "/images/pf_herzion_m.png",
      "/images/herzion_detail1.gif",
      "/images/herzion_detail2.png",
      "/images/herzion_detail3.png",
    ],
  };
});
