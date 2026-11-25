"use client";

import { useEffect, useRef } from "react";

// 11-26 스크롤에 따라 장면이 바뀌는 화면은 그림 대신 실제로 내려 보며 녹화한 영상으로 보여 준다
// (사용자 "트렌드에 맞춰 만든 것은 캡처보다 움직이는 것을 보는 게 더 궁금함").
// 소리 없는 영상이고, 화면에 보일 때만 돌고 벗어나면 멈춘다. 처음에는 첫 화면 그림(poster)만 받아 두고, 보일 때 영상을 받기 시작한다.
// 움직임 줄이기 설정이면 저절로 돌지 않고 재생 버튼을 보여 준다. full은 크게 보기 팝업(재생 막대를 함께 보여 준다).
export function MotionShot({ src, poster, alt, w, h, full = false }: { src: string; poster: string; alt: string; w: number; h: number; full?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      v.controls = true;
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return <video ref={ref} src={src} poster={poster} muted loop playsInline preload="none" controls={full} aria-label={alt} width={w} height={h} className="block h-auto w-full bg-[#0f131b] object-cover object-top" style={{ aspectRatio: `${w}/${h}` }} />;
}
