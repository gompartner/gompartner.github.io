"use client";

import { useEffect, useState } from "react";

import { VARIANTS } from "./variants";

export { VARIANTS };


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
      // 고른 시안이 그려진 다음 장에 가림(v-wait, 데모 layout)을 푼다
      requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.remove("v-wait")));
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
