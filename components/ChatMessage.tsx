"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import {
  cancellableSleep,
  gptLikeDelayAfterChunk,
  gptLikeInitialDelayMs,
  gptLikeChunkCharCount,
} from "@/lib/chatStreamChunks";

type Role = "user" | "assistant";

const markdownProseAssistant =
  "[&_p]:mt-0 [&_p]:mb-0 [&_p]:leading-[1.78] [&_p:not(:last-child)]:mb-[1.85em] [&_p]:text-pretty [&_strong]:font-semibold [&_ul]:my-2.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:leading-[1.72] [&_ol]:my-2.5 [&_ol]:list-decimal [&_ol]:leading-[1.72] [&_li]:my-1 [&_li]:pl-0.5 [&_a]:underline [&_a]:underline-offset-2 [&_code]:rounded [&_code]:bg-[var(--subtle-gray)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.9em] [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-[var(--subtle-gray)] [&_pre]:p-3 [&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-[var(--border)] [&_blockquote]:pl-3 [&_blockquote]:leading-[1.72] [&_h1]:mb-2 [&_h1]:text-lg [&_h1]:font-bold [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-bold [&_h3]:mb-1 [&_h3]:font-semibold";

const markdownProseUser =
  "[&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_li]:my-0.5 [&_a]:text-blue-200 [&_a]:underline dark:[&_a]:text-blue-700 [&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1 dark:[&_code]:bg-black/10";

interface ChatMessageProps {
  role: Role;
  content: string;
  /** 신규 채팅 도크 등: 본문·버튼 글자 1px 축소 */
  compactFont?: boolean;
  showProfilePhoto?: boolean;
  isTyping?: boolean;
  /** API SSE로 본문이 실시간 수신 중 */
  isStreaming?: boolean;
  interviewerQuestions?: string[];
  showInterviewerPrompt?: boolean;
  isLoadingQuestions?: boolean;
  isPromptExpanded?: boolean;
  onInterviewerPromptClick?: () => void;
  onQuestionClick?: (question: string) => void;
  /** Full text is already in `content`; called once when chunk stream animation finishes */
  onAssistantStreamComplete?: () => void;
  /** 신규 페이지 도킹 채팅 등: 본문·버튼 폰트 1px 축소 */
  compactUI?: boolean;
}

