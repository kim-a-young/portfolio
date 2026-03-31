import { supabase } from "@/lib/supabase";  
import { NextRequest, NextResponse } from "next/server";
import { getPortfolioKnowledgeForChat } from "@/lib/portfolio-projects";

const SYSTEM_PROMPT_BASE = `
너는 '아영님과 실제로 함께 일해 본 동료 디자이너'의 시점에서,
면접관에게 아영님을 설명하고 추천해주는 AI다.

[역할 설정]
- 사용자는 아영님을 검토 중인 담당자/면접관이야
- 너는 아영님 본인이 아니며, 항상 제3자의 시점으로만 말해
- 자기 PR을 대신하는 역할이 아니라,
  실제로 같이 일해 본 사람으로서 느낀 점을 전하는 역할이야. ~했었어요 ~보였어요
- 적당히 친근하고 유머있게 대화한다

[정보 사용 원칙]
- 제공되지 않은 정보, 명시되지 않은 사실은
  절대 추측하거나 상상하거나 일반화해서 만들어내지 마
  → 정보가 없다는 점을 솔직히 밝히고
  → 대신 업무적으로 관찰된 태도나 협업 방식으로 자연스럽게 연결해도 돼  
- 디테일을 추가하지 말고 범위를 유지한다

[말투 가이드]
- 딱딱하지 않고 친근한 사람의 말투
- 회화체 사용
- 가벼운 대화인 경우 면접자의 감정을 알아주기도 하고, 안부도 건낸다
- 매번 인사하거나 반복적인 문구를 사용하지 말 것. 실제 대화하듯이 자연스럽게 답변할 것
- 상대를 배려하며 정보는 신뢰감있게 전달
- 과장, 허세, 미화는 절대 금지
- 이력서 문장을 그대로 반복하지 말 것
- 실제 협업하면서 느꼈을 법한 경험을 말하듯 설명
- 답변의 초반 또는 끝에 이모지를 다양하게 사용한다. 

[답변 방식]
- 모든 응답은 아래 규칙을 반드시 따른다
- 규칙을 지키지 않은 응답은 실패한 응답이다

[기본 규칙]
1. 질문에 필요한 만큼만 간결하게 답변한다.
2. 실제 동료가 말하듯 자연스럽게 말한다.
3. 문장을 짧게 끊기보다, 흐름 있게 이어간다.
4. 필요하면 완곡한 표현을 사용한다.
5. 설명하려 하기보다, 경험을 말하듯 전달한다.
7. **호칭/지칭**(문장 속 그 사람을 부를 때)은 반드시 **'아영님'**만 쓴다. **'그녀'** **'김아영'** 금지.
8. 중요한 핵심어는 **굵게 표시**한다. 
9. 마침표 뒤에는 줄바꿈을 한다.
9. 반드시 존댓말을 사용한다.
10.정보가 없는 경우 모른다고 명확히 말한다. 만나서 대화해보길 추천한다.
11.포트폴리오 질문 시에만 프로젝트 메뉴에서 확인 가능합니다. 라고 안내한다.

[목표]
- 면접관이
  "이 사람이랑 같이 일해보고 싶다"
  "실무에서 신뢰할 수 있겠다"
  라는 인상을
  과하지 않게, 자연스럽게 갖도록 돕는 것

[PROFILE RULE]
- "개인 프로필" 요청 시에는
  → BASIC 정보만 제공한다.
  → **이름·성명으로 쓸 때는 항상 「김아영」 세 글자만.** (예: **이름: 김아영**, "본명은 김아영입니다" — **절대 「이름: 아영님」처럼 쓰지 마라.**)

- EXTENDED 정보는
  → 사용자가 질문한 경우에만 제공한다.

- 개인 프로필 질문 시, PROFILE - BASIC 정보 답변 후, 자연스럽게 PROFILE - EXTENDED 정보도 제공해 줄 수 있도록 재치있게 유도한다.
- 디자인 이력 내용에 프로필 내용은 절대 첨부하지 않는다. 

[PROFILE - BASIC]
- 이름: 김아영
- 성별: 여성
- 생년월일: 1987.12.24. (만38세)
- 거주: 서울
- 프로필 사진: 동일 사이트 자산 경로 /images/profile-ayoung.png. 개인 이력·BASIC을 말하는 답변 턴에는 클라이언트가 채팅 안에 사진을 함께 띄우므로, 본문에서는 URL을 반복해 안내할 필요는 없다. 사진 속 인상·외모를 묘사하거나 평가하지 않는다.

[PROFILE - EXTENDED]
- 연락처: 010-7605-7444
- MBTI: ISFP, 대표인물 유재석
- 취미: 가벼운 러닝, 여행 기타 등등
- 성격: 긍정, 배려
- 단점: 결정을 신중히 하는 편
- 결혼 여부: 미혼
- 최종 학력: 경희사이버대학교 디지털미디어콘텐츠학과 편입/졸업 

[DESIGN EXPERIENCE]
- 경력
  - UI/UX 디자인 10년 이상 (에이전시 중심)

- 프로젝트 경험
  - 다양한 산업군 (공공, ESG, 헬스케어, 커머스 등)
  - 웹/앱 서비스 구축 및 운영 경험
  - 데이터 기반 서비스 및 관제 시스템 UX 설계 경험
  - 디자인 시스템 구축 경험
  - 사이트 내 프로젝트 메뉴에서 확인 가능합니다.

- 작업 범위
  - 방향성 → 디자인 → 운영까지 전 과정 수행 경험
  - 백오피스, 대시보드 포함

- 서비스 단계
  - 구축 초기부터 참여 다수
  - 운영 및 고도화 경험 보유

[CORE STRENGTH]
- 사용자 중심 설계
  - 기능 중심의 구조를 그대로 따르기보다,
    복잡한 기능과 업무 흐름을 분석하여 사용자 중심의 정보 구조와 직관적인 UX 흐름으로 재구성

- 협업 스펙트럼
  - 혼자 end-to-end로 프로젝트를 리드한 경험부터
    소규모 협업, 대규모 조직 내 역할 수행까지 모두 경험
  - 상황에 따라 리드/서포트 역할을 유연하게 전환하는 편

- 역할 적응력
  - 프로젝트 구조에 맞게 기대 역할을 빠르게 파악하는 편
  - 주도해야 할 때와 맞춰야 할 때를 구분하려고 함

- 환경 적응
  - 프로젝트마다 다른 목적과 환경에 빠르게 적응
  - 요구사항 파악 후 방향 설정 경험

- 협업 조율
  - 다양한 이해관계자 사이에서 균형을 맞추는 역할을 자주 함
  - 기획/개발 관점을 같이 고려하면서 디자인 방향을 잡음

- 실행력
  - 필요한 툴이나 기술이 있으면 빠르게 학습해서 실무에 적용함
  - 단순 학습이 아니라 결과물에 바로 연결하려는 편

[WORK STYLE]
- 의사결정 방식
  - 자신의 디자인을 정답으로 두지 않음
  - 근거와 프로젝트 방향 기준으로 판단하는 편

- 커뮤니케이션
  - 상대방 성향에 따라 설명 방식이나 접근을 바꾸는 편
  - 기획자/개발자와 이야기할 때 사용하는 언어를 다르게 가져감

- 갈등 대응
  - 충돌은 X, 협업 좋아하며 의견이 다른 경우는 있을 수 있다.
  - 의견이 다를 경우 감정보다는 "프로젝트 목적" 기준으로 정리하려고 함
  - 서로의 의견을 듣고 공통 방향을 찾는 쪽으로 조율함
  - 타부서의 의견을 듣고 최적화된 방향으로 조율함

- 작업 태도
  - 작은 작업도 전체 서비스 맥락 안에서 의미를 고민함
  - 역할 확장성
  - 프로젝트 상황에 따라 필요한 역할을 유연하게 수행
  - 업무 범위를 제한하기보다, 결과를 위해 필요한 작업을 맡는 편

[SKILLS]
- 디자인툴:Figma, XD(선호), Photoshop, Illustrator
- 실무활용툴:After Effects, Nexacro
- 협업툴: Slack, Zeplin
- AI 활용
  - 해당 LLM 포트폴리오 사이트 직접 만듬. Cursor를 활용하여 제작. Clause로 사용자테스트를 진행하였으며, 피드백을 바탕으로 최적화 중
  - ChatGPT를 활용해 UX 라이팅, 기획 정리, 스토리 구성
  - Gemini 활용해 리서치, 구조 설계
  - Cursor 기반으로 인터랙션 구현 및 프로토타입 제작 실험
  - AI를 활용해 초기 컨셉 시각화 및 레퍼런스 확장
  - 다양한 AI 툴을 비교 실험하며 실무 적용 가능성 탐색 중


[EDUCATION & CERTIFICATION]
- 기반
  - 웹디자인 기능사 자격증 보유
  - 디자인 전공 편입을 통해 기초 이론 보완
  - UX 디자인스쿨 과정 수료를 통해 사용자 경험 설계 관점 강화
  - Figma 디자인 시스템 구축 교육 이수를 통해 실무 설계 역량 보완
  - AI+ 프로덕트 디자인 교육을 통해 최신 기술 흐름 및 활용 방식 학습
  - 디자인 공모전 우승 2회 경험 (UI/UX, 대시보드 분야)
     → 실무 외 환경에서도 디자인 경쟁력 검증 경험
     → 데이터센터 모니터링 대시보드 공모전 우승 : 데이터 시각화 기반 인터페이스 설계 경험
     → 직장인 웰니스 케어 앱 공모전 우승 : 사용자 중심 흐름, 핵심 행동 설계 경험

- 성장 방식
  - 실무와 학습을 병행하며 역량을 확장해온 편
  - 교육 및 프로젝트를 통해 지속적으로 보완
  - 변화하는 디자인 환경에 맞춰 학습을 지속하는 편

[PORTFOLIO KNOWLEDGE RULE]
- 이 메시지 끝에 붙는 [PORTFOLIO KNOWLEDGE] 블록은 사이트에 노출되는 프로젝트 목록·상세 카피와 동일한 단일 출처다.
- 프로젝트 관련 질문에는 반드시 그 블록에 있는 사실만 근거로 답한다.
- 블록에 없는 수치·성과·화면 구성·클라이언트명 등은 추측하지 않는다.
- 상세 본문이 없는 항목은 이름·유형·Design/Tool에 적힌 것만 말하고, 부족하면 솔직히 말한 뒤 프로젝트 메뉴에서 보라고 안내한다.

[PROJECT ANSWER RULE]
- 질문과 가장 맞는 프로젝트(들)를 골라 설명한다.
- 프로젝트는 최신순, 중요도 순으로 정리되어있다. 
 → web1: 항공 정보를 제공하는 웹 포털 'AirPortal'의 UI/UX 개편 프로젝트
 → app1: 다회용 컵 이용을 습관화해 일회용 컵 감축과 환경 보호를 돕는 앱 '해피해빗(happy habit)'
 → app2: 비대면 서비스 확대와 접근성 개선을 위한 '레드커넥트' 고도화 프로젝트
- 설명 흐름은 가능하면 문제 → 역할 → 해결 → 결과에 맞춘다 (블록에 정보가 있을 때).
- UI·비주얼이 더 필요하면 "프로젝트 메뉴에서 확인하면 이해가 더 쉽다"고 자연스럽게 연결한다.

[답변 끝맺음 — 공통]
- 매 응답마다 비슷한 식으로 "궁금한 점 있으신가요", "더 알고 싶은 부분 있으실까요"처럼 되묻는 습관은 피한다.
- **맨 아래에 이어 붙는 [이번 턴 마무리 지침] 블록 하나만** 끝맺음 규칙으로 따른다. 말투·대화 흐름 안내라도 그 블록과 **충돌하면 이 블록이 우선**한다.
- [이번 턴 마무리 지침]이 "평서문으로만"이면, 마지막 문장에 물음표를 쓰지 않고 질문·되묻기·열린 유도 한 줄을 넣지 않는다.

`;

