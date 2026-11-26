"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Check } from "lucide-react";

// 11-26 인수 시 확인 사항을 실제로 체크되는 목록으로(사용자 "요 네모도 뭔지 모르겠어. 체크리스트지?": 네모가 모양뿐이라 무엇인지 알 수 없었다).
// 줄을 누르면 체크되고, 이 브라우저에 문서별로 기억한다(다시 열어도 남는다). 체크한 줄은 제목에 줄을 긋고 흐리게 한다.
export function TakeoverCheck({ items }: { items: { b: string; t: string }[] }) {
  const key = `gp-check:${usePathname()}`;
  const [on, setOn] = useState<string[]>([]);
  useEffect(() => {
    try {
      const v: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
      // 브라우저 저장값은 붙은 뒤에만 읽을 수 있다(서버 화면과 맞추기)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (Array.isArray(v)) setOn(v.filter((x): x is string => typeof x === "string"));
    } catch {
      /* 저장값을 못 읽으면 빈 목록으로 둔다 */
    }
  }, [key]);
  const toggle = (b: string) =>
    setOn((v) => {
      const next = v.includes(b) ? v.filter((x) => x !== b) : [...v, b];
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* 저장이 막힌 브라우저는 이번 화면에서만 체크된다 */
      }
      return next;
    });
  const done = items.filter((i) => on.includes(i.b)).length;
  return (
    <>
      <p className="mt-3 text-[14px] tabular-nums text-[#aab2bf]" aria-live="polite">
        <b className="text-white">{done}</b> / {items.length} 확인
      </p>
      <ul role="list" className="mt-2 border-t border-white/12">
        {items.map((x) => {
          const c = on.includes(x.b);
          return (
            <li key={x.b} className="border-b border-white/10">
              <label className="grid cursor-pointer grid-cols-[32px_minmax(0,1fr)] gap-1.5 py-3.5 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-current">
                <input type="checkbox" checked={c} onChange={() => toggle(x.b)} className="sr-only" />
                <span aria-hidden className={`mt-0.5 grid h-[22px] w-[22px] place-items-center rounded-[6px] border-[1.5px] ${c ? "gp-box-on" : "border-white/40"}`}>
                  {c ? <Check size={15} strokeWidth={3} /> : null}
                </span>
                <span>
                  <span className={`block text-[16px] font-bold ${c ? "text-[#8a94a6] line-through decoration-1" : "text-white"}`}>{x.b}</span>
                  <span className="mt-0.5 block text-[15px] leading-[1.65] text-[#aab2bf]">{x.t}</span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </>
  );
}
