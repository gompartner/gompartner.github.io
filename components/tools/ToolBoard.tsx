"use client";

import Link from "next/link";
import { useState } from "react";
import { toolCategories, tools } from "@/data/tools";

/** 자료실 목록: 분류 탭과 제목 검색이 있는 게시판형 목록 */
export function ToolBoard() {
  const [cat, setCat] = useState<string>("전체");
  const [q, setQ] = useState("");
  const list = tools.filter((t) => (cat === "전체" || t.category === cat) && (!q.trim() || t.title.includes(q.trim())));
  const tabs = ["전체", ...toolCategories];

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[16px]" role="tablist" aria-label="자료 분류">
          {tabs.map((t) => (
            <li key={t}>
              <button
                type="button"
                role="tab"
                aria-selected={cat === t}
                onClick={() => setCat(t)}
                className={`border-b-2 pb-1.5 ${cat === t ? "border-foreground font-bold" : "border-transparent text-foreground-secondary hover:text-foreground"}`}
              >
                {t}
              </button>
            </li>
          ))}
        </ul>
        <form role="search" onSubmit={(e) => e.preventDefault()} className="flex w-full max-w-[320px]">
          <label htmlFor="tool-q" className="sr-only">
            제목 검색
          </label>
          <input
            id="tool-q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="제목 검색"
            className="h-10 min-w-0 flex-1 rounded-l-[6px] border border-border px-3 text-[15px]"
          />
          <button type="submit" className="h-10 rounded-r-[6px] border border-l-0 border-border px-4 text-[15px] font-semibold">
            검색
          </button>
        </form>
      </div>

      <p className="mt-5 text-[15px] text-foreground-secondary">
        전체 <b className="text-foreground">{list.length}</b>건
      </p>
      <table className="mt-2 w-full border-t-2 border-foreground text-[16px]">
        <caption className="sr-only">자료실 목록</caption>
        <thead className="hidden md:table-header-group">
          <tr className="border-b border-border text-[15px] text-foreground-secondary">
            <th scope="col" className="w-16 py-3 font-medium">번호</th>
            <th scope="col" className="w-32 py-3 font-medium">분류</th>
            <th scope="col" className="py-3 text-left font-medium">제목</th>
            <th scope="col" className="w-32 py-3 font-medium">등록일</th>
          </tr>
        </thead>
        <tbody>
          {list.map((t) => (
            <tr key={t.href} className="block border-b border-border py-3 md:table-row md:py-0">
              <td className="hidden py-3.5 text-center tabular-nums text-foreground-secondary md:table-cell">{tools.length - tools.indexOf(t)}</td>
              <td className="inline md:table-cell md:py-3.5 md:text-center">
                <span className="text-[14px] text-foreground-secondary md:text-[15px]">{t.category}</span>
              </td>
              <td className="block md:table-cell md:py-3.5">
                <Link href={t.href} className="font-medium hover:text-accent hover:underline hover:underline-offset-4">
                  {t.title}
                </Link>
              </td>
              <td className="block text-[14px] tabular-nums text-foreground-secondary md:table-cell md:py-3.5 md:text-center md:text-[15px]">{t.date}</td>
            </tr>
          ))}
          {list.length === 0 && (
            <tr>
              <td colSpan={4} className="py-10 text-center text-foreground-secondary">
                검색 결과가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
