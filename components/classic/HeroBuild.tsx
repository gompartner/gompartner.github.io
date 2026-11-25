import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";

// 11-25 조립형 첫 화면(사용자 "면과 선이 조합되며 완성, 합체 로봇처럼 조립되는 메인"). 시안, ?v=build
// 1단계 설계선 > 2단계 부품(면)이 여러 방향에서 비스듬히 날아와 맞물림 > 3단계 덮개가 벗겨지며 실제 내용. 움직임 줄이기면 완성된 화면만.

type V = CSSProperties & Record<`--${string}`, string>;

function Part({ dx, dy, rot, d, c, className = "", children }: { dx: string; dy: string; rot: string; d: number; c?: string; className?: string; children: ReactNode }) {
  const style: V = { "--dx": dx, "--dy": dy, "--rot": rot, "--d": `${d}s`, ...(c ? { "--c": c } : {}) };
  return (
    <div className={`gp-asm-part relative ${className}`} style={style}>
      {children}
      <span aria-hidden className="gp-asm-cover" />
      <span aria-hidden className="gp-asm-lock" />
    </div>
  );
}

const line = (d: number): V => ({ "--d": `${d}s` });

// 조립 연출 스타일(시안이라 이 파일 안에 둔다)
const css = `@keyframes gp-line-x { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes gp-line-y { from { transform: scaleY(0); } to { transform: scaleY(1); } }
@keyframes gp-part-in {
  0% { opacity: 0; transform: translate(var(--dx), var(--dy)) rotate(var(--rot)) scale(0.92); }
  72% { opacity: 1; transform: translate(calc(var(--dx) * -0.03), calc(var(--dy) * -0.03)) rotate(0deg) scale(1.01); }
  100% { opacity: 1; transform: none; }
}
@keyframes gp-cover-off { from { transform: scaleX(1); } to { transform: scaleX(0); } }
@keyframes gp-lock { 0% { opacity: 0; } 35% { opacity: 1; } 100% { opacity: 0; } }
@keyframes gp-fade { from { opacity: 0; } to { opacity: 1; } }
.gp-asm-line-x { transform-origin: left; animation: gp-line-x 0.9s cubic-bezier(0.6, 0, 0.2, 1) both; animation-delay: var(--d, 0s); }
.gp-asm-line-y { transform-origin: top; animation: gp-line-y 0.9s cubic-bezier(0.6, 0, 0.2, 1) both; animation-delay: var(--d, 0s); }
.gp-asm-part { animation: gp-part-in 0.75s cubic-bezier(0.2, 0.8, 0.2, 1) both; animation-delay: var(--d, 0s); }
.gp-asm-cover { position: absolute; inset: 0; background: var(--c, #256ef4); transform-origin: right; animation: gp-cover-off 0.5s cubic-bezier(0.7, 0, 0.2, 1) both; animation-delay: calc(var(--d, 0s) + 0.8s); }
.gp-asm-lock { position: absolute; inset: -5px; border: 1px solid #7aa7ff; pointer-events: none; animation: gp-lock 0.6s ease-out both; animation-delay: calc(var(--d, 0s) + 0.62s); }
.gp-asm-fade { animation: gp-fade 0.8s ease-out both; animation-delay: var(--d, 0s); }
@media (prefers-reduced-motion: reduce) {
  .gp-asm-line-x, .gp-asm-line-y, .gp-asm-part, .gp-asm-fade { animation: none; }
  .gp-asm-cover, .gp-asm-lock { display: none; }
}`;

