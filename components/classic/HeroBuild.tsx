import type { CSSProperties, ReactNode } from "react";
import { TownWindow } from "@/components/classic/TownWindow";
import { BuildGate } from "@/components/classic/BuildGate";

// 11-25 조립형 첫 화면(사용자 "면과 선이 조합되며 완성, 합체 로봇처럼 조립되는 메인"). 시안, ?v=build
// 1차(파란 덮개)는 "틀이 이미 나와 있어 로딩 느낌"이라 바꿈: 빈 틀을 먼저 보여 주지 않는다.
// 부품(실제 내용)이 화면 밖에서 입체로 돌며 날아와 하나씩 맞물리고, 창틀은 네 변이 모서리에서 뻗어 만나며,
// 큰 부품이 맞물릴 때 화면이 쿵 흔들리고, 다 맞춰지면 빛이 훑고 지나간다. 움직임 줄이기면 완성된 화면만.

type V = CSSProperties & Record<`--${string}`, string>;

const css = `
@keyframes gp-dock {
  0% { opacity: 0; transform: perspective(1000px) translate3d(var(--dx), var(--dy), 0) rotateX(var(--rx)) rotateY(var(--ry)) rotate(var(--rot)) scale(var(--s)); }
  55% { opacity: 1; }
  82% { transform: perspective(1000px) translate3d(calc(var(--dx) * -0.015), calc(var(--dy) * -0.015), 0) rotateX(0deg) rotateY(0deg) rotate(0deg) scale(1.015); }
  100% { opacity: 1; transform: none; }
}
@keyframes gp-edge-x { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes gp-edge-y { from { transform: scaleY(0); } to { transform: scaleY(1); } }
@keyframes gp-lock { 0% { opacity: 0; transform: scale(1.06); } 30% { opacity: 1; } 100% { opacity: 0; transform: scale(1); } }
@keyframes gp-clunk { 0%, 100% { transform: none; } 35% { transform: translateY(4px); } 65% { transform: translateY(-1px); } }
@keyframes gp-scan { from { transform: translateX(-110%); } to { transform: translateX(220%); } }
@keyframes gp-fade { from { opacity: 0; } to { opacity: 1; } }
.gp-part { animation: gp-dock 0.6s cubic-bezier(0.16, 0.84, 0.3, 1) both; animation-delay: var(--d); }
.gp-lock { position: absolute; inset: -6px; border: 1.5px solid #7aa7ff; border-radius: 10px; pointer-events: none; animation: gp-lock 0.55s ease-out both; animation-delay: calc(var(--d) + 0.48s); }
.gp-edge-x { animation: gp-edge-x 0.4s cubic-bezier(0.7, 0, 0.2, 1) both; animation-delay: var(--d); }
.gp-edge-y { animation: gp-edge-y 0.4s cubic-bezier(0.7, 0, 0.2, 1) both; animation-delay: var(--d); }
.gp-clunk { animation: gp-clunk 0.24s ease-out 1.1s both, gp-clunk 0.28s ease-out 1.5s both; }
.gp-scan { animation: gp-scan 0.7s ease-in-out both; animation-delay: var(--d); }
.gp-fade { animation: gp-fade 0.7s ease-out both; animation-delay: var(--d); }
/* 이미 조립했으면(새로고침 전) 조립 연출 없이 완성된 화면 */
[data-built] .gp-part, [data-built] .gp-edge-x, [data-built] .gp-edge-y, [data-built] .gp-clunk, [data-built] .gp-fade { animation: none; }
[data-built] .gp-lock, [data-built] .gp-scan { display: none; }
/* 돌아오거나 다시 보일 때: 선만 반짝이고 광택이 한 번 훑는다 */
@keyframes gp-spark { 0%, 100% { box-shadow: 0 0 0 0 rgba(122, 167, 255, 0); } 35% { box-shadow: 0 0 10px 2px rgba(122, 167, 255, 0.95); } }
[data-shine] .gp-edge-x, [data-shine] .gp-edge-y { animation: gp-spark 1s ease-out both; transform: none; }
[data-shine] .gp-edge-y { animation-delay: 0.15s; }
[data-built][data-shine] .gp-scan, [data-shine] .gp-scan { display: block; animation: gp-scan 0.7s ease-in-out both; animation-delay: 0.1s; }
@media (prefers-reduced-motion: reduce) {
  .gp-part, .gp-edge-x, .gp-edge-y, .gp-clunk, .gp-fade { animation: none; }
  .gp-lock, .gp-scan { display: none; }
  [data-shine] .gp-edge-x, [data-shine] .gp-edge-y { animation: none; }
}
`;

function Part({ dx, dy, rx = "0deg", ry = "0deg", rot = "0deg", s = "1", d, className = "", children }: { dx: string; dy: string; rx?: string; ry?: string; rot?: string; s?: string; d: number; className?: string; children: ReactNode }) {
  const style: V = { "--dx": dx, "--dy": dy, "--rx": rx, "--ry": ry, "--rot": rot, "--s": s, "--d": `${d}s` };
  return (
    <div className={`gp-part relative ${className}`} style={style}>
      {children}
      <span aria-hidden className="gp-lock" />
    </div>
  );
}

