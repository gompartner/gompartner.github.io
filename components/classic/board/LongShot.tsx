"use client";

import { useEffect, useRef, type CSSProperties } from "react";

// 11-26 긴 화면 캡처를 창 안에서 저절로 내려가며 보여 준다.
// 사용자: "첫 장 히어로만 있으니 뭘 했는지 모르겠다. 안에서 스크롤하게 해도 스크롤이 있는지도 모를 것(연혁과 카탈로그 동일)".
// 그래서 스크롤을 시키지 않는다. 페이지 전체를 찍은 긴 그림이 창 안에서 천천히 끝까지 내려갔다가 처음으로 돌아오고,
// 오른쪽 가는 막대가 지금 어디쯤인지 같이 움직인다. 화면에 보일 때만 움직이고, 마우스를 올리면 멈춘다.
// 스타일은 longShotCss.ts(서버 컴포넌트인 판 틀이 불러 쓴다. 이 파일은 클라이언트라 여기서 내보낸 문자열은 서버에서 못 쓴다).
// 움직임 줄이기 설정이나 오래된 브라우저(cqh 없음)에서는 맨 위 화면이 그대로 서 있다. 전체는 크게 보기에서 본다.

type V = CSSProperties & Record<`--${string}`, string>;

/** 긴 캡처 한 장. w, h는 그림의 실제 크기, ratio는 보여 주는 창의 비율("16/10") */
export function LongShot({ src, alt, w, h, ratio, eager = false, active = true }: { src: string; alt: string; w: number; h: number; ratio: string; eager?: boolean; active?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [rw, rh] = ratio.split("/").map(Number);
  // 창 몇 장 분량인가. 한 장이 조금 넘는 정도면 움직이지 않는다
  const screens = h / w / (rh / rw);
  const moves = screens > 1.2;

  useEffect(() => {
    const el = ref.current;
    if (!el || !moves) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && active) el.dataset.on = "";
      else delete el.dataset.on;
    }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, [moves, active]);

  const style: V = { aspectRatio: ratio, "--ls-dur": `${(4 + (screens - 1) * 3.4).toFixed(1)}s` };
  return (
    <span ref={ref} className="ls relative block w-full overflow-hidden bg-[#0f131b]" style={style}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} width={w} height={h} loading={eager ? "eager" : "lazy"} decoding="async" className={`absolute left-0 top-0 block h-auto w-full max-w-none ${moves ? "ls-img" : ""}`} />
      {moves && (
        <span aria-hidden className="pointer-events-none absolute bottom-1.5 right-1 top-1.5 w-[4px] rounded-full bg-black/15">
          <i className="ls-bar block w-full rounded-full bg-white/80 shadow-[0_0_0_1px_rgba(0,0,0,.35)]" style={{ height: `${Math.max(8, 100 / screens).toFixed(1)}%` }} />
        </span>
      )}
    </span>
  );
}
