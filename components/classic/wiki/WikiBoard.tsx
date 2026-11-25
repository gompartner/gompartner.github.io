"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronUp, Search, SlidersHorizontal, X } from "lucide-react";
import { BoardShell } from "@/components/classic/board/ui";

// 11-26 위키(위키) 찾기 판. 사용자 "찾을 때 편의성이 개판, 양이 많아지면 불편, 분류가 많아지면 필터 버튼 팝업에서 여러 개 선택까지".
// 방향 셋: (1) 지금처럼 주제별 나무 목록 (2) 서버 DB와 검색 API (3) 문서 목록을 한 표로 모으고 검색과 여러 개 고르는 필터.
// 문서가 수백 개 수준이라 (3)으로 한다. 목록(docs)은 한 곳에서 만들어 넘겨받는 표 한 장이라, 문서가 더 늘면 이 표만 DB로 옮기면 된다.
// 필터 팝업: 왼쪽에서 주제를 고르고 오른쪽에서 그 주제의 묶음을 여러 개 체크, 아래에서 종류를 체크, 선택 완료를 눌러야 적용된다.

export type WikiDoc = { title: string; href: string; topic: string; group: string; kind: string; updated?: string };
type Pick = { groups: string[]; kinds: string[] };
const key = (topic: string, group: string) => `${topic}\u0001${group}`;
const PAGE = 30;

