"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

// 11-26 화면 색 선택(다크, 화이트). html의 gp-dark와 gp-light를 바꾸고 gp-color에 기억한다(첫 그리기 전 적용은 app/layout.tsx의 themeScript).
// 기본은 어두운 화면. 기기 설정은 따르지 않는다(사이트를 어두운 화면으로 지었고, 밝은 화면은 고른 사람에게만 보인다).
// 휴대폰 주소창, 상태 줄 색도 화면 색을 따라간다(머리글 색과 같게)
const paintBar = (light: boolean) => document.querySelector('meta[name="theme-color"]')?.setAttribute("content", light ? "#ffffff" : "#0b0d12");
const apply = (light: boolean) => {
  const c = document.documentElement.classList;
  c.toggle("gp-light", light);
  c.toggle("gp-dark", !light);
  paintBar(light);
  try {
    localStorage.setItem("gp-color", light ? "light" : "dark");
  } catch {
    /* 저장이 막힌 브라우저는 이번 화면에서만 바뀐다 */
  }
};

export function ThemeSwitch({ className = "", withLabel = false }: { className?: string; withLabel?: boolean }) {
  // 서버와 첫 그리기는 어두운 화면 기준. 붙은 뒤 실제 상태를 읽는다
  const [light, setLight] = useState(false);
  useEffect(() => {
    const read = () => {
      const on = document.documentElement.classList.contains("gp-light");
      setLight(on);
      paintBar(on);
    };
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);
  const label = light ? "어두운 화면으로" : "밝은 화면으로";
  return (
    <button type="button" onClick={() => apply(!light)} aria-label={label} title={label} className={className}>
      {light ? <Moon size={20} aria-hidden /> : <Sun size={20} aria-hidden />}
      {withLabel && <span>{light ? "다크 모드" : "화이트 모드"}</span>}
    </button>
  );
}
