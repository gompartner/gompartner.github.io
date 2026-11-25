import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { TownWindow } from "@/components/classic/TownWindow";
import { BuildGate } from "@/components/classic/BuildGate";

// 11-25 조립형 첫 화면(사용자 "면과 선이 조합되며 완성, 합체 로봇처럼 조립되는 메인"). 시안, ?v=build
// 3차: "단순 스퀘어라 너무 네모네모, 3D까지 조립, 글자도 포함해 쓸 수 있는 수준으로".
// 네모 상자가 통째로 날아오던 것을 버리고 부품 단위를 바꿨다.
//  - 글자: 제목은 글자 하나하나가 떨어져 있다가 자석처럼 끌려와 딱 붙어 낱말이 된다(팔랑거리지 않게, 11-25 밤)
//  - 선: 창틀은 둥근 테두리가 마주 보는 두 모서리에서 자라 만나고, 뒤쪽 큰 원호와 창 안 설계선이 그려진다
//  - 둥근 부품: 꼬리표, 버튼, 서비스 이름표는 알약 모양으로 튀어나오거나 휘어 날아와 창틀에 붙는다
//  - 3D: 설계선 위로 마을이 나타나고 건물이 하나씩 내려앉는다(TownWindow, public/3d/island ?build=1)
// 한 번 조립하면 새로고침 전까지 다시 조립하지 않고(data-built), 다시 보일 때 테두리 반짝과 광택만(data-shine).

// 페이지 안 이동(#apply 등)은 next/link로 건다. 그냥 a 태그로 걸면 주소 기록에 Next가 모르는 칸이 생겨, 다른 페이지에 갔다가 뒤로 왔을 때 주소만 바뀌고 화면이 안 바뀐다
type V = CSSProperties & Record<`--${string}`, string>;

