"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowUpRight, Pointer, Power } from "lucide-react";
import { MotionShot } from "@/components/classic/board/MotionShot";

// 11-26 3D 웹 판의 첫 칸. 영상이 아니라 실제 3D 화면(public/3d 정적 페이지)을 그 자리에 끼워, 방문자가 직접 돌리고 눌러 본다
// (사용자 "영상 플레이가 아닌 효과도 할 수 있나". 이 상품은 직접 만져 봐야 팔린다).
// 맨 위에 둘 화면은 모듈 소파다(11-26 사용자 "3D 첫 번째 체험은 소파로". 처음에는 시스템 선반이었다). 한 화면에서 끝나고, 모듈을 붙이거나 원단을 바꿀 때마다 위쪽 금액이 바뀐다.
//  - PC(마우스): 페이지가 열리면 3D 라이브러리를 미리 받고 바로 켠다. 그리기 전에는 첫 화면 그림이 서 있다.
//    3D 위에서 휠을 굴리면 3D가 확대되지 않고 페이지가 내려간다(스크롤을 붙잡지 않는다). 확대는 Ctrl + 휠.
//  - 휴대폰, 태블릿(손가락): 3D 위에서는 손가락 끌기가 회전으로 쓰여 페이지가 내려가지 않는다. 그래서 처음에는 조작 영상(태블릿은 그림)만 두고,
//    "직접 해 보기"를 눌러야 그 자리에서 3D가 켜진다. 다시 끌 수 있고, 켠 동안에도 3D 높이를 화면의 70% 아래로 묶어 위아래에 잡고 내릴 자리를 남긴다.
// 끼운 화면 안의 곰파트너 바로가기 줄은 가리고(이미 곰파트너 사이트 안이다. 소파 화면은 ?embed=1 로 스스로 가리고 위 여백도 줄인다), 안쪽 링크는 창 전체로 연다. public/3d 파일은 고치지 않는다.

const THREE_URL = "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

/** 가구 쇼룸 3D 화면(소파, 선반)의 바탕색 */
const STAGE_BG = "#e6ecea";

/** auto: 바로 켠다(마우스), video: 눌러서 켠다, 그 전에는 조작 영상(휴대폰), still: 눌러서 켠다, 그 전에는 그림(태블릿) */
type Mode = "auto" | "video" | "still";

/** src는 끼울 주소, href는 전체 화면으로 열 주소. children은 3D 아래에 두는 이름표와 제목, hint는 그 아래 한 줄. poster는 넓은 화면의 첫 그림, preview는 휴대폰의 조작 영상 */
export function LiveStage({ src, href, title, poster, preview, hint, children }: { src: string; href: string; title: string; poster: string; preview: { src: string; poster: string; w: number; h: number; alt: string }; hint: string; children: ReactNode }) {
  // 서버와 첫 그리기에서는 어떤 기기인지 모른다(null): 그동안은 첫 화면 그림만 보인다
  const [mode, setMode] = useState<Mode | null>(null);
  const [on, setOn] = useState(false);
  const [ready, setReady] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const narrow = matchMedia("(max-width: 767px)").matches;
    const coarse = matchMedia("(pointer: coarse)").matches;
    let timer = 0;
    let link: HTMLLinkElement | null = null;
    const start = window.setTimeout(() => {
      setMode(narrow ? "video" : coarse ? "still" : "auto");
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

  const turn = (v: boolean) => {
    setReady(false);
    setOn(v);
  };
  const tap = mode === "video" || mode === "still";

  return (
    <div className="overflow-hidden rounded-[24px] border border-white/12 bg-[#121722] md:rounded-[28px]">
      <div className="relative aspect-[356/560] max-h-[70svh] w-full overflow-hidden bg-[#0f131b] md:aspect-auto md:h-[min(640px,calc(100svh-150px))] md:max-h-none md:min-h-[520px]">
        {/* 1. 3D가 켜지기 전: 휴대폰은 조작 영상, 그 밖에는 첫 화면 그림(좁은 화면과 넓은 화면의 그림이 다르다) */}
        {/* 바탕은 3D 화면의 바탕색: 태블릿처럼 그림과 칸의 비율이 다를 때 그림을 자르지 않고 남는 자리를 같은 색으로 채운다 */}
        <div className={`absolute inset-0 [&>video]:h-full [&>video]:object-center ${on && ready ? "invisible" : ""}`} style={{ backgroundColor: STAGE_BG }}>
          {mode === "video" && !on ? (
            <MotionShot src={preview.src} poster={preview.poster} alt={preview.alt} w={preview.w} h={preview.h} />
          ) : (
            <picture className="block h-full w-full">
              <source media="(min-width: 768px)" srcSet={poster} />
              <img src={preview.poster} alt="" width={preview.w} height={preview.h} decoding="async" className="h-full w-full object-cover object-center md:object-contain" />
            </picture>
          )}
        </div>
        {/* 손가락으로 쓰는 기기: 아래쪽(부속 줄 자리)에 켜는 버튼을 얹는다. 손이 가는 자리다 */}
        {tap && !on && (
          <p className="absolute inset-x-0 bottom-5 flex justify-center">
            <button type="button" onClick={() => turn(true)} className="gp-primary inline-flex min-h-[52px] items-center gap-2 rounded-full px-7 text-[17px] font-bold shadow-[0_24px_50px_-12px_rgba(0,0,0,.9)]">
              <Pointer size={18} aria-hidden /> 직접 해 보기
            </button>
          </p>
        )}
        {/* 2. 실제 3D 화면 */}
        {on && <iframe ref={frame} src={src} title={title} onLoad={onLoad} allow="clipboard-write" className={`absolute inset-0 h-full w-full border-0 transition-opacity duration-300 motion-reduce:transition-none ${ready ? "opacity-100" : "opacity-0"}`} />}
      </div>

      <div className="flex flex-col gap-5 border-t border-white/12 px-5 py-6 md:flex-row md:items-end md:justify-between md:gap-8 md:px-9 md:py-8">
        <div>
          {children}
          <p className="mt-2 break-keep text-[15px] leading-[1.65] text-[#aab2bf] md:text-[16px]">{hint}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {tap && on && (
            <button type="button" onClick={() => turn(false)} className="gp-ghost inline-flex min-h-12 items-center gap-2 rounded-full px-5 text-[16px] font-bold">
              <Power size={17} aria-hidden /> 3D 끄기
            </button>
          )}
          <a href={href} className="inline-flex min-h-12 items-center gap-1.5 rounded-full border border-white/25 px-5 text-[16px] font-bold text-white hover:border-white/90">
            전체 화면으로 열기 <ArrowUpRight size={17} aria-hidden />
          </a>
        </div>
      </div>
    </div>
  );
}