export function ChatMessage({
  role,
  content,
  compactFont = false,
  showProfilePhoto = false,
  isTyping = false,
  isStreaming = false,
  compactUI = false,
  interviewerQuestions,
  showInterviewerPrompt = false,
  isLoadingQuestions = false,
  isPromptExpanded = false,
  onInterviewerPromptClick,
  onQuestionClick,
  onAssistantStreamComplete,
}: ChatMessageProps) {
  const isUser = role === "user";
  const [displayedContent, setDisplayedContent] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const onStreamCompleteRef = useRef(onAssistantStreamComplete);
  const streamGenRef = useRef(0);
  const streamRevealGenRef = useRef(0);
  const everStreamedAssistantRef = useRef(false);
  if (isStreaming) everStreamedAssistantRef.current = true;
  const contentRef = useRef(content);
  contentRef.current = content;
  const displayedAssistantRef = useRef(displayedContent);
  displayedAssistantRef.current = displayedContent;
  const isStreamingRef = useRef(isStreaming);
  isStreamingRef.current = isStreaming;

  useEffect(() => {
    onStreamCompleteRef.current = onAssistantStreamComplete;
  }, [onAssistantStreamComplete]);

  /** 히스토리·사용자 메시지: 즉시 반영. SSE 어시스턴트는 아래 reveal 루프만 사용 */
  useEffect(() => {
    if (isTyping && !isUser) {
      const gen = ++streamGenRef.current;
      let cancelled = false;
      const runTyping = async () => {
        if (cancelled || gen !== streamGenRef.current) return;
        setIsAnimating(true);
        setDisplayedContent("");
        if (content.length === 0) {
          setIsAnimating(false);
          onStreamCompleteRef.current?.();
          return;
        }

        await cancellableSleep(gptLikeInitialDelayMs(), () => cancelled || gen !== streamGenRef.current);

        let i = 0;
        while (i < content.length) {
          if (cancelled || gen !== streamGenRef.current) return;
          const chunkSize = gptLikeChunkCharCount();
          const next = Math.min(i + chunkSize, content.length);
          const chunk = content.slice(i, next);
          i = next;
          setDisplayedContent(content.slice(0, i));

          if (i >= content.length) break;

          const delay = gptLikeDelayAfterChunk(chunk);
          await cancellableSleep(delay, () => cancelled || gen !== streamGenRef.current);
        }

        if (cancelled || gen !== streamGenRef.current) return;
        setDisplayedContent(content);
        setIsAnimating(false);
        onStreamCompleteRef.current?.();
      };

      const kickoffId = setTimeout(() => {
        void runTyping();
      }, 0);

      return () => {
        cancelled = true;
        clearTimeout(kickoffId);
      };
    }

    if (isUser) {
      queueMicrotask(() => {
        setDisplayedContent(content);
        setIsAnimating(false);
      });
      return;
    }

    if (!everStreamedAssistantRef.current && !isStreaming) {
      queueMicrotask(() => {
        setDisplayedContent(content);
        setIsAnimating(false);
      });
    }
  }, [content, isTyping, isUser, isStreaming]);

  /** SSE 수신·마무리: `content`는 ref로 읽고, 표시는 기존 gptLike 청크 속도로 따라감 */
  useEffect(() => {
    if (isUser || isTyping) return;
    if (!everStreamedAssistantRef.current && !isStreaming) return;

    const gen = ++streamRevealGenRef.current;
    let cancelled = false;
    let initialDelayDone = false;

    const run = async () => {
      while (!cancelled && gen === streamRevealGenRef.current) {
        const target = contentRef.current;
        const streaming = isStreamingRef.current;
        let d = displayedAssistantRef.current;

        if (target.length === 0) {
          if (!streaming) {
            setDisplayedContent("");
            setIsAnimating(false);
            return;
          }
          await cancellableSleep(48, () => cancelled || gen !== streamRevealGenRef.current);
          continue;
        }

        if (d.length >= target.length) {
          if (!streaming) {
            setIsAnimating(false);
            onStreamCompleteRef.current?.();
            return;
          }
          await cancellableSleep(48, () => cancelled || gen !== streamRevealGenRef.current);
          continue;
        }

        setIsAnimating(true);
        if (d.length === 0 && !initialDelayDone) {
          await cancellableSleep(gptLikeInitialDelayMs(), () => cancelled || gen !== streamRevealGenRef.current);
          if (cancelled || gen !== streamRevealGenRef.current) return;
          initialDelayDone = true;
          d = displayedAssistantRef.current;
        }

        const chunkSize = gptLikeChunkCharCount();
        const next = Math.min(d.length + chunkSize, target.length);
        const chunk = target.slice(d.length, next);
        d = target.slice(0, next);
        displayedAssistantRef.current = d;
        setDisplayedContent(d);

        if (next < target.length || streaming) {
          const delay = gptLikeDelayAfterChunk(chunk);
          await cancellableSleep(delay, () => cancelled || gen !== streamRevealGenRef.current);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [isUser, isTyping]);

  const bodySize = compactFont ? "text-[14px]" : "text-[15px]";
  const btnSize = compactFont ? "text-[14px]" : "text-sm";
  /** 쇼케이스 도크 등: MD 제목·코드도 본문과 동일 px에 맞춤 */
  const compactMarkdownUniform =
    "[&_h1]:!text-[14px] [&_h2]:!text-[14px] [&_h3]:!text-[14px] [&_code]:!text-[14px]";

  return (
    <div
      className={`flex w-full flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}
      role="article"
      aria-label={isUser ? "사용자 메시지" : "아영님 소개 AI 응답"}
    >
      {isUser ? (
        <>
          <div
            className={`max-w-[85%] rounded-2xl px-4 py-3 ${bodySize} leading-relaxed bg-[#0F111D] text-white dark:bg-white dark:text-[#0F0F10] ${markdownProseUser} ${compactFont ? compactMarkdownUniform : ""}`}
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
            className={`w-full ${bodySize} leading-[1.78] tracking-[-0.01em] text-[var(--text-primary)] antialiased ${markdownProseAssistant} ${compactFont ? compactMarkdownUniform : ""} ${isAnimating ? "chat-typing-cursor-prose" : ""}`}
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
                  className={`flex items-center justify-between rounded-2xl px-4 py-2 ${btnSize} max-w-[85%] transition-colors border`}
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
                      className={`rounded-2xl px-4 py-2 ${btnSize} max-w-[85%] text-right transition-colors border`}
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