const css = `
@property --gp-a { syntax: "<angle>"; inherits: false; initial-value: 180deg; }
@keyframes gp-char {
  0% { opacity: 0; transform: translate3d(var(--x), var(--y), 0) rotate(var(--r)); animation-timing-function: ease-out; }
  40% { opacity: 1; transform: translate3d(calc(var(--x) * 0.78), calc(var(--y) * 0.78), 0) rotate(calc(var(--r) * 0.7)); animation-timing-function: cubic-bezier(0.85, 0, 1, 0.45); }
  78% { opacity: 1; transform: translate3d(0px, 0px, 0) rotate(0deg); animation-timing-function: ease-out; }
  87% { transform: translate3d(calc(var(--x) * -0.04), calc(var(--y) * -0.04), 0) rotate(0deg); }
  100% { opacity: 1; transform: translate3d(0px, 0px, 0) rotate(0deg); }
}
@keyframes gp-word { from { opacity: 0; transform: translateY(0.7em); } to { opacity: 1; transform: none; } }
@keyframes gp-pill { from { opacity: 0; clip-path: inset(0 50% 0 50% round 999px); } to { opacity: 1; clip-path: inset(0 0 0 0 round 999px); } }
@keyframes gp-pop { 0% { opacity: 0; transform: scale(0.3) rotate(var(--r, -12deg)); } 70% { opacity: 1; transform: scale(1.06) rotate(0deg); } 100% { opacity: 1; transform: none; } }
@keyframes gp-chip {
  0% { opacity: 0; transform: translate(var(--x), var(--y)) rotate(calc(var(--r) * 0.3)) scale(1); animation-timing-function: ease-out; }
  42% { opacity: 1; transform: translate(calc(var(--x) * 0.8), calc(var(--y) * 0.8)) rotate(calc(var(--r) * 0.2)) scale(1); animation-timing-function: cubic-bezier(0.85, 0, 1, 0.45); }
  80% { opacity: 1; transform: translate(0px, 0px) rotate(0deg) scale(1); animation-timing-function: ease-out; }
  88% { transform: translate(calc(var(--x) * -0.03), calc(var(--y) * -0.03)) rotate(0deg) scale(0.97); }
  100% { opacity: 1; transform: translate(0px, 0px) rotate(0deg) scale(1); }
}
@keyframes gp-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
@keyframes gp-sweep { from { --gp-a: 0deg; } to { --gp-a: 180deg; } }
@keyframes gp-body { from { opacity: 0; clip-path: inset(50% 50% 50% 50% round 22px); } to { opacity: 1; clip-path: inset(0 0 0 0 round 22px); } }
@keyframes gp-line { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes gp-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes gp-clunk { 0%, 100% { transform: none; } 35% { transform: translateY(3px); } 65% { transform: translateY(-1px); } }
@keyframes gp-scan { from { transform: translateX(-110%); } to { transform: translateX(220%); } }
@keyframes gp-spark { 0%, 100% { box-shadow: 0 0 0 0 rgba(122, 167, 255, 0), inset 0 0 0 0 rgba(122, 167, 255, 0); } 35% { box-shadow: 0 0 22px 2px rgba(122, 167, 255, 0.7), inset 0 0 14px 0 rgba(122, 167, 255, 0.35); } }

.gp-char { display: inline-block; animation: gp-char 0.55s linear both; animation-delay: var(--d); }
.gp-word { display: inline-block; animation: gp-word 0.35s ease-out both; animation-delay: var(--d); }
.gp-pill { animation: gp-pill 0.4s cubic-bezier(0.6, 0, 0.2, 1) both; animation-delay: var(--d); }
.gp-pop { animation: gp-pop 0.42s cubic-bezier(0.2, 0.8, 0.3, 1) both; animation-delay: var(--d); }
.gp-chip { animation: gp-chip 0.6s linear both; animation-delay: var(--d); }
.gp-draw { stroke-dasharray: 1; animation: gp-draw 0.6s ease-in-out both; animation-delay: var(--d); }
.gp-line { transform-origin: left; animation: gp-line 0.4s cubic-bezier(0.6, 0, 0.2, 1) both; animation-delay: var(--d); }
.gp-fade { animation: gp-fade 0.4s ease-out both; animation-delay: var(--d); }
/* 창 몸통: 틀이 먼저 깔려 있지 않게 가운데 점에서 펼쳐진다 */
.gp-body { animation: gp-body 0.5s cubic-bezier(0.6, 0, 0.2, 1) both; animation-delay: var(--d); }
.gp-clunk { animation: gp-clunk 0.26s ease-out 1.15s both; }
/* 창틀: 둥근 테두리를 원뿔 마스크로 가려 두 모서리에서 자라게 한다 */
.gp-frame {
  --gp-a: 180deg;
  -webkit-mask: conic-gradient(from 225deg, #000 0 var(--gp-a), transparent var(--gp-a) 180deg, #000 180deg calc(180deg + var(--gp-a)), transparent calc(180deg + var(--gp-a)) 360deg);
  mask: conic-gradient(from 225deg, #000 0 var(--gp-a), transparent var(--gp-a) 180deg, #000 180deg calc(180deg + var(--gp-a)), transparent calc(180deg + var(--gp-a)) 360deg);
  animation: gp-sweep 0.6s cubic-bezier(0.6, 0, 0.2, 1) both; animation-delay: var(--d);
}
.gp-frame::before { content: ""; position: absolute; inset: 0; border-radius: inherit; border: 1.5px solid #7aa7ff; }
.gp-scan { transform: translateX(220%); animation: gp-scan 0.7s ease-in-out both; animation-delay: var(--d); }

/* 창이 화면에 들어오기 전에는 창 쪽 조립을 멈춰 둔다(휴대폰에서는 창이 아래에 있다) */
[data-win]:not([data-win-on]) :is(.gp-body, .gp-frame, .gp-pop, .gp-pill, .gp-chip, .gp-draw, .gp-fade, .gp-scan) { animation-play-state: paused; }
/* 이미 조립했으면(새로고침 전) 조립 없이 완성된 화면 */
[data-built] :is(.gp-body, .gp-char, .gp-word, .gp-pill, .gp-pop, .gp-chip, .gp-draw, .gp-line, .gp-fade, .gp-clunk, .gp-frame, .gp-scan) { animation: none; }
/* 다시 보일 때: 창틀이 반짝이고 광택이 한 번 훑는다 */
[data-shine] .gp-frame::before { animation: gp-spark 1s ease-out both; }
[data-built][data-shine] .gp-scan, [data-shine] .gp-scan { animation: gp-scan 0.7s ease-in-out 0.1s both; }
@media (prefers-reduced-motion: reduce) {
  :is(.gp-body, .gp-char, .gp-word, .gp-pill, .gp-pop, .gp-chip, .gp-draw, .gp-line, .gp-fade, .gp-clunk, .gp-frame, .gp-scan) { animation: none !important; }
  [data-shine] .gp-frame::before { animation: none; }
}
`;

const at = (d: number): V => ({ "--d": `${d.toFixed(3)}s` });

