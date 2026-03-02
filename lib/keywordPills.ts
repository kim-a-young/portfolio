/**
 * 질문 가이드용 키워드 버튼 설정.
 * 버튼을 추가하려면 이 배열에 항목을 넣으면 됩니다.
 */
export const KEYWORD_PILLS = [
  { id: "design-history", label: "디자인 이력", emoji: "🎨" },
  { id: "profile", label: "개인 프로필", emoji: "🙋‍♀️" },
  { id: "design-tools", label: "디자인 툴", emoji: "🛠️" },
] as const;

export type KeywordPillId = (typeof KEYWORD_PILLS)[number]["id"];
