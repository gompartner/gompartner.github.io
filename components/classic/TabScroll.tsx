"use client";

import { useEffect } from "react";

// 11-25 휴대폰에서 탭 줄이 옆으로 밀릴 때, 고른 탭이 화면 밖에 있으면 보이는 자리로 옮긴다(포트폴리오는 제작 탭의 맨 끝)
export function TabScroll() {
  useEffect(() => {
    document.querySelectorAll<HTMLElement>("[data-subtabs]").forEach((ul) => {
      const on = ul.querySelector<HTMLElement>("[aria-current=page]");
      if (!on || ul.scrollWidth <= ul.clientWidth) return;
      ul.scrollLeft = on.offsetLeft - ul.offsetLeft - 16;
    });
  }, []);
  return null;
}