// 11-25 밤 문구: 컨셉 문장 대신 맡길 이유가 보이게(사용자 "일을 맡기고 싶다는 부분이 약함, 강점이라고 써 놓은 문구가 약점").
// 사람 수나 사업자 형태처럼 작아 보이는 말은 쓰지 않고, 사이트에 이미 약속해 둔 숫자(기간, 금액, 회신 시간)와 납품물로 말한다
const lines = ["제작부터 운영까지", "한 곳에서 끝냅니다"];
const sub = "홈페이지는 29.9만 원부터, 6일이면 완성합니다. 수정 요청은 건별 10,000원부터, 영업일 24시간 안에 원인과 금액을 회신합니다.";
const trust = ["점검 결과표 납품", "원본 소스와 계정 인계", "무상 하자보수"];
// 창틀에 붙는 서비스 이름표. 휘어 날아오는 출발점(x, y)과 기울기
const chips = [
  { name: "홈페이지", pos: "right-[26%] -top-4", x: "140px", y: "-180px", r: "30deg" },
  { name: "앱", pos: "right-[8%] -top-4", x: "260px", y: "-90px", r: "-40deg" },
  { name: "업무 시스템", pos: "left-[6%] -bottom-4", x: "-240px", y: "120px", r: "-28deg" },
  { name: "유지보수", pos: "left-[36%] -bottom-4", x: "-60px", y: "220px", r: "36deg" },
];

/** 글자마다 떨어져 있는 출발 자리. 황금각으로 돌려 사방에 두되 가깝게(자석처럼 끌려와 붙는다). 서버와 브라우저가 같은 값 */
function scatter(i: number): V {
  const a = (i * 137.5 * Math.PI) / 180;
  const rad = 70 + (i % 4) * 34;
  return {
    "--x": `${Math.round(Math.cos(a) * rad)}px`,
    "--y": `${Math.round(Math.sin(a) * rad * 0.8)}px`,
    "--r": `${((i * 53) % 36) - 18}deg`,
    "--d": `${(0.3 + i * 0.03).toFixed(3)}s`,
  };
}

// 제목 글자에 차례 번호를 미리 매긴다
const title = (() => {
  let n = 0;
  return lines.map((line) => line.split(" ").map((word) => [...word].map((ch) => ({ ch, i: n++ }))));
})();

