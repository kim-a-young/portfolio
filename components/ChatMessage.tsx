"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

type Role = "user" | "assistant";

interface ChatMessageProps {
  role: Role;
  content: string;
  showProfilePhoto?: boolean;
  isTyping?: boolean;
  interviewerQuestions?: string[];
  showInterviewerPrompt?: boolean;
  isLoadingQuestions?: boolean;
  isPromptExpanded?: boolean;
  onInterviewerPromptClick?: () => void;
  onQuestionClick?: (question: string) => void;
}

export function ChatMessage({
  role,
  content,
  showProfilePhoto = false,
  isTyping = false,
  interviewerQuestions,
  showInterviewerPrompt = false,
  isLoadingQuestions = false,
  isPromptExpanded = false,
  onInterviewerPromptClick,
  onQuestionClick,
}: ChatMessageProps) {
  const isUser = role === "user";
  const [displayedContent, setDisplayedContent] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isTyping && !isUser) {
      setIsAnimating(true);
      setDisplayedContent("");
      let currentIndex = 0;
      
      const typingInterval = setInterval(() => {
        if (currentIndex < content.length) {
          setDisplayedContent(content.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
          setIsAnimating(false);
        }
      }, 20); // 20ms마다 한 글자씩 (조절 가능)

      return () => clearInterval(typingInterval);
    } else {
      setDisplayedContent(content);
      setIsAnimating(false);
    }
  }, [content, isTyping, isUser]);

  return (
    <div
      className={`flex w-full flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}
      role="article"
      aria-label={isUser ? "사용자 메시지" : "아영님 소개 AI 응답"}
    >
      {isUser ? (
        <>
          <div className="max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap bg-[#0F111D] text-white dark:bg-white dark:text-[#0F0F10]">
            {displayedContent}
          </div>
        </>
      ) : (
        <>
          {showProfilePhoto && (
            <div className="mb-3 flex w-full justify-start">
              <Image
                src="/images/profile-ayoung.png"
                alt="김아영 프로필 사진"
                width={88}
                height={88}
                className="rounded-2xl object-cover shadow-md ring-2 ring-[var(--border)]"
              />
            </div>
          )}
          <div className="w-full text-[15px] leading-relaxed whitespace-pre-wrap text-[var(--text-primary)]">
            {displayedContent}
            {isAnimating && <span className="animate-pulse">|</span>}
          </div>
          {!isAnimating && (showInterviewerPrompt || (interviewerQuestions && interviewerQuestions.length > 0)) && (
            <div className="flex flex-col gap-2 items-end w-full mt-2">
              {showInterviewerPrompt && (
                <button
                  onClick={onInterviewerPromptClick}
                  disabled={isLoadingQuestions}
                  className="flex items-center justify-between rounded-2xl px-4 py-2 text-sm max-w-[85%] transition-colors border"
                  style={{
                    backgroundColor: "var(--border)",
                    color: "var(--text-primary)",
                    borderColor: "var(--border)",
                    opacity: isLoadingQuestions ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoadingQuestions) {
                      e.currentTarget.style.opacity = "0.9";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = isLoadingQuestions ? "0.6" : "1";
                  }}
                >
                  <span style={{ color: "var(--text-primary)" }}>{isLoadingQuestions ? "생성 중..." : "음...그..."}</span>
                  {interviewerQuestions && interviewerQuestions.length > 0 && (
                    <svg
                      className={`ml-2 transition-transform ${isPromptExpanded ? "rotate-180" : ""}`}
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  )}
                </button>
              )}
              {isPromptExpanded && interviewerQuestions && interviewerQuestions.length > 0 && (
                <>
                  {interviewerQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => onQuestionClick?.(question)}
                      className="rounded-2xl px-4 py-2 text-sm max-w-[85%] text-right transition-colors border"
                      style={{
                        backgroundColor: "var(--border)",
                        color: "var(--text-primary)",
                        borderColor: "var(--border)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = "0.9";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = "1";
                      }}
                    >
                      <span style={{ color: "var(--text-primary)" }}>{question}</span>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
