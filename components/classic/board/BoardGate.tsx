"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";

// 판의 큰 제목 조립(빛줄기와 면)은 새로고침 전까지 판마다 한 번만 보여 준다. 이미 본 판으로 돌아오면 data-built를 붙여 완성된 제목을 바로 보여 준다.
// 11-26 사용자 "효과는 메인에만. 서브에서는 Build, Run, Care 같은 타이틀에만 있어도 됨. 누를 때마다 나와서 불편":
// 안쪽 판의 카드, 표, 그림(.bd-in)은 조립하지 않는다. 탭을 누를 때마다 내용이 날아와 붙는 것이 번거로웠다. 조립 연출은 메인(Assemble)과 판의 제목에만 남긴다.
const seen = new Set<string>();

export function BoardGate({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (seen.has(pathname)) el.dataset.built = "";
    else delete el.dataset.built;
    // 잠깐 머문 뒤에 "본 판"으로 적는다(개발 모드에서 효과가 두 번 도는 경우에도 제목 조립이 빠지지 않게)
    const t = window.setTimeout(() => seen.add(pathname), 1200);
    return () => window.clearTimeout(t);
  }, [pathname]);
  return <div ref={ref}>{children}</div>;
}
