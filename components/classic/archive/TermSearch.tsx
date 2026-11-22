"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SearchBox } from "@/components/classic/search/SearchBox";

// 아카이브 용어 검색(11-21 웹 용어 사전 검색창을 옮김). 결과를 누르면 그 용어 문서의 그 자리로 간다.
// 옛 주소 /glossary#t12 로 들어오면(301 뒤 /archive/terms#t12) 그 용어 문서로 넘긴다.
export type TermRow = { id: string; name: string; alt: string; look: string; hay: string; group: string; href: string };

export function TermSearch({ rows }: { rows: TermRow[] }) {
  const [q, setQ] = useState("");
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1));
    const hit = id ? rows.find((r) => r.id === id) : undefined;
    if (hit) location.replace(`${hit.href}#${hit.id}`);
  }, [rows]);
  const words = q.trim().split(/\s+/).filter(Boolean);
  const found = words.length ? rows.filter((r) => words.every((w) => [r.name, r.alt, r.look, r.hay, r.group].join(" ").includes(w))) : [];
  return (
    <div className="mt-6">
      <SearchBox id="terms-q" value={q} onChange={setQ} placeholder="예: 하트 버튼, 행간, 도메인 연장" suggestions={["달력", "팝업", "자물쇠", "행간", "도메인"]} />
      {words.length ? (
        <div className="mt-4" aria-live="polite">
          <p className="text-[14px] text-[#5b6370]">
            &quot;{q.trim()}&quot; 찾은 용어 <span className="tabular-nums">{found.length}</span>개
          </p>
          {found.length === 0 ? (
            <p className="py-10 text-center text-[15.5px] text-[#5b6370]">찾는 용어가 없습니다. 생김새를 설명하는 말로 다시 찾아 보세요.</p>
          ) : (
            <ul role="list" className="mt-2">
              {found.slice(0, 40).map((r) => (
                <li key={r.id} className="border-b border-[#e6e9ee]">
                  <Link href={`${r.href}#${r.id}`} className="group block py-3">
                    <span className="text-[16px] font-[800] group-hover:text-[#256ef4]">{r.name}</span>
                    <span className="ml-2 text-[13px] font-bold text-[#1d5fd6]">{r.group}</span>
                    <span className="mt-0.5 block text-[14px] leading-[1.55] text-[#5b6370]">{r.look}. {r.alt}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
