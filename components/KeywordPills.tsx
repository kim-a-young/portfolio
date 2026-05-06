"use client";

import { KEYWORD_PILLS, type KeywordPillId } from "@/lib/keywordPills";

interface KeywordPillsProps {
  onSelect: (pillId: KeywordPillId, label: string) => void;
  disabled?: boolean;
  /** true면 본문과 동일 14px (구버전 호환; pillTextClassName이 우선) */
  compact?: boolean;
  /** 지정 시 compact/text-sm 분기 대신 고정 크기 (쇼케이스 본문 통일용) */
  pillTextClassName?: string;
  /** 다크 분기와 무관하게 라이트 톤 강제 */
  forceLightTheme?: boolean;
}

export function KeywordPills({
  onSelect,
  disabled = false,
  compact = false,
  pillTextClassName,
  forceLightTheme = false,
}: KeywordPillsProps) {
  const pillText =
    pillTextClassName ?? (compact ? "text-[14px]" : "text-sm");

  return (
    <div className="flex flex-wrap justify-center gap-3" role="group" aria-label="질문 가이드">
      {KEYWORD_PILLS.map(({ id, label, emoji }) => (
        <button
          key={id}
          type="button"
          onClick={() => onSelect(id, `${emoji} ${label}`)}
          disabled={disabled}
          className={`rounded-full px-4 py-2.5 ${pillText} font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
            forceLightTheme ? "" : "hover:opacity-90"
          }`}
          style={{
            backgroundColor: forceLightTheme ? "#EFEFF1" : "var(--pill-bg)",
            color: forceLightTheme ? "#0F111D" : "var(--text-primary)",
            border: forceLightTheme
              ? "1px solid #E5E7EB"
              : "1px solid var(--border)",
          }}
          aria-label={`${label} 관련 질문하기`}
        >
          <span aria-hidden>{emoji}</span> {label}
        </button>
      ))}
    </div>
  );
}
