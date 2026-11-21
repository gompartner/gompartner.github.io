"use client";

import { ArrowUp, MessageCircle, Phone, PenLine } from "lucide-react";

// 시안 공통 바로가기(11-21 사례 분석: 실제 법률, 치과 사이트 대부분이 오른쪽 고정 퀵 메뉴로 전화, 카톡, 상담을 둔다).
// PC는 오른쪽 가운데 세로 띠, 휴대폰은 아래 고정 띠. 시안이라 누르는 동작은 없다.
export function QuickMenu({ accent, ink = "#ffffff", tel = "02-000-0000", cta = "상담 신청" }: { accent: string; ink?: string; tel?: string; cta?: string }) {
  const items = [
    { I: Phone, t: "전화" },
    { I: MessageCircle, t: "카톡 상담" },
    { I: PenLine, t: cta },
  ];
  return (
    <>
      <aside aria-label="바로가기" className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col overflow-hidden rounded-[14px] bg-white shadow-[0_10px_30px_rgba(15,20,30,0.16)] md:flex">
        {items.map(({ I, t }, i) => (
          <span key={t} className="flex w-[84px] flex-col items-center gap-1.5 border-b border-black/5 px-2 py-4 text-center text-[12px] font-bold leading-[1.3]" style={i === 2 ? { background: accent, color: ink } : { color: "#2b2f36" }}>
            <I size={20} aria-hidden />
            {t}
          </span>
        ))}
        <span className="flex h-11 items-center justify-center" style={{ color: "#8a909a" }} aria-label="맨 위로">
          <ArrowUp size={18} aria-hidden />
        </span>
      </aside>
      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-black/5 bg-white/95 px-3 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2.5 backdrop-blur md:hidden">
        <span className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-[12px] border border-black/10 text-[15px] font-bold text-[#2b2f36]">
          <Phone size={17} aria-hidden />
          {tel}
        </span>
        <span className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-[12px] text-[15px] font-bold" style={{ background: accent, color: ink }}>
          <PenLine size={17} aria-hidden />
          {cta}
        </span>
      </div>
      <div className="h-[76px] md:hidden" aria-hidden />
    </>
  );
}
