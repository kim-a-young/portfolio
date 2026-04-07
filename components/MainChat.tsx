"use client";

import { useState, useRef, useEffect } from "react";
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";
import { KeywordPills } from "./KeywordPills";
import { WelcomeBlock } from "./WelcomeBlock";
import type { KeywordPillId } from "@/lib/keywordPills";
import type { Message } from "@/lib/chatHistory";
import { getOrCreateBrowserId } from "@/lib/browserId";

interface MainChatProps {
  chatId?: string;
  initialMessages?: Message[];
  onMessagesChange?: (messages: Message[]) => void;
  sidebarOpen?: boolean;
}

export function MainChat({ chatId, initialMessages = [], onMessagesChange, sidebarOpen = false }: MainChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [typingMessageIndex, setTypingMessageIndex] = useState<number | null>(null);
  const [assistantMessageWithPrompt, setAssistantMessageWithPrompt] = useState<number | null>(null);
  const [expandedPrompts, setExpandedPrompts] = useState<Set<number>>(new Set());
  const [loadingQuestions, setLoadingQuestions] = useState<Set<number>>(new Set());
  /** SSE로 답변이 오고 있는 어시스턴트 메시지 인덱스 */
  const [streamingAssistantIndex, setStreamingAssistantIndex] = useState<number | null>(null);
  /** SSE 종료 후에도 gptLike 따라가기 애니가 끝날 때까지 타이머·스크롤 유지 */
  const [assistantRevealBusyIndex, setAssistantRevealBusyIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollTopRef = useRef<number>(0);
  const isUserScrollingUpRef = useRef<boolean>(false);
  const messagesRef = useRef<Message[]>(messages);
  messagesRef.current = messages;

  // 초기 메시지가 변경되면 동기화
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // 다른 페이지에서 돌아왔을 때 스크롤을 하단으로 이동
  useEffect(() => {
    if (initialMessages.length > 0) {
      // 약간의 지연을 두어 DOM이 완전히 렌더링된 후 스크롤
      const timer = setTimeout(() => {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "auto" });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [chatId, initialMessages.length]);

  // 10초 타이머: 마지막 어시스턴트 메시지 완료 후 10초 경과 시 해당 어시스턴트 메시지에 "음...그..." 버튼 표시
  useEffect(() => {
    // 타이머 초기화
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setAssistantMessageWithPrompt(null);

    // 마지막 메시지가 어시스턴트 메시지이고, 타이핑이 완료되었고, 제출 중이 아닐 때만 타이머 시작
    const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
    const isTypingComplete = typingMessageIndex === null;
    const streamIdle =
      streamingAssistantIndex === null && assistantRevealBusyIndex === null;

    if (
      messages.length > 0 &&
      lastMessage?.role === "assistant" &&
      !isSubmitting &&
      isTypingComplete &&
      streamIdle
    ) {
      // 마지막 어시스턴트 메시지의 인덱스
      const lastAssistantIndex = messages.length - 1;
      
      timerRef.current = setTimeout(() => {
        setAssistantMessageWithPrompt(lastAssistantIndex);
      }, 10000); // 10초
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    messages.length,
    isSubmitting,
    typingMessageIndex,
    streamingAssistantIndex,
    assistantRevealBusyIndex,
  ]);

  const hasMessages = messages.length > 0;

  // 사용자가 위로 스크롤하는지 감지
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const isNearBottom = scrollHeight - currentScrollTop - clientHeight < 100; // 하단 100px 이내

      // 사용자가 위로 스크롤하고 있고 하단 근처가 아니면 자동 스크롤 비활성화
      if (currentScrollTop < lastScrollTopRef.current && !isNearBottom) {
        isUserScrollingUpRef.current = true;
      } else if (isNearBottom) {
        isUserScrollingUpRef.current = false;
      }

      lastScrollTopRef.current = currentScrollTop;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 메시지가 추가되거나 로딩 상태가 변경될 때 자동 스크롤 (페이지 스크롤)
  useEffect(() => {
    // 사용자가 위로 스크롤 중이면 자동 스크롤하지 않음
    if (isUserScrollingUpRef.current) return;

    const scrollToLatest = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const hasScroll = scrollHeight > clientHeight;

      if (hasScroll) {
        // 스크롤이 생기면 최신 메시지를 상단에 위치시키기 위해 스크롤을 최하단으로
        // 하지만 사용자가 요청한 대로 최신 질문이 상단에 오도록 하려면
        // 마지막 사용자 메시지를 찾아서 그 위치로 스크롤해야 함
        const lastUserMessageIndex = messages.length > 0 
          ? messages.map((msg, i) => ({ role: msg.role, index: i }))
              .filter(m => m.role === "user")
              .pop()?.index
          : -1;

        if (lastUserMessageIndex !== undefined && lastUserMessageIndex >= 0 && messagesEndRef.current) {
          // 최신 사용자 메시지가 상단에 오도록 스크롤
          messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          // 최신 메시지를 상단에 위치
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
          } else {
            window.scrollTo({ top: document.documentElement.scrollHeight - clientHeight, behavior: "smooth" });
          }
        }
      } else {
        // 스크롤이 없으면 하단에 맞춤
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
        }
      }
    };
    
    scrollToLatest();
    // 스크롤 후 사용자가 위로 스크롤 중이었던 상태 리셋
    isUserScrollingUpRef.current = false;
  }, [
    messages.length,
    isSubmitting,
    typingMessageIndex,
    streamingAssistantIndex,
    assistantRevealBusyIndex,
    messages,
  ]);

  // 타이핑·SSE 수신 중에도 스크롤이 따라가도록
  useEffect(() => {
    if (
      (typingMessageIndex !== null ||
        streamingAssistantIndex !== null ||
        assistantRevealBusyIndex !== null) &&
      !isUserScrollingUpRef.current
    ) {
      const scrollInterval = setInterval(() => {
        if (isUserScrollingUpRef.current) {
          clearInterval(scrollInterval);
          return;
        }
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        const hasScroll = scrollHeight > clientHeight;

        if (hasScroll) {
          // 스크롤이 있으면 상단에 맞춤
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "auto", block: "start" });
          } else {
            window.scrollTo({ top: document.documentElement.scrollHeight - clientHeight, behavior: "auto" });
          }
        } else {
          // 스크롤이 없으면 하단에 맞춤
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "auto", block: "end" });
          }
        }
      }, 50); // 50ms마다 스크롤 업데이트 (더 부드럽게)

      return () => clearInterval(scrollInterval);
    }
  }, [typingMessageIndex, streamingAssistantIndex, assistantRevealBusyIndex]);

  const handleSubmit = async (
    questionText?: string,
    /** 메인 키워드 '개인 프로필' pill로 보낸 질문일 때만 true */
    showProfilePhotoWithReply = false
  ) => {
    // questionText가 제공되면 사용하고, 없으면 input 사용
    const textToSubmit = questionText || input;
    const text = typeof textToSubmit === "string" ? textToSubmit.trim() : "";
    if (!text || isSubmitting) return;

    // 타이머 리셋
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setAssistantMessageWithPrompt(null);

    setInput("");
    const userMessage: Message = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    // 질문 제출 시 스크롤이 있으면 해당 질문이 상단에 오도록 조정
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    const hasScroll = scrollHeight > clientHeight;
    
    if (hasScroll) {
      setTimeout(() => {
        // 새로 추가된 사용자 메시지가 상단에 오도록 스크롤
        const messageElements = document.querySelectorAll('[role="article"]');
        if (messageElements.length > 0) {
          const lastMessageElement = messageElements[messageElements.length - 1] as HTMLElement;
          if (lastMessageElement) {
            lastMessageElement.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      }, 50);
    }
    
    // 사용자 메시지만으로는 히스토리 저장하지 않음 (어시스턴트 응답 후에만 저장)
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
          if (typeof errorData.detail === "string" && errorData.detail) {
            console.error("[/api/chat detail]", errorData.detail);
          }
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
      if (!reader) {
        throw new Error("응답 본문을 읽을 수 없습니다.");
      }

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
            /* 한 줄 파싱 실패는 건너뜀 */
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
        queueMicrotask(() => onMessagesChange?.(out));
        return out;
      });

      setTimeout(() => {
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        const hasScroll = scrollHeight > clientHeight;
        if (hasScroll) {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
          } else {
            window.scrollTo({
              top: document.documentElement.scrollHeight - clientHeight,
              behavior: "smooth",
            });
          }
        } else if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
        }
      }, 100);
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
        queueMicrotask(() => onMessagesChange?.(next));
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

  const handleInputChange = (value: string) => {
    setInput(value);
  };

  const handleFormSubmit = () => {
    // ChatInput에서 호출될 때는 인자 없이 호출되므로 input 사용
    handleSubmit();
  };

  const handleKeywordSelect = (pillId: KeywordPillId, label: string) => {
    handleSubmit(label, pillId === "profile");
  };

  const handleInterviewerPromptClick = async (assistantIndex: number) => {
    if (loadingQuestions.has(assistantIndex)) return;
    
    const assistantMessage = messages[assistantIndex];
    
    // 이미 확장되어 있으면 접기
    if (expandedPrompts.has(assistantIndex)) {
      setExpandedPrompts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(assistantIndex);
        return newSet;
      });
      return;
    }

    // 질문이 이미 있으면 확장만
    if (assistantMessage.interviewerQuestions && assistantMessage.interviewerQuestions.length > 0) {
      setExpandedPrompts((prev) => new Set(prev).add(assistantIndex));
      return;
    }

    setLoadingQuestions((prev) => new Set(prev).add(assistantIndex));

    try {
      /**
       * 직전 사용자 질문이 **이 주제 스레드의 첫 질문**일 때만 true.
       * (바로 위가 어시스턴트 답변이면 같은 주제를 이어 묻는 후속 질문 → false)
       */
      const idxBeforeUser = assistantIndex - 2;
      const isFirstQuestionInTopic =
        idxBeforeUser < 0 ||
        messages[idxBeforeUser]?.role !== "assistant";

      const response = await fetch("/api/interviewer-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages.slice(0, assistantIndex + 1), // 해당 답변까지의 대화 전달
          isFirstQuestionInTopic,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get interviewer questions");
      }

      const data = await response.json();
      if (data.questions && Array.isArray(data.questions)) {
        // 해당 assistant 메시지에 질문 추가
        const updatedMessages = messages.map((msg, i) => 
          i === assistantIndex 
            ? { ...msg, interviewerQuestions: data.questions }
            : msg
        );
        setMessages(updatedMessages);
        onMessagesChange?.(updatedMessages);
        setExpandedPrompts((prev) => new Set(prev).add(assistantIndex));
        // 질문이 추가된 후 스크롤 이동
        setTimeout(() => {
          const scrollHeight = document.documentElement.scrollHeight;
          const clientHeight = document.documentElement.clientHeight;
          const hasScroll = scrollHeight > clientHeight;

          if (hasScroll) {
            if (messagesEndRef.current) {
              messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
            } else {
              window.scrollTo({ top: document.documentElement.scrollHeight - clientHeight, behavior: "smooth" });
            }
          } else {
            if (messagesEndRef.current) {
              messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
            }
          }
        }, 150);
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
      onMessagesChange?.(updatedMessages);
      setExpandedPrompts((prev) => new Set(prev).add(assistantIndex));
      // 질문이 추가된 후 스크롤 이동
      setTimeout(() => {
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        const hasScroll = scrollHeight > clientHeight;

        if (hasScroll) {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
          } else {
            window.scrollTo({ top: document.documentElement.scrollHeight - clientHeight, behavior: "smooth" });
          }
        } else {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
          }
        }
      }, 150);
    } finally {
      setLoadingQuestions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(assistantIndex);
        return newSet;
      });
    }
  };

  const handleQuestionClick = (question: string) => {
    handleSubmit(question);
  };

  return (
    <main className="flex min-h-svh flex-col bg-[var(--main-bg)]">
      <div className="mx-auto flex min-h-0 w-full max-w-[var(--main-content-max)] flex-1 flex-col px-4 pb-[30px] pt-[30px]">
        {!hasMessages ? (
          <WelcomeBlock
            input={input}
            onInputChange={handleInputChange}
            onSubmit={handleFormSubmit}
            onKeywordSelect={handleKeywordSelect}
            isSubmitting={isSubmitting}
          />
        ) : (
          <>
            <div className="py-4 pb-[200px]">
              {messages.map((msg, i) => {
                const isAssistantMessage = msg.role === "assistant";
                const showPrompt = isAssistantMessage && assistantMessageWithPrompt === i && !isSubmitting;
                const isLoading = isAssistantMessage && loadingQuestions.has(i);
                const isExpanded = isAssistantMessage && expandedPrompts.has(i);
                
                // 여백 로직
                const prevMessage = i > 0 ? messages[i - 1] : null;
                const isSetBreak = prevMessage?.role === "assistant" && msg.role === "user"; // 세트 간 여백 (80px)
                const isQuestionAnswer = prevMessage?.role === "user" && msg.role === "assistant"; // 질문-답변 간 여백 (30px)
                
                let marginClass = "";
                if (isSetBreak) {
                  marginClass = "mt-[80px]"; // 세트 간 여백
                } else if (isQuestionAnswer) {
                  marginClass = "mt-[30px]"; // 질문-답변 간 여백
                } else if (i > 0) {
                  marginClass = "mt-4"; // 기본 여백
                }
                
                return (
                  <div key={i} className={marginClass}>
                    <ChatMessage
                      role={msg.role}
                      content={msg.content}
                      showProfilePhoto={
                        msg.role === "assistant" ? msg.showProfilePhoto === true : false
                      }
                      isTyping={typingMessageIndex === i && msg.role === "assistant"}
                      isStreaming={streamingAssistantIndex === i && msg.role === "assistant"}
                      interviewerQuestions={isAssistantMessage ? msg.interviewerQuestions : undefined}
                      showInterviewerPrompt={showPrompt}
                      isLoadingQuestions={isLoading}
                      isPromptExpanded={isExpanded}
                      onInterviewerPromptClick={isAssistantMessage ? () => handleInterviewerPromptClick(i) : undefined}
                      onQuestionClick={(question) => handleQuestionClick(question)}
                      onAssistantStreamComplete={
                        msg.role === "assistant"
                          ? () => {
                              setAssistantRevealBusyIndex((prev) =>
                                prev === i ? null : prev
                              );
                              setTypingMessageIndex(null);
                              queueMicrotask(() => {
                                onMessagesChange?.(messagesRef.current);
                              });
                              setTimeout(() => {
                                const scrollHeight = document.documentElement.scrollHeight;
                                const clientHeight = document.documentElement.clientHeight;
                                const hasScroll = scrollHeight > clientHeight;

                                if (hasScroll) {
                                  if (messagesEndRef.current) {
                                    messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
                                  } else {
                                    window.scrollTo({
                                      top: document.documentElement.scrollHeight - clientHeight,
                                      behavior: "smooth",
                                    });
                                  }
                                } else if (messagesEndRef.current) {
                                  messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
                                }
                              }, 100);
                            }
                          : undefined
                      }
                    />
                  </div>
                );
              })}
              {isSubmitting && streamingAssistantIndex === null && (
                <div className="flex justify-start" role="status" aria-live="polite">
                  <div className="rounded-2xl bg-[var(--subtle-gray)] px-4 py-3 text-[var(--text-secondary)] animate-pulse">
                    답변을 작성하고 있어요...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div 
              className={`fixed bottom-0 z-10 bg-[var(--main-bg)] px-4 py-4 transition-[left] duration-200 ${
                sidebarOpen ? "md:left-[260px]" : "left-0"
              }`}
              style={{ 
                right: 0,
              }}
            >
              <div className="mx-auto flex max-w-[var(--main-content-max)] flex-col gap-3">
                <ChatInput
                  value={input}
                  onChange={handleInputChange}
                  onSubmit={handleFormSubmit}
                  placeholder="함께 일해 본 동료 AI가 뭐든 대답해 드려요"
                  disabled={isSubmitting}
                  compact={true}
                />
                <KeywordPills onSelect={handleKeywordSelect} disabled={isSubmitting} />
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
