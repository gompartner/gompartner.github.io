"use client";

// 데모 페이지를 iframe으로 띄우고 칸 폭에 맞춰 줄인다.
// 데모는 기준 폭(PC 1280, 휴대폰 390)으로 그려지고 transform으로 줄어들어 화면 그대로 눌러 볼 수 있다.
// 칸이 640px보다 좁으면 휴대폰 폭으로 띄운다. 불러오는 동안은 썸네일을 깔아 둔다.
// 휴대폰에서는 창 안 스크롤이 페이지 스크롤을 막으니 미리보기만 두고, 누르면 데모 페이지로 넘어간다.
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Maximize2 } from "lucide-react";

const PC = { w: 1280, h: 800 };
const MOBILE = { w: 390, h: 540 };

export function LiveDemoFrame({
  src,
  title,
  poster,
  posterSmall,
  ctaId,
}: {
  src: string;
  title: string;
  poster: string;
  posterSmall: string;
  ctaId: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [loaded, setLoaded] = useState<string | null>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setWidth(entry.contentRect.width),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const mobile = width > 0 && width < 640;
  const base = mobile ? MOBILE : PC;
  const scale = width / base.w;
  const ready = loaded === src;

  const frame = (
    <div
      ref={box}
      className="relative w-full overflow-hidden bg-white"
      style={{ aspectRatio: `${base.w} / ${base.h}` }}
    >
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
          tabIndex={mobile ? -1 : undefined}
          className="absolute left-0 top-0 origin-top-left border-0 transition-opacity duration-300 motion-reduce:transition-none"
          style={{
            width: base.w,
            height: base.h,
            transform: `scale(${scale})`,
            opacity: ready ? 1 : 0,
            pointerEvents: mobile ? "none" : undefined,
          }}
        />
      )}
      {mobile && (
        <Link
          href={src}
          prefetch={false}
          tabIndex={-1}
          aria-hidden
          className="absolute inset-0"
          data-gtm-cta={ctaId}
        />
      )}
    </div>
  );
  return (
    <>
      {frame}
      {mobile && (
        <Link
          href={src}
          prefetch={false}
          data-gtm-cta={ctaId}
          className="flex items-center justify-center gap-1.5 border-t border-border py-3 text-[15px] font-bold text-foreground"
        >
          <Maximize2 size={16} aria-hidden />
          크게 보기
        </Link>
      )}
    </>
  );
}
