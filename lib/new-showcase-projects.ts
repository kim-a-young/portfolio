import type { ProjectItem } from "./portfolio-projects";
import { SHOWCASE_PROJECTS } from "./portfolio-projects";
import { HABITICT_IMAGES, HABITICT_THUM } from "./showcaseHabitictAsset";
import { MONOPLEX_DETAIL1, MONOPLEX_THUM } from "./showcaseMonoplexAsset";
import { REDCONNECT_IMAGES, REDCONNECT_THUM } from "./showcaseRedconnectAsset";
import { GURUFIN_DETAIL1, GURUFIN_THUM } from "./showcaseGurufinAsset";
import { AIRPORTAL_IMAGES } from "./showcaseAirportalAsset";

/** 해피해빗 썸네일·상세 이미지 교체 시 숫자만 올리세요. */
const HAPPYHABIT_ASSET_VER = "1";

const HAPPYHABIT_IMAGES = [
  `/images/happyhabit_thum.png?v=${HAPPYHABIT_ASSET_VER}`,
  `/images/happyhabit_detail1.png?v=${HAPPYHABIT_ASSET_VER}`,
  `/images/happyhabit_detail2.png?v=${HAPPYHABIT_ASSET_VER}`,
] as const;

const MONOPLEX_IMAGES = [MONOPLEX_THUM, MONOPLEX_DETAIL1] as const;

/** SK Tech 아카데미 썸네일·상세 PNG를 교체할 때마다 숫자만 올리면 브라우저 캐시가 갱신됩니다. */
const STA_ASSET_VER = "1";
const STA_THUM = `/images/sta_thum.png?v=${STA_ASSET_VER}`;
/** 상세 팝업: 썸네일 → detail 순으로 롤링 */
const STA_GALLERY_IMAGES = [
  STA_THUM,
  `/images/sta_detail1.png?v=${STA_ASSET_VER}`,
  `/images/sta_detail2.png?v=${STA_ASSET_VER}`,
] as const;

/** KB손해보험 상세 PNG 교체 시 버전 숫자만 올리면 캐시가 갱신됩니다. */
const KB_ASSET_VER = "1";
const KB_GALLERY_IMAGES = [
  `/images/pf_kb_m.png?v=${KB_ASSET_VER}`,
  `/images/kb_detail1.png?v=${KB_ASSET_VER}`,
] as const;

/** 정관장몰 상세 PNG 교체 시 버전 숫자만 올리면 캐시가 갱신됩니다. */
const JUNG_ASSET_VER = "1";
const JUNG_GALLERY_IMAGES = [
  `/images/pf_kgcshop_m.png?v=${JUNG_ASSET_VER}`,
  `/images/jung_detail1.png?v=${JUNG_ASSET_VER}`,
  `/images/jung_detail2.png?v=${JUNG_ASSET_VER}`,
  `/images/jung_detail3.png?v=${JUNG_ASSET_VER}`,
  `/images/jung_detail4.png?v=${JUNG_ASSET_VER}`,
] as const;

/** 영진전문대 상세 PNG 교체 시 버전 숫자만 올리면 캐시가 갱신됩니다. */
const YJU_ASSET_VER = "1";
const YJU_GALLERY_IMAGES = [
  `/images/pf_yju_m.png?v=${YJU_ASSET_VER}`,
  `/images/yju_detail1.png?v=${YJU_ASSET_VER}`,
] as const;

/** LG SIS 썸네일·상세 PNG 교체 시 버전 숫자만 올리면 캐시가 갱신됩니다. */
const LGSIS_ASSET_VER = "1";
const LGSIS_THUM = `/images/lgsis_thum.png?v=${LGSIS_ASSET_VER}`;
const LGSIS_GALLERY_IMAGES = [
  LGSIS_THUM,
  `/images/lgsis_detail1.png?v=${LGSIS_ASSET_VER}`,
] as const;