export function WikiBoard({ docs, topics, kinds }: { docs: WikiDoc[]; topics: { label: string; groups: string[] }[]; kinds: string[] }) {
  const [q, setQ] = useState("");
  const [pick, setPick] = useState<Pick>({ groups: [], kinds: [] });
  const [draft, setDraft] = useState<Pick>(pick);
  const [tab, setTab] = useState(0);
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(PAGE);
  const dlg = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dlg.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      // 열릴 때 첫 버튼(로고, 닫기)에 파란 초점 테두리가 뜨지 않게 팝업 자신에 초점을 둔다. 키보드는 Tab으로 이어 간다
      d.focus();
    }
    if (!open && d.open) d.close();
  }, [open]);

  const list = useMemo(() => {
    const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return docs.filter((d) => {
      if (pick.groups.length && !pick.groups.includes(key(d.topic, d.group))) return false;
      if (pick.kinds.length && !pick.kinds.includes(d.kind)) return false;
      const hay = `${d.title} ${d.topic} ${d.group}`.toLowerCase();
      return words.every((w) => hay.includes(w));
    });
  }, [docs, q, pick]);

  const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const nSel = pick.groups.length + pick.kinds.length;
  const t = topics[tab];
  const allOn = t.groups.every((g) => draft.groups.includes(key(t.label, g)));

  return (
    <BoardShell no="05" en="WIKI" ice="무엇을 " title="찾으세요" lead="낱말로 찾거나, 필터에서 주제와 종류를 여러 개 골라 좁힐 수 있습니다.">
      <div className="mt-10 flex flex-wrap gap-3 md:mt-14">
        <label className="flex h-14 min-w-0 flex-1 basis-[280px] items-center gap-3 overflow-hidden rounded-full bg-white px-5 text-[#0b0d12]">
          <Search size={20} aria-hidden className="shrink-0 text-[#5b6370]" />
          <span className="sr-only">문서 검색</span>
          <input
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setShown(PAGE);
            }}
            placeholder="예: 인증서, 워드프레스, 접근성"
            className="h-full min-w-0 flex-1 bg-transparent text-[17px] outline-none placeholder:text-[#8a94a6] [&::-webkit-search-cancel-button]:hidden"
          />
        </label>
        <button
          type="button"
          onClick={() => {
            setDraft(pick);
            setOpen(true);
          }}
          className="inline-flex h-14 items-center gap-2 rounded-full border border-white/30 px-6 text-[17px] font-[800] text-white hover:border-white"
        >
          <SlidersHorizontal size={18} aria-hidden />
          필터
          {nSel > 0 && <span className="grid h-6 min-w-6 place-items-center rounded-full bg-[#256ef4] px-1.5 text-[13px] tabular-nums">{nSel}</span>}
        </button>
      </div>

      {nSel > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2" role="list" aria-label="고른 필터">
          {pick.groups.map((g) => {
            const [tp, gr] = g.split("\u0001");
            return (
              <li key={g}>
                <button type="button" onClick={() => setPick((p) => ({ ...p, groups: p.groups.filter((x) => x !== g) }))} className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-[#7aa7ff]/15 px-4 text-[15px] font-bold text-[#cfe0ff] hover:bg-[#7aa7ff]/25">
                  {tp} / {gr} <X size={15} aria-hidden />
                  <span className="sr-only">빼기</span>
                </button>
              </li>
            );
          })}
          {pick.kinds.map((k) => (
            <li key={k}>
              <button type="button" onClick={() => setPick((p) => ({ ...p, kinds: p.kinds.filter((x) => x !== k) }))} className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-[#ffd84d]/15 px-4 text-[15px] font-bold text-[#ffe58a] hover:bg-[#ffd84d]/25">
                {k} <X size={15} aria-hidden />
                <span className="sr-only">빼기</span>
              </button>
            </li>
          ))}
          <li>
            <button type="button" onClick={() => setPick({ groups: [], kinds: [] })} className="inline-flex min-h-11 items-center px-3 text-[15px] font-bold text-[#aab2bf] underline underline-offset-4 hover:text-white">
              모두 지우기
            </button>
          </li>
        </ul>
      )}

      <p className="mt-8 text-[15px] text-[#aab2bf]" aria-live="polite">
        문서 <b className="font-[800] text-white tabular-nums">{list.length}</b>개
      </p>
      <ul className="mt-3 border-t border-white/15" role="list">
        {list.slice(0, shown).map((d) => (
          <li key={`${d.href}-${d.topic}-${d.group}`} className="border-b border-white/10">
            <Link href={d.href} className="group grid gap-x-6 gap-y-1 py-4 md:grid-cols-[200px_1fr_auto] md:items-baseline md:py-5">
              <span className="text-[13px] font-bold text-[#7aa7ff] md:text-[14px]">
                {d.topic} <span className="text-white/40">/</span> {d.group}
              </span>
              <span className="break-keep text-[17px] font-[800] leading-[1.4] tracking-[-0.03em] text-white group-hover:text-[#7aa7ff] md:text-[19px]">{d.title}</span>
              <span className="flex items-center gap-3 text-[13px] text-[#8a94a6] md:text-[14px]">
                <span className="rounded-full border border-white/20 px-2.5 py-0.5">{d.kind}</span>
                {d.updated && <span className="tabular-nums">{d.updated.replaceAll("-", ".")}</span>}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {list.length === 0 && <p className="py-14 text-center text-[17px] text-[#aab2bf]">맞는 문서가 없습니다. 낱말을 줄이거나 필터를 지워 보세요.</p>}
      {list.length > shown && (
        <div className="mt-8 text-center">
          <button type="button" onClick={() => setShown((n) => n + PAGE)} className="inline-flex min-h-[52px] items-center rounded-full border border-white/30 px-7 text-[16px] font-bold text-white hover:border-white">
            {Math.min(PAGE, list.length - shown)}개 더 보기
          </button>
        </div>
      )}

      {/* 필터 팝업: 왼쪽 주제, 오른쪽 그 주제의 묶음(여러 개), 아래 종류. 선택 완료를 눌러야 적용 */}
      <dialog ref={dlg} tabIndex={-1} onClose={() => setOpen(false)} onClick={(e) => e.target === dlg.current && setOpen(false)} className="outline-none focus:outline-none m-auto w-[min(820px,calc(100vw-24px))] rounded-[20px] bg-white p-0 text-[#0b0d12] backdrop:bg-black/70">
        <div className="flex max-h-[calc(100dvh-24px)] flex-col">
          <div className="flex items-center justify-between border-b border-[#e6e9ee] px-5 py-4 md:px-6">
            <h2 className="text-[20px] font-[800] tracking-[-0.03em]">필터</h2>
            <button type="button" onClick={() => setOpen(false)} aria-label="닫기" className="grid h-11 w-11 place-items-center rounded-full hover:bg-[#f1f3f6]">
              <ChevronUp size={22} aria-hidden />
            </button>
          </div>
          <div className="grid min-h-0 flex-1 grid-cols-[minmax(120px,36%)_1fr]">
            <ul className="overflow-y-auto border-r border-[#e6e9ee]" role="tablist" aria-label="주제">
              {topics.map((x, i) => {
                const n = x.groups.filter((g) => draft.groups.includes(key(x.label, g))).length;
                return (
                  <li key={x.label} role="presentation">
                    <button type="button" role="tab" aria-selected={tab === i} onClick={() => setTab(i)} className={`flex min-h-[52px] w-full items-center justify-between gap-2 px-4 text-left text-[16px] md:px-6 md:text-[17px] ${tab === i ? "bg-[#256ef4] font-[800] text-white" : "hover:bg-[#f4f6fa]"}`}>
                      <span className="break-keep">{x.label}</span>
                      {n > 0 && <span className="tabular-nums">{n}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="overflow-y-auto p-3 md:p-4" role="tabpanel">
              <label className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-lg px-3 text-[16px] font-bold hover:bg-[#f4f6fa]">
                <input
                  type="checkbox"
                  checked={allOn}
                  onChange={() =>
                    setDraft((d) => {
                      const ks = t.groups.map((g) => key(t.label, g));
                      return { ...d, groups: allOn ? d.groups.filter((x) => !ks.includes(x)) : [...new Set([...d.groups, ...ks])] };
                    })
                  }
                  className="h-5 w-5 accent-[#256ef4]"
                />
                전체
              </label>
              {t.groups.map((g) => {
                const k = key(t.label, g);
                return (
                  <label key={k} className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-lg px-3 text-[16px] hover:bg-[#f4f6fa]">
                    <input type="checkbox" checked={draft.groups.includes(k)} onChange={() => setDraft((d) => ({ ...d, groups: toggle(d.groups, k) }))} className="h-5 w-5 accent-[#256ef4]" />
                    <span className={`break-keep ${draft.groups.includes(k) ? "font-bold text-[#256ef4]" : ""}`}>{g}</span>
                  </label>
                );
              })}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-[#e6e9ee] px-5 py-3 md:px-6">
            <span className="text-[14px] text-[#5b6370]">종류</span>
            {kinds.map((k) => (
              <label key={k} className="flex min-h-11 cursor-pointer items-center gap-2 text-[16px]">
                <input type="checkbox" checked={draft.kinds.includes(k)} onChange={() => setDraft((d) => ({ ...d, kinds: toggle(d.kinds, k) }))} className="h-5 w-5 accent-[#256ef4]" />
                {k}
              </label>
            ))}
          </div>
          <div className="grid grid-cols-[1fr_2fr] gap-2 border-t border-[#e6e9ee] p-4 md:p-5">
            <button type="button" onClick={() => setOpen(false)} className="min-h-[52px] rounded-lg border border-[#15171c] text-[16px] font-bold">
              닫기
            </button>
            <button
              type="button"
              onClick={() => {
                setPick(draft);
                setShown(PAGE);
                setOpen(false);
              }}
              className="min-h-[52px] rounded-lg bg-[#256ef4] text-[16px] font-bold text-white hover:bg-[#0b50d0]"
            >
              선택 완료
            </button>
          </div>
        </div>
      </dialog>
    </BoardShell>
  );
}
