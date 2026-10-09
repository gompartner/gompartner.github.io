"use client";

// 데모 페이지를 iframe으로 띄우고 칸 폭에 맞춰 줄인다.
// 데모는 기준 폭(PC 1280, 휴대폰 390)으로 그려지고 transform으로 줄어들어 화면 그대로 눌러 볼 수 있다.
// 칸이 640px보다 좁으면 휴대폰 폭으로 띄운다. 불러오는 동안은 썸네일을 깔아 둔다.
import { useEffect, useRef, useState } from "react";

const PC = { w: 1280, h: 800 };
const MOBILE = { w: 390, h: 720 };

export function LiveDemoFrame({ src, title, poster, posterSmall }: { src: string; title: string; poster: string; posterSmall: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [loaded, setLoaded] = useState<string | null>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const base = width > 0 && width < 640 ? MOBILE : PC;
  const scale = width / base.w;
  const ready = loaded === src;

  return (
    <div ref={box} className="relative w-full overflow-hidden bg-white" style={{ aspectRatio: `${base.w} / ${base.h}` }}>
      <picture>
        <source media="(min-width: 1024px)" srcSet={poster} />
        <img
          src={posterSmall}
          alt=""
          fetchPriority="high"
          decoding="async"
          className={`absolute inset-0 h-full w-full object-cover object-left-top transition-opacity duration-300 ${ready ? "opacity-0" : "opacity-100"}`}
        />
      </picture>
      {width > 0 && (
        <iframe
          key={`${src}-${base.w}`}
          src={src}
          title={title}
          onLoad={() => setLoaded(src)}
          className="absolute left-0 top-0 origin-top-left border-0 transition-opacity duration-300 motion-reduce:transition-none"
          style={{ width: base.w, height: base.h, transform: `scale(${scale})`, opacity: ready ? 1 : 0 }}
        />
      )}
    </div>
  );
}
