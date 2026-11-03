"use client";

import { useEffect, useState } from "react";
import { wrap } from "@/components/classic/ui";

// 11-03 3D 웹 제작 첫 화면. 섬 화면은 public/3d 정적 페이지(원본 모션-카탈로그)를 그대로 끼워 쓰고,
// 제목은 검색과 화면 읽기 프로그램을 위해 이 페이지에 둔다. 낮 장면이면 섬 화면이 알려 줘서 제목을 어둡게 바꾼다.
export function Hero3D({ title, src = "/3d/island", frameTitle = "카탈로그 마을 3D 화면. 건물 이름표를 누르면 해당 카탈로그를 엽니다.", height = "h-[calc(100svh-118px)] md:h-[calc(100svh-134px)]" }: { title: string; src?: string; frameTitle?: string; height?: string }) {
  const [lite, setLite] = useState(false);
  useEffect(() => {
    const on = (e: MessageEvent) => {
      if (e.origin === location.origin && e.data?.gp3d === "lite") setLite(!!e.data.v);
    };
    addEventListener("message", on);
    return () => removeEventListener("message", on);
  }, []);
  return (
    <section aria-labelledby="t3d-hero" className={`relative ${height} min-h-[520px] overflow-hidden bg-[#0f1b3d]`}>
      <iframe
        src={src}
        title={frameTitle}
        className="absolute inset-0 h-full w-full border-0"
        allow="fullscreen"
      />
      <div className={`${wrap} pointer-events-none relative pt-6 md:pt-9`}>
        <h1
          id="t3d-hero"
          className={`max-w-[640px] break-keep text-[27px] font-[800] leading-[1.2] tracking-[-0.03em] transition-colors duration-500 md:text-[46px] ${
            lite ? "text-[#1d1916] [text-shadow:0_1px_14px_rgba(255,255,255,.55)]" : "text-[#f3ece2] [text-shadow:0_2px_18px_rgba(0,0,0,.45)]"
          }`}
        >
          {title}
        </h1>
      </div>
    </section>
  );
}
