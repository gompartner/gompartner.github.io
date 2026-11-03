import type { Metadata } from "next";
import { JwtParser } from "@/components/classic/tools/JwtParser";
import { pageMeta } from "@/lib/seo";
import { ToolFrame } from "@/components/classic/support/ToolFrame";

// 11-04 공유 미리보기(카톡 등)도 이 도구의 제목, 설명, 주소로 나오게 pageMeta를 쓴다
export const metadata: Metadata = pageMeta({ title: "JWT 파서 (디코더, 서명 확인, 무료)", description: "JWT 토큰의 헤더와 페이로드를 풀고 exp, iat 같은 시각을 한국 시간으로 보여 줍니다. HS256, HS384, HS512 서명을 브라우저 안에서 확인하며 토큰을 서버로 보내지 않습니다.", path: "/tools/jwt-parser" });

export default function ClassicJwtParserPage() {
  return (
    <ToolFrame href="/tools/jwt-parser">
      <JwtParser />
    </ToolFrame>
  );
}
