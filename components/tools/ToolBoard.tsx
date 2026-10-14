"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight, Search } from "lucide-react";
import { toolRoles, tools } from "@/data/tools";

type Role = (typeof toolRoles)[number];

/** 자료실 목록: 누구인지 고르면 그 사람이 겪는 상황 말풍선이 나오고, 누르면 도구로 간다. 이름 검색은 아래에 따로 둔다. */
export function ToolBoard() {
  const [role, setRole] = useState<Role>("사장님");
  const [q, setQ] = useState("");
  const word = q.trim();
  const list = word
    ? tools.filter((t) => t.title.includes(word) || t.need.includes(word))
    : tools.filter((t) => (t.who as readonly string[]).includes(role));

  return (
    <div className="mt-8">
      <p className="inline-block rounded-full border-[3px] border-[#1d1d1f] bg-accent px-5 py-2 text-[17px] font-bold text-white md:text-[19px]">어떤 게 필요하세요?</p>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="누구신가요">
        {toolRoles.map((r) => {
          const on = !word && r === role;
          return (
            <button
              key={r}
              type="button"
              aria-pressed={on}
              onClick={() => {
                setRole(r);
                setQ("");
              }}
              className={`h-10 rounded-full border-[2.5px] border-[#1d1d1f] px-4 text-[15px] font-bold transition-colors ${on ? "bg-[#1d1d1f] text-white" : "bg-white hover:bg-[#fff3b0]"}`}
            >
              {r}
            </button>
          );
        })}
      </div>

      <ul key={word || role} className="soft-in mt-5 grid gap-3 md:grid-cols-2 md:gap-4" role="list">
        {list.map((t) => (
          <li key={t.href}>
            <Link
              href={t.href}
              className="group flex h-full items-center justify-between gap-3 rounded-[26px] rounded-bl-[6px] border-[3px] border-[#1d1d1f] bg-white py-3 pl-5 pr-3 shadow-[4px_4px_0_#1d1d1f] transition-[transform,box-shadow,background-color] duration-150 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#fff3b0] hover:shadow-[6px_6px_0_#1d1d1f] active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              <span className="min-w-0">
                <span className="block text-[17px] font-bold leading-[1.4] md:text-[19px]">{t.need}</span>
                <span className="mt-0.5 block text-[14px] font-bold text-foreground-tertiary">
                  {t.title} / {t.for}
                </span>
              </span>
              <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-full border-[2.5px] border-[#1d1d1f] bg-accent text-white transition-transform group-hover:translate-x-0.5">
                <ChevronRight size={18} strokeWidth={3} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {list.length === 0 && <p className="mt-5 text-[16px] text-foreground-secondary">찾는 도구가 없어요.</p>}

      <form role="search" onSubmit={(e) => e.preventDefault()} className="mt-10 flex max-w-[420px] items-center gap-2 border-t-2 border-dashed border-[#1d1d1f]/30 pt-6">
        <label htmlFor="tool-q" className="sr-only">
          도구 이름으로 찾기
        </label>
        <span className="relative flex-1">
          <Search size={18} strokeWidth={2.5} aria-hidden className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-foreground-tertiary" />
          <input
            id="tool-q"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="도구 이름으로 찾기"
            className="h-12 w-full rounded-full border-[2.5px] border-[#1d1d1f] bg-white pl-11 pr-4 text-[16px]"
          />
        </span>
      </form>
    </div>
  );
}
