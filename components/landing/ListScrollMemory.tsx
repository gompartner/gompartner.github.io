"use client";

import { useEffect } from "react";
import { doneReturning, returningTo, saveList } from "@/lib/listReturn";

/** 목록 페이지의 스크롤 위치를 적어 두고, 사례 화면에서 "다른 사례"로 돌아오면 그 자리로 내려 준다. */
export function ListScrollMemory() {
  useEffect(() => {
    const path = window.location.pathname;
    const back = returningTo(path);
    // 조건을 되살린 뒤 목록 높이가 바뀌므로 몇 번 나눠 맞춘다
    const timers = back ? [0, 80, 300].map((ms) => window.setTimeout(() => window.scrollTo(0, back.y), ms)) : [];
    const done = window.setTimeout(doneReturning, 350);
    if (!back) saveList({ path, y: 0 });

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => saveList({ path, y: Math.round(window.scrollY) }));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
  return null;
}
