"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

// data-gtm-cta 속성이 붙은 요소의 클릭을 위임 리스너 하나로 수집해
// GTM dataLayer에 cta_click 이벤트로 푸시한다.
// 서버 컴포넌트 CTA에는 속성만 붙이면 되므로 클라이언트 경계를 바꾸지 않는다.
export function CtaTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>(
        "[data-gtm-cta]"
      );
      if (!target) return;
      window.dataLayer ??= [];
      window.dataLayer.push({
        event: "cta_click",
        cta_id: target.dataset.gtmCta,
        cta_href: target.getAttribute("href") ?? undefined,
      });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
