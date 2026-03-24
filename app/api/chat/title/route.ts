import { NextRequest, NextResponse } from "next/server";

const TITLE_SYSTEM = `너는 채팅 사이드바 목록에만 쓰는 "제목 한 줄"을 만든다.

[형식]
- 한국어, 한 줄만, 공백 포함 최대 34자
- 짧은 명사구·토픽 라벨 (책 제목처럼). 끝에 "…" 금지.

[반드시]
- 핵심 주제·대상·행위만 추출해 압축한다.
- 예시 스타일: "미래에셋 OMS UI 개선", "레드커넥트 헌혈 UX", "협업 스타일 질문"

[절대 금지]
- 문장 서두: "이 프로젝트는", "사용자는", "다음은", "질문:", "저는"
- 원문 앞부분을 복사해 끊은 것처럼 보이게 쓰기
- 따옴표, 이모지, 마크다운, 번호 목록, 줄바꿈
- 설명·이유·접속사로 길게 늘이기`;

const COMPRESS_SYSTEM = `입력된 문자열을 채팅 목록 제목으로만 바꾼다.
한국어 한 줄, 공백 포함 최대 34자, 명사구 위주, 앞의 "이 프로젝트는" 류 서두 제거, 출력만.`;

type IncomingMsg = { role?: string; content?: string };

function stripTitleWrapping(title: string): string {
  return title
    .replace(/^["'「『\s]+|["'」』\s]+$/g, "")
    .trim()
    .split(/\n/)[0]
    ?.trim() ?? "";
}

async function callOpenAI(
  apiKey: string,
  system: string,
  user: string,
  temperature: number
): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature,
      max_tokens: 100,
    }),
  });

  if (!response.ok) {
    return "";
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content?.trim() ?? "";
  return stripTitleWrapping(raw);
}

/** 잘린 문장형처럼 보이면 재압축 (문자 자르기 대신) */
async function ensureCompactTitle(
  apiKey: string,
  title: string
): Promise<string> {
  const t = stripTitleWrapping(title);
  if (!t) return "";

  const badStart =
    /^(이|그|저)\s+(프로젝트|질문|대화|내용|경우|부분|서비스|앱|사이트)는?/u.test(
      t
    );
  const tooLong = t.length > 34;
  const endsWithEllipsis = /…|\.\.\.|⋯$/.test(t);

  if (!tooLong && !badStart && !endsWithEllipsis) {
    return t;
  }

  const compressed = await callOpenAI(
    apiKey,
    COMPRESS_SYSTEM,
    `다음을 목록 제목 한 줄(34자 이내, 명사구)로만 바꿔줘:\n\n${t}`,
    0.2
  );

  if (compressed) {
    return stripTitleWrapping(compressed);
  }

  const second = await callOpenAI(
    apiKey,
    COMPRESS_SYSTEM,
    `아래를 채팅 목록 제목으로 최대 28자, 명사구 한 줄만 출력:\n\n${t}`,
    0.15
  );
  if (second) return stripTitleWrapping(second);

  return t;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const raw = body.messages as IncomingMsg[] | undefined;
    if (!Array.isArray(raw) || raw.length === 0) {
      return NextResponse.json(
        { error: "messages array is required" },
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

    const compact = raw
      .filter((m) => m && (m.role === "user" || m.role === "assistant"))
      .slice(0, 6)
      .map((m) => ({
        role: m.role,
        content: String(m.content ?? "").slice(0, 1200),
      }));

    const transcript = compact
      .map((m) => `${m.role === "user" ? "사용자" : "어시스턴트"}: ${m.content}`)
      .join("\n\n");

    let title = await callOpenAI(
      apiKey,
      TITLE_SYSTEM,
      `아래 대화의 주제를 채팅 목록 제목 한 줄로만 적어줘. (명사구·토픽 라벨, 34자 이내)\n\n${transcript}`,
      0.25
    );

    if (!title) {
      return NextResponse.json(
        { error: "No title in response" },
        { status: 500 }
      );
    }

    title = await ensureCompactTitle(apiKey, title);

    if (!title) {
      return NextResponse.json(
        { error: "No title in response" },
        { status: 500 }
      );
    }

    return NextResponse.json({ title });
  } catch (error) {
    console.error("Chat title route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
