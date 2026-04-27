/**
 * 항공정보포털 썸네일·상세 이미지 캐시 무효화.
 * `public/images`의 파일을 교체한 뒤에도 브라우저에 옛 이미지가 남으면 이 숫자만 올리세요.
 */
export const AIRPORTAL_ASSET_VER = "6";

export const AIRPORTAL_THUM = `/images/airportal_thum.png?v=${AIRPORTAL_ASSET_VER}`;

export const AIRPORTAL_DETAIL1 = `/images/airportal_detail1.png?v=${AIRPORTAL_ASSET_VER}`;

export const AIRPORTAL_DETAIL2 = `/images/airportal_detail2.png?v=${AIRPORTAL_ASSET_VER}`;

export const AIRPORTAL_DETAIL3 = `/images/airportal_detail3.png?v=${AIRPORTAL_ASSET_VER}`;

export const AIRPORTAL_IMAGES = [
  AIRPORTAL_THUM,
  AIRPORTAL_DETAIL1,
  AIRPORTAL_DETAIL2,
  AIRPORTAL_DETAIL3,
] as const;
