import Link from "next/link";
import { trendDocs } from "@/data/classic/archive";

// 트렌드 문서 이전, 다음(11-21). 순서는 data/classic/archive.ts trendDocs
export function TrendNav({ current }: { current: string }) {
  const i = trendDocs.findIndex((d) => d.href === current);
  const prev = trendDocs[i - 1];
  const next = trendDocs[i + 1];
  return (
    <nav aria-label="이전, 다음 문서" className="mt-10 grid gap-3 sm:grid-cols-2">
      {prev ? (
        <Link href={prev.href} className="rounded-lg border border-[#d9dee5] px-4 py-3.5 hover:border-[#256ef4]">
          <span className="block text-[13px] text-[#5b6370]">이전 {i}장</span>
          <span className="text-[15.5px] font-bold">{prev.title}</span>
        </Link>
      ) : (
        <Link href="/archive/trends" className="rounded-lg border border-[#d9dee5] px-4 py-3.5 hover:border-[#256ef4]">
          <span className="block text-[13px] text-[#5b6370]">목록</span>
          <span className="text-[15.5px] font-bold">트렌드 전체</span>
        </Link>
      )}
      {next ? (
        <Link href={next.href} className="rounded-lg border border-[#d9dee5] px-4 py-3.5 text-right hover:border-[#256ef4]">
          <span className="block text-[13px] text-[#5b6370]">다음 {i + 2}장</span>
          <span className="text-[15.5px] font-bold">{next.title}</span>
        </Link>
      ) : null}
    </nav>
  );
}
