import type { ReactNode } from "react";

/** 화면 캡처를 넣는 브라우저 창 틀. 주소 칸 자리에 그 화면의 날짜와 단계 이름을 적는다 */
export function Frame({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <span className="block overflow-hidden rounded-[12px] border border-white/15 bg-[#1b2130] shadow-[0_30px_70px_-24px_rgba(0,0,0,.85)] md:rounded-[16px]">
      <span className="flex h-9 items-center gap-1.5 px-3.5 md:h-11 md:px-4">
        <i aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-white/25" />
        <i aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-white/25" />
        <i aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-white/25" />
        <span className="ml-2 min-w-0 truncate rounded-full bg-white/10 px-3 py-0.5 text-[13px] font-bold text-[#dbe2ee] md:text-[14px]">{label}</span>
      </span>
      {children}
    </span>
  );
}
