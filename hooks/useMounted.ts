"use client";

import { useEffect, useState } from "react";

/**
 * 시간 의존 UI(카운트다운, 달력 등)를 클라이언트 mount 후에만 렌더하기 위한 훅.
 * 프리렌더 시점의 Date가 HTML에 동결되어 생기는 hydration mismatch를 방지한다.
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
