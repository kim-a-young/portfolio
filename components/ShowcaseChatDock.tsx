"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";
import { KeywordPills } from "./KeywordPills";
import type { KeywordPillId } from "@/lib/keywordPills";
import type { Message } from "@/lib/chatHistory";
import {
  addChatToHistory,
  getChatById,
  resolveChatTitle,
} from "@/lib/chatHistory";
import { getOrCreateBrowserId } from "@/lib/browserId";
import {
  SHOWCASE_CHAT_BODY_CLASS,
  SHOWCASE_CHAT_TAB_CLASS,
  SHOWCASE_CHAT_TITLE_CLASS,
} from "@/lib/showcaseChatTypography";

/** 로컬 채팅 히스토리 키 — 라우트가 /new → /v2로 바뀌어도 동일 스레드 유지 */
const SHOWCASE_CHAT_ID = "showcase-new-page";

const SHOWCASE_GREETING =
  "안녕하세요🙂 함께 일해 본 동료AI가 뭐든 대답해드려요";

export function ShowcaseChatDock() {
  const [open, setOpen] = useState(false);
  const [fabAnimating, setFabAnimating] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: SHOWCASE_GREETING },
  ]);
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [typingMessageIndex, setTypingMessageIndex] = useState<number | null>(
    null
  );
  const [assistantMessageWithPrompt, setAssistantMessageWithPrompt] = useState<
    number | null
  >(null);
  const [expandedPrompts, setExpandedPrompts] = useState<Set<number>>(
    new Set()
  );
  const [loadingQuestions, setLoadingQuestions] = useState<Set<number>>(
    new Set()
  );
  const [streamingAssistantIndex, setStreamingAssistantIndex] = useState<
    number | null
  >(null);
  const [assistantRevealBusyIndex, setAssistantRevealBusyIndex] = useState<
    number | null
  >(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesRef = useRef<Message[]>(messages);
  messagesRef.current = messages;

  const scrollPanelToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  const triggerFabAnimation = useCallback(() => {
    setFabAnimating(false);
    window.requestAnimationFrame(() => {
      setFabAnimating(true);
    });
  }, []);

  const resetConversation = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const fresh: Message[] = [
      { role: "assistant", content: SHOWCASE_GREETING },
    ];
    setMessages(fresh);
    setInput("");
    setIsSubmitting(false);
    setTypingMessageIndex(null);
    setAssistantMessageWithPrompt(null);
    setExpandedPrompts(new Set());
    setLoadingQuestions(new Set());
    setStreamingAssistantIndex(null);
    setAssistantRevealBusyIndex(null);
    void (async () => {
      const title = await resolveChatTitle(fresh, SHOWCASE_CHAT_ID);
      addChatToHistory({
        id: SHOWCASE_CHAT_ID,
        title,
        messages: fresh,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    })();
    queueMicrotask(() => scrollPanelToBottom("auto"));
  }, [scrollPanelToBottom]);

  const persistMessages = useCallback((newMessages: Message[]) => {
    void (async () => {
      const existing = getChatById(SHOWCASE_CHAT_ID);
      const title = await resolveChatTitle(newMessages, SHOWCASE_CHAT_ID);
      addChatToHistory({
        id: SHOWCASE_CHAT_ID,
        title,
        messages: newMessages,
        createdAt: existing?.createdAt ?? Date.now(),
        updatedAt: Date.now(),
      });
    })();
  }, []);

  useEffect(() => {
    const saved = getChatById(SHOWCASE_CHAT_ID);
    if (saved?.messages?.length) {
      setMessages(saved.messages);
    }
  }, []);

  useEffect(() => {
    triggerFabAnimation();
  }, [triggerFabAnimation]);

  useEffect(() => {
    if (!open) return;
    scrollPanelToBottom("auto");
  }, [open, scrollPanelToBottom]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setAssistantMessageWithPrompt(null);
    const lastMessage =
      messages.length > 0 ? messages[messages.length - 1] : null;
    const isTypingComplete = typingMessageIndex === null;
    const streamIdle =
      streamingAssistantIndex === null && assistantRevealBusyIndex === null;
    const hasUserMessage = messages.some((m) => m.role === "user");

    if (
      hasUserMessage &&
      messages.length > 0 &&
      lastMessage?.role === "assistant" &&
      !isSubmitting &&
      isTypingComplete &&
      streamIdle
    ) {
      const lastAssistantIndex = messages.length - 1;
      timerRef.current = setTimeout(() => {
        setAssistantMessageWithPrompt(lastAssistantIndex);
      }, 10000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [
    messages.length,
    isSubmitting,
    typingMessageIndex,
    streamingAssistantIndex,
    assistantRevealBusyIndex,
  ]);

  useEffect(() => {
    scrollPanelToBottom("smooth");
  }, [
    messages.length,
    isSubmitting,
    typingMessageIndex,
    streamingAssistantIndex,
    assistantRevealBusyIndex,
    messages,
    scrollPanelToBottom,
  ]);

  useEffect(() => {
    if (
      (typingMessageIndex !== null ||
        streamingAssistantIndex !== null ||
        assistantRevealBusyIndex !== null) &&
      open
    ) {
      const id = window.setInterval(() => {
        scrollPanelToBottom("auto");
      }, 50);
      return () => clearInterval(id);
    }
  }, [
    typingMessageIndex,
    streamingAssistantIndex,
    assistantRevealBusyIndex,
    open,
    scrollPanelToBottom,
  ]);

  const handleSubmit = async (
    questionText?: string,
    showProfilePhotoWithReply = false
  ) => {
    const textToSubmit = questionText || input;
    const text = typeof textToSubmit === "string" ? textToSubmit.trim() : "";
    if (!text || isSubmitting) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    setAssistantMessageWithPrompt(null);

    setInput("");
    const userMessage: Message = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    setIsSubmitting(true);

    const outgoingMessages = [...messages, userMessage];
    const assistantIndex = updatedMessages.length;

    const assistantShell: Message = {
      role: "assistant",
      content: "",
      ...(showProfilePhotoWithReply ? { showProfilePhoto: true } : {}),
    };

    let streamFinishedOk = false;
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": getOrCreateBrowserId(),
        },
        body: JSON.stringify({ messages: outgoingMessages }),
      });

      const contentType = response.headers.get("content-type") ?? "";

      if (!response.ok) {
        let errorMessage = "Failed to get response from API";
        try {
          const errorData = (await response.json()) as {
            error?: string;
            detail?: string;
          };
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `API error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      if (!contentType.includes("text/event-stream")) {
        throw new Error("스트리밍 응답이 아닙니다. 서버를 확인해 주세요.");
      }

      setMessages([...updatedMessages, assistantShell]);
      setStreamingAssistantIndex(assistantIndex);
      setAssistantRevealBusyIndex(assistantIndex);

      const reader = response.body?.getReader();
      if (!reader) throw new Error("응답 본문을 읽을 수 없습니다.");

      const decoder = new TextDecoder();
      let sseBuffer = "";
      let streamDone = false;

      outer: while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        sseBuffer += decoder.decode(value, { stream: true });

        let nl: number;
        while ((nl = sseBuffer.indexOf("\n")) >= 0) {
          const line = sseBuffer.slice(0, nl).trim();
          sseBuffer = sseBuffer.slice(nl + 1);
          if (!line.startsWith("data:")) continue;
          const raw = line.slice(5).trim();
          if (!raw) continue;

          try {
            const payload = JSON.parse(raw) as { delta?: string; done?: boolean };
            if (typeof payload.delta === "string" && payload.delta.length > 0) {
              setMessages((prev) => {
                const next = [...prev];
                const m = next[assistantIndex];
                if (m?.role === "assistant") {
                  next[assistantIndex] = {
                    ...m,
                    content: m.content + payload.delta,
                  };
                }
                return next;
              });
            }
            if (payload.done === true) {
              streamDone = true;
              break outer;
            }
          } catch {
            /* skip */
          }
        }
      }

      reader.releaseLock();

      if (!streamDone) {
        console.warn("[/api/chat] stream ended without done flag");
      }

      setMessages((prev) => {
        const next = [...prev];
        const m = next[assistantIndex];
        if (m?.role === "assistant" && m.content.trim() === "") {
          next[assistantIndex] = {
            ...m,
            content: "죄송합니다. 답변을 받지 못했습니다. 다시 시도해 주세요.",
          };
        }
        const out = next;
        queueMicrotask(() => persistMessages(out));
        return out;
      });

      setTimeout(() => scrollPanelToBottom("smooth"), 100);
      streamFinishedOk = true;
    } catch (error) {
      console.error("Error calling chat API:", error);
      const errorContent =
        error instanceof Error
          ? `죄송합니다. 오류가 발생했습니다: ${error.message}`
          : "죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.";
      setMessages((prev) => {
        const next = [...prev];
        const m = next[assistantIndex];
        if (m?.role === "assistant") {
          next[assistantIndex] = { ...m, content: errorContent };
        } else {
          next.push({
            role: "assistant",
            content: errorContent,
            ...(showProfilePhotoWithReply ? { showProfilePhoto: true } : {}),
          });
        }
        queueMicrotask(() => persistMessages(next));
        return next;
      });
    } finally {
      setStreamingAssistantIndex(null);
      setIsSubmitting(false);
      if (!streamFinishedOk) {
        setAssistantRevealBusyIndex(null);
      }
    }
  };

  const handleFormSubmit = () => handleSubmit();

  const handleKeywordSelect = (pillId: KeywordPillId, label: string) => {
    handleSubmit(label, pillId === "profile");
  };

  const handleInterviewerPromptClick = async (assistantIndex: number) => {
    if (loadingQuestions.has(assistantIndex)) return;

    const assistantMessage = messages[assistantIndex];

    if (expandedPrompts.has(assistantIndex)) {
      setExpandedPrompts((prev) => {
        const next = new Set(prev);
        next.delete(assistantIndex);
        return next;
      });
      return;
    }

    if (
      assistantMessage.interviewerQuestions &&
      assistantMessage.interviewerQuestions.length > 0
    ) {
      setExpandedPrompts((prev) => new Set(prev).add(assistantIndex));
      return;
    }

    setLoadingQuestions((prev) => new Set(prev).add(assistantIndex));

    try {
      const idxBeforeUser = assistantIndex - 2;
      const isFirstQuestionInTopic =
        idxBeforeUser < 0 || messages[idxBeforeUser]?.role !== "assistant";

      const response = await fetch("/api/interviewer-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.slice(0, assistantIndex + 1),
          isFirstQuestionInTopic,
        }),
      });

      if (!response.ok) throw new Error("Failed to get interviewer questions");

      const data = await response.json();
      if (data.questions && Array.isArray(data.questions)) {
        const updatedMessages = messages.map((msg, i) =>
          i === assistantIndex
            ? { ...msg, interviewerQuestions: data.questions }
            : msg
        );
        setMessages(updatedMessages);
        persistMessages(updatedMessages);
        setExpandedPrompts((prev) => new Set(prev).add(assistantIndex));
        setTimeout(() => scrollPanelToBottom("smooth"), 150);
      }
    } catch (error) {
      console.error("Error fetching interviewer questions:", error);
      const defaultQuestions = [
        "어떤 역량을 보고 싶으신가요?",
        "디자이너 기준은 무엇인가요?",
      ];
      const updatedMessages = messages.map((msg, i) =>
        i === assistantIndex
          ? { ...msg, interviewerQuestions: defaultQuestions }
          : msg
      );
      setMessages(updatedMessages);
      persistMessages(updatedMessages);
      setExpandedPrompts((prev) => new Set(prev).add(assistantIndex));
      setTimeout(() => scrollPanelToBottom("smooth"), 150);
    } finally {
      setLoadingQuestions((prev) => {
        const next = new Set(prev);
        next.delete(assistantIndex);
        return next;
      });
    }
  };

  const handleQuestionClick = (question: string) => {
    handleSubmit(question);
  };

  const hasPinnedGreeting =
    messages[0]?.role === "assistant" &&
    messages[0]?.content === SHOWCASE_GREETING;
  const conversationStartIndex = hasPinnedGreeting ? 1 : 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`showcase-chat-fab-ring fixed bottom-5 right-5 z-[40] h-14 w-14 md:bottom-7 md:right-7 ${
          fabAnimating ? "showcase-chat-fab-ring--animate" : ""
        }`}
        aria-expanded={open}
        aria-controls="showcase-chat-panel"
        aria-label={open ? "채팅 닫기" : "채팅 열기"}
      >
        <span className="showcase-chat-fab-inner">
          {open ? (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          )}
        </span>
      </button>

      {open ? (
        <div
          id="showcase-chat-panel"
          data-theme="light"
          role="dialog"
          aria-modal="false"
          aria-label="동료봇 🤖 채팅"
          className="fixed bottom-[5.25rem] right-5 z-[40] flex h-[min(520px,calc(100dvh-8rem))] w-[min(100vw-2rem,420px)] flex-col overflow-hidden rounded-2xl bg-[var(--main-bg)] shadow-[0_24px_70px_rgba(15,23,42,0.28)] [--background:#FFFFFF] [--subtle-gray:#EFEFF1] [--border:#E5E7EB] [--text-primary:#0F111D] [--text-secondary:#6B7280] [--accent:#6D5EF3] [--main-bg:#FFFFFF] [--pill-bg:#EFEFF1] md:bottom-[5.5rem] md:right-7"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-neutral-100/70 px-4 py-3">
            <p
              className={`${SHOWCASE_CHAT_TITLE_CLASS} font-semibold text-neutral-900`}
            >
              동료봇 🤖
            </p>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={resetConversation}
                className="rounded-lg p-1.5 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
                aria-label="대화 초기화"
                title="대화 초기화"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M21 12a9 9 0 1 1-2.64-6.36" />
                  <path d="M21 3v7h-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
                aria-label="패널 닫기"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div
            ref={scrollContainerRef}
            className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain bg-neutral-50/70 px-3 py-3"
          >
            <div className="pb-2">
              {hasPinnedGreeting ? (
                <ChatMessage
                  compactFont
                  forceLightTheme
                  role={messages[0]!.role}
                  content={messages[0]!.content}
                  showProfilePhoto={messages[0]!.showProfilePhoto === true}
                  isTyping={typingMessageIndex === 0}
                  isStreaming={streamingAssistantIndex === 0}
                  interviewerQuestions={messages[0]!.interviewerQuestions}
                  showInterviewerPrompt={assistantMessageWithPrompt === 0 && !isSubmitting}
                  isLoadingQuestions={loadingQuestions.has(0)}
                  isPromptExpanded={expandedPrompts.has(0)}
                  onInterviewerPromptClick={() => handleInterviewerPromptClick(0)}
                  onQuestionClick={(question) => handleQuestionClick(question)}
                  onAssistantStreamComplete={() => {
                    setAssistantRevealBusyIndex((prev) => (prev === 0 ? null : prev));
                    setTypingMessageIndex(null);
                    queueMicrotask(() => {
                      persistMessages(messagesRef.current);
                    });
                    setTimeout(() => scrollPanelToBottom("smooth"), 100);
                  }}
                />
              ) : null}
              <div className="mt-3 flex justify-start">
                <KeywordPills
                  compact
                  forceLightTheme
                  pillTextClassName={SHOWCASE_CHAT_TAB_CLASS}
                  onSelect={handleKeywordSelect}
                  disabled={isSubmitting}
                />
              </div>
              {messages.slice(conversationStartIndex).map((msg, i) => {
                const realIndex = i + conversationStartIndex;
                const isAssistantMessage = msg.role === "assistant";
                const showPrompt =
                  isAssistantMessage &&
                  assistantMessageWithPrompt === realIndex &&
                  !isSubmitting;
                const isLoading =
                  isAssistantMessage && loadingQuestions.has(realIndex);
                const isExpanded =
                  isAssistantMessage && expandedPrompts.has(realIndex);

                const prevMessage =
                  realIndex > 0 ? messages[realIndex - 1] : null;
                const isSetBreak =
                  prevMessage?.role === "assistant" && msg.role === "user";
                const isQuestionAnswer =
                  prevMessage?.role === "user" && msg.role === "assistant";

                let marginClass = "";
                if (isSetBreak) marginClass = "mt-[48px]";
                else if (isQuestionAnswer) marginClass = "mt-[20px]";
                else marginClass = "mt-3";

                return (
                  <div key={realIndex} className={marginClass}>
                    <ChatMessage
                      compactFont
                      forceLightTheme
                      role={msg.role}
                      content={msg.content}
                      showProfilePhoto={
                        msg.role === "assistant"
                          ? msg.showProfilePhoto === true
                          : false
                      }
                      isTyping={
                        typingMessageIndex === realIndex &&
                        msg.role === "assistant"
                      }
                      isStreaming={
                        streamingAssistantIndex === realIndex &&
                        msg.role === "assistant"
                      }
                      interviewerQuestions={
                        isAssistantMessage ? msg.interviewerQuestions : undefined
                      }
                      showInterviewerPrompt={showPrompt}
                      isLoadingQuestions={isLoading}
                      isPromptExpanded={isExpanded}
                      onInterviewerPromptClick={
                        isAssistantMessage
                          ? () => handleInterviewerPromptClick(realIndex)
                          : undefined
                      }
                      onQuestionClick={(question) =>
                        handleQuestionClick(question)
                      }
                      onAssistantStreamComplete={
                        msg.role === "assistant"
                          ? () => {
                              setAssistantRevealBusyIndex((prev) =>
                                prev === realIndex ? null : prev
                              );
                              setTypingMessageIndex(null);
                              queueMicrotask(() => {
                                persistMessages(messagesRef.current);
                              });
                              setTimeout(
                                () => scrollPanelToBottom("smooth"),
                                100
                              );
                            }
                          : undefined
                      }
                    />
                  </div>
                );
              })}
              {isSubmitting && streamingAssistantIndex === null && (
                <div
                  className="flex justify-start"
                  role="status"
                  aria-live="polite"
                >
                  <div
                    className={`rounded-2xl bg-[var(--subtle-gray)] px-4 py-3 ${SHOWCASE_CHAT_BODY_CLASS} text-[var(--text-secondary)] animate-pulse`}
                  >
                    답변을 작성하고 있어요...
                  </div>
                </div>
              )}
              <div aria-hidden className="h-px w-full shrink-0" />
            </div>
          </div>

          <div className="mt-auto shrink-0 bg-neutral-50/70 p-3">
            <div className="[&_.input-border-gradient-inner]:!bg-[var(--main-bg)]">
              <ChatInput
                value={input}
                onChange={setInput}
                onSubmit={handleFormSubmit}
                placeholder="무엇이든 물어보세요"
                disabled={isSubmitting}
                compact
                textSizeClass={SHOWCASE_CHAT_BODY_CLASS}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
