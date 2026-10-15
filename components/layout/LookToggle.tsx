"use client";

import { useEffect, useState } from "react";
import { BookOpen, Newspaper } from "lucide-react";

// 웹툰 보기와 클래식(웹 에이전시형 회사 홈페이지) 보기 전환.
// html[data-look="classic"]이 붙으면 클래식이다. 고른 모양은 이 브라우저에 기억하고,
// 루트 레이아웃의 짧은 스크립트가 첫 화면을 그리기 전에 다시 붙인다.

const isClassic = () => typeof document !== "undefined" && document.documentElement.dataset.look === "classic";

/** 지금 클래식 보기인지. 전환 버튼을 누르면 모든 곳이 함께 바뀐다. */
export function useClassic() {
  const [classic, setClassic] = useState(false);
  useEffect(() => {
    setClassic(isClassic());
    const mo = new MutationObserver(() => setClassic(isClassic()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-look"] });
    return () => mo.disconnect();
  }, []);
  return classic;
}

function setLook(classic: boolean) {
  if (classic) document.documentElement.dataset.look = "classic";
  else delete document.documentElement.dataset.look;
  try {
    if (classic) localStorage.setItem("look", "classic");
    else localStorage.removeItem("look");
  } catch {}
  window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
}

export function LookToggle({ className }: { className: string }) {
  const classic = useClassic();
  const label = classic ? "웹툰으로 보기" : "클래식으로 보기";
  return (
    <button
      type="button"
      onClick={() => setLook(!classic)}
      aria-pressed={classic}
      aria-label={label}
      title={label}
      data-gtm-cta={classic ? "look_webtoon" : "look_classic"}
      className={className}
    >
      {classic ? <BookOpen size={19} aria-hidden /> : <Newspaper size={19} aria-hidden />}
    </button>
  );
}
