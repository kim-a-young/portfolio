/** habitict 썸네일·상세 이미지 교체 시 숫자만 올리세요. (`/v2`·메인 카드 공통) */
export const HABITICT_ASSET_VER = "2";

export const HABITICT_THUM = `/images/habitict_thum.png?v=${HABITICT_ASSET_VER}`;

export const HABITICT_DETAIL1 = `/images/habitict_detail1.png?v=${HABITICT_ASSET_VER}`;

export const HABITICT_IMAGES = [HABITICT_THUM, HABITICT_DETAIL1] as const;
