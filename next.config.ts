import type { NextConfig } from "next";

// 정적 export 전용 구성.
// 보안 헤더와 /fonts 캐시 헤더는 output: "export"에서 지원되지 않으므로
// 호스팅 레이어(_headers, nginx 등)에서 설정해야 한다.
const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  poweredByHeader: false,
  // 같은 와이파이의 휴대폰, 아이패드로 개발 서버를 검수할 때 JS 요청이 403으로 막히지 않게 한다(개발 모드에만 적용)
  allowedDevOrigins: ["192.168.50.205"],
  // 개발 서버에서만: public/3d 정적 페이지를 실제 서버(Cloudflare)처럼 확장자 없이 연다.
  // 없으면 테스트 주소에서 /3d 화면과 3D 마을이 "페이지를 찾을 수 없습니다"로 나온다(11-25 사용자 제보). 빌드(output: export)에는 넣지 않는다
  ...(process.env.NODE_ENV === "development"
    ? {
        async rewrites() {
          return {
            beforeFiles: [
              { source: "/3d/island", destination: "/3d/island.html" },
              { source: "/3d/:name(ar|configurator|door|hanok|room|sign|sofa|space)", destination: "/3d/:name/index.html" },
            ],
          };
        },
      }
    : {}),
};

export default nextConfig;
