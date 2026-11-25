"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronUp, SlidersHorizontal, X } from "lucide-react";
import type { SearchItem, SearchKind } from "./index";
import { matches, norm } from "./match";
import { SearchBox } from "./SearchBox";
import { ORDER, SearchResults } from "./SearchResults";

const SUGGEST = ["홈페이지 제작", "오류 수정", "업체 변경", "워드프레스", "PHP", "예약", "견적 계산", "치과", "학원"];

// 통합검색. 주소의 ?q= 와 ?kind= 를 읽고, 바뀔 때마다 주소도 바꿔 둔다(뒤로 가기, 공유)
// 11-26 종류 필터(사용자 "통합검색 필요합니다 필터 기능 포함"): 결과가 있는 종류만 버튼으로 나오고 여러 개를 함께 고를 수 있다. 아무것도 안 고르면 전체.
export function SiteSearch({ index }: { index: SearchItem[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [kinds, setKinds] = useState<SearchKind[]>(() => (params.get("kind") ?? "").split(",").filter((k): k is SearchKind => (ORDER as string[]).includes(k)));
  useEffect(() => {
    const t = setTimeout(() => {
      const sp = new URLSearchParams();
      if (q.trim()) sp.set("q", q.trim());
      if (q.trim() && kinds.length) sp.set("kind", kinds.join(","));
      const qs = sp.toString();
      router.replace(qs ? `/search?${qs}` : "/search", { scroll: false });
    }, 300);
    return () => clearTimeout(t);
  }, [q, kinds, router]);

  // 빈칸만 친 것은 검색어가 없는 것으로 본다
  const term = q.trim();
  const found = useMemo(() => {
    // 같은 주소와 제목이 두 번 들어온 결과는 한 번만 센다
    const seen = new Set<string>();
    const list = index.filter((i) => matches(`${i.title} ${i.desc} ${i.hay} ${i.kind}`, term)).filter((i) => !seen.has(`${i.href}|${i.title}`) && seen.add(`${i.href}|${i.title}`));
    // 제목에 검색어가 든 결과를 그 종류 안에서 먼저 보여 준다(순서는 그대로 두고 앞으로만 당긴다)
    const words = term.split(/\s+/).map(norm).filter(Boolean);
    const inTitle = (i: SearchItem) => words.every((w) => norm(i.title).includes(w));
    return [...list.filter(inTitle), ...list.filter((i) => !inTitle(i))];
  }, [index, term]);
  const counts = useMemo(() => ORDER.map((k) => ({ k, n: found.filter((i) => i.kind === k).length })).filter((c) => c.n > 0), [found]);
  // 검색어가 바뀌어 결과가 없어진 종류는 선택에서 뺀 것으로 본다
  const active = term ? kinds.filter((k) => counts.some((c) => c.k === k)) : kinds;
  const shown = active.length ? found.filter((i) => active.includes(i.kind)) : found;
  const toggle = (k: SearchKind) => setKinds((v) => (v.includes(k) ? v.filter((x) => x !== k) : [...v, k]));
  // 필터 팝업: 검색어가 있으면 결과가 있는 종류와 건수, 없으면 고를 수 있는 모든 종류
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<SearchKind[]>([]);
  const dlg = useRef<HTMLDialogElement>(null);
  const options = useMemo(() => (term ? counts : ORDER.filter((k) => index.some((i) => i.kind === k)).map((k) => ({ k, n: 0 }))), [term, counts, index]);
  useEffect(() => {
    const d = dlg.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      d.focus();
    }
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <div>
      <SearchBox
        id="site-search"
        value={q}
        onChange={setQ}
        placeholder="서비스, 카탈로그, 위키, 자주 묻는 질문 검색"
        suggestions={SUGGEST}
        aside={
          <button
            type="button"
            onClick={() => {
              setDraft(active);
              setOpen(true);
            }}
            aria-haspopup="dialog"
            className="inline-flex h-[60px] shrink-0 items-center gap-2 rounded-full border-2 border-[#15171c] bg-white px-5 text-[16px] md:px-6 md:text-[17px] font-[800] text-[#15171c] hover:bg-[#f4f6fa]"
          >
            <SlidersHorizontal size={18} aria-hidden />
            필터
            {active.length > 0 ? <span className="grid h-6 min-w-6 place-items-center rounded-full bg-[#256ef4] px-1.5 text-[13px] tabular-nums text-white">{active.length}</span> : null}
          </button>
        }
      />
      {active.length > 0 ? (
        <ul className="mt-5 flex flex-wrap gap-2" role="list" aria-label="고른 필터">
          {active.map((k) => (
            <li key={k}>
              <button type="button" onClick={() => toggle(k)} className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-[#256ef4] bg-[#256ef4] px-4 text-[15px] font-bold text-white">
                {k} <X size={15} aria-hidden />
                <span className="sr-only">빼기</span>
              </button>
            </li>
          ))}
          <li>
            <button type="button" onClick={() => setKinds([])} className="inline-flex min-h-11 items-center px-3 text-[15px] font-bold text-[#5b6370] underline underline-offset-4 hover:text-[#15171c]">
              모두 지우기
            </button>
          </li>
        </ul>
      ) : null}

      {/* 필터 팝업(위키 판과 같은 방식): 종류를 여러 개 고르고 선택 완료를 눌러야 적용된다. 흰 팝업 그대로 두려고 keep-light로 감싼다 */}
      <div className="keep-light">
        <dialog ref={dlg} tabIndex={-1} onClose={() => setOpen(false)} onClick={(e) => e.target === dlg.current && setOpen(false)} aria-labelledby="sf-title" className="m-auto w-[min(520px,calc(100vw-24px))] rounded-[20px] bg-white p-0 text-[#0b0d12] outline-none backdrop:bg-black/70 focus:outline-none">
          <div className="flex max-h-[calc(100dvh-24px)] flex-col">
            <div className="flex shrink-0 items-center justify-between border-b border-[#e6e9ee] px-5 py-4 md:px-6">
              <h2 id="sf-title" className="text-[20px] font-[800] tracking-[-0.03em]">
                필터
              </h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="닫기" className="grid h-11 w-11 place-items-center rounded-full hover:bg-[#f1f3f6]">
                <ChevronUp size={22} aria-hidden />
              </button>
            </div>
            <div className="min-h-0 overflow-y-auto p-3 md:p-4">
              <p className="px-3 pb-1 pt-2 text-[14px] text-[#5b6370]">종류</p>
              {options.map((o) => (
                <label key={o.k} className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-lg px-3 text-[16px] hover:bg-[#f4f6fa]">
                  <input type="checkbox" checked={draft.includes(o.k)} onChange={() => setDraft((d) => (d.includes(o.k) ? d.filter((x) => x !== o.k) : [...d, o.k]))} className="h-5 w-5 accent-[#256ef4]" />
                  <span className={`break-keep ${draft.includes(o.k) ? "font-bold text-[#256ef4]" : ""}`}>{o.k}</span>
                  {term ? <span className="ml-auto text-[15px] tabular-nums text-[#5b6370]">{o.n}건</span> : null}
                </label>
              ))}
            </div>
            <div className="grid shrink-0 grid-cols-[1fr_2fr] gap-2 border-t border-[#e6e9ee] p-4 md:p-5">
              <button type="button" onClick={() => setOpen(false)} className="min-h-[52px] rounded-lg border border-[#15171c] text-[16px] font-bold">
                닫기
              </button>
              <button
                type="button"
                onClick={() => {
                  setKinds(draft);
                  setOpen(false);
                }}
                className="min-h-[52px] rounded-lg bg-[#256ef4] text-[16px] font-bold text-white hover:bg-[#0b50d0]"
              >
                선택 완료
              </button>
            </div>
          </div>
        </dialog>
      </div>
      <p className="mt-7 text-[15px] text-[#5b6370]" role="status">
        {term ? (
          <>
            <b className="break-all text-[#15171c]">{term}</b> 검색 결과 <b className="tabular-nums text-[#15171c]">{shown.length}</b>건{active.length ? <span> ({active.join(", ")})</span> : null}
          </>
        ) : (
          "검색어를 입력해 주십시오."
        )}
      </p>
      {term && shown.length > 0 ? (
        <div className="mt-8">
          <SearchResults items={shown} />
        </div>
      ) : null}
      {term && found.length === 0 ? <p className="mt-6 text-[16px]">다른 검색어로 찾아보시거나 Contact로 문의해 주십시오.</p> : null}
    </div>
  );
}
