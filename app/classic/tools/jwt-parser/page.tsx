import type { Metadata } from "next";
import { JwtParser } from "@/components/classic/tools/JwtParser";
import { fitDescription } from "@/lib/seo";
import { ToolFrame } from "@/components/classic/support/ToolFrame";

export const metadata: Metadata = {
  title: "JWT 파서 (디코더, 서명 확인, 무료)",
  description: fitDescription("JWT 토큰의 헤더와 페이로드를 풀고 exp, iat 같은 시각을 한국 시간으로 보여 줍니다. HS256, HS384, HS512 서명을 브라우저 안에서 확인하며 토큰을 서버로 보내지 않습니다."),
  alternates: { canonical: "/tools/jwt-parser" },
};

export default function ClassicJwtParserPage() {
  return (
    <ToolFrame href="/classic/tools/jwt-parser">
      <JwtParser />
    </ToolFrame>
  );
}
