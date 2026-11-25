"use client";

import { useEffect, useRef, useState } from "react";

// 11-26 실제 화면을 틀 안에 넣어 그 자리에서 만져 보게 한다(영상이 아니라 진짜 화면).
// 화면은 정해진 폭(base: PC 1280, 휴대폰 390)으로 그리고, 틀 폭에 맞춰 통째로 줄인다. 그래야 휴대폰에서 PC 화면을 골라도 PC 배치 그대로 보인다.
// 줄인 뒤에도 드래그, 터치, 스크롤은 그대로 먹는다. 틀이 화면에 들어올 때 불러온다(loading="lazy").
export function LiveFrame({ src, title, base, ratio }: { src: string; title: string; base: number; ratio: number }) {
  const box = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  const scale = w ? Math.min(1, w / base) : 1;
  const iw = w && w > base ? w : base;
  const ih = Math.round(iw * ratio);
  return (
    <div ref={box} className="relative w-full overflow-hidden bg-[#0f131b]" style={{ height: w ? Math.round(ih * scale) : undefined, aspectRatio: w ? undefined : `1/${ratio}` }}>
      {w ? <iframe src={src} title={title} loading="lazy" width={iw} height={ih} className="absolute left-0 top-0 origin-top-left border-0 bg-white" style={{ transform: `scale(${scale})` }} /> : null}
    </div>
  );
}
