import type { Metadata } from "next";
import Link from "next/link";
import { tools } from "@/data/tools";

export const metadata: Metadata = {
  title: "무료 도구",
  description: "개인정보처리방침 생성기, 웹접근성 자가 점검표, 검색 결과 미리보기, JWT 파서를 무료로 씁니다.",
  alternates: { canonical: "/tools" },
};

export default function ToolsPage() {
  return (
    <div className="mx-auto w-full max-w-[1248px] px-4 py-10 md:px-6 md:py-14">
      <h1 className="text-[28px] font-bold leading-[1.4] tracking-[-0.01em] md:text-[36px]">무료 도구</h1>
      <p className="mt-2 text-[17px] leading-[1.6] text-foreground-secondary">홈페이지를 운영하며 필요한 문서와 점검을 바로 할 수 있습니다.</p>
      <ul className="mt-8 grid gap-4 md:grid-cols-2">
        {tools.map((t) => (
          <li key={t.href}>
            <Link href={t.href} className="block h-full rounded-[10px] border border-border p-6 transition-colors hover:border-accent hover:bg-accent-surface">
              <p className="text-[15px] font-bold text-accent">{t.for}</p>
              <h2 className="mt-1 text-[21px] font-bold">{t.title}</h2>
              <p className="mt-2 text-[16px] leading-[1.6] text-foreground-secondary">{t.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
