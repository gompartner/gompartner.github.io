import type { Metadata } from "next";
import { PhpCheck } from "@/components/classic/tools/PhpCheck";
import { fitDescription } from "@/lib/seo";
import { ToolFrame } from "@/components/classic/support/ToolFrame";

export const metadata: Metadata = {
  title: "PHP 취약점 점검 (PHP2Shell 패치 확인)",
  description: fitDescription("홈페이지 주소를 넣으면 PHP 버전을 읽어 PHP2Shell 취약점 패치 여부를 알려 드려요."),
  alternates: { canonical: "/tools/php-check" },
};

export default function ClassicPhpCheckPage() {
  return (
    <ToolFrame href="/classic/tools/php-check">
      <PhpCheck />
    </ToolFrame>
  );
}
