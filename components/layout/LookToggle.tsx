"use client";

import { usePathname, useRouter } from "next/navigation";
import { BookOpen, Newspaper } from "lucide-react";
import { classicPathFor, webtoonPathFor } from "@/lib/look";

// 웹툰 보기와 클래식(웹 에이전시형 회사 홈페이지) 보기 전환.
// 클래식은 /classic 아래 별도 페이지다. 고른 모양은 이 브라우저에 기억해 다음 방문 때 그 주소로 연다.

export function LookToggle({ className }: { className: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const classic = pathname.startsWith("/classic");
  const label = classic ? "웹툰으로 보기" : "클래식으로 보기";

  const toggle = () => {
    try {
      if (classic) localStorage.removeItem("look");
      else localStorage.setItem("look", "classic");
    } catch {}
    router.push(classic ? webtoonPathFor(pathname) : (classicPathFor(pathname) ?? "/classic"));
  };

  return (
    <button type="button" onClick={toggle} aria-label={label} title={label} data-gtm-cta={classic ? "look_webtoon" : "look_classic"} className={className}>
      {classic ? <BookOpen size={19} aria-hidden /> : <Newspaper size={19} aria-hidden />}
    </button>
  );
}
