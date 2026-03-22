"use client";

import { ChatInput } from "./ChatInput";
import { Greeting } from "./Greeting";
import { HeroAnimation } from "./HeroAnimation";
import { KeywordPills } from "./KeywordPills";
import type { KeywordPillId } from "@/lib/keywordPills";

type WelcomeBlockProps = {
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  onKeywordSelect: (pillId: KeywordPillId, label: string) => void;
  isSubmitting: boolean;
};

/**
 * Hero empty state: Lottie, greeting, input, pills.
 * Uses stagger animation classes (CSS) for initial entrance.
 */
export function WelcomeBlock({
  input,
  onInputChange,
  onSubmit,
  onKeywordSelect,
  isSubmitting,
}: WelcomeBlockProps) {
  const stagger = "stagger-1";
  const stagger2 = "stagger-2";
  const stagger3 = "stagger-3";
  const stagger4 = "stagger-4";

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <div className="flex w-full max-w-[768px] flex-col gap-[40px] pb-[60px]">
        <div className={`${stagger} h-[90px] pt-[35px]`}>
          <HeroAnimation />
        </div>
        <h1
          className={`flex flex-col items-center justify-start text-left text-xl font-bold leading-snug tracking-tight text-[var(--text-primary)] md:text-2xl ${stagger2}`}
          aria-label="인사 문구"
        >
          <Greeting />
          <br />
          <span className="text-[var(--text-primary)]">
            <span className="font-bold text-hero-gradient">지원자 아영님</span>
            에 대해 알아가볼까요?
          </span>
        </h1>
        <div className={`w-full ${stagger3}`}>
          <ChatInput
            value={input}
            onChange={onInputChange}
            onSubmit={onSubmit}
            placeholder="아영님에 대한 정보 수집을 도와드려요! 뭐든 물어보세요..."
            disabled={isSubmitting}
          />
        </div>
        <div className={`w-full ${stagger4}`}>
          <KeywordPills onSelect={onKeywordSelect} disabled={isSubmitting} />
        </div>
      </div>
    </div>
  );
}
