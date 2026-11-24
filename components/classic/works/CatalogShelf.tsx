"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { wrap } from "@/components/classic/ui";
import s from "./CatalogShelf.module.css";

// 카탈로그 진열대(11-24): 샘플 첫 화면을 휴대폰 크기 그대로 옆으로 넘겨 보고, 같은 자리에서 시안 A, B를 바꾼다.
export type ShelfItem = { id: string; name: string; group: string; variants: { ab: string; label: string; href: string; img: string }[] };

export function CatalogShelf({ items }: { items: ShelfItem[] }) {
  const groups = useMemo(() => ["전체", ...Array.from(new Set(items.map((i) => i.group)))], [items]);
  const [group, setGroup] = useState("전체");
  const [cur, setCur] = useState(0);
  const [side, setSide] = useState<Record<string, number>>({});
  const track = useRef<HTMLDivElement>(null);
  const list = useMemo(() => items.filter((i) => group === "전체" || i.group === group), [items, group]);
  const item = list[Math.min(cur, list.length - 1)];
  const sel = item ? side[item.id] ?? 0 : 0;

  const go = (i: number, smooth = true) => {
    const c = track.current?.children[Math.max(0, Math.min(list.length - 1, i))] as HTMLElement | undefined;
    c?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", inline: "center", block: "nearest" });
  };

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const mid = el.scrollLeft + el.clientWidth / 2;
        let best = 0;
        let bd = Infinity;
        Array.from(el.children).forEach((c, k) => {
          const h = c as HTMLElement;
          const d = Math.abs(h.offsetLeft + h.offsetWidth / 2 - mid);
          if (d < bd) { bd = d; best = k; }
        });
        setCur(best);
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => { el.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, [list]);

  useEffect(() => { setCur(0); if (track.current) track.current.scrollLeft = 0; }, [group]);

  if (!item) return null;
  return (
    <section aria-label="카탈로그 넘겨 보기" className={s.shelf}>
      <div className={wrap}>
        <div className={s.chips} role="group" aria-label="분류">
          {groups.map((g) => (
            <button key={g} type="button" className={s.chip} aria-pressed={g === group} onClick={() => setGroup(g)}>
              {g}
              <small>{g === "전체" ? items.length : items.filter((i) => i.group === g).length}</small>
            </button>
          ))}
        </div>
      </div>
      <div
        ref={track}
        className={s.track}
        tabIndex={0}
        aria-label="샘플 화면"
        onKeyDown={(e) => { if (e.key === "ArrowRight") { e.preventDefault(); go(cur + 1); } else if (e.key === "ArrowLeft") { e.preventDefault(); go(cur - 1); } }}
      >
        {list.map((d, i) => (
          <button
            key={d.id}
            type="button"
            aria-label={d.name}
            className={`${s.card} ${i === cur ? s.on : ""} ${(side[d.id] ?? 0) === 1 ? s.showb : ""}`}
            onClick={() => { if (i !== cur) go(i); else if (d.variants.length > 1) setSide((p) => ({ ...p, [d.id]: (p[d.id] ?? 0) ? 0 : 1 })); }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={d.variants[0].img} alt="" loading={i < 4 ? "eager" : "lazy"} />
            {d.variants[1] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className={s.b} src={d.variants[1].img} alt="" loading="lazy" />
            ) : null}
          </button>
        ))}
      </div>
      <div className={wrap}>
        <div className={s.info}>
          <div className={s.row}>
            <span className={s.g}>{item.group}</span>
            <h2 className={s.name}>{item.name}</h2>
            <span className={s.pos}>{cur + 1} / {list.length}</span>
          </div>
          <div className={s.row}>
            <div className={s.ab}>
              {item.variants.length > 1
                ? item.variants.map((v, k) => (
                    <button key={v.ab} type="button" className={s.abBtn} aria-pressed={k === sel} onClick={() => setSide((p) => ({ ...p, [item.id]: k }))}>
                      <b>{v.ab}</b>
                      {v.label}
                    </button>
                  ))
                : null}
            </div>
            <a className={s.open} href={(item.variants[sel] ?? item.variants[0]).href} data-gtm-cta="catalog_shelf_open">
              열어 보기
            </a>
          </div>
          <input className={s.scrub} type="range" min={0} max={list.length - 1} step={1} value={cur} aria-label="샘플 빠르게 넘기기" onChange={(e) => go(Number(e.target.value), false)} />
        </div>
      </div>
    </section>
  );
}
