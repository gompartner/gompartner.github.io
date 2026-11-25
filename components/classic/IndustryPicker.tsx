"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Mic, Search } from "lucide-react";

// 11-25 대표: "업종 고르기 셀렉트를 일일이 고르기 힘들다. 몇 글자만 치거나 말로 해도 업종이 되게".
// 글자 몇 개(초성도 됨, 예: ㅊㄱ, 피부, 필라)로 걸러 고르고, 마이크 버튼으로 말하면 가장 가까운 업종을 바로 고른다.
// 말하기는 브라우저 음성 인식(Web Speech API)을 쓰고, 지원하지 않는 브라우저에서는 버튼을 숨긴다.

export type PickItem = { id: string; name: string; group: string };

const CHO = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
const cho = (s: string) =>
  Array.from(s)
    .map((c) => {
      const k = c.charCodeAt(0) - 0xac00;
      return k >= 0 && k < 11172 ? CHO[Math.floor(k / 588)] : c;
    })
    .join("");
const clean = (s: string) => s.replace(/\s+/g, "").replace(/(홈페이지|업종|병원이요|이요|요|입니다|해줘|보여줘)$/g, "").toLowerCase();

// 말이나 글로 흔히 부르는 다른 이름(업종 이름에 없는 말만)
const ALIAS: Record<string, string[]> = {
  치과: ["이빨", "치아", "임플란트", "교정"],
  피부과: ["피부", "에스테틱", "레이저"],
  정형외과: ["허리", "무릎", "관절", "척추"],
  소아과: ["소아청소년과", "아이병원", "어린이병원"],
  한의원: ["한방", "침"],
  동물병원: ["강아지", "고양이", "반려동물"],
  미용실: ["헤어", "헤어샵", "머리"],
  네일: ["네일샵", "손톱"],
  필라테스: ["요가", "운동"],
  한식당: ["식당", "음식점", "밥집"],
  로스터리: ["커피", "카페", "원두"],
  "세무 회계": ["세무사", "회계사", "기장"],
  법률사무소: ["변호사", "로펌"],
  부동산: ["공인중개사", "중개사무소"],
};

/** 점수가 높을수록 잘 맞는다. 0이면 안 맞음 */
function score(it: PickItem, q: string) {
  if (!q) return 1;
  const n = clean(it.name);
  const aliases = Object.entries(ALIAS).find(([k]) => clean(k) === n)?.[1] ?? [];
  if (n === q) return 100;
  if (n.startsWith(q)) return 80;
  if (n.includes(q)) return 60;
  if (aliases.some((a) => clean(a).includes(q) || q.includes(clean(a)))) return 50;
  if (q.length >= 2 && q.includes(n)) return 45;
  if (/^[ㄱ-ㅎ]+$/.test(q) && cho(n).includes(q)) return 40;
  if (clean(it.group).includes(q)) return 20;
  return 0;
}

