"use client";

import { useState, useCallback, useEffect } from "react";
import { MainChat } from "./MainChat";
import { Sidebar } from "./Sidebar";
import { ThemeToggle } from "./ThemeToggle";
import { ProjectView } from "./ProjectView";
import { useChatHistory } from "@/lib/useChatHistory";
import {
  getChatHistory,
  addChatToHistory,
  generateChatTitle,
  type ChatHistory,
  type Message,
} from "@/lib/chatHistory";

export function Layout() {
  const introParticles = [
    // 중앙 큰 알맹이 (더 선명)
    { left: "48.5%", top: "36%", size: 20, opacity: 0.95, delay: "0s", dur: "2.8s", color: "#61bcf8" },
    { left: "51.5%", top: "38.5%", size: 18, opacity: 0.9, delay: "0.2s", dur: "3.1s", color: "#7b2bd6" },
    { left: "50%", top: "41%", size: 16, opacity: 0.92, delay: "0.35s", dur: "2.9s", color: "#61bcf8" },
    { left: "46.8%", top: "39.5%", size: 14, opacity: 0.85, delay: "0.15s", dur: "3.2s", color: "#7b2bd6" },
    { left: "53.2%", top: "40.2%", size: 15, opacity: 0.86, delay: "0.45s", dur: "3s", color: "#61bcf8" },
    // 바깥 작은 알맹이 (더 투명)
    { left: "43%", top: "34%", size: 8, opacity: 0.45, delay: "0.25s", dur: "2.7s", color: "#7b2bd6" },
    { left: "57%", top: "34.5%", size: 7, opacity: 0.42, delay: "0.4s", dur: "2.9s", color: "#61bcf8" },
    { left: "41.5%", top: "41%", size: 6, opacity: 0.38, delay: "0.55s", dur: "3.1s", color: "#61bcf8" },
    { left: "58.5%", top: "42%", size: 7, opacity: 0.4, delay: "0.1s", dur: "2.8s", color: "#7b2bd6" },
    { left: "45%", top: "45%", size: 6, opacity: 0.35, delay: "0.5s", dur: "3.3s", color: "#61bcf8" },
    { left: "55.5%", top: "45.5%", size: 6, opacity: 0.35, delay: "0.3s", dur: "3s", color: "#7b2bd6" },
    { left: "50%", top: "31.8%", size: 5, opacity: 0.32, delay: "0.6s", dur: "2.6s", color: "#61bcf8" },
  ];

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
    }, 2200);

    const hideTimer = setTimeout(() => {
      setIntroStage("hidden");
    }, 3400);

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
          className={`fixed inset-0 z-40 flex items-center justify-center text-white transition-opacity duration-700 ${
            introStage === "exit" ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
          style={{
            background:
              "radial-gradient(circle at 50% 46%, #040100 0%, #040100 20%, #07112a 56%, #102d66 100%)",
          }}
        >
          {/* 텍스트 위쪽 입자 군집 (모였다 퍼졌다 + exit 시 아이콘 쪽으로 빨려감) */}
          <div
            className={`pointer-events-none absolute inset-0 transition-all duration-800 ease-out ${
              introStage === "exit"
                ? "translate-y-[-90px] scale-50 opacity-0"
                : "translate-y-0 scale-100 opacity-100"
            }`}
            style={{
              animation: "intro-cluster-breathe 3.1s ease-in-out infinite",
              transformOrigin: "50% 40%",
            }}
          >
            {introParticles.map((p, index) => (
              <span
                key={index}
                className="absolute rounded-full"
                style={{
                  left: p.left,
                  top: p.top,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  opacity: p.opacity,
                  backgroundColor: p.color,
                  boxShadow:
                    p.color === "#7b2bd6"
                      ? "0 0 16px rgba(123,43,214,0.95)"
                      : "0 0 16px rgba(97,188,248,0.95)",
                  animation: `intro-particle-breathe ${p.dur} ease-in-out ${p.delay} infinite`,
                }}
              />
            ))}
          </div>

          <div className="relative flex flex-col items-center gap-6">
            {/* 텍스트는 고정 위치/스타일 유지 */}
            <div className="mt-24 text-center">
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
          <ProjectView projectId={selectedProject} sidebarOpen={sidebarOpen} />
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
