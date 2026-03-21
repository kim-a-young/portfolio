This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Environment variables (채팅 / OpenAI)

메인 채팅과 면접 질문 API(`app/api/chat`, `app/api/interviewer-questions`)는 서버에서 **`OPENAI_API_KEY`** 를 읽습니다.

| 환경 | 설정 방법 |
|------|-----------|
| **로컬** | 프로젝트 루트에 `.env.local` 파일을 만들고 `OPENAI_API_KEY=sk-...` 를 넣습니다. (`.env.example` 참고) |
| **배포 (Vercel 등)** | 호스팅 대시보드 → **Project → Settings → Environment Variables** 에 `OPENAI_API_KEY` 를 추가하고, **Production**(필요 시 Preview)에 적용한 뒤 **재배포**합니다. |

`.env.local`은 Git에 올리지 않으므로, 배포 서버에는 자동으로 전달되지 않습니다. 배포 후에도 `OpenAI API key is not configured` 가 나오면 해당 환경에 변수가 빠졌거나 이름이 다르게 들어간 경우입니다.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