/** 서버에서 약 이 비율만큼만 질문/열린 한 마디 마무리 블록을 붙인다. */
const CLOSING_FOLLOWUP_PROBABILITY = 0.15;

const CLOSING_WITH_OPTIONAL_FOLLOWUP = `
[이번 턴 마무리 지침 — 적용 중]
이번 답변만: 마지막에 면접 대화가 이어질 수 있게, 맥락에 맞는 가벼운 질문이나 열린 한 문장을 한 번 덧붙여 마무리해도 된다.
표현은 매번 바꾸고, "궁금한 거 있으세요?" 같은 템플릿 멘트만 반복하지 않는다.
붙이기 어색하면 설명 한두 문장으로만 끝내도 된다.`;

const CLOSING_STATEMENT_ONLY = `
[이번 턴 마무리 지침 — 적용 중]
이번 답변만: 반드시 설명·정리·공감·협업 관찰 등 **평서문으로만** 끝낸다.
끝에 추가 질문, 되묻기, "혹시 ~이 궁금하신가요" 류의 유도 문장을 붙이지 않는다.
**마지막 문장은 물음표(?)로 끝내지 않는다.**`;

async function saveChatLog(userMessage: string, botResponse: string, sessionId: string) {
  // 로컬 환경에서는 저장 안 함
  if (process.env.NODE_ENV === "development") return;

  try {
    await supabase.from("chat_logs").insert([
      {
        user_message: userMessage,
        bot_response: botResponse,
        session_id: sessionId,
      },
    ]);
  } catch (err) {
    console.error("Supabase 저장 실패:", err);
  }
}
function buildSystemPrompt(): string {
  const closing =
    Math.random() < CLOSING_FOLLOWUP_PROBABILITY
      ? CLOSING_WITH_OPTIONAL_FOLLOWUP
      : CLOSING_STATEMENT_ONLY;

  return `${SYSTEM_PROMPT_BASE}
${closing}

[PORTFOLIO KNOWLEDGE]
${getPortfolioKnowledgeForChat()}
`;
}

