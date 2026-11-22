"use client";
// 11-22 다크모드 전환. 누르면 지금과 반대로 바꾸고 gp-theme에 저장한다(처음에는 기기 설정을 따른다, app/layout.tsx themeScript)
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ className = "", withLabel = false }: { className?: string; withLabel?: boolean }) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const el = document.documentElement;
    const sync = () => setDark(el.classList.contains("gp-dark"));
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);
  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle("gp-dark", next);
    try {
      localStorage.setItem("gp-theme", next ? "dark" : "light");
    } catch {}
  };
  const label = dark ? "밝은 화면으로 보기" : "어두운 화면으로 보기";
  return (
    <button type="button" onClick={toggle} aria-label={withLabel ? undefined : label} aria-pressed={dark} className={className}>
      {dark ? <Sun size={20} aria-hidden /> : <Moon size={20} aria-hidden />}
      {withLabel ? <span>{dark ? "밝은 화면" : "어두운 화면"}</span> : null}
    </button>
  );
}
