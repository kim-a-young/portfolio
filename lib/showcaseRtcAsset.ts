/**
 * RTC(다중 비행장) 썸네일·상세 이미지 캐시 무효화.
 * `public/images/rtc_*.png`를 교체한 뒤 브라우저에 옛 이미지가 남으면 이 숫자만 올리세요.
 */
export const RTC_ASSET_VER = "2";

export const RTC_THUM = `/images/rtc_thum.png?v=${RTC_ASSET_VER}`;

export const RTC_DETAIL1 = `/images/rtc_detail1.png?v=${RTC_ASSET_VER}`;

export const RTC_IMAGES = [RTC_THUM, RTC_DETAIL1] as const;
