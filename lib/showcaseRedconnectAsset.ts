/** redconnect 썸네일 교체 시 숫자만 올리세요. (`/v2`·메인 카드 공통) */
export const REDCONNECT_THUM_VER = "2";
export const REDCONNECT_DETAIL1_VER = "3";

export const REDCONNECT_THUM = `/images/redconnect_thum.png?v=${REDCONNECT_THUM_VER}`;
export const REDCONNECT_DETAIL1 = `/images/redconnect_detail1.png?v=${REDCONNECT_DETAIL1_VER}`;

export const REDCONNECT_IMAGES = [REDCONNECT_THUM, REDCONNECT_DETAIL1] as const;
