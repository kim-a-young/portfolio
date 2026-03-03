"use client";

import { useState, useCallback, useEffect } from "react";
import { MainChat } from "./MainChat";
import { Sidebar } from "./Sidebar";
import { ThemeToggle } from "./ThemeToggle";
import { ProjectView } from "./ProjectView";
import { HeroAnimation } from "./HeroAnimation";
import { useChatHistory } from "@/lib/useChatHistory";
import {
  getChatHistory,
  addChatToHistory,
  generateChatTitle,
  type ChatHistory,
  type Message,
} from "@/lib/chatHistory";

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const chatHistory = useChatHistory();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [introStage, setIntroStage] = useState<"enter" | "exit" | "hidden">("enter");

  // 첫 진입시 화려한 인트로 애니메이션 (메인 아이콘으로 빨려 들어가듯)
  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setIntroStage("exit");
    }, 1400);

    const hideTimer = setTimeout(() => {
      setIntroStage("hidden");
    }, 2400);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  // 새 채팅 시작 (프로젝트 화면에서도 항상 채팅 화면으로 전환)
  const handleNewChat = useCallback(() => {
    setSelectedProject(null);
    setCurrentChatId(null);
    setMessages([]);
  }, []);

  // 채팅 선택
  const handleSelectChat = useCallback((chatId: string) => {
    const chat = getChatHistory().find((c) => c.id === chatId);
    if (chat) {
      setCurrentChatId(chat.id);
      setMessages(chat.messages);
      setSelectedProject(null); // 프로젝트 선택 해제
    }
  }, []);

  // 프로젝트 선택
  const handleSelectProject = useCallback((projectId: string) => {
    setSelectedProject(projectId);
    // (채팅 히스토리는 유지) 화면 전환 시 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  // 홈으로 이동 (인트로 없이 메인 채팅 화면으로)
  const handleGoHome = useCallback(() => {
    setSelectedProject(null);
    setSidebarOpen(false);
  }, []);

  // 메시지 변경 시 히스토리 저장
  const handleMessagesChange = useCallback(
    (newMessages: Message[]) => {
      setMessages(newMessages);

      if (newMessages.length === 0) return;

      const now = Date.now();
      const chatIdToUse = currentChatId || `chat-${now}`;

      if (!currentChatId) {
        setCurrentChatId(chatIdToUse);
      }

      const title = generateChatTitle(newMessages);
      const chat: ChatHistory = {
        id: chatIdToUse,
        title,
        messages: newMessages,
        createdAt: currentChatId ? getChatHistory().find((c) => c.id === currentChatId)?.createdAt || now : now,
        updatedAt: now,
      };

      addChatToHistory(chat);
    },
    [currentChatId]
  );

  return (
    <div className="flex min-h-screen bg-[var(--main-bg)]">
      {/* 풀스크린 인트로 오버레이 */}
      {introStage !== "hidden" && (
        <div
          className={`fixed inset-0 z-40 flex items-center justify-center bg-[radial-gradient(circle_at_top,_#4c1d95_0,_#1d4ed8_30%,_#020617_65%,_#000000_100%)] text-white transition-opacity duration-700 ${
            introStage === "exit" ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <div className="relative flex flex-col items-center gap-6">
            {/* 아이콘만 빨려 들어가듯 이동/회전 */}
            <div
              className={`transform transition-all duration-800 ease-out ${
                introStage === "exit"
                  ? "translate-y-[-140px] scale-50 rotate-180 opacity-0"
                  : "translate-y-0 scale-100 rotate-0 opacity-100"
              }`}
            >
              <div className="animate-[ping_1.4s_ease-out_infinite] rounded-full border border-blue-400/40 p-6">
                <div className="scale-125 transform drop-shadow-[0_0_80px_rgba(129,140,248,0.9)]">
                  <HeroAnimation />
                </div>
              </div>
            </div>

            {/* 텍스트는 고정 위치/스타일 유지 */}
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.4em] text-blue-200/80">
                AYOUNG DESIGN PORTFOLIO
              </p>
              <p className="mt-3 text-xl font-semibold tracking-tight md:text-2xl">
                담당자님, 이쪽으로 모시겠습니다
              </p>
            </div>
          </div>
        </div>
      )}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onSelectProject={handleSelectProject}
        onGoHome={handleGoHome}
        chatHistory={chatHistory}
        currentChatId={currentChatId}
        selectedProject={selectedProject}
      />
      <div
        className={`relative flex min-w-0 flex-1 flex-col transition-[margin] duration-200 ${
          sidebarOpen ? "md:ml-[260px]" : ""
        }`}
      >
        <div className="fixed right-3 top-3 z-20 flex items-center gap-2">
          <ThemeToggle />
          {!sidebarOpen && (
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="fixed left-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--icon)] transition-colors hover:bg-[var(--subtle-gray)]"
            aria-label="메뉴 열기"
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
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
          )}
        </div>
        {selectedProject === "projects" ? (
          <ProjectView projectId={selectedProject} />
        ) : (
          <MainChat
            chatId={currentChatId || undefined}
            initialMessages={messages}
            onMessagesChange={handleMessagesChange}
            sidebarOpen={sidebarOpen}
          />
        )}
      </div>
    </div>
  );
}
