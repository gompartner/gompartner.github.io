"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Monitor, Smartphone } from "lucide-react";
import { NavLink } from "@/components/classic/NavLink";

// 11-24 메인 첫 화면: 홈페이지 제작이 진행되는 순서를 손님이 직접 해 본다. 업종과 시안을 고르고 상호를 넣으면 그 시안에 상호가 들어간 화면이 뜬다.
export type BuilderItem = { group: string; id: string; slug: string; name: string; variants: { id: string; label: string }[] };

const STEPS = ["업종, 시안 선택", "상호, 자료 반영", "견적", "제작, 수정", "오픈, 납품", "100일 무상 유지보수"];

export function SiteBuilder({ items }: { items: BuilderItem[] }) {
  const groups = useMemo(() => Array.from(new Set(items.map((i) => i.group))), [items]);
  const [id, setId] = useState(items[0]?.id ?? "");
  const [v, setV] = useState("a");
  const [name, setName] = useState("");
  const [device, setDevice] = useState<"pc" | "mobile">("pc");
  const [scale, setScale] = useState(0.5);
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const item = items.find((i) => i.id === id) ?? items[0];
  const variant = item.variants.find((x) => x.id === v) ?? item.variants[0];
  const FW = device === "pc" ? 1280 : 390;
  const FH = device === "pc" ? 800 : 760;

  useEffect(() => { if (window.matchMedia("(max-width: 767px)").matches) setDevice("mobile"); }, []);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => setScale(Math.min(1, el.clientWidth / FW));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [FW]);

  // 시안 화면의 상호 자리(머리글 첫 글자 묶음)를 입력한 상호로 바꾼다. 비우면 원래 이름으로 되돌린다.
  const applyName = () => {
    const doc = frame.current?.contentDocument;
    const el = doc?.querySelector("header p, header a, header span") as (HTMLElement & { _orig?: string[] }) | null;
    if (!doc || !el) return;
    const nodes: Text[] = [];
    const w = doc.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) nodes.push(w.currentNode as Text);
    if (!el._orig) el._orig = nodes.map((n) => n.data);
    const t = name.trim();
    nodes.forEach((n, k) => { n.data = t ? (k === 0 ? t : "") : el._orig![k] ?? ""; });
  };
  useEffect(() => { applyName(); }, [name]); // eslint-disable-line react-hooks/exhaustive-deps

  const src = `/work/${item.slug}?v=${variant.id}`;
  const done = name.trim() ? 2 : 1;
  const msg = `${item.name} 홈페이지, 시안 ${variant.id.toUpperCase()} ${variant.label}${name.trim() ? `, 상호 ${name.trim()}` : ""}`;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)] lg:items-start lg:gap-x-12 lg:gap-y-8">
      <div className="min-w-0 lg:col-start-1 lg:row-start-1">
        <div className="grid gap-4 text-[22px] font-[800] leading-[1.35] tracking-[-0.04em] md:gap-5 md:text-[30px]">
          <label className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
            <span className="sr-only">업종</span>
            <select value={item.id} onChange={(e) => { setId(e.target.value); setV("a"); }} className="h-12 max-w-full rounded-md border-2 border-[#15171c] bg-white px-3 text-[19px] font-[800] text-[#15171c] md:h-14 md:text-[24px]">
              {groups.map((g) => (
                <optgroup key={g} label={g}>
                  {items.filter((i) => i.group === g).map((i) => (
                    <option key={i.id} value={i.id}>{i.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <span>홈페이지</span>
          </label>
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5" role="group" aria-label="시안">
            <span>시안</span>
            {item.variants.map((x) => (
              <button key={x.id} type="button" aria-pressed={x.id === variant.id} onClick={() => setV(x.id)} className={`h-12 rounded-md border-2 px-3.5 text-[17px] font-[800] md:h-14 md:text-[21px] ${x.id === variant.id ? "border-[#256ef4] bg-[#256ef4] text-white" : "border-[#c9d0da] bg-white text-[#15171c]"}`}>
                {x.id.toUpperCase()} {x.label}
              </button>
            ))}
          </div>
          <label className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
            <span>상호</span>
            <input value={name} onChange={(e) => setName(e.target.value.slice(0, 16))} placeholder="상호 입력" autoComplete="organization" className="h-12 w-[11em] max-w-full rounded-md border-2 border-[#15171c] bg-white px-3 text-[19px] font-[800] text-[#15171c] placeholder:font-bold placeholder:text-[#8a94a6] md:h-14 md:text-[24px]" />
          </label>
        </div>
      </div>

      <div className="order-3 min-w-0 lg:order-none lg:col-start-1 lg:row-start-2">
        <div className="flex flex-wrap gap-2.5">
          <NavLink href={`/contact?sample=${item.id}&msg=${encodeURIComponent(msg)}`} data-gtm-cta="classic_builder_contact" className="inline-flex h-14 items-center rounded-md bg-[#256ef4] px-5 text-[16px] font-bold text-white transition-colors hover:bg-[#0b50d0] md:px-7 md:text-[18px]">
            이 구성으로 상담 신청
          </NavLink>
          <a href={src} data-gtm-cta="classic_builder_open" className="inline-flex h-14 items-center gap-1 rounded-md px-4 text-[16px] font-bold shadow-[inset_0_0_0_1.5px_#15171c] [.gp-dark_&]:shadow-[inset_0_0_0_1.5px_#e8ebf0] md:text-[18px]">
            시안 전체 보기 <ArrowUpRight size={18} aria-hidden />
          </a>
        </div>

        <ol className="mt-8 grid grid-cols-2 gap-x-4 border-t-2 border-[#15171c] md:mt-10 md:grid-cols-3" role="list">
          {STEPS.map((t, k) => (
            <li key={t} className="flex items-baseline gap-2 border-b border-[#d9dee5] py-3 text-[15px] md:text-[16px]">
              <span className={`w-5 shrink-0 font-[800] tabular-nums ${k < done ? "text-[#1552cc]" : "text-[#5b6370]"}`}>{k + 1}</span>
              <span className={`font-bold ${k < done ? "text-[#15171c]" : "text-[#5b6370]"}`}>{t}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="order-2 min-w-0 lg:order-none lg:col-start-2 lg:row-span-2 lg:row-start-1">
        <div className="mb-2.5 flex items-center justify-between gap-3">
          <p className="min-w-0 truncate text-[15px] font-bold text-[#3d4450] md:text-[16px]">
            {name.trim() || item.name} 홈페이지, 시안 {variant.id.toUpperCase()}
          </p>
          <div className="flex shrink-0 gap-1" role="group" aria-label="미리보기 화면">
            {([["pc", "PC", Monitor], ["mobile", "모바일", Smartphone]] as const).map(([k, label, Icon]) => (
              <button key={k} type="button" aria-pressed={device === k} onClick={() => setDevice(k)} className={`inline-flex h-10 items-center gap-1.5 rounded-md border px-3 text-[14px] font-bold ${device === k ? "border-[#15171c] bg-[#15171c] text-white" : "border-[#c9d0da] bg-white text-[#3d4450]"}`}>
                <Icon size={16} aria-hidden /> {label}
              </button>
            ))}
          </div>
        </div>
        <div ref={box} className={`keep-light overflow-hidden rounded-[12px] border border-[#c9d0da] bg-[#f4f6fa] ${device === "mobile" ? "mx-auto max-w-[390px]" : ""}`} style={{ height: FH * scale }}>
          <iframe ref={frame} key={src} src={src} title={`${item.name} 홈페이지 시안 ${variant.id.toUpperCase()} 미리보기`} onLoad={applyName} className="origin-top-left border-0 bg-white" style={{ width: FW, height: FH, transform: `scale(${scale})` }} />
        </div>
      </div>
    </div>
  );
}
