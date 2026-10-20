"use client";

import { usePathname, useRouter } from "next/navigation";
import { BookOpen, Newspaper } from "lucide-react";
import { classicPathFor, webtoonPathFor } from "@/lib/look";

// 웹툰 보기와 클래식(웹 에이전시형 회사 홈페이지) 보기 전환.
// 클래식은 /classic 아래 별도 페이지다. 고른 모양은 이 브라우저에 기억해 다음 방문 때 그 주소로 연다.

function rememberLook(classic: boolean) {
  try {
    if (classic) localStorage.setItem("look", "classic");
    else localStorage.removeItem("look");
  } catch {}
}

export function LookToggle({ className }: { className: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const classic = pathname.startsWith("/classic");
  const label = classic ? "웹툰으로 보기" : "클래식으로 보기";

  const toggle = () => {
    rememberLook(!classic);
    router.push(classic ? webtoonPathFor(pathname) : (classicPathFor(pathname) ?? "/classic"));
  };

  return (
    <button type="button" onClick={toggle} aria-label={label} title={label} data-gtm-cta={classic ? "look_webtoon" : "look_classic"} className={className}>
      {classic ? <BookOpen size={19} aria-hidden /> : <Newspaper size={19} aria-hidden />}
    </button>
  );
}

// 메뉴 글자로 모양을 바꾸는 링크. 그냥 링크로 걸면 기억이 남아 다음 방문 때 반대쪽으로 튕기므로 아이콘과 같이 기억을 바꾼다.
export function LookLink({ to, cta, className, onClick, children }: { to: "classic" | "webtoon"; cta: string; className: string; onClick?: () => void; children: React.ReactNode }) {
  const router = useRouter();
  const href = to === "classic" ? "/classic" : "/";

  return (
    <a
      href={href}
      data-gtm-cta={cta}
      className={className}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        rememberLook(to === "classic");
        onClick?.();
        router.push(href);
      }}
    >
      {children}
    </a>
  );
}
