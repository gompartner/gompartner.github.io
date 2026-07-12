"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * 정적 export 환경에서 hydration-safe한 localStorage 상태 훅.
 * 첫 렌더는 항상 initialValue(프리렌더 HTML과 동일)로 시작하고,
 * mount 후 저장된 값을 읽어온다. hydrated 플래그로 로딩 전 UI를 제어할 수 있다.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        setValue(JSON.parse(raw) as T);
      }
    } catch {
      // 파싱 실패나 접근 불가 시 initialValue 유지
    }
    setHydrated(true);
  }, [key]);

  const set = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const next =
          typeof updater === "function" ? (updater as (p: T) => T)(prev) : updater;
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // 저장 실패(시크릿 모드 용량 제한 등)해도 상태는 유지
        }
        return next;
      });
    },
    [key],
  );

  return [value, set, hydrated] as const;
}
