import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/new", destination: "/v2", permanent: true }];
  },
  images: {
    /**
     * Next.js 16 기본값은 `**` + `search: ''`로 쿼리 없는 로컬 경로만 허용합니다.
     * `/images/...?v=...` 캐시 버스트는 `search`를 생략한 패턴으로 허용합니다.
     * (`/_next/static/media/**`는 빌드 시 자동으로 이어집니다.)
     */
    localPatterns: [
      {
        pathname: "/images/**",
      },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