const at = (d: number): V => ({ "--d": `${d}s` });

export function HeroBuild() {
  return (
    <BuildGate>
    <section aria-labelledby="c-hero" className="relative isolate overflow-hidden bg-[#0b0d12] text-white">
      <style>{css}</style>
      <div aria-hidden className="gp-fade absolute inset-0 -z-10 bg-[linear-gradient(rgba(122,167,255,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(122,167,255,.07)_1px,transparent_1px)] bg-[size:48px_48px]" style={at(0)} />
      <div className="gp-clunk relative mx-auto grid w-full max-w-[1248px] gap-12 px-4 pb-20 pt-16 md:px-6 md:pb-28 md:pt-24 lg:grid-cols-[1fr_1fr] lg:gap-14">
        <div className="lg:pt-6">
          <Part dx="0px" dy="-260px" rx="80deg" d={0.75} className="inline-block">
            <p className="rounded-full border border-white/20 px-4 py-1.5 text-[14px] font-bold text-[#c9ced6] md:text-[15px]">웹, 앱 개발과 유지보수</p>
          </Part>
          {/* 제목 두 줄이 양쪽에서 날아와 합쳐진다 */}
          <h1 id="c-hero" className="mt-6 break-keep text-[40px] font-[800] leading-[1.1] tracking-[-0.055em] md:text-[72px]">
            <Part dx="-1100px" dy="0px" ry="-70deg" s="1.4" d={0.4} className="block">
              아이디어를
            </Part>
            <Part dx="1100px" dy="0px" ry="70deg" s="1.4" d={0.48} className="block">
              운영되는 서비스로
            </Part>
          </h1>
          <Part dx="0px" dy="320px" rx="-75deg" d={0.8} className="mt-6 max-w-[560px]">
            <p className="break-keep text-[17px] leading-[1.7] text-[#aab2bf] md:text-[19px]">
              홈페이지, 업무 시스템, 앱을 기획부터 오픈, 운영까지 맡습니다. 개발 책임자가 직접 만들고 원본 소스와 인계 문서까지 드립니다.
            </p>
          </Part>
          <div className="mt-9 flex flex-wrap gap-2.5">
            <Part dx="-600px" dy="400px" rot="-160deg" s="0.6" d={0.9}>
              <a href="#apply" data-gtm-cta="classic_hero_contact" className="inline-flex min-h-[54px] items-center rounded-md bg-[#256ef4] px-7 text-[17px] font-bold text-white hover:bg-[#0b50d0]">
                프로젝트 문의
              </a>
            </Part>
            <Part dx="500px" dy="460px" rot="140deg" s="0.6" d={0.98}>
              <a href="#portfolio" className="inline-flex min-h-[54px] items-center rounded-md border border-white/30 px-7 text-[17px] font-bold text-white hover:border-white">
                포트폴리오 보기
              </a>
            </Part>
          </div>
        </div>

        {/* 오른쪽 브라우저 창: 네 변이 모서리에서 뻗어 만나고, 부품이 차례로 끼워진다 */}
        <div>
          <div className="relative">
          <span aria-hidden className="gp-edge-x absolute left-0 right-0 top-0 h-px origin-left bg-[#7aa7ff]" style={at(0.05)} />
          <span aria-hidden className="gp-edge-y absolute bottom-0 right-0 top-0 w-px origin-top bg-[#7aa7ff]" style={at(0.15)} />
          <span aria-hidden className="gp-edge-x absolute bottom-0 left-0 right-0 h-px origin-right bg-[#7aa7ff]" style={at(0.25)} />
          <span aria-hidden className="gp-edge-y absolute bottom-0 left-0 top-0 w-px origin-bottom bg-[#7aa7ff]" style={at(0.35)} />
          <div className="relative overflow-hidden rounded-[2px]">
            <Part dx="0px" dy="-500px" rx="90deg" d={0.5} className="bg-[#151922]">
              <div className="flex h-10 items-center gap-1.5 border-b border-white/10 px-4">
                <i className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <i className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <i className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                <span className="ml-3 h-5 flex-1 rounded bg-white/10" />
              </div>
            </Part>
            {/* 11-25 사용자 "상품은 3D 타운으로": 창 안에 3D 미니어처 마을(public/3d/island). 건물 이름표를 누르면 그 상품 화면이 열린다 */}
            <Part dx="900px" dy="-120px" ry="75deg" rot="8deg" d={0.6}>
              <TownWindow />
            </Part>
            {/* 다 맞물리면 빛이 한 번 훑는다 */}
            <span className="gp-scan pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-[linear-gradient(90deg,transparent,rgba(122,167,255,.35),transparent)]" style={at(1.3)} />
          </div>
          </div>
          <p className="gp-fade mt-3 text-right text-[13px] font-bold tracking-[0.15em] text-[#7aa7ff]" style={at(1.55)}>
            BUILD COMPLETE
          </p>
        </div>
      </div>
    </section>
    </BuildGate>
  );
}
