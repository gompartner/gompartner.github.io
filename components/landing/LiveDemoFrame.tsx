"use client";

// 데모 페이지를 iframe으로 띄우고 칸 폭에 맞춰 줄인다.
// 데모는 기준 폭(PC 1280, 휴대폰 390)으로 그려지고 transform으로 줄어들어 화면 그대로 눌러 볼 수 있다.
// 칸이 640px보다 좁으면 휴대폰 폭으로 띄운다. 불러오는 동안은 썸네일을 깔아 둔다.
// PC에서는 창 높이를 화면 안에 맞춰, 페이지를 내리지 않고 바로 데모 안을 스크롤하게 한다.
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
  const [height, setHeight] = useState(0);
  const [top, setTop] = useState(0);
  const [loaded, setLoaded] = useState<string | null>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const measureTop = () => setTop(Math.round(el.getBoundingClientRect().top + window.scrollY));
    const ro = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
      setHeight(entry.contentRect.height);
      measureTop();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const mobile = width > 0 && width < 640;
  const scale = width / (mobile ? MOBILE : PC).w;
  // 화면 높이에 맞춰 잘린 만큼 데모 기준 높이도 줄여, 줄이는 비율은 폭 기준 그대로 둔다.
  const base = mobile ? MOBILE : { w: PC.w, h: height > 0 ? Math.round(height / scale) : PC.h };
  const ready = loaded === src;

  const frame = (
    <div
      ref={box}
      className="relative w-full overflow-hidden bg-white"
      style={
        mobile
          ? { aspectRatio: `${MOBILE.w} / ${MOBILE.h}` }
          : { aspectRatio: `${PC.w} / ${PC.h}`, maxHeight: `max(440px, calc(100svh - ${(top || 300) + 24}px))` }
      }
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
