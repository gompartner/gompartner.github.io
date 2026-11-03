import type { Metadata } from "next";
import { PhpCheck } from "@/components/classic/tools/PhpCheck";
import { pageMeta } from "@/lib/seo";
import { ToolFrame } from "@/components/classic/support/ToolFrame";

// 11-04 공유 미리보기(카톡 등)도 이 도구의 제목, 설명, 주소로 나오게 pageMeta를 쓴다
export const metadata: Metadata = pageMeta({ title: "PHP 취약점 점검 (PHP2Shell 패치 확인)", description: "홈페이지 주소를 넣으면 PHP 버전을 읽어 PHP2Shell 취약점 패치 여부를 알려 드려요.", path: "/tools/php-check" });

export default function ClassicPhpCheckPage() {
  return (
    <ToolFrame href="/tools/php-check">
      <PhpCheck />
    </ToolFrame>
  );
}
