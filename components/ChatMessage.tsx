"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";

type Role = "user" | "assistant";

const markdownProseAssistant =
  "[&_p]:mt-0 [&_p]:mb-0 [&_p]:leading-[1.78] [&_p:not(:last-child)]:mb-[1.85em] [&_p]:text-pretty [&_strong]:font-semibold [&_ul]:my-2.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:leading-[1.72] [&_ol]:my-2.5 [&_ol]:list-decimal [&_ol]:leading-[1.72] [&_li]:my-1 [&_li]:pl-0.5 [&_a]:underline [&_a]:underline-offset-2 [&_code]:rounded [&_code]:bg-[var(--subtle-gray)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.9em] [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-[var(--subtle-gray)] [&_pre]:p-3 [&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-[var(--border)] [&_blockquote]:pl-3 [&_blockquote]:leading-[1.72] [&_h1]:mb-2 [&_h1]:text-lg [&_h1]:font-bold [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-bold [&_h3]:mb-1 [&_h3]:font-semibold";

/** 방금 출력한 문자 뒤, 다음 글자까지 대기(ms) — 문단 경계는 더 길게 */
function delayMsAfterChar(ch: string, nextChar: string | undefined): number {
  if (ch === "\n") {
    if (nextChar === "\n") return 78;
    return 58;
  }
  if (/[.!?。．？…]/.test(ch)) return 48;
  if (/[,，、;:]/.test(ch)) return 30;
  if (ch === " " || ch === "\t") return 14;
  return 25;
}

const markdownProseUser =
  "[&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_li]:my-0.5 [&_a]:text-blue-200 [&_a]:underline dark:[&_a]:text-blue-700 [&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1 dark:[&_code]:bg-black/10";

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
      if (content.length === 0) {
        setIsAnimating(false);
        return;
      }

      let i = 0;
      let cancelled = false;
      let timeoutId: ReturnType<typeof setTimeout>;

      const tick = () => {
        if (cancelled) return;
        if (i >= content.length) {
          setIsAnimating(false);
          return;
        }
        i += 1;
        setDisplayedContent(content.slice(0, i));
        if (i >= content.length) {
          setIsAnimating(false);
          return;
        }
        const chJustShown = content[i - 1];
        const delay = delayMsAfterChar(chJustShown, content[i]);
        timeoutId = setTimeout(tick, delay);
      };

      timeoutId = setTimeout(tick, 18);
      return () => {
        cancelled = true;
        clearTimeout(timeoutId);
      };
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
          <div
            className={`max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed bg-[#0F111D] text-white dark:bg-white dark:text-[#0F0F10] ${markdownProseUser}`}
          >
            <ReactMarkdown remarkPlugins={[remarkBreaks]}>
              {displayedContent}
            </ReactMarkdown>
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
          <div
            className={`w-full text-[15px] leading-[1.78] tracking-[-0.01em] text-[var(--text-primary)] antialiased ${markdownProseAssistant} ${isAnimating ? "chat-typing-cursor-prose" : ""}`}
          >
            {displayedContent === "" && isAnimating ? (
              <span className="chat-typing-cursor-mark font-light text-[var(--text-primary)]">
                |
              </span>
            ) : (
              <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                {displayedContent}
              </ReactMarkdown>
            )}
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
