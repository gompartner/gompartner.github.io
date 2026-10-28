"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight, Search } from "lucide-react";

// 가이드 목록과 검색. 글이 계속 늘어나서 최근 글을 위에 두고, 제목, 설명, 본문을 띄어쓰기 단위로 모두 포함하는 글만 남긴다.
// 서버 쪽 페이지가 본문을 글자로 펴서(text) 넘긴다.
export type GuideItem = { slug: string; title: string; description: string; published: string; text: string; image?: { src: string; alt: string } };
type Look = "webtoon" | "classic";

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, "");

export function GuideList({ items, look }: { items: GuideItem[]; look: Look }) {
  const [q, setQ] = useState("");
  const sorted = useMemo(() => [...items].reverse().sort((a, b) => b.published.localeCompare(a.published)), [items]);
  const words = q.trim().split(/\s+/).filter(Boolean).map(norm);
  const list = words.length === 0 ? sorted : sorted.filter((g) => {
    const hay = norm(`${g.title} ${g.description} ${g.text}`);
    return words.every((w) => hay.includes(w));
  });
  const base = look === "classic" ? "/classic/guide" : "/guide";

  return (
    <>
      <form role="search" onSubmit={(e) => e.preventDefault()} className={look === "classic" ? "mb-6" : "mt-8"}>
        <label htmlFor="guide-q" className="sr-only">
          가이드 검색
        </label>
        <div className="relative max-w-[560px]">
          <Search size={20} aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6d7882]" />
          <input
            id="guide-q"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="예: PHP, 유지보수비, Vercel"
            className={
              look === "classic"
                ? "h-12 w-full rounded-md border border-[#6d7882] bg-white pl-11 pr-3 text-[17px]"
                : "h-12 w-full border-[3px] border-[#1d1d1f] bg-white pl-11 pr-3 text-[17px]"
            }
          />
        </div>
        <p aria-live="polite" className="mt-3 text-[15px] text-[#5b6370]">
          {words.length > 0 ? `${list.length}편` : `전체 ${items.length}편`}
        </p>
      </form>

      {list.length === 0 && (
        <p className="py-10 text-[17px] leading-[1.7]">
          찾는 글이 없어요. 겪고 있는 문제를 알려 주시면 답을 드릴게요.{" "}
          <Link href="/classic/contact" className="font-bold underline underline-offset-2">
            상담 신청하기
          </Link>
        </p>
      )}

      {look === "classic" ? (
        <ul className="border-t-2 border-[#15171c]" role="list">
          {list.map((g) => (
            <li key={g.slug} className="border-b border-[#e6e9ee]">
              <Link href={`${base}/${g.slug}`} className="group flex items-center gap-4 px-2 py-5 md:gap-6 md:px-4 md:py-6">
                {g.image && <Image src={g.image.src} alt="" width={160} height={90} className="hidden w-[160px] shrink-0 rounded sm:block" />}
                <span className="min-w-0 flex-1">
                  <span className="block text-[17px] font-bold leading-[1.5] tracking-[-0.02em] group-hover:text-[#256ef4] md:text-[19px]">{g.title}</span>
                  <span className="mt-1 block text-[15px] leading-[1.6] text-[#5b6370] md:text-[16px]">{g.description}</span>
                </span>
                <ChevronRight size={22} aria-hidden className="shrink-0 text-[#6b7280] group-hover:text-[#256ef4]" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="mt-6 grid gap-5 md:grid-cols-2" role="list">
          {list.map((g) => (
            <li key={g.slug}>
              <Link
                href={`${base}/${g.slug}`}
                className="group flex h-full flex-col border-[3px] border-[#1d1d1f] bg-white shadow-[5px_5px_0_#1d1d1f] transition-[transform,box-shadow,background-color] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#fff3b0] hover:shadow-[7px_7px_0_#1d1d1f] active:translate-x-1 active:translate-y-1 active:shadow-none motion-reduce:transition-none"
              >
                {g.image && <Image src={g.image.src} alt="" width={600} height={338} className="h-auto w-full border-b-[3px] border-[#1d1d1f]" />}
                <span className="flex flex-1 flex-col p-5 md:p-7">
                  <span className="text-[20px] font-bold leading-[1.45] md:text-[22px]">{g.title}</span>
                  <span className="mt-2 flex-1 text-[16px] leading-[1.65] text-foreground-secondary">{g.description}</span>
                  <span aria-hidden className="mt-4 grid h-9 w-9 place-items-center self-end rounded-full border-[2.5px] border-[#1d1d1f] bg-accent text-white">
                    <ArrowRight size={18} strokeWidth={3} />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
