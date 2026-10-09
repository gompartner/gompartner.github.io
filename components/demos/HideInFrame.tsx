"use client";

import { useEffect, useState } from "react";

/** 첫 화면 미리보기(iframe) 안에서는 데모 하단 버튼들을 숨긴다 */
export function HideInFrame({ children }: { children: React.ReactNode }) {
  const [framed, setFramed] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setFramed(window.self !== window.top));
    return () => cancelAnimationFrame(frame);
  }, []);
  return framed ? null : <>{children}</>;
}
