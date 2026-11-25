"use client";

import Image from "next/image";
import { NavLink as Link } from "@/components/classic/NavLink";
import { ArrowUpRight } from "lucide-react";
import type { SearchItem, SearchKind } from "./index";
import { NEW_TAB, NewTabMark, isOutside } from "@/components/classic/NewTab";

export const ORDER: SearchKind[] = ["바로가기", "서비스", "카탈로그", "위키", "운영 노트", "네이버 블로그", "티스토리", "유튜브", "무료 도구", "용어", "자주 묻는 질문", "공지사항"];

/** 검색 결과 묶음. 종류별로 나눠 보여 준다 */
export function SearchResults({ items, grouped = true }: { items: SearchItem[]; grouped?: boolean }) {
  // 같은 주소와 제목이 두 번 들어온 결과는 한 번만 보여 준다(내린 페이지들이 /make, /maintenance 하나로 모이며 겹쳤다)
  const seen = new Set<string>();
  const uniq = items.filter((i) => !seen.has(`${i.href}|${i.title}`) && seen.add(`${i.href}|${i.title}`));
  const groups = grouped ? ORDER.map((k) => ({ k, list: uniq.filter((i) => i.kind === k) })).filter((g) => g.list.length > 0) : [{ k: "카탈로그" as SearchKind, list: uniq }];
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
                <li key={`${i.href}-${i.title}`} className="min-w-0">
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
                  <Link href={i.href} {...(isOutside(i.href) ? NEW_TAB : {})} className="group flex items-start justify-between gap-4 py-5">
                    <span className="min-w-0">
                      <span className="block text-[17px] font-bold leading-[1.45] group-hover:text-[#256ef4]">{i.title}</span>
                      <span className="mt-1 line-clamp-2 block text-[15px] leading-[1.6] text-[#5b6370]">{i.desc}</span>
                    </span>
                    {isOutside(i.href) ? (
                      <span className="mt-1 shrink-0 text-[#6b7280] group-hover:text-[#256ef4]">
                        <NewTabMark size={19} />
                      </span>
                    ) : (
                      <ArrowUpRight size={20} aria-hidden className="mt-1 shrink-0 text-[#6b7280] group-hover:text-[#256ef4]" />
                    )}
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
