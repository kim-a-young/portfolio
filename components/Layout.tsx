"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { MainChat } from "./MainChat";
import { Sidebar } from "./Sidebar";
import { ThemeToggle } from "./ThemeToggle";
import { ProjectView } from "./ProjectView";
import { useChatHistory } from "@/lib/useChatHistory";
import {
  getChatHistory,
  addChatToHistory,
  resolveChatTitle,
  type ChatHistory,
  type Message,
} from "@/lib/chatHistory";

type LayoutProps = {
  /** 인트로가 끝난 뒤 메인이 보일 때만 true — 이 시점에만 메뉴 힌트 표시 */
  mainEntered?: boolean;
};

export function Layout({ mainEntered = true }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const chatHistory = useChatHistory();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showMenuProjectHint, setShowMenuProjectHint] = useState(false);
  const [menuHintExiting, setMenuHintExiting] = useState(false);
  /** 저장되지 않은 새 스레드용 id — MainChat chatId와 첫 저장 시 동일해야 함 */
  const [draftThreadId, setDraftThreadId] = useState(() => `chat-${Date.now()}`);
  const menuHintShowTimerRef = useRef<number | null>(null);
  const menuHintExitTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mainEntered) {
      if (menuHintShowTimerRef.current) {
        window.clearTimeout(menuHintShowTimerRef.current);
        menuHintShowTimerRef.current = null;
      }
      if (menuHintExitTimerRef.current) {
        window.clearTimeout(menuHintExitTimerRef.current);
        menuHintExitTimerRef.current = null;
      }
      queueMicrotask(() => {
        setShowMenuProjectHint(false);
        setMenuHintExiting(false);
      });
      return;
    }

    /** 말풍선 최초 등장까지 지연. 등장 애니는 globals `menu-hint-in` / 퇴장은 `menu-project-hint-out`과 맞춤 */
    const HINT_DELAY_MS = 1200;
    menuHintShowTimerRef.current = window.setTimeout(() => {
      menuHintShowTimerRef.current = null;
      setShowMenuProjectHint(true);
      setMenuHintExiting(false);
    }, HINT_DELAY_MS);

    return () => {
      if (menuHintShowTimerRef.current) {
        window.clearTimeout(menuHintShowTimerRef.current);
        menuHintShowTimerRef.current = null;
      }
      if (menuHintExitTimerRef.current) {
        window.clearTimeout(menuHintExitTimerRef.current);
        menuHintExitTimerRef.current = null;
      }
    };
  }, [mainEntered]);

  /** 메뉴(햄버거) 클릭 시에만 말풍선을 닫음 — 자동 숨김 없음 */
  const FADE_OUT_MATCH_CSS_MS = 1200;

  const handleOpenMenu = useCallback(() => {
    setSidebarOpen(true);

    if (menuHintShowTimerRef.current) {
      window.clearTimeout(menuHintShowTimerRef.current);
      menuHintShowTimerRef.current = null;
    }

    setShowMenuProjectHint((wasShown) => {
      if (!wasShown) return wasShown;
      requestAnimationFrame(() => {
        setMenuHintExiting(true);
        if (menuHintExitTimerRef.current) {
          window.clearTimeout(menuHintExitTimerRef.current);
        }
        menuHintExitTimerRef.current = window.setTimeout(() => {
          menuHintExitTimerRef.current = null;
          setShowMenuProjectHint(false);
          setMenuHintExiting(false);
        }, FADE_OUT_MATCH_CSS_MS);
      });
      return wasShown;
    });
  }, []);

  const effectiveChatId = currentChatId ?? draftThreadId;

  const handleNewChat = useCallback(() => {
    setSelectedProject(null);
    setDraftThreadId(`chat-${Date.now()}`);
    setCurrentChatId(null);
    setMessages([]);
  }, []);

  const handleSelectChat = useCallback((chatId: string) => {
    const chat = getChatHistory().find((c) => c.id === chatId);
    if (chat) {
      setCurrentChatId(chat.id);
      setMessages(chat.messages);
      setSelectedProject(null);
    }
  }, []);

  const handleSelectProject = useCallback((projectId: string) => {
    setSelectedProject(projectId);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const handleGoHome = useCallback(() => {
    setSelectedProject(null);
    setSidebarOpen(false);
  }, []);

  const handleMessagesChange = useCallback(
    (newMessages: Message[]) => {
      setMessages(newMessages);

      if (newMessages.length === 0) return;

      const now = Date.now();
      const chatIdToUse = currentChatId ?? draftThreadId;

      if (!currentChatId) {
        setCurrentChatId(chatIdToUse);
      }

      void (async () => {
        const title = await resolveChatTitle(newMessages, chatIdToUse);

        const existing = getChatHistory().find((c) => c.id === chatIdToUse);
        const chat: ChatHistory = {
          id: chatIdToUse,
          title,
          messages: newMessages,
          createdAt: existing?.createdAt ?? now,
          updatedAt: Date.now(),
        };

        addChatToHistory(chat);
      })();
    },
    [currentChatId, draftThreadId]
  );

  return (
    <div className="flex min-h-screen bg-[var(--main-bg)]">
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
        </div>
        {!sidebarOpen && (
          <div className="fixed left-3 top-3 z-50 flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenMenu}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--icon)] transition-colors hover:bg-[var(--subtle-gray)]"
              aria-label="메뉴 열기"
              aria-describedby={
                showMenuProjectHint ? "menu-project-hint" : undefined
              }
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
            {showMenuProjectHint && (
              <div
                id="menu-project-hint"
                role="status"
                className={`menu-project-hint-pop pointer-events-none relative max-w-[min(17rem,calc(100vw-5.5rem))] origin-left ${menuHintExiting ? "menu-project-hint-out" : ""}`}
              >
                <div className="relative rounded-2xl border border-zinc-600 bg-[#0f0f10] px-3.5 py-2 text-sm leading-snug text-zinc-100">
                  <span
                    className="pointer-events-none absolute left-0 top-1/2 z-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-l border-zinc-600 bg-[#0f0f10]"
                    aria-hidden
                  />
                  <span className="relative z-10 block">
                    프로젝트 내용을 확인하세요
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
        {selectedProject === "projects" ? (
          <ProjectView projectId={selectedProject} sidebarOpen={sidebarOpen} />
        ) : (
          <MainChat
            chatId={effectiveChatId}
            initialMessages={messages}
            onMessagesChange={handleMessagesChange}
            sidebarOpen={sidebarOpen}
          />
        )}
      </div>
    </div>
  );
}