export function IndustryPicker({ items, value, onPick }: { items: PickItem[]; value: string; onPick: (id: string) => void }) {
  const cur = items.find((i) => i.id === value) ?? items[0];
  const [q, setQ] = useState<string | null>(null); // null이면 고른 이름을 보여 준다
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const [listening, setListening] = useState(false);
  const [canTalk, setCanTalk] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const box = useRef<HTMLDivElement>(null);

  const found = useMemo(() => {
    const t = clean(q ?? "");
    return items
      .map((it) => ({ it, s: score(it, t) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .map((x) => x.it);
  }, [items, q]);

  useEffect(() => {
    const W = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
    queueMicrotask(() => setCanTalk(Boolean(W.SpeechRecognition || W.webkitSpeechRecognition)));
    const off = (e: PointerEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) {
        setOpen(false);
        setQ(null);
      }
    };
    document.addEventListener("pointerdown", off);
    return () => document.removeEventListener("pointerdown", off);
  }, []);

  const pick = (id: string) => {
    onPick(id);
    setQ(null);
    setOpen(false);
    input.current?.blur();
  };

  const talk = () => {
    const W = window as unknown as { SpeechRecognition?: new () => SpeechRec; webkitSpeechRecognition?: new () => SpeechRec };
    const R = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    if (!R) return;
    const r = new R();
    r.lang = "ko-KR";
    r.interimResults = false;
    r.maxAlternatives = 3;
    setListening(true);
    r.onresult = (ev) => {
      // 들은 후보 몇 개 중 가장 잘 맞는 업종을 고른다
      const said = Array.from(ev.results[0]).map((a) => a.transcript);
      let best: { id: string; s: number } | null = null;
      for (const t of said) {
        for (const it of items) {
          const s = score(it, clean(t));
          if (s > 0 && (!best || s > best.s)) best = { id: it.id, s };
        }
      }
      if (best) pick(best.id);
      else {
        setQ(said[0] ?? "");
        setOpen(true);
      }
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    r.start();
  };

  return (
    <div ref={box} className="relative inline-flex max-w-full items-center">
      <span className="pointer-events-none absolute left-3 text-[#8a929e]">
        <Search size={18} aria-hidden />
      </span>
      <input
        ref={input}
        role="combobox"
        aria-expanded={open}
        aria-controls="industry-list"
        aria-autocomplete="list"
        aria-label="업종 검색"
        value={q ?? cur.name}
        placeholder="업종 이름 몇 글자"
        onFocus={(e) => {
          setQ("");
          setOpen(true);
          setHi(0);
          e.currentTarget.select();
        }}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
          setHi(0);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHi((h) => Math.min(found.length - 1, h + 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHi((h) => Math.max(0, h - 1));
          } else if (e.key === "Enter") {
            e.preventDefault();
            if (found[hi]) pick(found[hi].id);
          } else if (e.key === "Escape") {
            setOpen(false);
            setQ(null);
            input.current?.blur();
          }
        }}
        className={`h-12 w-[230px] max-w-full rounded-md border-2 border-[#15171c] bg-white pl-9 text-[19px] font-[800] text-[#15171c] placeholder:text-[16px] placeholder:font-semibold placeholder:text-[#9aa1ab] md:h-14 md:w-[260px] md:text-[24px] ${canTalk ? "pr-12" : "pr-3"}`}
      />
      {canTalk && (
        <button
          type="button"
          onClick={talk}
          aria-label={listening ? "듣는 중" : "말로 업종 고르기"}
          className={`absolute right-1.5 grid h-9 w-9 place-items-center rounded-md md:h-10 md:w-10 ${listening ? "animate-pulse bg-[#256ef4] text-white" : "text-[#3b4350] hover:bg-[#eef1f5]"}`}
        >
          <Mic size={20} aria-hidden />
        </button>
      )}
      {open && (
        <ul id="industry-list" role="listbox" className="absolute left-0 top-full z-30 mt-1 max-h-[320px] w-[min(320px,calc(100vw-2rem))] overflow-auto rounded-md border-2 border-[#15171c] bg-white py-1 text-[16px] font-semibold tracking-normal shadow-[0_12px_30px_rgba(15,27,61,0.18)]">
          {found.length === 0 && <li className="px-3 py-2.5 text-[#6b7280]">맞는 업종이 없습니다</li>}
          {found.map((it, k) => (
            <li
              key={it.id}
              role="option"
              aria-selected={k === hi}
              onPointerDown={(e) => {
                e.preventDefault();
                pick(it.id);
              }}
              onPointerEnter={() => setHi(k)}
              className={`flex cursor-pointer items-baseline justify-between gap-3 px-3 py-2.5 ${k === hi ? "bg-[#eef4ff] text-[#1d5fd6]" : "text-[#15171c]"}`}
            >
              <span>{it.name}</span>
              <span className="text-[13px] font-medium text-[#8a929e]">{it.group}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type SpeechRec = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  onresult: (ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
  onend: () => void;
  onerror: () => void;
};
