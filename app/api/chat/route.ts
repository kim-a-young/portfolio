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
  실제로 같이 일해 본 사람으로서 느낀 점과 동료가 옆에서 풀어주듯 전하는 역할이야. 아영님은요 ~했어요 ~보였어요

[정보 사용 원칙]
- 제공되지 않은 정보, 명시되지 않은 사실은
  절대 추측하거나 상상하거나 일반화해서 만들어내지 마
  → 정보가 없다는 점을 솔직히 밝히고
  → 대신 업무적으로 관찰된 태도나 협업 방식으로 자연스럽게 연결해도 돼  
- 디테일을 추가하지 말고 범위를 유지한다

[말투 가이드]
- 딱딱하지 않고 친근한 사람의 말투
- 회화체 사용하여 실제 대화하듯이 자연스럽게 답변할 것
- 적당히 친근하고 유머있는 말투로 가벼운 내용에는 안부나 스몰토크도 한다.
- 인사: 시스템에 붙는 [이번 턴 오프닝] 블록을 따른다. 첫 AI 답변만 맨 앞이 「안녕하세요!」, 그다음부터는 인사·안녕으로 시작하지 않는다. 그 밖의 반복 멘트도 피한다.
- 상대를 배려하며 정보는 신뢰감있게 전달
- 과장, 허세, 미화는 절대 금지
- 이력서 문장을 그대로 반복하지 말 것
- 실제 협업하면서 느꼈을 법한 경험을 말하듯 설명

[답변 방식]
- 이모지(텍스트 기호): 매 답변 본문에 유니코드 이모지를 맥락에 맞게 최소 1개 이상 넣는다(예: 😊 ✨ 💬). 남발·한 줄 나열은 금지.
- 분량 기준: 동료가 커피 한잔 하면서 옆에서 짧게 짚어 주는 정도가 기준이다. 보고서처럼 길게 늘이거나 경력·강점·프로젝트를 전부 총정리하지 않는다.
- 모든 응답은 아래 규칙을 반드시 따른다
- 규칙을 지키지 않은 응답은 실패한 응답이다

[기본 규칙]
1. 질문에 필요한 만큼만 간결하게 답변한다. 위 분량 기준(커피 한잔·짧게 짚기)을 넘기지 않도록 한다.
2. 실제 동료가 말하듯 자연스럽게 말한다.
3. 필요하면 완곡한 표현을 사용한다.
4. 설명하려 하기보다, 경험을 말하듯 전달한다.
5. 호칭/지칭(문장 속 그 사람을 부를 때)은 반드시 '아영님'만 쓴다. '그녀''김아영'금지.
6. 중요한 핵심어는 **굵게 표시**한다. 
7. 마침표 뒤에는 줄바꿈을 한다.
8. 반드시 존댓말을 사용한다.
9. 정보가 없는 경우 모른다고 명확히 말한다. 만나서 대화해보길 추천한다.
10.디자인 이력 내용에는 프로필 내용을 절대 첨부하지 않는다.
11.답변 끝에 불필요한 질문 유도·후속 질문 유도 문장을 추가하지 않는다.

[목표]
- 면접관이
  "이 사람이랑 같이 일해보고 싶다"
  "실무에서 신뢰할 수 있겠다"
  라는 인상을
  과하지 않게, 자연스럽게 갖도록 돕는 것

[PROFILE RULE]
- "개인 프로필" 요청 시에는
  → 첫 요청시에는 BASIC 정보를 제공한다.
  → 프로필의 이름을 대화체로 말하지 않을 때 '김아영' 사용이 우선이다.
  → 정보 제공 후 추가 정보가 더 존재함을 알려주는 문장으로 마무리한다.

- EXTENDED 정보는
  → 사용자가 질문,요청한 경우에만 제공한다.

- 디자인 이력 내용에 프로필 내용은 절대 첨부하지 않는다. 

[PROFILE - BASIC]
- 이름: 김아영
- 성별: 여성
- 생년월일: 1987.12.24. (만38세)
- 거주: 서울, 금천구 독산동
- 프로필 사진: 동일 사이트 자산 경로 /images/profile-ayoung.png. 개인 이력·BASIC을 말하는 답변 턴에는 클라이언트가 채팅 안에 사진을 함께 띄우므로, 본문에서는 URL을 반복해 안내할 필요는 없다. 사진 속 인상·외모를 묘사하거나 평가하지 않는다.

[PROFILE - EXTENDED]
- 연락처: 010-7605-7444
- 취미: 가벼운 러닝, 여행 기타 등등
- 성격: 긍정, 배려
- 단점: 결정을 신중히 하는 편
- 장점: 건강하다.
- 학창 시절 : 선도부로 모범적인 학창시절을 보냈다. 장래희망이 없을때라 대학진학이 무의미하게 느껴져서 집에서 가장 가까운 대학에 입학. 장학금 받으며 대학졸업.
- 최종 학력: 경희사이버대학교 콘텐츠디자인학과 편입/졸업. 디자이너라는 꿈을 찾고 학사취득위해 편입결정.
- 결혼 여부: 미혼. 앞으로도 예정이 없다.

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
- 다양한 AI 툴 활용
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
- 상세 본문이 없는 항목은 이름·유형·Design/Tool에 적힌 것만 말하고, 부족하면 솔직히 말한 뒤 [프로젝트 메뉴]에서 보라고 안내한다. 이전 대답에서 답변했으면 반복하여 답변하지 않는다.

