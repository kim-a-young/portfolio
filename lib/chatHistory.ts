export type Message = {
  role: "user" | "assistant";
  content: string;
  interviewerQuestions?: string[]; // 사용자 메시지에 연결된 면접관 질문들
  /** 이력·프로필 답변 턴에 서버가 내려주면 채팅에 프로필 사진을 함께 표시 */
  showProfilePhoto?: boolean;
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

/** 이보다 짧으면 인사·단답 등으로 보고 로컬 제목 (그 외는 의미 요약 API 사용) */
const TITLE_LOCAL_MAX = 14;

/** 같은 채팅·같은 첫 질문에 대해 LLM 제목 요약을 한 번만 호출 */
const smartTitleInFlight = new Map<string, Promise<string>>();
const smartTitleResolved = new Map<string, string>();

function smartTitleKey(chatId: string, firstUserTrimmed: string): string {
  return `${chatId}::${firstUserTrimmed}`;
}

/** 아주 짧은 메시지용: 공백 정리 후 그대로 (긴 질문은 LLM 의미 요약으로 처리) */
export function simpleTitle(text: string): string {
  const t = text.replace(/\s+/g, " ").trim();
  return t || "새 채팅";
}

function firstUserText(messages: Message[]): string | null {
  const m = messages.find((x) => x.role === "user");
  if (!m?.content) return null;
  return m.content;
}

/** 긴 첫 메시지: 대화 맥락으로 목록용 제목 생성 */
export async function generateSmartTitle(messages: Message[]): Promise<string> {
  const first = firstUserText(messages);
  if (!first) return "새 채팅";

  try {
    const res = await fetch("/api/chat/title", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });
    if (!res.ok) {
      const retry = await fetch("/api/chat/title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      if (retry.ok) {
        const data2 = (await retry.json()) as { title?: string };
        const t2 = data2.title?.trim();
        if (t2) return t2;
      }
      return simpleTitle(first);
    }
    const data = (await res.json()) as { title?: string };
    const title = data.title?.trim();
    if (title) return title;
  } catch {
    // fall through
  }
  return simpleTitle(first);
}

/**
 * 첫 사용자 메시지 길이에 따라 로컬 제목 vs LLM 제목.
 * `chatId`를 넘기면 동일 대화에서 히스토리 갱신 시 요약 API 중복 호출을 막는다.
 */
export async function resolveChatTitle(
  messages: Message[],
  chatId: string
): Promise<string> {
  const raw = firstUserText(messages);
  if (!raw) return "새 채팅";

  const trimmed = raw.trim();
  if (trimmed.length <= TITLE_LOCAL_MAX) {
    return simpleTitle(trimmed);
  }

  const key = smartTitleKey(chatId, trimmed);
  const done = smartTitleResolved.get(key);
  if (done) return done;

  let pending = smartTitleInFlight.get(key);
  if (!pending) {
    pending = generateSmartTitle(messages).then((title) => {
      smartTitleResolved.set(key, title);
      smartTitleInFlight.delete(key);
      return title;
    });
    smartTitleInFlight.set(key, pending);
  }
  return pending;
}