export function HeroBuild() {
  return (
    <BuildGate>
      {/* overflow-clip: hidden이면 날아오는 부품 때문에 구역 안쪽이 스크롤되어 화면이 잠깐 밀린다 */}
      <section aria-labelledby="c-hero" className="relative isolate overflow-clip bg-[#0b0d12] text-white">
        <style>{css}</style>
        {/* 바탕: 모눈과 큰 원호 */}
        <div aria-hidden className="gp-fade absolute inset-0 -z-10 bg-[linear-gradient(rgba(122,167,255,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(122,167,255,.06)_1px,transparent_1px)] bg-[size:48px_48px]" style={at(0)} />
        <svg aria-hidden viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 -z-10 h-full w-full" fill="none" strokeLinecap="round">
          <circle className="gp-draw" pathLength={1} cx="900" cy="350" r="330" stroke="rgba(122,167,255,.2)" strokeWidth="1" style={at(0.05)} />
          <circle className="gp-draw" pathLength={1} cx="900" cy="350" r="470" stroke="rgba(122,167,255,.12)" strokeWidth="1" style={at(0.2)} />
          <path className="gp-draw" pathLength={1} d="M40 640 L560 120" stroke="rgba(122,167,255,.14)" strokeWidth="1" style={at(0.15)} />
          <path className="gp-draw" pathLength={1} d="M0 520 C 260 420, 420 560, 640 660" stroke="rgba(122,167,255,.12)" strokeWidth="1" style={at(0.3)} />
        </svg>

        {/* 휴대폰, 태블릿(한 줄 배치)에서는 제목 바로 아래에 3D 창을 둔다. 설명과 버튼 아래에 있으면 첫 화면에 안 보여 스크롤하다 지나쳤다(11-25 사용자).
            왼쪽 묶음을 contents로 풀어 order로 순서만 바꾸고, 넓은 화면(lg)에서는 원래대로 왼쪽 글, 오른쪽 창 */}
        <div className="gp-clunk mx-auto grid w-full max-w-[1248px] items-center px-4 pb-20 pt-8 md:px-6 md:pb-28 md:pt-16 lg:grid-cols-[1fr_1.05fr] lg:gap-12 lg:pt-20">
          <div className="contents lg:block">
            <p className="gp-pill order-1 inline-flex items-center gap-2 justify-self-start rounded-full border border-white/20 bg-white/[0.04] px-4 py-1.5 text-[14px] font-bold text-[#c9ced6] md:text-[15px]" style={at(0.2)}>
              <i aria-hidden className="h-2 w-2 rounded-full bg-[#7aa7ff]" />
              홈페이지, 업무 시스템, 앱 개발
            </p>
            {/* 제목: 글자가 흩어져 있다가 모인다 */}
            <h1 id="c-hero" aria-label={lines.join(" ")} className="order-2 mt-6 text-[40px] font-[800] leading-[1.12] tracking-[-0.055em] md:text-[68px] xl:text-[76px]">
              {title.map((words, li) => (
                <span key={li} aria-hidden className="block">
                  {words.map((chars, wi) => (
                    <span key={wi} className="inline-block whitespace-nowrap">
                      {wi > 0 && <span className="inline-block w-[0.22em]" />}
                      {chars.map(({ ch, i }) => (
                        <span key={i} className="gp-char" style={scatter(i)}>
                          {ch}
                        </span>
                      ))}
                    </span>
                  ))}
                </span>
              ))}
            </h1>
            <span aria-hidden className="gp-line order-3 mt-5 block h-1.5 w-24 rounded-full bg-[#256ef4] md:w-32" style={at(0.75)} />
            <p className="order-5 mt-9 max-w-[540px] break-keep text-[17px] leading-[1.7] text-[#aab2bf] md:text-[19px] lg:mt-6">
              {sub.split(" ").map((w, i) => (
                <span key={i}>
                  <span className="gp-word" style={at(0.7 + i * 0.015)}>
                    {w}
                  </span>{" "}
                </span>
              ))}
            </p>
            <div className="order-6 mt-9 flex flex-wrap gap-3">
              <Link href="#apply" data-gtm-cta="classic_hero_contact" className="gp-pop inline-flex min-h-[56px] items-center gap-3 rounded-full bg-[#256ef4] py-2 pl-7 pr-2.5 text-[17px] font-bold text-white hover:bg-[#0b50d0]" style={{ ...at(0.9), "--r": "-14deg" } as V}>
                무료 견적 받기
                <span aria-hidden className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#0b0d12]">
                  <ArrowUpRight size={20} />
                </span>
              </Link>
              <Link href="#portfolio" className="gp-pop inline-flex min-h-[56px] items-center rounded-full border border-white/30 px-7 text-[17px] font-bold text-white hover:border-white" style={{ ...at(0.98), "--r": "12deg" } as V}>
                포트폴리오 보기
              </Link>
            </div>
            <ul className="order-7 mt-8 flex flex-wrap gap-x-6 gap-y-2.5" role="list">
              {trust.map((t, i) => (
                <li key={t} className="gp-pop flex items-center gap-2 text-[15px] font-bold text-[#c9ced6] md:text-[16px]" style={{ ...at(1.05 + i * 0.06), "--r": "0deg" } as V}>
                  <span aria-hidden className="grid h-5 w-5 place-items-center rounded-full bg-[#7aa7ff]/20 text-[#7aa7ff]">
                    <Check size={13} strokeWidth={3} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* 오른쪽 창: 둥근 창틀이 두 모서리에서 자라 만나고, 안에서 3D 마을이 조립된다 */}
          <div data-win className="relative order-4 mt-9 lg:order-none lg:mt-0">
            <span aria-hidden className="gp-frame pointer-events-none absolute -inset-px z-20 rounded-[22px]" style={at(0.05)} />
            <div className="gp-body relative overflow-hidden rounded-[22px] bg-[#10141d]" style={at(0.1)}>
              <div aria-hidden className="flex h-11 items-center gap-2 border-b border-white/10 px-4">
                {["#ff5f57", "#febc2e", "#28c840"].map((c, i) => (
                  <i key={c} className="gp-pop h-3 w-3 rounded-full" style={{ background: c, ...at(0.3 + i * 0.06), "--r": "0deg" } as V} />
                ))}
                <span className="gp-pill ml-3 flex h-6 flex-1 items-center rounded-full bg-white/[0.08] px-3 text-[12px] tracking-[0.02em] text-[#8a94a6]" style={at(0.45)}>
                  gompartner.co.kr
                </span>
              </div>
              <TownWindow />
              <span aria-hidden className="gp-scan pointer-events-none absolute inset-y-0 left-0 z-10 w-1/2 bg-[linear-gradient(100deg,transparent,rgba(160,195,255,.28),transparent)]" style={at(1.35)} />
            </div>
            <ul aria-label="만드는 것" className="pointer-events-none absolute inset-0 z-30" role="list">
              {chips.map((c, i) => (
                <li key={c.name} className={`gp-chip absolute ${c.pos} rounded-full border border-[#7aa7ff]/60 bg-[#0b0d12] px-3.5 py-1.5 text-[13px] font-bold text-white shadow-[0_4px_14px_rgba(0,0,0,.4)] md:text-[14px]`} style={{ ...at(0.85 + i * 0.07), "--x": c.x, "--y": c.y, "--r": c.r } as V}>
                  {c.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </BuildGate>
  );
}