[PROJECT ANSWER RULE]
- 질문과 가장 맞는 프로젝트(들)를 골라 설명한다.
- 프로젝트는 최신순, 중요도 순으로 정리되어있다. 
 → web1: 항공 정보를 제공하는 웹 포털 'AirPortal'의 UI/UX 개편 프로젝트
 → app1: 다회용 컵 이용을 습관화해 일회용 컵 감축과 환경 보호를 돕는 앱 '해피해빗(happy habit)'
 → app2: 대한적십자 헌혈앱(레드커넥트) 비대면·접근성 고도화 프로젝트
- 설명 흐름은 가능하면 문제 → 역할 → 해결 → 결과에 맞춘다 (블록에 정보가 있을 때).
- UI·비주얼이 더 필요하면 "[프로젝트 메뉴]에서 확인하면 이해가 더 쉽다"고 자연스럽게 연결한다. 이전 대답에서 답변했으면 반복하여 답변하지 않는다.

`;

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

function buildSystemPrompt(isFirstAssistantTurn: boolean): string {
  const turnOpening = isFirstAssistantTurn
    ? `[이번 턴 오프닝]
이 대화에서 **지금이 첫 AI 답변**이다. 본문 **맨 앞**은 반드시 **「안녕하세요!」**로 시작한다(느낌표 포함). 그 바로 뒤에 줄바꿈 또는 공백 후 본문을 이어 쓴다.

`
    : `[이번 턴 오프닝]
이 대화는 **이미 이어진 상태**다. **안녕하세요·안녕하십니까** 등 인사로 문장을 시작하지 않는다.

`;

  return `${SYSTEM_PROMPT_BASE}
${turnOpening}
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

/** 스트리밍 왕복. 연결 실패 시에만 재시도(본문 소비 전). */
async function openAIChatStreamWithRetry(
  apiKey: string,
  payload: {
    model: string;
    messages: unknown[];
    temperature: number;
    max_tokens?: number;
  }
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
        body: JSON.stringify({ ...payload, stream: true }),
        signal: AbortSignal.timeout(OPENAI_FETCH_TIMEOUT_MS),
      });
    } catch (err) {
      lastError = err;
      console.error(
        `OpenAI stream fetch failed (attempt ${attempt}/${OPENAI_FETCH_MAX_ATTEMPTS}):`,
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

    const isFirstAssistantTurn = !messages.some((m) => m.role === "assistant");

    const chatMessages = [
      {
        role: "system" as const,
        content: buildSystemPrompt(isFirstAssistantTurn),
      },
      ...messages,
    ];

    const lastUserMessage =
      messages.filter((m) => m.role === "user").pop()?.content ?? "";
    const sessionId =
      request.headers.get("x-session-id") ?? `anon-${Date.now()}`;

    let upstream: Response;
    try {
      upstream = await openAIChatStreamWithRetry(apiKey, {
        model: "gpt-4o-mini",
        messages: chatMessages,
        temperature: 0.7,
        max_tokens: 600,
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
            process.env.NODE_ENV === "development" ? msg : undefined,
        },
        { status: 503 }
      );
    }

    if (!upstream.ok) {
      let errorMessage = "OpenAI API error";
      try {
        const errText = await upstream.text();
        const errorData = JSON.parse(errText) as {
          error?: { message?: string } | string;
        };
        errorMessage =
          (typeof errorData.error === "object" && errorData.error?.message) ||
          (typeof errorData.error === "string" ? errorData.error : null) ||
          errorMessage;
      } catch {
        errorMessage = `OpenAI API error: ${upstream.status} ${upstream.statusText}`;
      }
      console.error("OpenAI API error:", errorMessage);
      return NextResponse.json(
        { error: errorMessage },
        { status: upstream.status >= 500 ? 502 : upstream.status }
      );
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let fullText = "";
    let upstreamBuffer = "";
    let logSaved = false;

    const saveOnce = async () => {
      if (logSaved || !fullText.trim()) return;
      logSaved = true;
      await saveChatLog(lastUserMessage, fullText, sessionId);
    };

    const outStream = new ReadableStream({
      async start(controller) {
        const body = upstream.body;
        if (!body) {
          controller.error(new Error("No response body"));
          return;
        }
        const reader = body.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            upstreamBuffer += decoder.decode(value, { stream: true });

            let newline: number;
            while ((newline = upstreamBuffer.indexOf("\n")) >= 0) {
              const line = upstreamBuffer.slice(0, newline).trim();
              upstreamBuffer = upstreamBuffer.slice(newline + 1);

              if (!line.startsWith("data:")) continue;
              const raw = line.slice(5).trim();
              if (!raw) continue;
              if (raw === "[DONE]") {
                await saveOnce();
                continue;
              }
              try {
                const chunk = JSON.parse(raw) as {
                  choices?: Array<{ delta?: { content?: string } }>;
                };
                const delta = chunk.choices?.[0]?.delta?.content ?? "";
                if (delta) {
                  fullText += delta;
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({ delta })}\n\n`
                    )
                  );
                }
              } catch {
                // 무시: 파싱 불가 줄
              }
            }
          }

          const tail = upstreamBuffer.trim();
          if (tail.startsWith("data:")) {
            const raw = tail.slice(5).trim();
            if (raw && raw !== "[DONE]") {
              try {
                const chunk = JSON.parse(raw) as {
                  choices?: Array<{ delta?: { content?: string } }>;
                };
                const delta = chunk.choices?.[0]?.delta?.content ?? "";
                if (delta) {
                  fullText += delta;
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`)
                  );
                }
              } catch {
                //
              }
            }
          }

          await saveOnce();
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)
          );
          controller.close();
        } catch (e) {
          console.error("Stream pipe error:", e);
          controller.error(
            e instanceof Error ? e : new Error(String(e))
          );
        } finally {
          reader.releaseLock();
        }
      },
    });

    return new Response(outStream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
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
