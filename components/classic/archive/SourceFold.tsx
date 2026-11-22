"use client";
// 11-22 출처 목록은 첫 줄만 보이고 더보기로 펼친다(인사이트와 같은 모양)
import { Children, useState, type ReactNode } from "react";

export function SourceFold({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const n = Children.toArray(children).flat().length;
  return (
    <div className="mt-3 text-[14.5px] leading-[1.6]">
      <ul
        role="list"
        className={open ? "space-y-2" : "[&>li:not(:first-child)]:hidden [&>li]:truncate"}
      >
        {children}
      </ul>
      {n > 1 && (
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="mt-2 text-[14px] font-bold text-[#1d5fd6]"
        >
          {open ? "접기" : `더보기 (${n})`}
        </button>
      )}
    </div>
  );
}
