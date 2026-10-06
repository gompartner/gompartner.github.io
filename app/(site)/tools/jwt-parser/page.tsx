import type { Metadata } from "next";
import { JwtParser } from "@/components/tools/JwtParser";

export const metadata: Metadata = {
  title: "JWT 파서 (디코더, 서명 확인, 무료)",
  description:
    "JWT 토큰의 헤더와 페이로드를 풀고 exp, iat 같은 시각을 한국 시간으로 보여 줍니다. HS256, HS384, HS512 서명을 브라우저 안에서 확인하며 토큰을 서버로 보내지 않습니다.",
  alternates: { canonical: "/tools/jwt-parser" },
};

export default function JwtParserPage() {
  return (
    <div className="mx-auto w-full max-w-[1248px] px-4 pb-10 pt-14 md:px-6 md:py-14">
      <h1 className="text-[28px] font-bold leading-[1.4] tracking-[-0.01em] md:text-[36px]">JWT 파서</h1>
      <JwtParser />
    </div>
  );
}
