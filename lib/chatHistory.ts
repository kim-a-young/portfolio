export type Message = {
  role: "user" | "assistant";
  content: string;
  interviewerQuestions?: string[]; // 사용자 메시지에 연결된 면접관 질문들
};

export interface ChatHistory {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = "chat-history";
const EMPTY_HISTORY: ChatHistory[] = [];

const CHANGE_EVENT = "chat-history:change";

function emitChatHistoryChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function getChatHistory(): ChatHistory[] {
  if (typeof window === "undefined") return EMPTY_HISTORY;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return EMPTY_HISTORY;
    return JSON.parse(stored);
  } catch (error) {
    console.error("Error loading chat history:", error);
    return EMPTY_HISTORY;
  }
}

export function saveChatHistory(history: ChatHistory[]): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    emitChatHistoryChange();
  } catch (error) {
    console.error("Error saving chat history:", error);
  }
}

export function addChatToHistory(chat: ChatHistory): void {
  const history = getChatHistory();
  const existingIndex = history.findIndex((c) => c.id === chat.id);
  
  if (existingIndex >= 0) {
    history[existingIndex] = chat;
  } else {
    history.unshift(chat);
  }
  
  // 최대 50개까지만 저장
  if (history.length > 50) {
    history.splice(50);
  }
  
  saveChatHistory(history);
}

export function updateChatInHistory(chatId: string, updates: Partial<ChatHistory>): void {
  const history = getChatHistory();
  const index = history.findIndex((c) => c.id === chatId);
  
  if (index >= 0) {
    history[index] = { ...history[index], ...updates, updatedAt: Date.now() };
    saveChatHistory(history);
  }
}

export function deleteChatFromHistory(chatId: string): void {
  const history = getChatHistory();
  const filtered = history.filter((c) => c.id !== chatId);
  saveChatHistory(filtered);
}

export function getChatById(chatId: string): ChatHistory | null {
  const history = getChatHistory();
  return history.find((c) => c.id === chatId) || null;
}

export function generateChatTitle(messages: Message[]): string {
  // 첫 번째 사용자 메시지의 첫 30자를 제목으로 사용
  const firstUserMessage = messages.find((m) => m.role === "user");
  if (firstUserMessage) {
    return firstUserMessage.content.slice(0, 30).trim() + (firstUserMessage.content.length > 30 ? "..." : "");
  }
  return "새 채팅";
}
