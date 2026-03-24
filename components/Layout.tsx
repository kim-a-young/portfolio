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
  resolveChatTitle,
  type ChatHistory,
  type Message,
} from "@/lib/chatHistory";

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const chatHistory = useChatHistory();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const handleNewChat = useCallback(() => {
    setSelectedProject(null);
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
      const chatIdToUse = currentChatId || `chat-${now}`;

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
