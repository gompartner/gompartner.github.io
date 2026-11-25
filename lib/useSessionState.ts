"use client";

import { useEffect, useRef, useState } from "react";

// 11-25 목록 화면의 검색어, 고른 카테고리처럼 다른 화면에 갔다 돌아와도 남아야 하는 값. 화면 주소마다 세션에 둔다.
// 첫 그림은 서버와 같게 init으로 그리고, 화면이 뜬 뒤 세션 값으로 바꾼다(hydration 불일치 없음).
export function useSessionState<T>(key: string, init: T) {
  const [v, setV] = useState<T>(init);
  const ready = useRef(false);
  const k = () => `gp-s:${window.location.pathname.replace(/\/+$/, "")}:${key}`;
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(k());
      if (raw != null) queueMicrotask(() => setV(JSON.parse(raw)));
    } catch {}
    ready.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!ready.current) return;
    try {
      sessionStorage.setItem(k(), JSON.stringify(v));
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v]);
  return [v, setV] as const;
}
