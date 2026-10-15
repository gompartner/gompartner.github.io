"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

// 버튼·링크 클릭을 위임 리스너 하나로 모아 GTM dataLayer에 cta_click 이벤트로 푸시한다.
// data-gtm-cta가 있으면 그 값을, 없으면 "auto:" + 버튼 이름(aria-label이나 글자 앞 30자)을 cta_id로 쓴다.
// GA에는 cta_id가 맞춤 측정기준 "버튼 ID"로 등록돼 있다(페이지는 GA 기본 페이지 경로로 나눠 본다).
const CLICKABLE = "[data-gtm-cta], a[href], button, summary, [role=tab], [role=button]";

function nameOf(el: HTMLElement) {
  const raw = el.getAttribute("aria-label") || el.getAttribute("title") || el.innerText || el.getAttribute("href") || "";
  return raw.replace(/\s+/g, " ").trim().slice(0, 30) || el.tagName.toLowerCase();
}

export function CtaTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>(CLICKABLE);
      if (!target) return;
      const tagged = target.closest<HTMLElement>("[data-gtm-cta]");
      window.dataLayer ??= [];
      window.dataLayer.push({
        event: "cta_click",
        cta_id: tagged ? tagged.dataset.gtmCta : `auto:${nameOf(target)}`,
        cta_href: (tagged ?? target).getAttribute("href") ?? undefined,
      });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
