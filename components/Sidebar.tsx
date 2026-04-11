"use client";

import { useState } from "react";
import type { ChatHistory } from "@/lib/chatHistory";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onSelectProject: (projectId: string) => void;
  onGoHome: () => void;
  chatHistory: ChatHistory[];
  currentChatId: string | null;
  selectedProject: string | null;
}


function NewChatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M3 11.5L12 4l9 7.5" />
      <path d="M5 10.5V20h14v-9.5" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
      className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function Sidebar({
  isOpen,
  onClose,
  onNewChat,
  onSelectChat,
  onSelectProject,
  onGoHome,
  chatHistory,
  currentChatId,
  selectedProject,
}: SidebarProps) {
  const [chatsOpen, setChatsOpen] = useState(true);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 md:hidden"
          onClick={onClose}
          onKeyDown={(e) => e.key === "Escape" && onClose()}
          role="button"
          tabIndex={0}
          aria-label="메뉴 닫기"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 flex h-full w-[260px] flex-col border-r bg-[var(--sidebar-bg)] transition-transform duration-200 ease-out dark:border-zinc-800 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ borderColor: "var(--border)" }}
        aria-label="사이드바"
      >
        <div className="flex items-center justify-between gap-2 border-b px-2 py-2" style={{ borderColor: "var(--border)" }}>
          <button
            type="button"
            onClick={onGoHome}
            className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-[var(--sidebar-hover)]"
            style={{ color: "var(--icon)" }}
            aria-label="홈으로 이동"
          >
            <HomeIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-[var(--sidebar-hover)]"
            style={{ color: "var(--icon)" }}
            aria-label="메뉴 닫기"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
          {/* 1. 새 채팅 */}
          <div className="p-2">
            <button
              type="button"
              onClick={onNewChat}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-[var(--sidebar-hover)]"
              style={{ color: "var(--text-primary)" }}
              aria-label="새 채팅"
            >
              <NewChatIcon className="shrink-0" />
              새 채팅
            </button>
          </div>

          {/* 2. 내 채팅 (기본 펼침) */}
          <div className="flex flex-col px-2">
            <button
              type="button"
              onClick={() => setChatsOpen(!chatsOpen)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-[var(--sidebar-hover)]"
              style={{ color: "var(--text-primary)" }}
              aria-expanded={chatsOpen}
            >
              내 채팅
              <ChevronIcon open={chatsOpen} />
            </button>
            {chatsOpen && (
              <nav className="max-h-[200px] overflow-y-auto py-1" aria-label="내 채팅 목록">
                {chatHistory.length === 0 ? (
                  <div className="px-3 py-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                    채팅 내역이 없습니다
                  </div>
                ) : (
                  <ul className="space-y-0.5">
                    {chatHistory.map((chat) => (
                      <li key={chat.id}>
                        <button
                          type="button"
                          onClick={() => onSelectChat(chat.id)}
                          className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--sidebar-hover)] ${
                            currentChatId === chat.id ? "bg-[var(--sidebar-hover)]" : ""
                          }`}
                          style={{
                            color: currentChatId === chat.id ? "var(--text-primary)" : "var(--text-secondary)",
                          }}
                        >
                          {chat.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </nav>
            )}
          </div>

          {/* 3. 프로젝트 */}
          <div className="px-2">
            <button
              type="button"
              onClick={() => onSelectProject("projects")}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-[var(--sidebar-hover)] ${
                selectedProject === "projects"
                  ? "bg-[var(--sidebar-hover)]"
                  : ""
              }`}
              style={{ color: "var(--text-primary)" }}
              aria-label="프로젝트"
            >
              프로젝트
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
