"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { NavLink } from "@/components/classic/NavLink";
import s from "./SiteBuilder.module.css";

// 11-25 메인 첫 화면: 홈페이지가 만들어지는 과정을 손님이 직접 본다.
// 장면 순서(사용자 확인): 1 빈 브라우저 창 > 2 뼈대가 선으로 그려짐 > 3 사진과 색이 위에서 아래로 입혀짐 > 4 상호가 한 자씩 써짐 > 5 모바일 화면이 옆에 섬 > 6 오픈 표시.
export type BuilderItem = { group: string; id: string; slug: string; name: string; variants: { id: string; label: string }[] };

const STEPS = ["업종, 시안 선택", "상호, 자료 반영", "견적", "제작, 수정", "오픈, 납품", "하자보수, 유지관리"];
const PCW = 1280, PCH = 800, MW = 390, MH = 780;

export function SiteBuilder({ items }: { items: BuilderItem[] }) {
  const groups = useMemo(() => Array.from(new Set(items.map((i) => i.group))), [items]);
  const [id, setId] = useState(items[0]?.id ?? "");
  const [v, setV] = useState("a");
  const [name, setName] = useState("");
  const [typed, setTyped] = useState("");
  // 0 빈 창과 뼈대, 1 화면이 입혀짐, 2 모바일 화면, 3 오픈
  const [phase, setPhase] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [w, setW] = useState(720);
  const stage = useRef<HTMLDivElement>(null);
  const pc = useRef<HTMLIFrameElement>(null);
  const mo = useRef<HTMLIFrameElement>(null);
  const item = items.find((i) => i.id === id) ?? items[0];
  const variant = item.variants.find((x) => x.id === v) ?? item.variants[0];
  const src = `/work/${item.slug}?v=${variant.id}`;

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const fit = () => setW(el.clientWidth);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 업종이나 시안을 바꾸면 처음 장면부터 다시 만든다
  useEffect(() => { setPhase(0); setLoaded(false); }, [src]);
  // 화면이 스크립트보다 먼저 다 뜨면 onLoad를 놓친다. 뜬 상태인지 직접 확인한다
  useEffect(() => {
    if (loaded) return;
    const t = setInterval(() => {
      const d = pc.current?.contentDocument;
      if (d && d.readyState === "complete" && d.querySelector("header")) { setLoaded(true); apply(pc.current); }
    }, 200);
    return () => clearInterval(t);
  }, [loaded, src]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (phase === 0 && loaded) { const t = setTimeout(() => setPhase(1), reduce ? 0 : 1500); return () => clearTimeout(t); }
    if (phase === 1) { const t = setTimeout(() => setPhase(2), reduce ? 0 : 900); return () => clearTimeout(t); }
    if (phase === 2) { const t = setTimeout(() => setPhase(3), reduce ? 0 : 700); return () => clearTimeout(t); }
  }, [phase, loaded]);

  // 상호는 한 자씩 써진다
  useEffect(() => {
    const target = name.trim();
    if (typed === target) return;
    const next = target.startsWith(typed) ? target.slice(0, typed.length + 1) : typed.slice(0, -1);
    const t = setTimeout(() => setTyped(next), 55);
    return () => clearTimeout(t);
  }, [name, typed]);

  // 시안 화면의 상호 자리(머리글 첫 글자 묶음)에 써 넣는다. 비우면 원래 이름으로 되돌린다.
  const apply = (f: HTMLIFrameElement | null) => {
    const doc = f?.contentDocument;
    const el = doc?.querySelector("header p, header a, header span") as (HTMLElement & { _orig?: string[] }) | null;
    if (!doc || !el) return;
    const nodes: Text[] = [];
    const tw = doc.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    while (tw.nextNode()) nodes.push(tw.currentNode as Text);
    if (!el._orig) el._orig = nodes.map((n) => n.data);
    nodes.forEach((n, k) => { n.data = typed ? (k === 0 ? typed : "") : el._orig![k] ?? ""; });
  };
  useEffect(() => { apply(pc.current); apply(mo.current); }, [typed]); // eslint-disable-line react-hooks/exhaustive-deps

  const sp = w / PCW;
  const mw = Math.max(92, w * 0.24), sm = mw / MW;
  const done = phase >= 3 ? (name.trim() ? 2 : 1) : 0;
  const shown = typed || item.name;
  const msg = `${item.name} 홈페이지, 시안 ${variant.id.toUpperCase()}${name.trim() ? `, 상호 ${name.trim()}` : ""}`;

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
                {x.id.toUpperCase()}
              </button>
            ))}
          </div>
          <label className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
            <span>상호</span>
            <input value={name} onChange={(e) => setName(e.target.value.slice(0, 16))} placeholder="상호 입력" autoComplete="organization" className="h-12 w-[11em] max-w-full rounded-md border-2 border-[#15171c] bg-white px-3 text-[19px] font-[800] text-[#15171c] placeholder:font-bold placeholder:text-[#8a94a6] md:h-14 md:text-[24px]" />
          </label>
        </div>
      </div>

      <div className="order-2 min-w-0 lg:order-none lg:col-start-2 lg:row-span-2 lg:row-start-1">
        <div className={`keep-light ${s.window} ${phase >= 3 ? s.open : ""}`}>
          <div className={s.chrome}>
            <span className={s.dots} aria-hidden><i /><i /><i /></span>
            <span className={s.addr}>
              {shown}
              <i className={typed !== name.trim() ? s.caret : ""} aria-hidden />
            </span>
            <span className={s.badge} aria-hidden={phase < 3}>오픈</span>
          </div>
          <div ref={stage} className={s.stage} style={{ height: PCH * sp }} data-phase={phase}>
            <div className={s.wire} key={`w-${src}`} aria-hidden>
              <span className={s.wHead} /><span className={s.wLogo} /><span className={s.wNav} /><span className={s.wHero} /><span className={s.wTitle} /><span className={s.wSub} /><span className={s.wBtn} />
              <span className={s.wCard} style={{ left: "5%" }} /><span className={s.wCard} style={{ left: "36.5%" }} /><span className={s.wCard} style={{ left: "68%" }} />
            </div>
            <div className={s.paint}>
              <iframe ref={pc} key={src} src={src} title={`${item.name} 홈페이지 시안 ${variant.id.toUpperCase()} PC 미리보기`} onLoad={() => { setLoaded(true); apply(pc.current); }} style={{ width: PCW, height: PCH, transform: `scale(${sp})` }} />
            </div>
            <div className={s.phone} style={{ width: mw, height: MH * sm }}>
              {phase >= 1 ? (
                <iframe ref={mo} key={`m-${src}`} src={src} title={`${item.name} 홈페이지 시안 ${variant.id.toUpperCase()} 모바일 미리보기`} onLoad={() => apply(mo.current)} style={{ width: MW, height: MH, transform: `scale(${sm})` }} />
              ) : null}
            </div>
          </div>
        </div>
        <p className="mt-2.5 text-[15px] font-bold text-[#3d4450] md:text-[16px]" aria-live="polite">
          {phase === 0 ? "화면 구성 중" : phase === 1 ? "디자인 적용 중" : phase === 2 ? "모바일 화면 확인 중" : `${shown} 홈페이지, 시안 ${variant.id.toUpperCase()}`}
        </p>
      </div>

      <div className="order-3 min-w-0 lg:order-none lg:col-start-1 lg:row-start-2">
        <div className="flex flex-wrap gap-2.5">
          <NavLink href={`/contact?sample=${item.id}&msg=${encodeURIComponent(msg)}`} data-gtm-cta="classic_builder_contact" className="inline-flex h-14 items-center rounded-md bg-[#256ef4] px-5 text-[16px] font-bold text-white transition-colors hover:bg-[#0b50d0] md:px-7 md:text-[18px]">
            이 구성으로 상담 신청
          </NavLink>
          <a href={src} data-gtm-cta="classic_builder_open" className="inline-flex h-14 items-center gap-1 rounded-md px-4 text-[16px] font-bold shadow-[inset_0_0_0_1.5px_#15171c] [.gp-dark_&]:shadow-[inset_0_0_0_1.5px_#e8ebf0] md:text-[18px]">
            시안 전체 보기 <ArrowUpRight size={18} aria-hidden />
          </a>
          <NavLink href="/works" data-gtm-cta="classic_builder_works" className="inline-flex h-14 items-center px-2 text-[16px] font-bold text-[#1552cc] hover:underline md:text-[18px]">
            포트폴리오
          </NavLink>
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
    </div>
  );
}
