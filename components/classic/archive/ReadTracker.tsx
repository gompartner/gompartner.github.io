"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { loadAll, saveRec, type ReadRec } from "@/lib/readState";

// 11-22 문서 읽기 기록(LMS식): 맨 위 진행 막대, 읽던 곳 이어 읽기, 읽은 뒤 바뀐 곳 안내와 표시.
export type DocChange = { date: string; id?: string; text: string };

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export function ReadTracker({ href, ver, changes = [] }: { href: string; ver?: string; changes?: DocChange[] }) {
  const [prev, setPrev] = useState<ReadRec | null | undefined>(undefined);
  const [p, setP] = useState(0);
  const [hideResume, setHideResume] = useState(false);
  const best = useRef(0);

  useEffect(() => {
    const old = loadAll()[href];
    // 브라우저 저장값은 붙은 뒤에만 읽을 수 있다(서버 화면과 맞추기)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPrev(old ?? null);
    best.current = old?.p ?? 0;
    const main = document.getElementById("archive-main");
    if (!main) return;
    let t: ReturnType<typeof setTimeout> | undefined;
    const calc = () => {
      const r = main.getBoundingClientRect();
      const top = r.top + scrollY;
      const v = Math.round(Math.min(1, Math.max(0, (scrollY + innerHeight - top) / Math.max(1, r.height))) * 100);
      setP(v);
      if (v > best.current) best.current = v;
      clearTimeout(t);
      t = setTimeout(() => saveRec(href, { p: best.current, y: Math.round(scrollY), v: ver, d: today() }), 400);
    };
    calc();
    addEventListener("scroll", calc, { passive: true });
    addEventListener("resize", calc);
    return () => {
      removeEventListener("scroll", calc);
      removeEventListener("resize", calc);
      clearTimeout(t);
    };
  }, [href, ver]);

  // 지난번에 읽은 판(v) 뒤에 바뀐 절은 본문에서 바로 칠한다(설명 글 없이). 제목부터 다음 제목 전까지, 오른쪽 목차에도 점
  const fresh = prev?.v ? changes.filter((c) => c.date > prev.v! && c.id) : [];
  const key = fresh.map((c) => c.id).join();
  useEffect(() => {
    const undo: (() => void)[] = [];
    for (const c of fresh) {
      const h = document.getElementById(c.id!);
      if (!h) continue;
      const els: HTMLElement[] = [h];
      for (let n = h.nextElementSibling as HTMLElement | null; n && !/^H2$/.test(n.tagName) && !n.querySelector("h2"); n = n.nextElementSibling as HTMLElement | null) els.push(n);
      els.forEach((el) => {
        el.dataset.changedBlock = "1";
        undo.push(() => delete el.dataset.changedBlock);
      });
      const b = document.createElement("span");
      b.textContent = "바뀜";
      b.className = "ml-2 inline-block translate-y-[-3px] rounded bg-[#256ef4] px-1.5 py-0.5 align-middle text-[12px] font-bold tracking-normal text-white";
      h.appendChild(b);
      undo.push(() => b.remove());
      const t = document.querySelector<HTMLElement>(`aside a[href="#${c.id}"]`);
      if (t) {
        t.dataset.changedToc = "1";
        undo.push(() => delete t.dataset.changedToc);
      }
    }
    return () => undo.forEach((f) => f());
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  // 안내는 문서 머리(제목, 요약) 바로 아래에 끼운다
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const head = document.querySelector("#archive-main header");
    if (!head) return;
    const d = document.createElement("div");
    head.after(d);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSlot(d);
    return () => d.remove();
  }, []);

  const resume = prev && prev.p >= 10 && prev.p < 90 && prev.y > 400 && !hideResume;
  return (
    <>
      <div aria-hidden className="fixed inset-x-0 top-0 z-[60] h-[3px] bg-transparent">
        <div className="h-full bg-[#256ef4] transition-[width] duration-150" style={{ width: `${p}%` }} />
      </div>
      {slot && fresh.length ? createPortal(
        <a href={`#${fresh[0].id}`} className="mt-5 inline-flex min-h-[36px] items-center gap-2 rounded-full bg-[#256ef4] px-4 text-[14px] font-bold text-white hover:bg-[#1d5fd6]">
          바뀐 곳 {fresh.length}곳으로
        </a>,
        slot,
      ) : null}
      {slot && resume ? createPortal(
        <div className="mt-5 flex max-w-[820px] flex-wrap items-center gap-3 rounded-md bg-[#f4f6f9] px-4 py-3 text-[14.5px]">
          <span className="text-[#3d4450]">{prev!.d}에 {prev!.p}%까지 읽었습니다.</span>
          <button type="button" onClick={() => { scrollTo({ top: prev!.y }); setHideResume(true); }} className="min-h-[36px] rounded-md bg-[#15171c] px-3.5 text-[14px] font-bold text-white">
            이어 읽기
          </button>
          <button type="button" onClick={() => setHideResume(true)} className="min-h-[36px] px-1 text-[13.5px] text-[#5b6370] underline underline-offset-4">
            처음부터
          </button>
        </div>,
        slot,
      ) : null}
    </>
  );
}
