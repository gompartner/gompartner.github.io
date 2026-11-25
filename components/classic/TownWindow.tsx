"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { asm } from "@/components/classic/assembleState";
import { coarsePointer, holdScroll } from "@/components/classic/scrollHold";

// 11-25 조립형 첫 화면 창 안의 3D 마을.
// 순서: 설계선(등각 바닥과 건물 윤곽)이 그려진다 > 3D가 나타나고 건물이 하나씩 내려앉는다(island ?build=1).
// 휴대폰에서 완성된 마을 사진을 먼저 보여 주고 버튼을 눌러야 3D가 나오던 것은 뺐다(사용자 "이미 다 그려져 있어, 눌러야 하는 게 불편").
// 3D는 글자 조립이 끝날 즈음 미리 불러 두고, 창이 보이면 설계선 다음에 건물을 내린다.
// 새로고침 전에 이미 조립했으면 건물 연출 없이 바로 불러온다.
// 처음 보이는 각도(11-25 사용자가 아이패드에서 돌려 보여 준 화면): 길이 가로로 놓이고 건물 다섯 채가 정면으로 보인다
const BASE = `${process.env.NODE_ENV === "development" ? "/3d/island.html" : "/3d/island"}?az=-0.8&zoom=1`;

type V = CSSProperties & Record<`--${string}`, string>;
const at = (d: number): V => ({ "--d": `${d.toFixed(2)}s` });

/** 등각 상자 윤곽(바닥 가운데 cx, cy, 폭 w, 깊이 d, 높이 h) */
function box(cx: number, cy: number, w: number, d: number, h: number) {
  const u = [w / 2, w / 4], v = [-d / 2, d / 4];
  const N = [cx - u[0] - v[0], cy - u[1] - v[1]], E = [cx + u[0] - v[0], cy + u[1] - v[1]];
  const S = [cx + u[0] + v[0], cy + u[1] + v[1]], W = [cx - u[0] + v[0], cy - u[1] + v[1]];
  const p = (q: number[], up = 0) => `${q[0].toFixed(1)} ${(q[1] - up).toFixed(1)}`;
  return `M${p(W)} L${p(S)} L${p(E)} M${p(W)} L${p(W, h)} M${p(S)} L${p(S, h)} M${p(E)} L${p(E, h)} M${p(N, h)} L${p(E, h)} L${p(S, h)} L${p(W, h)} Z`;
}
const BOXES: [number, number, number, number, number][] = [[128, 132, 70, 60, 34], [196, 104, 60, 56, 50], [272, 140, 64, 60, 38], [150, 196, 78, 64, 28], [246, 204, 66, 60, 56]];
const plan = BOXES.map((b) => box(...b));
/** 상자 윗면(지붕). 3D가 준비될 때까지 한 채씩 번갈아 차오르며 조립이 이어지고 있음을 보여 준다 */
function roof(cx: number, cy: number, w: number, d: number, h: number) {
  const u = [w / 2, w / 4], v = [-d / 2, d / 4];
  const pts = [[cx - u[0] - v[0], cy - u[1] - v[1]], [cx + u[0] - v[0], cy + u[1] - v[1]], [cx + u[0] + v[0], cy + u[1] + v[1]], [cx - u[0] + v[0], cy - u[1] + v[1]]];
  return pts.map((q) => `${q[0].toFixed(1)},${(q[1] - h).toFixed(1)}`).join(" ");
}
const roofs = BOXES.map((b) => roof(...b));

const THREE_URL = "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

