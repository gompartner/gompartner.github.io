"use client";

import Link from "next/link";
import { useState } from "react";
import { ReadMark } from "@/components/classic/archive/ReadMark";

// 11-22 한국 웹 연표: 시대마다 이야기, 깊이 읽기, 그 시대 사건. 위 주제 태그로 사건을 거른다(이야기는 그대로)
export type EraView = { id: string; label: string; title: string; story: string[]; read: { href: string; title: string; ver?: string }[] };
export type EventView = { era: string; when: string; text: string; topic: string; region?: string; href?: string; doc?: string; src?: { label: string; url: string } };

const tone: Record<string, string> = {
  홈페이지: "text-[#1d5fd6]",
  화면: "text-[#5b3fb0]",
  기술: "text-[#17734a]",
  "보안과 사고": "text-[#b42318]",
  "검색과 AI": "text-[#9a5300]",
  "법과 공공": "text-[#3d4450]",
};

export function HistoryView({ eras, events, topics }: { eras: EraView[]; events: EventView[]; topics: string[] }) {
  const [sel, setSel] = useState("전체");
  const [korea, setKorea] = useState(false);
  const pass = (e: EventView) => (sel === "전체" || e.topic === sel) && (!korea || !e.region);
  return (
    <div>
      <div className="sticky top-16 z-10 -mx-4 mt-6 border-b border-[#e6e9ee] bg-white px-4 py-2.5 md:top-[76px] md:mx-0 md:px-0 [@media(pointer:coarse)_and_(min-width:768px)]:top-0">
        <div role="group" aria-label="주제로 거르기" className="-mx-4 flex gap-1.5 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
          {["전체", ...topics].map((t) => (
            <button key={t} type="button" aria-pressed={sel === t} onClick={() => setSel(t)} className={`min-h-[34px] shrink-0 whitespace-nowrap rounded-full border px-3 text-[13.5px] font-bold ${sel === t ? "border-[#256ef4] bg-[#256ef4] text-white" : "border-[#d9dee5] bg-white text-[#3d4450] hover:border-[#256ef4]"}`}>
              {t}
            </button>
          ))}
          <button type="button" aria-pressed={korea} onClick={() => setKorea(!korea)} className={`min-h-[34px] shrink-0 whitespace-nowrap rounded-full border px-3 text-[13.5px] font-bold ${korea ? "border-[#256ef4] bg-[#eef3ff] text-[#1d5fd6]" : "border-[#d9dee5] bg-white text-[#3d4450]"}`}>
            한국만
          </button>
        </div>
      </div>

      {eras.map((era) => {
        const list = events.filter((e) => e.era === era.id && pass(e));
        return (
          <section key={era.id} aria-labelledby={era.id} className="mt-12 scroll-mt-40">
            <p className="text-[14px] font-[800] tabular-nums text-[#256ef4]">{era.label}</p>
            <h2 id={era.id} className="mt-1 scroll-mt-40 text-[24px] font-[800] tracking-[-0.035em] md:text-[28px]">{era.title}</h2>
            {era.story.map((t, i) => (
              <p key={i} className="mt-4 max-w-[760px] text-[16.5px] leading-[1.8] text-[#2b313b]">{t}</p>
            ))}

            <p className="mt-6 text-[13px] font-[800] text-[#6b7380]">깊이 읽기</p>
            <ul role="list" className="mt-2 grid gap-2 sm:grid-cols-2">
              {era.read.map((d) => (
                <li key={d.href}>
                  <Link href={d.href} className="group flex h-full items-start justify-between gap-3 rounded-lg border border-[#d9dee5] bg-white px-3.5 py-3 hover:border-[#256ef4]">
                    <span className="text-[14.5px] font-bold leading-[1.5] group-hover:text-[#256ef4]">{d.title}</span>
                    <ReadMark href={d.href} ver={d.ver} />
                  </Link>
                </li>
              ))}
            </ul>

            <ol role="list" className="mt-6 border-l-2 border-[#e1e5eb] pl-5">
              {list.map((e, i) => (
                <li key={i} className="relative pb-4 last:pb-0">
                  <span aria-hidden className="absolute -left-[27px] top-[7px] h-[10px] w-[10px] rounded-full border-2 border-white bg-[#9aa3b0]" />
                  <p className="flex flex-wrap items-baseline gap-x-2 text-[13px]">
                    <b className="text-[14px] font-[800] tabular-nums text-[#15171c]">{e.when}</b>
                    <span className={`font-bold ${tone[e.topic] ?? ""}`}>{e.topic}</span>
                    {e.region ? <span className="text-[#6b7380]">{e.region}</span> : null}
                  </p>
                  <p className="mt-0.5 max-w-[760px] text-[15px] leading-[1.65] text-[#2b313b]">
                    {e.text}{" "}
                    {e.href ? (
                      <Link href={e.href} className="whitespace-nowrap text-[13px] font-bold text-[#5b6370] underline-offset-4 hover:text-[#256ef4] hover:underline">{e.doc}</Link>
                    ) : e.src ? (
                      <a href={e.src.url} target="_blank" rel="noopener noreferrer" className="whitespace-nowrap text-[13px] text-[#6b7380] underline underline-offset-4 hover:text-[#256ef4]">출처: {e.src.label}</a>
                    ) : null}
                  </p>
                </li>
              ))}
              {list.length === 0 ? <li className="text-[14px] text-[#6b7380]">이 주제의 사건이 이 시대에는 없습니다.</li> : null}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
