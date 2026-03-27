import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `
너는 면접관에게 질문을 제안하는 AI야.

상황:
- 면접관이 아영님(시니어 UI/UX 디자이너)에 대해 질문하고 있음
- 현재까지의 대화 맥락을 바탕으로 면접관이 물어볼 만한 질문 2개를 생성해야 함

[2개 질문의 역할 — 반드시 구분]
- **질문1**: 지금 대화에서 나온 주제와 연결되되, 
  같은 프로젝트나 경험을 더 파고드는 질문은 금지.
  → "왜", "어떻게", "더 구체적으로" 같은 심화 질문 절대 금지.
  → 같은 주제의 다른 측면(예: 성과→느낀점, 어려움→배운점)으로 살짝 옮기는 것도 금지.
  → 아직 언급되지 않은 새로운 경험이나 정보를 여는 질문이어야 함.

- **질문2**: 질문1과 완전히 다른 카테고리.
  → 아래 중 하나를 고를 것:
     수상/인증 이력, 교육 배경, 성장 방식, 협업 스타일,
     사용 툴/프로세스, 포트폴리오, 커리어 목표, 팀 핏,
     개인 성향/취미, 우리 서비스와의 연결점
  → 단, 이미 대화에 나온 카테고리는 제외.

[핵심 제약 — 반드시 지킬 것]
- 아영님의 데이터(제공된 정보)에 존재하는 내용을 바탕으로만 질문 생성.
- 데이터에 없는 내용을 추측하거나 상상해야 답할 수 있는 질문은 만들지 말 것.
- 짧고 간결 (한 줄에 15자 내외, 최대 22자)
- 가볍고 자연스러운 대화 톤

형식:
- JSON 배열 형식으로만 반환
- 예: ["질문1", "질문2"]
`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

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

    const chatMessages = [
      { role: "system", content: SYSTEM_PROMPT },
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
          temperature: 0.7,
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
