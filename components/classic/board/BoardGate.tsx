"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";

// 판의 조립 연출은 새로고침 전까지 판마다 한 번만(메인과 같은 규칙, 11-25 사용자 "한번 만들면 새로고침 전까지는 다시 그릴 필요 없이").
// 이미 본 판으로 돌아오면 data-built를 붙여 조립 없이 완성된 화면을 보여 준다.
const seen = new Set<string>();

export function BoardGate({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (seen.has(pathname)) el.dataset.built = "";
    else delete el.dataset.built;
    seen.add(pathname);
  }, [pathname]);
  return <div ref={ref}>{children}</div>;
}
