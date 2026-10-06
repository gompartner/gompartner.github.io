"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { TriangleAlert, X } from "lucide-react";
import type { DemoPopupItem } from "@/data/popups";

// 국내 사이트식 공지 팝업. PC는 머리글 아래 왼쪽에 고정 폭으로 나란히 띄우고,
// 모바일은 화면 아래에서 올라오는 시트로 하나씩 보여 준다.
// "오늘 하루 보지 않음"은 오늘 날짜를 저장해 같은 날에는 다시 띄우지 않는다.
// 떠 있는 동안 body에 data-demo-popup을 두고, 모두 닫히면 demo-popup-closed 이벤트를 보낸다(DemoDock 자동 가이드가 기다림).

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const keyOf = (projectId: string, popupId: string) => `demo-popup-hide:${projectId}:${popupId}`;

function hiddenToday(projectId: string, popupId: string) {
  try {
    return localStorage.getItem(keyOf(projectId, popupId)) === today();
  } catch {
    return false;
  }
}

/** 글자가 이미지에 박힌 듯한 포스터 */
function Poster({ p }: { p: DemoPopupItem }) {
  const { bg, fg, accent, soft } = p.color;
  const line = `color-mix(in srgb, ${fg} 22%, transparent)`;
  const warning = p.kind === "warning";
  const stripe = { background: `repeating-linear-gradient(-45deg, ${fg} 0 10px, ${bg} 10px 20px)` };

  return (
    <div className="select-none" style={{ background: bg, color: fg }}>
      {warning && <div aria-hidden className="h-3" style={stripe} />}

      {p.kind === "photo" && p.photo && (
        <div className="relative h-[170px] w-full">
          <Image src={p.photo} alt="" fill sizes="(min-width: 1024px) 360px, 100vw" className="object-cover" style={{ objectPosition: p.pos }} />
          <span className="absolute left-0 top-4 px-3 py-1.5 text-[14px] font-extrabold tracking-[-0.02em]" style={{ background: accent, color: bg }}>
            {p.tag}
          </span>
        </div>
      )}

      <div className="px-6 pb-5 pt-6">
        {p.kind === "notice" && (
          <span className="inline-block px-2.5 py-1 text-[14px] font-extrabold tracking-[-0.02em]" style={{ background: accent, color: bg }}>
            {p.tag}
          </span>
        )}
        {warning && (
          <div className="flex items-center gap-2" style={{ color: accent }}>
            <TriangleAlert size={34} strokeWidth={2.6} aria-hidden />
            <span className="text-[32px] font-black leading-none tracking-[-0.04em]">{p.tag}</span>
          </div>
        )}

        <p className={`${p.kind === "photo" ? "" : "mt-4"} text-[30px] font-black leading-[1.18] tracking-[-0.05em]`}>
          {p.lines.map((l, i) => (
            <span key={l} className="block" style={i === p.lines.length - 1 && !warning ? { color: accent } : undefined}>
              {l}
            </span>
          ))}
        </p>
        {p.sub && <p className="mt-2 text-[16px] font-bold tracking-[-0.02em]" style={{ color: soft }}>{p.sub}</p>}

        {p.days && (
          <ol className="mt-5 grid grid-cols-3 gap-1.5">
            {p.days.map((d) => (
              <li
                key={d.date}
                className="flex flex-col items-center py-3 text-center"
                style={d.off ? { background: accent, color: bg } : { background: `color-mix(in srgb, ${fg} 9%, transparent)` }}
              >
                <span className="text-[22px] font-black leading-none tabular-nums tracking-[-0.03em]">{d.date}</span>
                <span className="mt-1 text-[13px] font-bold">{d.dow}</span>
                <span className={`mt-1.5 tabular-nums ${d.off ? "text-[15px] font-black" : "text-[12px] font-semibold"}`}>{d.text}</span>
              </li>
            ))}
          </ol>
        )}

        {p.rows && (
          <dl className="mt-5 space-y-2 text-[15px] leading-snug">
            {p.rows.map(([k, v]) => (
              <div key={k} className="flex gap-3">
                <dt className="w-[62px] shrink-0 border-r-2 pr-2 font-extrabold" style={{ borderColor: accent }}>
                  {k}
                </dt>
                <dd className="font-semibold tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
        )}

        {p.body && <p className="mt-4 text-[15px] font-medium leading-[1.55]">{p.body}</p>}

        <div className="mt-5 flex items-end justify-between gap-3 border-t pt-3" style={{ borderColor: line }}>
          <span className="text-[17px] font-black tracking-[-0.03em]">{p.org}</span>
          {p.tel && <span className="text-[15px] font-bold tabular-nums" style={{ color: soft }}>{p.tel}</span>}
        </div>
      </div>

      {warning && <div aria-hidden className="h-3" style={stripe} />}
    </div>
  );
}

export function DemoPopup({ projectId, items }: { projectId: string; items: DemoPopupItem[] }) {
  // 서버 렌더와 첫 하이드레이션에는 아무것도 그리지 않고, 마운트 뒤에 오늘 숨긴 팝업을 빼고 띄운다
  const [open, setOpen] = useState<string[] | null>(null);

  useEffect(() => {
    const list = items.filter((p) => !hiddenToday(projectId, p.id)).map((p) => p.id);
    if (list.length) document.body.setAttribute("data-demo-popup", "");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage는 마운트 뒤에만 읽을 수 있다
    setOpen(list);
  }, [projectId, items]);

  // 모두 닫히면 표시를 지우고 알린다
  useEffect(() => {
    if (open === null || open.length) return;
    if (!document.body.hasAttribute("data-demo-popup")) return;
    document.body.removeAttribute("data-demo-popup");
    window.dispatchEvent(new Event("demo-popup-closed"));
  }, [open]);

  // 페이지를 떠날 때 표시를 남기지 않는다
  useEffect(() => () => document.body.removeAttribute("data-demo-popup"), []);

  const close = useCallback((id: string) => setOpen((o) => (o ? o.filter((x) => x !== id) : o)), []);

  const hideToday = (id: string) => {
    try {
      localStorage.setItem(keyOf(projectId, id), today());
    } catch {}
    close(id);
  };

  // Esc는 맨 위(마지막) 팝업부터 닫는다
  useEffect(() => {
    if (!open?.length) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || document.querySelector('[aria-label="사용법"]')) return;
      close(open[open.length - 1]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!open?.length) return null;
  const shown = items.filter((p) => open.includes(p.id));

  return (
    <div className="print:hidden">
      <div aria-hidden className="fixed inset-0 z-[60] bg-black/50 lg:hidden" />
      <div className="fixed inset-x-0 bottom-0 z-[60] mx-auto max-w-[480px] lg:inset-x-auto lg:bottom-auto lg:left-10 lg:top-[128px] lg:mx-0 lg:flex lg:max-w-none lg:items-start lg:gap-2">
        {shown.map((p, i) => (
          <div
            key={p.id}
            role="dialog"
            aria-label={p.label}
            className={`${i > 0 ? "hidden lg:block" : ""} w-full overflow-hidden rounded-t-[12px] bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.25)] lg:w-[360px] lg:rounded-none lg:shadow-[0_6px_24px_rgba(0,0,0,0.3)]`}
          >
            <div className="max-h-[calc(100dvh-120px)] overflow-y-auto lg:max-h-[calc(100vh-200px)]">
              <Poster p={p} />
            </div>
            <div className="flex h-11 items-center justify-between bg-[#222] px-3 text-[14px] text-white">
              <label className="flex cursor-pointer items-center gap-2 py-2">
                <input type="checkbox" onChange={() => hideToday(p.id)} className="h-4 w-4 accent-white" />
                오늘 하루 보지 않음
              </label>
              <button type="button" onClick={() => close(p.id)} className="flex items-center gap-1 py-2 pl-3 font-semibold">
                닫기
                <X size={15} aria-hidden />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
