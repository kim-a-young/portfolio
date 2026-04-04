import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

/** 윈도우 등: Noto Sans KR (본고딕). 맥: body에서 Apple SD Gothic Neo 우선 사용 */
const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "디자이너 김아영 | 정보 수집 | 포트폴리오",
  description:
    "디자이너 김아영 포트폴리오·정보 수집용 AI 챗 — 프로젝트와 지원 정보를 질문하고 답변을 받을 수 있습니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning data-theme="light">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem("theme");if(t==="dark"||t==="light"||t==="system"){var r=t==="system"?(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):t;document.documentElement.setAttribute("data-theme",r);}else document.documentElement.setAttribute("data-theme","light");})();`,
          }}
        />
      </head>
      <body className={`${notoSansKR.variable} antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
