"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, LayoutGrid, List, ListFilter, RotateCcw, Search, X } from "lucide-react";
import type { Project } from "@/lib/types";
import { capabilities, fields, fieldsById, type Capability, type Field } from "@/data/workFilters";
import { WorksGrid } from "./WorksGrid";
import { WorksList } from "./WorksList";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { returningTo, saveList } from "@/lib/listReturn";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

// 검색창 아래 바로 누르는 검색어
const suggestions = ["예약", "병원", "쇼핑몰", "학원", "계산", "지도", "엑셀", "관리자"];

const capKeywords = (name: Capability | null): readonly string[] => capabilities.find((c) => c.name === name)?.keywords ?? [];

const hasField = (p: Project, f: Field | null) => !f || (fieldsById[p.id] ?? []).includes(f);
const hasCap = (p: Project, c: Capability | null) => {
  if (!c) return true;
  const text = [p.title, p.description, ...p.features].join(" ");
  return capKeywords(c).some((k) => text.includes(k));
};

// 검색어는 띄어쓰기와 대소문자를 무시하고, 업종 분류도 함께 찾는다("병원"이면 결과지 프로그램도 나온다)
const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, "");
const searchText = (p: Project) => normalize([p.title, p.category, p.description, ...p.features, ...(fieldsById[p.id] ?? [])].join(" "));

