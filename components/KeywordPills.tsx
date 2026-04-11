"use client";

import { KEYWORD_PILLS, type KeywordPillId } from "@/lib/keywordPills";

interface KeywordPillsProps {
  onSelect: (pillId: KeywordPillId, label: string) => void;
  disabled?: boolean;
  /** true면 본문과 동일 14px (구버전 호환; pillTextClassName이 우선) */
  compact?: boolean;
  /** 지정 시 compact/text-sm 분기 대신 고정 크기 (쇼케이스 본문 통일용) */
  pillTextClassName?: string;
}

export function KeywordPills({
  onSelect,
  disabled = false,
  compact = false,
  pillTextClassName,
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
          className={`rounded-full px-4 py-2.5 ${pillText} font-medium transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50`}
          style={{
            backgroundColor: "var(--pill-bg)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
          }}
          aria-label={`${label} 관련 질문하기`}
        >
          <span aria-hidden>{emoji}</span> {label}
        </button>
      ))}
    </div>
  );
}
