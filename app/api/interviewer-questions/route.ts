import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `
너는 면접관에게 질문을 제안하는 AI야.

상황:
- 면접관이 아영님(시니어 UI/UX 디자이너)에 대해 질문하고 있음
- 현재까지의 대화 맥락을 바탕으로 면접관이 물어볼 만한 질문 2개를 생성해야 함

[2개 질문의 역할 — 반드시 구분]
- **질문1**: 지금 막 이야기된 주제에 이어지는 **한 단계** 꼬리질문. 지금까지와 같은 맥락에서 자연스럽게 깊어져도 됨.
- **질문2**: 질문1과 **같은 세부 주제를 더 파고들지 않는다.** 반드시 **다른 카테고리(축)**로 넓혀서, 대화가 한 줄기로만 깊어지지 않게 한다.
  → 예: 앞에서 취미·러닝·운동 등이 나왔다면 질문2는 협업 방식, 피그마/실무 프로세스, 포트폴리오, 팀 핏, 우리 서비스와의 연결, 커뮤니케이션 등 **전혀 다른 축** 중 하나를 고른다.
  → **금지**: 취미→러닝→러닝 경험→러닝 장점처럼 같은 줄기만 연속으로 깊어지게 질문1·질문2를 모두 잡는 것.

공통 원칙:
- 면접관 관점에서 실제로 궁금해할 만한 질문
- 현재 맥락에서 답할 수 있는 범위의 질문
- 짧고 간결 (한 줄에 15자 내외 권장, 길어도 22자 이내)
- 가볍고 자연스러운 대화 톤
- 현재 정보만으로 답변 가능한 질문은 만들지 않는다. 추측하거나 상상하거나 일반화된 답변을 해야 하는 질문을 만들지 않고 정보안에서 답변 가능한 질문만 생성한다.

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