export function TownWindow() {
  const [built] = useState(() => asm.hero);
  const [src, setSrc] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false); // 3D 첫 장면이 그려졌다
  const [lines, setLines] = useState(false); // 창이 보인 뒤 설계선이 그려질 시간이 지났다
  const [seen, setSeen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const state = useRef({ loaded: false, done: false, stop: () => {} });
  // 설계선에서 3D로 바꾸는 때: 3D가 준비됐고, 설계선도 보여 줬을 때
  const ready = loaded && (built || lines);

  // 11-26 3D는 창이 보이기를 기다리지 않고 미리 불러 둔다(사용자 "3D가 만들어지기 전에 기다릴지가 관건").
  // 글자 조립과 겹쳐 버벅이지 않게 조금 뒤에 시작하고(휴대폰은 더 뒤), 건물은 창이 보일 때 내린다(island ?wait=1).
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "modulepreload";
    link.href = THREE_URL;
    document.head.appendChild(link);
    let idle = 0;
    const coarse = matchMedia("(pointer: coarse)").matches;
    const timer = window.setTimeout(() => {
      const go = () => setSrc(built ? BASE : `${BASE}&build=1&wait=1`);
      if ("requestIdleCallback" in window) idle = window.requestIdleCallback(go, { timeout: 400 });
      else go();
    }, built ? 200 : coarse ? 900 : 400);
    return () => {
      window.clearTimeout(timer);
      if (idle && "cancelIdleCallback" in window) window.cancelIdleCallback(idle);
      link.remove();
    };
  }, [built]);

  // 창이 절반 넘게 보이면 설계선이 그려지고, 1초 뒤부터 3D로 바꿀 수 있다
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let timer = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      setSeen(true);
      timer = window.setTimeout(() => setLines(true), 900);
    }, { threshold: 0.5 });
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  // 3D 첫 장면이 그려지면(마을 화면이 body에 gl-on을 붙인다) 설계선을 걷을 수 있다
  useEffect(() => {
    if (!src) return;
    const started = Date.now();
    const id = window.setInterval(() => {
      let on = false;
      try {
        on = !!frame.current?.contentDocument?.body?.classList.contains("gl-on");
      } catch {
        on = false;
      }
      if (on || Date.now() - started > 8000) {
        window.clearInterval(id);
        state.current.loaded = true;
        setLoaded(true);
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [src]);

  // 3D로 바뀌는 순간 건물을 내리기 시작한다. 다섯 채가 앉으면(약 1.3초) 조립 끝
  useEffect(() => {
    if (!ready || built) return;
    frame.current?.contentWindow?.postMessage("gp-build", window.location.origin);
    const st = state.current;
    const timer = window.setTimeout(() => {
      st.done = true;
      st.stop();
    }, 1400);
    return () => window.clearTimeout(timer);
  }, [ready, built]);

  // 마을이 다 조립되기 전에 아래로 내리려 하면, 창이 화면에 다 들어오는 자리에서 조립이 끝날 때까지 붙잡는다.
  // 보통 2초 안팎, 길어도 3.2초. 내리려 한 지 1.3초가 지나도 3D가 준비되지 않으면(느린 통신) 그냥 보낸다. 머리글 메뉴로 건너뛸 때는 붙잡지 않는다.
  useEffect(() => {
    const el = root.current;
    const st = state.current;
    if (!el || !seen || built || st.done || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let release: (() => void) | null = null;
    let giveUp = 0;
    let last = window.scrollY;
    const start = () => {
      if (release || st.done) return;
      const r = el.getBoundingClientRect();
      if (r.bottom < 120) return stop(); // 이미 지나갔다
      const headH = document.querySelector("header")?.getBoundingClientRect().height ?? 72;
      let y = window.scrollY;
      // 창 아래가 잘렸으면 다 보일 만큼만 내리고, 창 위가 머리글에 가렸으면(화면이 뜨기 전에 이미 내린 경우) 그만큼 올린다
      if (coarsePointer()) y = window.scrollY; // 손가락 기기는 자리를 옮기지 않는다
      else if (r.top < headH + 12) y = Math.max(0, y + r.top - headH - 12);
      else if (r.bottom > window.innerHeight - 16) y += Math.max(0, Math.min(r.top - headH - 12, r.bottom - window.innerHeight + 24));
      if (Math.abs(y - window.scrollY) > 4) window.scrollTo({ top: y, behavior: "smooth" });
      release = holdScroll(y, 3200);
      giveUp = window.setTimeout(() => {
        if (!st.loaded) stop();
      }, 1300);
    };
    const wheel = (e: WheelEvent) => {
      if (e.deltaY <= 0 || release || st.done) return;
      e.preventDefault();
      start();
    };
    const scroll = () => {
      if (window.scrollY > last + 1) start();
      last = window.scrollY;
    };
    const jump = (e: Event) => {
      if ((e.target as HTMLElement)?.closest?.('a[href*="#"]')) stop();
    };
    function stop() {
      st.done = true;
      release?.();
      window.clearTimeout(giveUp);
      window.removeEventListener("wheel", wheel);
      window.removeEventListener("scroll", scroll);
      document.removeEventListener("click", jump, true);
    }
    st.stop = stop;
    window.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("scroll", scroll, { passive: true });
    document.addEventListener("click", jump, true);
    return () => {
      const was = st.done;
      stop();
      st.done = was;
      st.stop = () => {};
    };
  }, [seen, built]);

  return (
    <div ref={root}>
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0f1b3d]">
        {/* 1. 설계선 */}
        <svg aria-hidden viewBox="0 0 400 300" className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${ready ? "opacity-0" : "opacity-100"}`} fill="none" stroke="#7aa7ff" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round">
          <path className="gp-draw" pathLength={1} d="M200 52 L372 150 L200 248 L28 150 Z" style={at(0.4)} />
          <path className="gp-draw" pathLength={1} d="M114 101 L286 199 M114 199 L286 101" strokeOpacity=".45" style={at(0.5)} />
          {roofs.map((pts, i) => (
            <polygon key={`r${i}`} className="gp-roof" points={pts} stroke="none" style={at(1.0 + i * 0.32)} />
          ))}
          {plan.map((d, i) => (
            <path key={i} className="gp-draw" pathLength={1} d={d} strokeOpacity=".85" style={at(0.55 + i * 0.07)} />
          ))}
        </svg>
        {/* 2. 3D 마을: 건물이 하나씩 내려앉는다 */}
        {src && (
          <iframe
            ref={frame}
            src={src}
            title="3D 마을. 건물 이름표를 누르면 해당 상품 화면을 엽니다."
            className={`absolute inset-0 h-full w-full border-0 transition-opacity duration-300 ${ready ? "opacity-100" : "opacity-0"}`}
          />
        )}
      </div>
      <p className="gp-fade flex min-h-11 items-center gap-2 border-t border-white/10 px-4 pb-7 pt-2.5 text-[13px] leading-[1.5] text-[#aab2bf] md:text-[14px]" style={at(1.3)}>
        <i aria-hidden className={`h-2 w-2 shrink-0 rounded-full ${ready ? "bg-[#28c840]" : "bg-[#7aa7ff]"}`} />
        {ready ? "건물 이름표를 누르면 그 상품 화면이 열립니다. 끌면 마을이 돌아갑니다." : "3D 마을을 조립하고 있습니다."}
      </p>
    </div>
  );
}
