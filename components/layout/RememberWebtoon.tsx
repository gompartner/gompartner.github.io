"use client";

import { useEffect } from "react";

// 곰파트너 이야기(/story)를 열면 웹툰 보기를 고른 것으로 기억한다.
// 다음 방문 때 첫 화면(/)으로 들어와도 이야기로 이어진다. 클래식 페이지에 들어가면 RememberClassic이 지운다.
export function RememberWebtoon() {
  useEffect(() => {
    try {
      localStorage.setItem("look", "webtoon");
    } catch {}
  }, []);
  return null;
}