/** LG OLED SPACE 상세 PNG 교체 시 버전 숫자만 올리면 캐시가 갱신됩니다. */
const OLED_ASSET_VER = "1";
const OLED_GALLERY_IMAGES = [
  `/images/pf_oled_m.png?v=${OLED_ASSET_VER}`,
  `/images/oled_detail1.png?v=${OLED_ASSET_VER}`,
] as const;

/** 헤이폴 상세 PNG 교체 시 버전 숫자만 올리면 캐시가 갱신됩니다. */
const HEYPOLL_ASSET_VER = "1";
const HEYPOLL_GALLERY_IMAGES = [
  `/images/pf_heypoll_m.png?v=${HEYPOLL_ASSET_VER}`,
  `/images/heypoll_detail1.png?v=${HEYPOLL_ASSET_VER}`,
] as const;

/** /v2 그리드 상단 노출 순서 (해피해빗 → 항공포털 → 레드커넥트 → MONOPLEX → SK Tech 아카데미). */
const V2_LEADING_PROJECT_IDS: readonly number[] = [2, 1, 3, 20, 23];

/**
 * /v2 쇼케이스 탭 전용 프로젝트 목록.
 * `SHOWCASE_PROJECTS`와 이미지·상세 갤러리 경로를 분리해 관리합니다.
 */
const NEW_SHOWCASE_PROJECTS_MAPPED: ProjectItem[] = SHOWCASE_PROJECTS.map((p) => {
  if (p.id === 1) {
    return {
      ...p,
      image: AIRPORTAL_IMAGES[0],
      detailImages: [...AIRPORTAL_IMAGES],
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
  if (p.id === 23) {
    return {
      ...p,
      image: STA_THUM,
      detailImages: [...STA_GALLERY_IMAGES],
    };
  }
  if (p.id === 6) {
    return {
      ...p,
      image: KB_GALLERY_IMAGES[0],
      detailImages: [...KB_GALLERY_IMAGES],
    };
  }
  if (p.id === 9) {
    return {
      ...p,
      image: JUNG_GALLERY_IMAGES[0],
      detailImages: [...JUNG_GALLERY_IMAGES],
    };
  }
  if (p.id === 10) {
    return {
      ...p,
      image: YJU_GALLERY_IMAGES[0],
      detailImages: [...YJU_GALLERY_IMAGES],
    };
  }
  if (p.id === 24) {
    return {
      ...p,
      image: LGSIS_THUM,
      detailImages: [...LGSIS_GALLERY_IMAGES],
    };
  }
  if (p.id === 8) {
    return {
      ...p,
      image: OLED_GALLERY_IMAGES[0],
      detailImages: [...OLED_GALLERY_IMAGES],
    };
  }
  if (p.id === 7) {
    return {
      ...p,
      image: HEYPOLL_GALLERY_IMAGES[0],
      detailImages: [...HEYPOLL_GALLERY_IMAGES],
    };
  }
  if (p.id === 5) {
    return {
      ...p,
      image: GURUFIN_THUM,
      detailImages: [GURUFIN_THUM, GURUFIN_DETAIL1],
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

const V2_HIDDEN_PROJECT_IDS = new Set<number>([21]);

const byId = new Map(NEW_SHOWCASE_PROJECTS_MAPPED.map((p) => [p.id, p]));
const leading = V2_LEADING_PROJECT_IDS.map((id) => byId.get(id)).filter(
  (p): p is ProjectItem => p != null
);
const leadingIdSet = new Set(V2_LEADING_PROJECT_IDS);
const rest = NEW_SHOWCASE_PROJECTS_MAPPED.filter(
  (p) => !V2_HIDDEN_PROJECT_IDS.has(p.id) && !leadingIdSet.has(p.id)
);

/**
 * 다중 비행장 원격 통합 관제(id 21)는 노출하지 않습니다.
 */
export const NEW_SHOWCASE_PROJECTS: ProjectItem[] = [...leading, ...rest];