export function HeroBuild({ shots }: { shots: { img: string; name: string }[] }) {
  return (
    <section aria-labelledby="c-hero" className="relative isolate overflow-hidden bg-[#0b0d12] text-white">
      <style>{css}</style>
      {/* 바탕 모눈 */}
      <div aria-hidden className="gp-asm-fade absolute inset-0 -z-10 bg-[linear-gradient(rgba(122,167,255,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(122,167,255,.07)_1px,transparent_1px)] bg-[size:48px_48px]" style={line(0)} />
      <div className="relative mx-auto w-full max-w-[1248px] px-4 pb-16 pt-14 md:px-6 md:pb-24 md:pt-24">
        {/* 1단계 설계선 */}
        <span aria-hidden className="gp-asm-line-x absolute left-0 right-0 top-10 h-px bg-[#7aa7ff]/50 md:top-16" style={line(0.05)} />
        <span aria-hidden className="gp-asm-line-x absolute bottom-8 left-0 right-0 h-px bg-[#7aa7ff]/50 md:bottom-12" style={line(0.2)} />
        <span aria-hidden className="gp-asm-line-y absolute bottom-0 left-4 top-0 w-px bg-[#7aa7ff]/50 md:left-6" style={line(0.1)} />
        <span aria-hidden className="gp-asm-line-y absolute bottom-0 top-0 hidden w-px bg-[#7aa7ff]/50 lg:left-[52%] lg:block" style={line(0.3)} />

        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
          <div className="lg:pt-6">
            <Part dx="-120px" dy="-40px" rot="-8deg" d={0.6} className="inline-block">
              <p className="rounded-full border border-white/20 px-4 py-1.5 text-[14px] font-bold text-[#c9ced6] md:text-[15px]">웹, 앱 개발과 유지보수</p>
            </Part>
            <Part dx="-220px" dy="60px" rot="6deg" d={0.8} className="mt-6">
              <h1 id="c-hero" className="break-keep text-[40px] font-[800] leading-[1.1] tracking-[-0.055em] md:text-[72px]">
                아이디어를
                <br />
                운영되는 서비스로
              </h1>
            </Part>
            <Part dx="-160px" dy="140px" rot="-4deg" d={1.0} className="mt-6 max-w-[560px]" c="#1d4fb8">
              <p className="break-keep text-[17px] leading-[1.7] text-[#aab2bf] md:text-[19px]">
                홈페이지, 업무 시스템, 앱을 기획부터 오픈, 운영까지 맡습니다. 개발 책임자가 직접 만들고 원본 소스와 인계 문서까지 드립니다.
              </p>
            </Part>
            <div className="mt-9 flex flex-wrap gap-2.5">
              <Part dx="-80px" dy="200px" rot="10deg" d={1.2} c="#ffffff">
                <a href="#apply" data-gtm-cta="classic_hero_contact" className="inline-flex min-h-[54px] items-center rounded-md bg-[#256ef4] px-7 text-[17px] font-bold text-white hover:bg-[#0b50d0]">
                  프로젝트 문의
                </a>
              </Part>
              <Part dx="60px" dy="220px" rot="-12deg" d={1.3}>
                <a href="#portfolio" className="inline-flex min-h-[54px] items-center rounded-md border border-white/30 px-7 text-[17px] font-bold text-white hover:border-white">
                  포트폴리오 보기
                </a>
              </Part>
            </div>
          </div>

          {/* 오른쪽: 브라우저 창이 부품으로 조립된다 */}
          <div aria-hidden className="relative">
            <Part dx="260px" dy="-160px" rot="9deg" d={0.7} c="#1d4fb8" className="rounded-t-[12px] border border-white/15 bg-[#151922]">
              <div className="flex h-10 items-center gap-1.5 px-4">
                <i className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <i className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <i className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                <span className="ml-3 h-5 flex-1 rounded bg-white/10" />
              </div>
            </Part>
            <Part dx="320px" dy="40px" rot="-7deg" d={0.95} className="border-x border-white/15">
              <span className="relative block aspect-[16/9] w-full overflow-hidden bg-[#151922]">
                <Image src={shots[0].img} alt="" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
              </span>
            </Part>
            <div className="gp-asm-fade grid grid-cols-3 gap-px border-x border-b border-white/15 bg-white/15" style={line(1.6)}>
              {shots.slice(1, 4).map((s, i) => (
                <Part key={s.img} dx={`${(i - 1) * 180}px`} dy="260px" rot={`${(i - 1) * -14}deg`} d={1.15 + i * 0.12} c={i === 1 ? "#ffffff" : "#256ef4"} className="bg-[#151922]">
                  <span className="relative block aspect-[4/3] w-full overflow-hidden">
                    <Image src={s.img} alt="" fill sizes="20vw" className="object-cover" />
                  </span>
                </Part>
              ))}
            </div>
            {/* 다 맞물린 뒤 완성 표시 */}
            <p className="gp-asm-fade mt-3 text-right text-[13px] font-bold tracking-[0.15em] text-[#7aa7ff]" style={line(2.1)}>
              BUILD COMPLETE
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
