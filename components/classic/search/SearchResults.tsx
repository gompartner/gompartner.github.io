"use client";

import Image from "next/image";
import { NavLink as Link } from "@/components/classic/NavLink";
import { ArrowUpRight } from "lucide-react";
import type { SearchItem, SearchKind } from "./index";

const ORDER: SearchKind[] = ["서비스", "카탈로그", "인사이트", "자료실", "자주 묻는 질문", "공지사항"];

/** 검색 결과 묶음. 종류별로 나눠 보여 준다 */
export function SearchResults({ items, grouped = true }: { items: SearchItem[]; grouped?: boolean }) {
  const groups = grouped ? ORDER.map((k) => ({ k, list: items.filter((i) => i.kind === k) })).filter((g) => g.list.length > 0) : [{ k: "카탈로그" as SearchKind, list: items }];
  return (
    <div className="space-y-12">
      {groups.map((g) => (
        <section key={g.k} aria-label={`${g.k} 검색 결과`}>
          {grouped ? (
            <h2 className="flex items-baseline gap-2 border-b-2 border-[#15171c] pb-3 text-[20px] font-[800] tracking-[-0.03em]">
              {g.k} <span className="text-[15px] font-bold tabular-nums text-[#5b6370]">{g.list.length}건</span>
            </h2>
          ) : null}
          {g.k === "카탈로그" ? (
            <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4" role="list">
              {g.list.map((i) => (
                <li key={i.href} className="min-w-0">
                  <Link href={i.href} className="group block">
                    <span className="block overflow-hidden rounded-md border border-[#e1e5eb] bg-white">
                      {i.thumb ? <Image src={i.thumb} alt={`${i.title} 화면`} width={720} height={450} sizes="(min-width: 1024px) 290px, 45vw" className="aspect-[16/10] w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none" /> : null}
                    </span>
                    <span className="mt-3 block break-keep text-[16px] font-bold leading-[1.4] group-hover:underline md:text-[17px]">{i.title}</span>
                    <span className="mt-1 line-clamp-2 block text-[14px] leading-[1.5] text-[#5b6370]">{i.desc}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <ul role="list">
              {g.list.map((i) => (
                <li key={`${i.href}-${i.title}`} className="border-b border-[#e6e9ee]">
                  <Link href={i.href} className="group flex items-start justify-between gap-4 py-5">
                    <span className="min-w-0">
                      <span className="block text-[17px] font-bold leading-[1.45] group-hover:text-[#256ef4]">{i.title}</span>
                      <span className="mt-1 line-clamp-2 block text-[15px] leading-[1.6] text-[#5b6370]">{i.desc}</span>
                    </span>
                    <ArrowUpRight size={20} aria-hidden className="mt-1 shrink-0 text-[#6b7280] group-hover:text-[#256ef4]" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
