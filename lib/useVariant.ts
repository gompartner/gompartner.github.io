"use client";

import { useEffect, useState } from "react";

// 사례마다 시안을 두 개 이상 두고 맨 위 줄에서 바꿔 본다(11-21). 주소의 ?v=a 로 고정해 링크로 보낼 수 있다.
export const VARIANTS: Record<string, { id: string; label: string }[]> = {
  company: [
    { id: "brand", label: "시안 A 브랜드형" },
    { id: "info", label: "시안 B 정보형" },
  ],
  "law-firm": [
    { id: "a", label: "시안 A 프리미엄" },
    { id: "b", label: "시안 B 상담형" },
  ],
};

export function setVariant(v: string) {
  const u = new URL(window.location.href);
  u.searchParams.set("v", v);
  window.history.replaceState(null, "", u);
  window.dispatchEvent(new CustomEvent("demo:variant", { detail: v }));
}

export function useVariant(projectId: string) {
  const list = VARIANTS[projectId];
  const first = list?.[0]?.id ?? "a";
  const [v, setV] = useState(first);
  useEffect(() => {
    const read = () => {
      const q = new URLSearchParams(window.location.search).get("v");
      setV(q && list?.some((x) => x.id === q) ? q : first);
    };
    read();
    window.addEventListener("demo:variant", read);
    window.addEventListener("popstate", read);
    return () => {
      window.removeEventListener("demo:variant", read);
      window.removeEventListener("popstate", read);
    };
  }, [first, list]);
  return v;
}
