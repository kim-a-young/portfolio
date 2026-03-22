"use client";

import { useRef, useEffect } from "react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
  "aria-label"?: string;
  compact?: boolean;
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  placeholder = "아영님에 대한 정보 수집을 도와드려요! 뭐든 물어보세요...",
  disabled = false,
  "aria-label": ariaLabel = "질문 입력",
  compact = false,
}: ChatInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      onSubmit();
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSubmit();
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      const maxHeight = compact ? 120 : 200;
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, maxHeight)}px`;
    }
  }, [value, compact]);

  const minHeight = compact ? "min-h-[80px]" : "min-h-[200px]";
  const textareaMinHeight = compact ? "min-h-[60px]" : "min-h-[170px]";
  const textareaMaxHeight = compact ? "max-h-[120px]" : "max-h-[200px]";
  const padding = compact ? "py-3" : "py-4";

  return (
    <div className="input-border-gradient focus-within:shadow-lg transition-shadow duration-200">
      <div className={`input-border-gradient-inner flex ${minHeight} w-full items-end gap-3 px-4 ${padding}`}>
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={compact ? 2 : 4}
          className={`${textareaMinHeight} ${textareaMaxHeight} flex-1 resize-none bg-transparent text-[14px] text-[var(--text-primary)] outline-none caret-[var(--accent)] placeholder:opacity-80 [&::placeholder]:[color:var(--text-secondary)]`}
          aria-label={ariaLabel}
        />
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={disabled || !value.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          aria-label="전송"
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
}