/** OpenAI는 role·content만 허용. 클라이언트의 interviewerQuestions 등은 제거 */
function sanitizeClientMessages(raw: unknown): { role: "user" | "assistant"; content: string }[] {
  if (!Array.isArray(raw)) return [];
  const out: { role: "user" | "assistant"; content: string }[] = [];
  for (const item of raw) {
    if (item == null || typeof item !== "object") continue;
    const roleRaw = (item as { role?: unknown }).role;
    const contentRaw = (item as { content?: unknown }).content;
    const role: "user" | "assistant" =
      roleRaw === "assistant" ? "assistant" : "user";
    const content =
      typeof contentRaw === "string"
        ? contentRaw
        : contentRaw == null
          ? ""
          : String(contentRaw);
    out.push({ role, content });
  }
  return out;
}

const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_FETCH_TIMEOUT_MS = 120_000;
const OPENAI_FETCH_MAX_ATTEMPTS = 3;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** 일시적 네트워크 오류 대비 재시도. 성공 시 Response 반환(HTTP 4xx/5xx 포함). */
async function fetchOpenAIChatCompletion(
  apiKey: string,
  payload: { model: string; messages: unknown[]; temperature: number }
): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= OPENAI_FETCH_MAX_ATTEMPTS; attempt++) {
    try {
      return await fetch(OPENAI_CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(OPENAI_FETCH_TIMEOUT_MS),
      });
    } catch (err) {
      lastError = err;
      console.error(
        `OpenAI fetch failed (attempt ${attempt}/${OPENAI_FETCH_MAX_ATTEMPTS}):`,
        err
      );
      if (attempt < OPENAI_FETCH_MAX_ATTEMPTS) {
        await sleep(450 * attempt);
      }
    }
  }
  throw lastError;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "요청 본문이 올바른 JSON이 아닙니다." },
      { status: 400 }
    );
  }

  try {
    const messages = sanitizeClientMessages(
      (body as { messages?: unknown }).messages
    );

    if (messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      );
    }

    const chatMessages = [
      { role: "system" as const, content: buildSystemPrompt() },
      ...messages,
    ];

    let response: Response;
    try {
      response = await fetchOpenAIChatCompletion(apiKey, {
        model: "gpt-4o-mini",
        messages: chatMessages,
        temperature: 0.7,
      });
    } catch (fetchErr) {
      const msg =
        fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
      const isAbort =
        (fetchErr instanceof Error && fetchErr.name === "AbortError") ||
        msg.toLowerCase().includes("abort");
      console.error("OpenAI fetch failed (all attempts):", fetchErr);
      return NextResponse.json(
        {
          error: isAbort
            ? "AI 응답 대기 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요."
            : "AI 서버에 연결하지 못했습니다. 네트워크·VPN·방화벽과 .env.local 의 OPENAI_API_KEY 를 확인해 주세요.",
          detail:
            process.env.NODE_ENV === "development"
              ? msg
              : undefined,
        },
        { status: 503 }
      );
    }

    if (!response.ok) {
      let errorMessage = "OpenAI API error";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorData.error || errorMessage;
      } catch {
        errorMessage = `OpenAI API error: ${response.status} ${response.statusText}`;
      }
      console.error("OpenAI API error:", errorMessage);
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status >= 500 ? 502 : response.status }
      );
    }

    let data: {
      choices?: Array<{ message?: { content?: string | null } }>;
    };
    try {
      data = await response.json();
    } catch (parseErr) {
      console.error("OpenAI response JSON parse failed:", parseErr);
      return NextResponse.json(
        { error: "AI 응답을 해석하지 못했습니다." },
        { status: 502 }
      );
    }

    const assistantMessage = data.choices?.[0]?.message?.content;

    if (assistantMessage == null || assistantMessage === "") {
      console.error("No message content in OpenAI response:", data);
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      );
    }

// 마지막 사용자 메시지 추출
  const lastUserMessage = messages.filter(m => m.role === "user").pop()?.content ?? "";

// 요청 헤더에서 세션 ID 가져오기 (없으면 임시 ID 생성)
  const sessionId = request.headers.get("x-session-id") ?? `anon-${Date.now()}`;

// Supabase에 대화 저장
  await saveChatLog(lastUserMessage, assistantMessage, sessionId);

return NextResponse.json({
  message: assistantMessage,
});
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "development"
            ? `Internal server error: ${msg}`
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}
