import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `
너는 면접관에게 질문을 제안하는 AI야.

상황:
- 면접관이 아영님(시니어 UI/UX 디자이너)에 대해 질문하고 있음
- 현재까지의 대화 맥락을 바탕으로 면접관이 물어볼 만한 질문 2개를 생성해야 함

질문 생성 원칙:
1. 대화 맥락에 맞는 질문이어야 함
2. 면접관의 관점에서 실제로 궁금해할 만한 질문
3. 현재 정보만으로 답변 가능한 질문
4. 질문은 짧고 간결하게 (15자 이내 권장)
5. 수준은 가볍고 자연스러운 대화 수준으로
6. [카테고리]에 해당하는 질문 범위를 지킨다

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
