"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

// 11-26 3D 웹 판의 첫 칸. 영상이 아니라 실제 3D 화면(public/3d 정적 페이지)을 그 자리에 끼워, 방문자가 직접 돌리고 눌러 본다
// (사용자 "영상 플레이가 아닌 효과도 할 수 있나". 이 상품은 직접 만져 봐야 팔린다).
// 맨 위에 둘 화면은 모듈 소파다(11-26 사용자 "3D 첫 번째 체험은 소파로". 처음에는 시스템 선반이었다). 한 화면에서 끝나고, 모듈을 붙이거나 원단을 바꿀 때마다 위쪽 금액이 바뀐다.
//  - PC(마우스): 페이지가 열리면 3D 라이브러리를 미리 받고 바로 켠다. 그리기 전에는 첫 화면 그림이 서 있다.
//    3D 위에서 휠을 굴리면 3D가 확대되지 않고 페이지가 내려간다(스크롤을 붙잡지 않는다). 확대는 Ctrl + 휠.
//  - 휴대폰, 태블릿(손가락): 3D 위 손가락 끌기가 페이지 내리기를 막아 3D를 켜지 않는다. 11-28 대표 "모바일에서도 PC와 동일하게 캡처 이미지로, 체험하기 버튼은 제거": 칸 크기로 찍은 그림만 두고 직접 만지는 것은 전체 화면으로 열기.
// 끼운 화면 안의 곰파트너 바로가기 줄은 가리고(이미 곰파트너 사이트 안이다. 소파 화면은 ?embed=1 로 스스로 가리고 위 여백도 줄인다), 안쪽 링크는 창 전체로 연다. public/3d 파일은 고치지 않는다.

const THREE_URL = "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

/** 가구 쇼룸 3D 화면(소파, 선반)의 바탕색 */
const STAGE_BG = "#e6ecea";

/** src는 끼울 주소, href는 전체 화면으로 열 주소. children은 3D 아래에 두는 이름표와 제목, hint는 그 아래 한 줄. poster는 넓은 화면의 첫 그림, preview.still은 휴대폰 칸 크기로 찍은 그림 */
export function LiveStage({ src, href, title, poster, stages, preview, hint, children }: { src: string; href: string; title: string; poster: string; stages?: { min: number; src: string }[]; preview: { src: string; poster: string; still?: string; w: number; h: number; alt: string }; hint: string; children: ReactNode }) {
  const [on, setOn] = useState(false);
  const [ready, setReady] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const narrow = matchMedia("(max-width: 767px)").matches;
    const coarse = matchMedia("(pointer: coarse)").matches;
    let timer = 0;
    let link: HTMLLinkElement | null = null;
    const start = window.setTimeout(() => {
      // 휴대폰, 태블릿(손가락)은 3D를 켜지 않고 그림만 둔다(11-28)
      if (narrow || coarse) return;
      // 마우스로 쓰는 넓은 화면은 눌러야 켜지는 단계를 두지 않는다
      link = document.createElement("link");
      link.rel = "modulepreload";
      link.href = THREE_URL;
      document.head.appendChild(link);
      timer = window.setTimeout(() => setOn(true), 150);
    }, 0);
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(timer);
      link?.remove();
    };
  }, []);

  // 끼운 화면이 열리면: 바로가기 줄 가리기, 링크는 창 전체로, 휠은 페이지 스크롤로 넘기기
  const onLoad = () => {
    try {
      const win = frame.current?.contentWindow;
      const doc = frame.current?.contentDocument;
      if (win && doc) {
        const st = doc.createElement("style");
        st.textContent = ".gp-bar{display:none!important}html,body{overscroll-behavior:auto!important}";
        doc.head.appendChild(st);
        doc.querySelectorAll("a[href]").forEach((a) => a.setAttribute("target", "_top"));
        win.addEventListener(
          "wheel",
          (e) => {
            // 3D의 휠 확대로 넘어가지 않게 막는다. 끼운 화면은 스크롤할 것이 없어 휠이 바깥 페이지로 이어진다
            if (!e.ctrlKey) e.stopImmediatePropagation();
          },
          { capture: true, passive: true },
        );
      }
    } catch {
      // 같은 사이트의 화면이라 여기 올 일은 없다. 막히면 원래 화면 그대로 쓴다
    }
    setReady(true);
  };


  return (
    <div className="overflow-hidden rounded-[24px] border border-white/12 bg-[#121722] md:rounded-[28px]">
      <div className="relative aspect-[356/560] max-h-[70svh] w-full overflow-hidden bg-[#0f131b] md:aspect-auto md:h-[min(640px,calc(100svh-150px))] md:max-h-none md:min-h-[520px]">
        {/* 1. 3D가 켜지기 전 첫 화면 그림(좁은 화면과 넓은 화면의 그림이 다르다). 손가락 기기는 이 그림만 보인다 */}
        {/* 바탕은 3D 화면의 바탕색: 태블릿처럼 그림과 칸의 비율이 다를 때 그림을 자르지 않고 남는 자리를 같은 색으로 채운다 */}
        <div className={`absolute inset-0 [&>video]:h-full [&>video]:object-center ${on && ready ? "invisible" : ""}`} style={{ backgroundColor: STAGE_BG }}>
          {/* 11-28 대표 "모바일에서도 PC와 동일하게 캡처 이미지로, 체험하기 버튼은 제거": 손가락 기기는 3D를 켜지 않고 칸 크기로 찍은 그림만 둔다. 직접 만지는 것은 전체 화면으로 열기 */}
          <picture className="block h-full w-full">
              {/* 11-27 사용자 "만든다 만 느낌": 넓은 화면은 칸 크기 그대로 찍은 그림(stages)을 칸 폭에 맞춰 골라 꽉 채운다. 양옆에 바탕색 여백이 남지 않게 */}
              {(stages ?? []).map((g) => <source key={g.min} media={`(min-width: ${g.min}px)`} srcSet={g.src} />)}
              <source media="(min-width: 768px)" srcSet={poster} />
              <img src={preview.still ?? preview.poster} alt="" width={preview.w} height={preview.h} decoding="async" className={`h-full w-full object-cover object-center ${stages ? "" : "md:object-contain"}`} />
          </picture>
        </div>
        {/* 2. 실제 3D 화면 */}
        {on && <iframe ref={frame} src={src} title={title} onLoad={onLoad} allow="clipboard-write" className={`absolute inset-0 h-full w-full border-0 transition-opacity duration-300 motion-reduce:transition-none ${ready ? "opacity-100" : "opacity-0"}`} />}
      </div>

      <div className="flex flex-col gap-5 border-t border-white/12 px-5 py-6 md:flex-row md:items-end md:justify-between md:gap-8 md:px-9 md:py-8">
        <div>
          {children}
          <p className="mt-2 break-keep text-[15px] leading-[1.65] text-[#aab2bf] md:text-[16px]">{hint}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <a href={href} className="inline-flex min-h-12 items-center gap-1.5 rounded-full border border-white/25 px-5 text-[16px] font-bold text-white hover:border-white/90">
            전체 화면으로 열기 <ArrowUpRight size={17} aria-hidden />
          </a>
        </div>
      </div>
    </div>
  );
}
