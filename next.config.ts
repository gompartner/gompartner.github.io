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
};

export default nextConfig;
