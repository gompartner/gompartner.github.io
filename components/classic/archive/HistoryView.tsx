"use client";

import Link from "next/link";
import { useState } from "react";

// 11-22 한국 웹 연표: 시대마다 이야기, 깊이 읽기, 그 시대 사건. 위 주제 태그로 사건을 거른다(이야기는 그대로)
// 11-26 읽는 화면 정리: 사건 줄마다 붙던 문서 링크와 출처 링크를 뺐다. 그 사건을 다룬 문서는 시대마다 깊이 읽기 한 줄에,
// 바깥 출처는 문서 맨 아래 참고 자료에 모은다(app/(classic)/knowledge/history/page.tsx). 주제 이름의 색 구분도 한 색으로.
export type EraView = { id: string; label: string; title: string; story: string[]; read: { href: string; title: string }[] };
export type EventView = { era: string; when: string; text: string; topic: string; region?: string };

const chip = "min-h-[36px] shrink-0 whitespace-nowrap rounded-full border px-3.5 text-[14px] font-bold";
const chipOff = "border-[#d9dee5] text-[#3d4450] hover:border-[#15171c]";

export function HistoryView({ eras, events, topics }: { eras: EraView[]; events: EventView[]; topics: string[] }) {
  const [sel, setSel] = useState("전체");
  const [korea, setKorea] = useState(false);
  const pass = (e: EventView) => (sel === "전체" || e.topic === sel) && (!korea || !e.region);
  return (
    <>
      <div className="sticky top-16 z-10 -mx-4 mt-8 border-b border-white/12 bg-[#0b0d12] px-4 py-2.5 md:top-[76px] md:mx-0 md:px-0 [@media(pointer:coarse)_and_(min-width:768px)]:top-0">
        <div role="group" aria-label="주제로 거르기" className="-mx-4 flex gap-1.5 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:flex-wrap md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
          {["전체", ...topics].map((t) => (
            <button key={t} type="button" aria-pressed={sel === t} onClick={() => setSel(t)} className={`${chip} ${sel === t ? "gp-primary border-transparent" : chipOff}`}>
              {t}
            </button>
          ))}
          <button type="button" aria-pressed={korea} onClick={() => setKorea(!korea)} className={`${chip} ${korea ? "gp-primary border-transparent" : chipOff}`}>
            한국만
          </button>
        </div>
      </div>

      {eras.map((era) => {
        const list = events.filter((e) => e.era === era.id && pass(e));
        return (
          <section key={era.id} aria-labelledby={era.id} className="mt-14 anchor-40">
            <p className="text-[14px] font-[800] tabular-nums text-[#5b6370]">{era.label}</p>
            <h2 id={era.id} className="mt-1 anchor-40 break-keep text-[22px] font-[800] leading-[1.4] tracking-[-0.035em] md:text-[25px]">{era.title}</h2>
            {era.story.map((t, i) => (
              <p key={i} className="mt-4 text-[17px] leading-[1.8] text-[#2b313b]">{t}</p>
            ))}

            <ol role="list" className="mt-7 border-l border-[#d9dee5] pl-5">
              {list.map((e, i) => (
                <li key={i} className="relative pb-4 last:pb-0">
                  <span aria-hidden className="absolute -left-[25px] top-[8px] h-[9px] w-[9px] rounded-full bg-[#9aa3b0]" />
                  <p className="flex flex-wrap items-baseline gap-x-2 text-[13.5px] text-[#5b6370]">
                    <b className="text-[14.5px] font-[800] tabular-nums text-[#15171c]">{e.when}</b>
                    <span>{e.topic}</span>
                    {e.region ? <span>{e.region}</span> : null}
                  </p>
                  <p className="mt-0.5 text-[15.5px] leading-[1.7] text-[#2b313b]">{e.text}</p>
                </li>
              ))}
              {list.length === 0 ? <li className="text-[14.5px] text-[#5b6370]">이 주제의 사건이 이 시대에는 없습니다.</li> : null}
            </ol>

            <p className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-[14.5px] leading-[1.6]">
              <span className="font-bold text-[#5b6370]">깊이 읽기</span>
              {era.read.map((d) => (
                <Link key={d.href} href={d.href} className="-my-2 py-2 text-[#3d4450] underline underline-offset-4 hover:text-[#15171c]">
                  {d.title}
                </Link>
              ))}
            </p>
          </section>
        );
      })}
    </>
  );
}
