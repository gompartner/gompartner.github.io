"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { asm } from "@/components/classic/assembleState";

// 11-25 조립형 첫 화면 창 안의 3D 마을.
// 순서: 설계선(등각 바닥과 건물 윤곽)이 그려진다 > 3D가 나타나고 건물이 하나씩 내려앉는다(island ?build=1).
// 휴대폰은 처음에 3D를 바로 불러오면 버벅여서(사용자 제보) 설계선 위에 마을 사진을 둥글게 열어 보여 주고, 누르면 3D를 불러온다.
// PC는 첫 화면 조립이 끝나고 브라우저가 한가할 때 불러온다. 새로고침 전에 이미 조립했으면 건물 연출 없이 바로.
const BASE = process.env.NODE_ENV === "development" ? "/3d/island.html" : "/3d/island";

type V = CSSProperties & Record<`--${string}`, string>;
const at = (d: number): V => ({ "--d": `${d.toFixed(2)}s` });

const css = `
.gp-poster, .gp-tap { display: none; }
@media (max-width: 767px), (pointer: coarse) { .gp-poster { display: block; } .gp-tap { display: flex; } }
`;

/** 등각 상자 윤곽(바닥 가운데 cx, cy, 폭 w, 깊이 d, 높이 h) */
function box(cx: number, cy: number, w: number, d: number, h: number) {
  const u = [w / 2, w / 4], v = [-d / 2, d / 4];
  const N = [cx - u[0] - v[0], cy - u[1] - v[1]], E = [cx + u[0] - v[0], cy + u[1] - v[1]];
  const S = [cx + u[0] + v[0], cy + u[1] + v[1]], W = [cx - u[0] + v[0], cy - u[1] + v[1]];
  const p = (q: number[], up = 0) => `${q[0].toFixed(1)} ${(q[1] - up).toFixed(1)}`;
  return `M${p(W)} L${p(S)} L${p(E)} M${p(W)} L${p(W, h)} M${p(S)} L${p(S, h)} M${p(E)} L${p(E, h)} M${p(N, h)} L${p(E, h)} L${p(S, h)} L${p(W, h)} Z`;
}
const plan = [box(128, 132, 70, 60, 34), box(196, 104, 60, 56, 50), box(272, 140, 64, 60, 38), box(150, 196, 78, 64, 28), box(246, 204, 66, 60, 56)];

export function TownWindow() {
  const [built] = useState(() => asm.hero);
  const [src, setSrc] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);

  // PC: 조립 연출(약 1.5초)이 끝난 뒤 한가할 때 불러온다
  useEffect(() => {
    if (matchMedia("(max-width: 767px), (pointer: coarse)").matches) return;
    let idle = 0;
    const t = window.setTimeout(() => {
      const go = () => setSrc(built ? BASE : `${BASE}?build=1`);
      if ("requestIdleCallback" in window) idle = window.requestIdleCallback(go, { timeout: 1500 });
      else go();
    }, built ? 200 : 1500);
    return () => {
      window.clearTimeout(t);
      if (idle && "cancelIdleCallback" in window) window.cancelIdleCallback(idle);
    };
  }, [built]);

  // 3D 첫 장면이 그려지면(마을 화면이 body에 gl-on을 붙인다) 설계선과 사진을 걷는다
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
        setReady(true);
      }
    }, 120);
    return () => window.clearInterval(id);
  }, [src]);

  return (
    <div>
      <style>{css}</style>
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0f1b3d]">
        {/* 1. 설계선 */}
        <svg aria-hidden viewBox="0 0 400 300" className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${ready ? "opacity-0" : "opacity-100"}`} fill="none" stroke="#7aa7ff" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round">
          <path className="gp-draw" pathLength={1} d="M200 52 L372 150 L200 248 L28 150 Z" style={at(0.4)} />
          <path className="gp-draw" pathLength={1} d="M114 101 L286 199 M114 199 L286 101" strokeOpacity=".45" strokeDasharray="1" style={at(0.5)} />
          {plan.map((d, i) => (
            <path key={i} className="gp-draw" pathLength={1} d={d} strokeOpacity=".85" style={at(0.55 + i * 0.07)} />
          ))}
        </svg>
        {/* 2. 휴대폰: 마을 사진이 가운데에서 둥글게 열린다 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/3d-town-poster.jpg"
          alt="3D 미니어처 마을. 한옥 찻집, 가구 쇼룸, 간판 제작, 인테리어, 곰파트너 건물"
          className={`gp-poster gp-iris absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-300 ${ready ? "opacity-0" : "opacity-100"}`}
          style={at(1.0)}
        />
        {/* 3. 3D 마을 */}
        {src && (
          <iframe
            ref={frame}
            src={src}
            title="3D 마을. 건물 이름표를 누르면 해당 상품 화면을 엽니다."
            className={`absolute inset-0 h-full w-full border-0 transition-opacity duration-300 ${ready ? "opacity-100" : "opacity-0"}`}
          />
        )}
        {!src && (
          <button type="button" onClick={() => setSrc(`${BASE}?build=1`)} className="gp-tap gp-pop absolute inset-x-0 bottom-5 mx-auto w-fit items-center gap-2 rounded-full bg-white px-5 py-3 text-[15px] font-bold text-[#0b0d12] shadow-[0_6px_20px_rgba(0,0,0,.35)]" style={{ ...at(1.45), "--r": "0deg" } as V}>
            3D로 조립해 보기
          </button>
        )}
        {src && !ready && (
          <span className="absolute inset-x-0 bottom-5 flex justify-center">
            <span className="rounded-full bg-black/60 px-4 py-2 text-[14px] font-bold text-white">3D 마을 조립 중</span>
          </span>
        )}
      </div>
      <p className="gp-fade flex min-h-11 items-center gap-2 border-t border-white/10 px-4 pb-7 pt-2.5 text-[13px] leading-[1.5] text-[#aab2bf] md:text-[14px]" style={at(1.5)}>
        <i aria-hidden className={`h-2 w-2 shrink-0 rounded-full ${ready ? "bg-[#28c840]" : "bg-[#7aa7ff]"}`} />
        {ready ? "건물 이름표를 누르면 그 상품 화면이 열립니다. 끌면 마을이 돌아갑니다." : "곰파트너가 만든 3D 미니어처 마을입니다."}
      </p>
    </div>
  );
}
