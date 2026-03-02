"use client";

import { useState, useCallback } from "react";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const chatHistory = useChatHistory();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

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
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onSelectProject={handleSelectProject}
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