// 샘플은 기본으로 "[업종]에서 쓰는 [기능]을 갖춘 샘플 N개" 문장의 빈칸을 골라 거르고,
// 원하면 검색어로 찾는 방식으로 바꿀 수 있다.
// 빈칸에서 고를 수 있는 단어에는 지금 조건의 샘플 수를 붙이고, 0개가 되는 단어는 막아 결과가 비지 않게 한다.
export function WorksSearch({ projects }: { projects: Project[] }) {
  const [mode, setMode] = useState<"pick" | "text">("pick");
  const [field, setField] = useState<Field | null>(null);
  const [cap, setCap] = useState<Capability | null>(null);
  const [open, setOpen] = useState<"field" | "cap" | null>(null);
  const [query, setQuery] = useState("");

  // 샘플 화면에서 "다른 샘플"로 돌아오면 고른 조건을 되살린다
  type Filters = { mode: "pick" | "text"; field: Field | null; cap: Capability | null; query: string };
  const restored = useRef(false);
  useEffect(() => {
    const f = returningTo(window.location.pathname)?.filters as Filters | undefined;
    const frame = requestAnimationFrame(() => {
      if (f) {
        setMode(f.mode);
        setField(f.field);
        setCap(f.cap);
        setQuery(f.query);
      } else {
        // 새로 들어온 목록이면 예전에 고른 조건을 지운다
        saveList({ path: window.location.pathname, filters: undefined });
      }
      restored.current = true;
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    if (restored.current) saveList({ path: window.location.pathname, filters: { mode, field, cap, query } satisfies Filters });
  }, [mode, field, cap, query]);

  const terms = query.split(/\s+/).map(normalize).filter(Boolean);
  const results =
    mode === "pick"
      ? projects.filter((p) => hasField(p, field) && hasCap(p, cap))
      : projects.filter((p) => terms.every((t) => searchText(p).includes(t)));
  const active = mode === "pick" ? Boolean(field || cap) : query !== "";

  const reset = () => {
    setField(null);
    setCap(null);
    setQuery("");
  };

  const fieldOptions = [
    { value: null, label: "모든 업종", count: projects.filter((p) => hasCap(p, cap)).length },
    ...fields.map((f) => ({ value: f, label: f, count: projects.filter((p) => hasField(p, f) && hasCap(p, cap)).length })),
  ];
  const capOptions = [
    { value: null, label: "모든 기능", count: projects.filter((p) => hasField(p, field)).length },
    ...capabilities.map((c) => ({
      value: c.name,
      label: `${c.name} 기능`,
      count: projects.filter((p) => hasField(p, field) && hasCap(p, c.name)).length,
    })),
  ];

  // 카드·목록 보기는 이 브라우저에만 기억한다
  const [view, setView] = useState<"card" | "list">("card");
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        if (localStorage.getItem("works-view") === "list") setView("list");
      } catch {}
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  const setViewSaved = (v: "card" | "list") => {
    setView(v);
    try {
      localStorage.setItem("works-view", v);
    } catch {}
  };

  const count = (
    <span aria-live="polite" className="whitespace-nowrap tabular-nums">
      <RollingText text={String(results.length)} />개
    </span>
  );

  return (
    <>
      <div role="group" aria-label="찾는 방법" className="mb-5 inline-flex rounded-full border-[2.5px] border-[#1d1d1f] bg-white p-1 text-[15px] shadow-[3px_3px_0_#1d1d1f] md:text-[16px]">
        {(
          [
            ["pick", "조건으로 고르기", ListFilter],
            ["text", "검색어로 찾기", Search],
          ] as const
        ).map(([m, label, Icon]) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            onClick={() => {
              setOpen(null);
              setMode(m);
            }}
            className={`inline-flex h-9 items-center gap-1.5 rounded-full px-4 font-bold transition-colors duration-150 ${
              mode === m ? "bg-[#1d1d1f] text-white" : "text-foreground-secondary hover:bg-[#fff3b0] hover:text-foreground"
            }`}
          >
            <Icon size={16} strokeWidth={2.5} aria-hidden />
            {label}
          </button>
        ))}
      </div>
      <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-8">
        <div className="relative min-h-[48px] flex-1 text-[17px] min-[390px]:text-[19px] font-bold leading-[1.8] tracking-[-0.01em] md:text-[26px]">
          <AnimatePresence mode="wait" initial={false}>
            {mode === "pick" ? (
              <motion.div key="pick" {...swap} className="whitespace-nowrap md:whitespace-normal">
                <span className="whitespace-nowrap">
                  <WordPicker
                    id="field"
                    label="업종"
                    options={fieldOptions}
                    value={field}
                    open={open === "field"}
                    onOpenChange={(o) => setOpen(o ? "field" : null)}
                    onChange={setField}
                  />
                  <span className="text-[13px] min-[390px]:text-[15px] md:text-[26px]">에서</span>
                </span>{" "}
                <span className="text-[13px] min-[390px]:text-[15px] md:text-[26px]">쓰는</span>{" "}
                <span className="whitespace-nowrap">
                  <WordPicker
                    id="cap"
                    label="기능"
                    options={capOptions}
                    value={cap}
                    open={open === "cap"}
                    onOpenChange={(o) => setOpen(o ? "cap" : null)}
                    onChange={setCap}
                  />
                  <span className="text-[13px] min-[390px]:text-[15px] md:text-[26px]">을</span>
                </span>{" "}
                <span className="whitespace-nowrap text-[13px] min-[390px]:text-[15px] md:text-[26px]">갖춘 샘플</span>
              </motion.div>
            ) : (
              <motion.div key="text" {...swap} className="flex flex-col gap-4">
                <label htmlFor="works-search" className="sr-only">
                  샘플 검색
                </label>
                <span className="relative block w-full max-w-[560px]">
                  <Search
                    size={22}
                    strokeWidth={2.75}
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 left-5 z-10 -translate-y-1/2 text-accent"
                  />
                  <input
                    id="works-search"
                    type="search"
                    autoFocus
                    autoComplete="off"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="예: 병원 예약"
                    className="wt-input h-14 w-full rounded-[28px] rounded-bl-[8px] border-[3px] border-[#1d1d1f] bg-white pr-12 pl-13 text-[18px] font-bold text-foreground shadow-[4px_4px_0_#1d1d1f] outline-none transition-[box-shadow,transform] duration-150 placeholder:font-normal placeholder:text-foreground-tertiary focus:-translate-x-0.5 focus:-translate-y-0.5 focus:shadow-[6px_6px_0_#256ef4] md:h-16 md:text-[22px] [&::-webkit-search-cancel-button]:hidden"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      aria-label="검색어 지우기"
                      className="absolute top-1/2 right-3 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full text-foreground-secondary hover:bg-[#fff3b0] hover:text-foreground"
                    >
                      <X size={20} strokeWidth={2.75} aria-hidden />
                    </button>
                  )}
                </span>
                <ul aria-label="자주 찾는 말" className="flex flex-wrap gap-2 text-[15px] font-bold tracking-normal">
                  {suggestions.map((w) => (
                    <li key={w}>
                      <button
                        type="button"
                        onClick={() => setQuery(w)}
                        aria-pressed={query === w}
                        className={`inline-flex h-9 items-center rounded-full border-[2.5px] border-[#1d1d1f] px-3.5 transition-[background-color,transform] duration-150 active:scale-[0.97] ${
                          query === w ? "bg-[#fff3b0]" : "bg-white hover:bg-[#fff3b0]"
                        }`}
                      >
                        {w}
                      </button>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      <div className="mt-8 flex items-center justify-between gap-4">
        <p className="flex items-center text-[16px] text-foreground-secondary">
          총&nbsp;<b className="text-foreground">{count}</b>
          <ResetButton show={active} onClick={reset} />
        </p>
        <div role="radiogroup" aria-label="보기 방식" className="inline-flex rounded-full border-[2.5px] border-[#1d1d1f] bg-white p-1">
          {(
            [
              ["card", "카드", LayoutGrid],
              ["list", "목록", List],
            ] as const
          ).map(([v, label, Icon]) => (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={view === v}
              onClick={() => setViewSaved(v)}
              className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[15px] font-bold transition-colors ${
                view === v ? "bg-[#1d1d1f] text-white" : "text-foreground-secondary hover:bg-[#fff3b0] hover:text-foreground"
              }`}
            >
              <Icon size={16} aria-hidden />
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4">
        {results.length > 0 ? (
          view === "list" ? <WorksList projects={results} /> : <WorksGrid projects={results} />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="mx-auto max-w-[520px] overflow-hidden border-[3px] border-[#1d1d1f] bg-[#fffdf8] shadow-[5px_5px_0_#1d1d1f]"
          >
            <div className="flex flex-col items-center gap-2 px-5 pb-6 pt-5 text-center">
              <p className="rounded-[22px] rounded-bl-[6px] border-[3px] border-[#1d1d1f] bg-white px-4 py-2.5 text-[17px] font-bold leading-[1.5]">찾는 샘플이 없어요.</p>
              <p className="text-[16px] leading-[1.5] text-foreground-secondary">비슷한 작업이 가능한지 채팅으로 물어봐 주세요.</p>
            </div>
            <img src="/images/webtoon/bear-think.jpg" alt="" className="aspect-[16/9] w-full border-t-[3px] border-[#1d1d1f] object-cover object-[50%_30%]" />
          </motion.div>
        )}
      </div>
    </>
  );
}

// 문장과 검색창을 바꿀 때 살짝 떠오르며 교체한다
const swap = {
  initial: { opacity: 0, transform: "translateY(6px)" },
  animate: { opacity: 1, transform: "translateY(0px)", transition: { duration: 0.2, ease: EASE_OUT } },
  exit: { opacity: 0, transform: "translateY(-6px)", transition: { duration: 0.12, ease: EASE_OUT } },
};

// 조건을 지우는 아이콘. 누르면 거꾸로 돌면서 사라진다.
function ResetButton({ show, onClick }: { show: boolean; onClick: () => void }) {
  const reduce = useReducedMotionSafe();
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.button
          type="button"
          onClick={onClick}
          aria-label="조건 지우기"
          title="조건 지우기"
          initial={reduce ? { opacity: 0 } : { opacity: 0, transform: "scale(0.8)" }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, transform: "rotate(0deg) scale(1)" }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, transform: "rotate(-270deg) scale(0.8)" }}
          transition={{ duration: 0.28, ease: EASE_OUT }}
          className="ml-2 inline-grid size-9 place-items-center rounded-full border-[2.5px] border-[#1d1d1f] bg-white align-middle text-foreground hover:bg-[#fff3b0]"
        >
          <RotateCcw size={20} strokeWidth={2.5} aria-hidden />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

type Option<T> = { value: T | null; label: string; count: number };

// 문장 속 빈칸. 누르면 아래에 단어 목록이 열리고, 고른 단어는 굴러가듯 바뀐다.
function WordPicker<T extends string>({
  id,
  label,
  options,
  value,
  open,
  onOpenChange,
  onChange,
}: {
  id: string;
  label: string;
  options: Option<T>[];
  value: T | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (value: T | null) => void;
}) {
  const reduce = useReducedMotionSafe();
  const wrapRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value) ?? options[0];

  // 목록에서 아래 단어로 바꾸면 위로, 위 단어로 바꾸면 아래로 굴러간다
  const index = options.indexOf(current);
  const [prev, setPrev] = useState({ index, dir: 1 });
  if (prev.index !== index) setPrev({ index, dir: index > prev.index ? 1 : -1 });

  // 바깥을 누르면 닫는다
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) onOpenChange(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open, onOpenChange]);

  // 열리면 고른 단어에 초점을 둔다
  useEffect(() => {
    if (open) listRef.current?.querySelector<HTMLButtonElement>("[aria-selected=true]")?.focus();
  }, [open]);

  const close = () => {
    onOpenChange(false);
    triggerRef.current?.focus();
  };

  const onListKey = (e: React.KeyboardEvent) => {
    const items = [...(listRef.current?.querySelectorAll<HTMLButtonElement>("[role=option]:not(:disabled)") ?? [])];
    const at = items.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "Tab") {
      onOpenChange(false);
    } else if (["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft"].includes(e.key)) {
      e.preventDefault();
      const step = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1;
      items[(at + step + items.length) % items.length]?.focus();
    }
  };

  return (
    <span ref={wrapRef}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`works-${id}-list`}
        aria-label={`${label} 고르기, 지금 ${current.label}`}
        onClick={() => onOpenChange(!open)}
        className={`mx-0.5 inline-flex items-center gap-1 rounded-[6px] border-b-[3px] border-[#1d1d1f] px-2 align-baseline transition-[background-color,transform] duration-150 active:scale-[0.97] motion-reduce:active:scale-100 ${
          value ? "bg-[#fff3b0] text-foreground" : "text-foreground hover:bg-[#fff3b0]/70"
        }`}
      >
        <RollingText text={current.label} dir={prev.dir} />
        <ChevronDown
          size={20}
          strokeWidth={2.5}
          aria-hidden
          className={`shrink-0 transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            ref={listRef}
            id={`works-${id}-list`}
            role="listbox"
            aria-label={label}
            onKeyDown={onListKey}
            initial={reduce ? { opacity: 0 } : { opacity: 0, transform: "translateY(-4px) scale(0.97)" }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, transform: "translateY(0px) scale(1)" }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            transition={{ duration: 0.18, ease: EASE_OUT }}
            className="absolute top-full left-0 z-20 mt-3 flex w-full max-w-[640px] origin-top-left flex-wrap gap-2 rounded-[6px] border-[3px] border-[#1d1d1f] bg-[#fffdf8] p-4 text-[17px] font-normal leading-[1.5] tracking-normal shadow-[5px_5px_0_#1d1d1f]"
          >
            {options.map((o) => {
              const selected = o.value === value;
              return (
                <button
                  key={o.label}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  disabled={o.count === 0}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => {
                    onChange(o.value);
                    close();
                  }}
                  className={`inline-flex h-10 items-center gap-1.5 rounded-full border-[2.5px] px-3.5 font-bold transition-[background-color,border-color,transform] duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:border-transparent disabled:font-normal disabled:text-foreground-tertiary disabled:line-through motion-reduce:active:scale-100 ${
                    selected ? "border-[#1d1d1f] bg-accent text-accent-foreground" : "border-[#1d1d1f] bg-white hover:bg-[#fff3b0]"
                  }`}
                >
                  {selected && <Check size={16} strokeWidth={3} aria-hidden />}
                  {o.label}
                  <span className={`text-[15px] tabular-nums ${selected ? "" : "text-foreground-tertiary"}`}>{o.count}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

// 글자가 바뀌면 이전 글자는 위로 빠지고 새 글자가 아래에서 올라온다(dir이 -1이면 반대).
// 폭은 새 글자 길이에 맞춰 늘거나 줄어든다.
function RollingText({ text, dir = 1 }: { text: string; dir?: number }) {
  const reduce = useReducedMotionSafe();
  const sizerRef = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (sizerRef.current) setWidth(sizerRef.current.offsetWidth);
  }, [text]);

  const enter = reduce ? { opacity: 0 } : { opacity: 0, transform: `translateY(${dir * 70}%)` };
  const leave = reduce ? { opacity: 0 } : { opacity: 0, transform: `translateY(${dir * -70}%)` };

  return (
    <motion.span
      className="relative inline-block overflow-hidden whitespace-nowrap align-bottom"
      initial={false}
      animate={width === null ? undefined : { width }}
      transition={{ duration: reduce ? 0 : 0.24, ease: EASE_OUT }}
    >
      <span ref={sizerRef} aria-hidden className="invisible absolute whitespace-nowrap">
        {text}
      </span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={text}
          className="inline-block"
          initial={enter}
          animate={{ opacity: 1, transform: "translateY(0%)" }}
          exit={leave}
          transition={{ duration: 0.24, ease: EASE_OUT }}
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
}
