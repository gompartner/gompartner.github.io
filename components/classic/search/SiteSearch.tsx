"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronUp, Search, SearchX, SlidersHorizontal, X } from "lucide-react";
import type { SearchItem, SearchKind } from "./index";
import { matches, norm } from "./match";
import { SearchBox } from "./SearchBox";
import { PickItem } from "@/components/classic/FilterParts";
import { ORDER, SearchResults } from "./SearchResults";

const SUGGEST = ["홈페이지 제작", "오류 수정", "업체 변경", "워드프레스", "PHP", "예약", "견적 계산", "치과", "학원"];

// 통합검색. 주소의 ?q= 와 ?kind= 를 읽고, 바뀔 때마다 주소도 바꿔 둔다(뒤로 가기, 공유)
// 11-26 필터(사용자 "통합검색 필요합니다 필터 기능 포함", "필터도 하위 뎁스 체크하게"): 왼쪽에서 종류, 오른쪽에서 그 종류의 하위 분류를 여러 개 고른다.
// 고른 것은 "종류" 또는 "종류:하위" 꼴로 적는다(주소의 ?kind= 도 같은 꼴, 쉼표로 잇는다). 아무것도 안 고르면 전체.
const kindOf = (token: string) => token.split(":")[0] as SearchKind;
const hit = (sel: string[], i: SearchItem) => sel.includes(i.kind) || (!!i.sub && sel.includes(`${i.kind}:${i.sub}`));
export function SiteSearch({ index }: { index: SearchItem[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [kinds, setKinds] = useState<string[]>(() => (params.get("kind") ?? "").split(",").filter((k) => (ORDER as string[]).includes(kindOf(k))));
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
  // 검색어가 바뀌어 결과가 없어진 것은 선택에서 뺀 것으로 본다
  const active = term ? kinds.filter((k) => found.some((i) => hit([k], i))) : kinds;
  const shown = active.length ? found.filter((i) => hit(active, i)) : found;
  const toggle = (k: string) => setKinds((v) => (v.includes(k) ? v.filter((x) => x !== k) : [...v, k]));
  // 필터 팝업: 검색어가 있으면 결과가 있는 종류와 하위 분류(건수와 함께), 없으면 고를 수 있는 모든 것
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string[]>([]);
  const [tab, setTab] = useState(0);
  const dlg = useRef<HTMLDialogElement>(null);
  const options = useMemo(() => {
    const pool = term ? found : index;
    return ORDER.map((k) => {
      const list = pool.filter((i) => i.kind === k);
      const subs = [...new Set(list.map((i) => i.sub).filter((x): x is string => !!x))].map((name) => ({ name, n: list.filter((i) => i.sub === name).length }));
      return { k, n: list.length, subs };
    }).filter((o) => o.n > 0);
  }, [term, found, index]);
  const cur = options[Math.min(tab, options.length - 1)];
  // 종류 전체를 고르면 그 종류의 하위 선택은 지우고, 하위를 고르면 종류 전체 선택을 지운다
  const pickAll = (k: SearchKind) => setDraft((d) => (d.includes(k) ? d.filter((x) => x !== k) : [...d.filter((x) => kindOf(x) !== k), k]));
  const pickSub = (k: SearchKind, name: string) => setDraft((d) => (d.includes(`${k}:${name}`) ? d.filter((x) => x !== `${k}:${name}`) : [...d.filter((x) => x !== k), `${k}:${name}`]));
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
        placeholder="검색어를 입력하세요"
        suggestions={SUGGEST}
        aside={
          <button
            type="button"
            onClick={() => {
              setDraft(active);
              setTab(Math.max(0, options.findIndex((o) => active.some((x) => kindOf(x) === o.k))));
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
                {k.replace(":", " / ")} <X size={15} aria-hidden />
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
        <dialog ref={dlg} tabIndex={-1} onClose={() => setOpen(false)} onClick={(e) => e.target === dlg.current && setOpen(false)} aria-labelledby="sf-title" className="m-auto w-[min(760px,calc(100vw-24px))] rounded-[20px] border border-white/12 bg-[#121722] p-0 text-white outline-none backdrop:bg-black/70 focus:outline-none">
          <div className="flex h-[min(560px,calc(100dvh-24px))] flex-col">
            <div className="flex shrink-0 items-center justify-between border-b border-white/12 px-5 py-4 md:px-6">
              <h2 id="sf-title" className="text-[20px] font-[800] tracking-[-0.03em]">
                필터
              </h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="닫기" className="grid h-11 w-11 place-items-center rounded-full hover:bg-white/10">
                <ChevronUp size={22} aria-hidden />
              </button>
            </div>
            {/* 왼쪽 종류, 오른쪽 그 종류의 하위 분류 */}
            <div className="grid min-h-0 flex-1 grid-cols-[minmax(124px,38%)_1fr]">
              <ul className="overflow-y-auto border-r border-white/12" role="tablist" aria-label="종류">
                {options.map((o, i) => {
                  const n = draft.filter((x) => kindOf(x) === o.k).length;
                  return (
                    <li key={o.k} role="presentation">
                      <button type="button" role="tab" aria-selected={cur?.k === o.k} onClick={() => setTab(i)} className={`flex min-h-[52px] w-full items-center justify-between gap-2 px-4 text-left text-[16px] md:px-6 md:text-[17px] ${cur?.k === o.k ? "gp-on" : "text-[#c9ced6] hover:bg-white/5"}`}>
                        <span className="break-keep">{o.k}</span>
                        {n > 0 ? <span className="tabular-nums">{draft.includes(o.k) ? "전체" : n}</span> : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="overflow-y-auto p-3 md:p-4" role="tabpanel">
                {cur ? (
                  <>
                    <PickItem checked={draft.includes(cur.k)} onChange={() => pickAll(cur.k)} note={term ? `${cur.n}건` : undefined}>
                      전체
                    </PickItem>
                    {cur.subs.length > 1 ? (
                      <div className="mt-1 grid border-t border-white/10 pt-1 sm:grid-cols-2">
                        {cur.subs.map((sub) => (
                          <PickItem key={sub.name} checked={draft.includes(`${cur.k}:${sub.name}`)} onChange={() => pickSub(cur.k, sub.name)} note={term ? `${sub.n}건` : undefined}>
                            {sub.name}
                          </PickItem>
                        ))}
                      </div>
                    ) : null}
                  </>
                ) : null}
              </div>
            </div>
            <div className="grid shrink-0 grid-cols-[1fr_2fr] gap-2 border-t border-white/12 p-4 md:p-5">
              <button type="button" onClick={() => setOpen(false)} className="min-h-[52px] rounded-lg border border-white/30 text-[16px] font-bold text-white hover:border-white/70">
                닫기
              </button>
              <button
                type="button"
                onClick={() => {
                  setKinds(draft);
                  setOpen(false);
                }}
                className="gp-primary min-h-[52px] rounded-lg text-[16px] font-bold"
              >
                선택 완료
              </button>
            </div>
          </div>
        </dialog>
      </div>
      {/* 11-26 사용자 "텍스트만 나오고 보편적이지 않아": 국내 검색 화면에서 흔히 쓰는 꼴로. 결과 줄은 '검색어' 검색결과 N건, 빈 화면과 결과 없음은 아이콘과 안내로 */}
      <div role="status">
        {term && found.length > 0 ? (
          <p className="mt-7 text-[16px] text-[#3d4450]">
            <b className="break-all text-[#256ef4]">&apos;{term}&apos;</b> 검색결과 <b className="tabular-nums text-[#15171c]">{shown.length}</b>건
          </p>
        ) : null}
        {!term ? (
          <div className="mt-12 flex flex-col items-center px-4 py-10 text-center md:mt-16">
            <span aria-hidden className="grid h-16 w-16 place-items-center rounded-full bg-[#eef2f7] text-[#5b6370]">
              <Search size={28} />
            </span>
            <p className="mt-5 text-[18px] font-bold text-[#15171c]">검색어를 입력해 주세요.</p>
          </div>
        ) : null}
        {term && found.length === 0 ? (
          <div className="mt-12 flex flex-col items-center px-4 py-10 text-center md:mt-16">
            <span aria-hidden className="grid h-16 w-16 place-items-center rounded-full bg-[#eef2f7] text-[#5b6370]">
              <SearchX size={28} />
            </span>
            <p className="mt-5 break-keep text-[18px] font-bold text-[#15171c]">
              <span className="break-all text-[#256ef4]">&apos;{term}&apos;</span>에 대한 검색결과가 없습니다.
            </p>
            <ul className="mt-4 space-y-1 text-left text-[15px] leading-[1.7] text-[#5b6370]">
              <li>- 검색어의 철자가 정확한지 확인해 주세요.</li>
              <li>- 검색어의 단어 수를 줄이거나 다른 검색어로 검색해 보세요.</li>
            </ul>
          </div>
        ) : null}
      </div>
      {term && shown.length > 0 ? (
        <div className="mt-8">
          <SearchResults items={shown} />
        </div>
      ) : null}
    </div>
  );
}
