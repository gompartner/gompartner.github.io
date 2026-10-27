import { PhpCheck } from "@/components/classic/tools/PhpCheck";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "PHP 취약점 점검 (PHP2Shell 패치 확인)",
  description: "홈페이지 주소를 넣으면 PHP 버전을 읽어 PHP2Shell 취약점 패치 여부를 알려 드려요.",
  path: "/tools/php-check",
});

export default function PhpCheckPage() {
  return (
    <div className="mx-auto w-full max-w-[1248px] px-4 pb-10 pt-14 md:px-6 md:py-14">
      <h1 className="mb-6 text-[28px] font-bold leading-[1.4] tracking-[-0.01em] md:text-[36px]">PHP 취약점 점검</h1>
      <PhpCheck />
    </div>
  );
}
