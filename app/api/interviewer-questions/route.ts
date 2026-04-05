import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT_HEAD = `
너는 면접관에게 질문을 제안하는 AI야.

상황:
- 면접관이 아영님(시니어 UI/UX 디자이너)에 대해 질문하고 있음
- 현재까지의 대화 맥락을 바탕으로 면접관이 물어볼 만한 질문 2개를 생성해야 함

[답 가능 범위 — 질문은 여기 안에서만]
- 질문 한 문장은 **이 대화·어시스턴트 답에 이미 나온 사실** 또는 **일반 공개 프로필 수준에서 확인되는 정보**(경력 축, 프로젝트 유형, 툴, 교육·수상, 협업 스타일, 포트폴리오 주제)로만 답할 수 있어야 한다.
- 프로필상 취미는 '가벼운 러닝, 여행' 정도만 언급 수준이며 **여행 일화·여행에서 배운 점·여행에서의 영감·여행이 디자인/업무에 미친 영향** 등은 **데이터에 없음** → 이런 주제로 질문을 만들지 마라.
- 가족·연애·사적 내면·여행 상세·일반적인 철학·가치관을 파고드는 질문 금지.

[금지 효과 — 반드시 피할 것]
- 질문 결과 메인 챗봇이 "잘 모르겠지만", "개인적인 경험은 잘 모르지만", "정보가 없어서"로 시작하거나 같은 말을 두 번 반복하게 만드는 질문은 **실패한 질문**이다. 그런 질문을 내지 말고, **근거 있는 다른 주제**로 바꿔라.
`;

const PROMPT_Q2_BLOCK = `
[질문2 — 항상 동일]
- **질문2**: 질문1과 완전히 다른 카테고리.
  → 아래 중 하나를 고를 것:
     수상/인증 이력, 교육 배경, 성장 방식, 협업 스타일,
     사용 툴/프로세스, 포트폴리오, 커리어 목표, 팀 핏,
     우리 서비스와의 연결점
  → (취미·라이프)는 **이번 대화에서 어시스턴트가 구체적으로 말한 래닝·운동 습관 등에 한해** 가능. **여행·여행 영감·여행에서 배운 점** 등은 선택지에서 제외.
  → 단, 이미 대화에 나온 카테고리는 제외.
  → 파고드는 심화 질문 금지. 가볍게 넓은 주제를 여는 수준.
`;

const SYSTEM_PROMPT_TAIL = `
[핵심 제약 — 반드시 지킬 것]
- 아영님의 데이터(제공된 정보·대화에 드러난 사실)에 존재하는 내용을 바탕으로만 질문 생성.
- 데이터에 없는 내용을 추측하거나 상상해야 답할 수 있는 질문은 만들지 말 것.
- **답변이 "모른다/정보 없음/잘 모르겠다"로 갈 수 있는지** 한 번 더 점검하고, 그럴 가능성이 있으면 질문을 폐기하고 다른 주제로 쓸 것.
- 짧고 간결 (한 줄에 15자 내외, 최대 22자)
- 가볍고 자연스러운 대화 톤

형식:
- JSON 배열 형식으로만 반환.
- **배열 순서 고정: index 0 = 위 [질문1] 규칙에 맞는 문장, index 1 = 위 [질문2] 규칙에 맞는 문장. 순서를 바꾸거나 뒤집지 말 것.**
- 예: ["질문1 규칙으로 쓴 문장", "질문2 규칙으로 쓴 문장"]
`;

const Q1_RULE_FIRST_IN_TOPIC = `
[질문1 — 지금 답변이 **이 대화 주제에서의 첫 사용자 질문**에 대한 것일 때만]
- 클라이언트에서 "주제의 첫 질문"으로 표시된 경우에만 아래 규칙 적용.
- 직전 **사용자 질문**과 **어시스턴트 답변** 맥락에 **한 단계 정도만** 이어지는 가벼운 꼬리질문으로 제안할 것.
- 같은 프로젝트·경험을 **겉만 한 겹** 더 짚는 수준만 허용 (역할, 지표, 사용 맥락 등 **답변·데이터에 이미 나왔거나 바로 확장 가능한 사실**만).
- "왜 그렇게 생각하시나요?" 같은 철학·가치관 심화, 또는 데이터 밖 추측으로 이어지는 질문은 금지.
- "더 구체적으로 단계별로"처럼 과한 파고듦은 금지.
`;

const Q1_RULE_SAME_TOPIC_FOLLOWUP = `
[질문1 — 같은 주제에서 **어시스턴트 답 다음에 이어진** 사용자 질문에 대한 말풍선일 때]
- 직전 턴에 이미 사용자 질문 → 답변이 있었고, 지금은 그 **후속** 질문에 대한 답변인 경우.
- 질문은 이미 대화에서 잡힌 카테고리(예: 특정 프로젝트, 직무/역할 한 축, 프로필·경력의 한 덩어리)주제로 할 것.
 → 카테고리 내용이 부족할 시 가벼운 옆선·소주제·근처 카테고리 주제로 할 것. 
- 대화에 없던 **전혀 다른 프로젝트·경험**으로 새 장을 여는 질문은 하지 말 것.
- 같은 프로젝트·경험을 **더 파고드는** 질문은 금지.
  → "왜", "어떻게", "더 구체적으로" 같은 심화 질문 절대 금지.
`;

function buildSystemPrompt(isFirstQuestionInTopic: boolean): string {
  const q1 = isFirstQuestionInTopic ? Q1_RULE_FIRST_IN_TOPIC : Q1_RULE_SAME_TOPIC_FOLLOWUP;
  return `${SYSTEM_PROMPT_HEAD}
${q1}
${PROMPT_Q2_BLOCK}
${SYSTEM_PROMPT_TAIL}`;
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = (await request.json()) as {
      messages?: unknown;
      isFirstQuestionInTopic?: boolean;
      isFirstUserTurnBubble?: boolean;
    };
    const { messages } = rawBody;
    const isFirstQuestionInTopic = Boolean(
      rawBody.isFirstQuestionInTopic ?? rawBody.isFirstUserTurnBubble
    );

    if (!Array.isArray(messages)) {
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

    const systemPrompt = buildSystemPrompt(isFirstQuestionInTopic);

    const chatMessages = [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `다음 대화 맥락을 바탕으로 면접관이 물어볼 만한 질문 2개를 생성해주세요:\n\n${JSON.stringify(messages, null, 2)}`,
      },
    ];

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: chatMessages,
          temperature: 0.45,
        }),
      }
    );

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
        { status: response.status }
      );
    }

    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content || "";

    let questions: string[] = [];
    try {
      const parsed = JSON.parse(responseText);
      if (Array.isArray(parsed)) {
        questions = parsed.slice(0, 2);
      }
    } catch {
      // JSON 파싱 실패 시 텍스트에서 질문 추출 시도
      const questionMatches = responseText.match(/["']([^"']+)["']/g);
      if (questionMatches) {
        questions = questionMatches
          .map((q: string) => q.replace(/["']/g, ""))
          .slice(0, 2);
      }
    }

    if (questions.length === 0) {
      // 기본 질문 제공
      questions = [
        "이 질문을 통해 어떤 역량을 가장 보고 싶으신가요?",
        "이 팀에서 특히 중요하게 생각하는 디자이너 기준은 무엇인가요?",
      ];
    }

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Interviewer questions API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
