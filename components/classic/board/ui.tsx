import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { BoardGate } from "@/components/classic/board/BoardGate";
import { assembleCss } from "@/components/classic/board/assembleCss";
import { longShotCss } from "@/components/classic/board/longShotCss";

// 11-26 안쪽 "한 판" 페이지들이 함께 쓰는 틀. 메인(ClassicHome)과 같은 바탕, 같은 머리 모양, 같은 글자를 쓴다.
// 판마다 따로 만들어 한 사이트로 보이지 않던 것을 여기서 하나로 맞춘다(사용자 "각자 유닛으로 만들어 일원화가 안 됨").

export const wrap = "mx-auto w-full max-w-[1248px] px-4 md:px-6";

// 메인의 컨셉은 "조립"이다(사용자: 면과 선이 조합되면서 완성되는, 합체 로봇처럼 조립되는 화면). 안쪽 판도 같은 방식으로 조립된다.
//  - 큰 제목: 빛줄기가 그어지고 그 사이 면(비스듬한 조각)이 차오르며 글자가 된다(메인 HeroBuild와 같은 방식, 더 짧게)
//  - 부품(.bd-in): 그 자리에서 선이 그어지고 면이 차오른다(assembleCss). 날아오거나 끌려오지 않는다
//  - 새로고침 전까지 판마다 한 번만(BoardGate가 data-built를 붙인다). 움직임 줄이기 설정이면 처음부터 완성된 화면
const css = `${assembleCss}${longShotCss}
/* 팝업(크게 보기, 필터)이 열려 있는 동안 뒤 페이지는 스크롤되지 않는다(11-26 사용자 "뒤쪽이 스크롤되는 버그"). 그 규칙들은 어느 페이지에서나 쓰게 머리글(ClassicHeader)에 있다 */
@keyframes bd-ray { 0% { opacity: 1; stroke-dashoffset: 1; } 34% { opacity: 1; stroke-dashoffset: 0; } 78% { opacity: 1; stroke-dashoffset: 0; } 100% { opacity: 0; stroke-dashoffset: 0; } }
@keyframes bd-shard { 0% { opacity: 0; transform: translate(var(--sx), var(--sy)); filter: brightness(2.6); } 55% { opacity: 1; transform: none; filter: brightness(2.2); } 100% { opacity: 1; transform: none; filter: brightness(1); } }
.bd-ray { opacity: 0; stroke-dasharray: 1; animation: bd-ray 1.2s cubic-bezier(0.6, 0, 0.2, 1) both; animation-delay: var(--d, 0s); }
.bd-shard { animation: bd-shard 0.5s cubic-bezier(0.2, 0.8, 0.3, 1) both; animation-delay: var(--d, 0s); }
[data-built] :is(.bd-ray, .bd-shard) { animation: none; }
@media (prefers-reduced-motion: reduce) { .bd-ray, .bd-shard { animation: none; } }
.bd-ice { background-image: linear-gradient(112deg, #ffffff 0%, #d5e4ff 30%, #8db4ff 52%, #e8f1ff 74%, #ffffff 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
/* 메인과 같게: 휴대폰 아래에 떠 있는 전화, 카카오톡 상담 바와 그 높이만큼의 바닥글 여백을 뺀다 */
html:has(.gp-home) [aria-label="전화와 카카오톡 상담"] { display: none; }
@media (max-width: 767px) { html:has(.gp-home) footer { padding-bottom: 0; } }
/* 사이트 다크모드가 흰 판과 입력 칸을 어둡게 바꾸지 않게 */
html.gp-dark .cl .gp-home input:not([type=checkbox]):not([type=radio]):not([type=hidden]), html.gp-dark .cl .gp-home textarea:not([hidden]):not([type=x]):not([type=y]) { background-color: #fff; color: #15171c; }
html.gp-dark .cl .gp-home { color-scheme: light; }
`;

// 제목을 나누는 면(비스듬한 조각 넷)과 그 경계를 따라 긋는 빛줄기
const CUT = [26, 52, 78];
const SLANT = 14;
const SHARDS = [-30, ...CUT].map((x0, i, arr) => {
  const x1 = i === arr.length - 1 ? 140 : arr[i + 1];
  return `polygon(${x0}% 0%, ${x1}% 0%, ${x1 - SLANT}% 100%, ${x0 - SLANT}% 100%)`;
});
const ORDER = [1, 2, 0, 3];

/** 판의 바탕과 머리(번호, 영어 이름, 큰 제목, 한 줄). ice는 제목에서 얼음색으로 칠할 앞부분 */
export function BoardShell({ no, en, ice, title, lead, children }: { no: string; en: string; ice: string; title: string; lead: string; children: ReactNode }) {
  return (
    <BoardGate>
    <div className="keep-light gp-home">
      <style>{css}</style>
      <div className="bg-[#0b0d12] bg-[linear-gradient(rgba(122,167,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(122,167,255,.05)_1px,transparent_1px)] bg-[size:48px_48px] text-white">
        <div className={`${wrap} pb-20 pt-10 md:pb-28 md:pt-16`}>
          <p className="flex items-center gap-3 text-[13px] font-bold tracking-[0.18em] text-[#7aa7ff] md:text-[14px]">
            <span>{no}</span>
            <span aria-hidden className="h-px w-10 bg-current" />
            {en}
          </p>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
            <h1 className="relative break-keep text-[40px] font-[800] leading-[1.1] tracking-[-0.05em] md:text-[68px]">
              {/* 보이는 글자는 면 네 장으로 나눠 조립한다 */}
              {/* opacity-0: 자리와 읽는 글자를 맡는다(visibility로 숨기면 화면 읽기 프로그램에서 제목이 비어 버린다) */}
              <span className="opacity-0">
                {ice}
                {title}
              </span>
              {SHARDS.map((clip, i) => (
                <span key={i} aria-hidden className="bd-shard absolute inset-0" style={{ clipPath: clip, "--d": `${0.3 + ORDER.indexOf(i) * 0.09}s`, "--sx": `${i % 2 ? 14 : -14}px`, "--sy": `${i % 2 ? -34 : 34}px` } as CSSProperties}>
                  <span className="bd-ice">{ice}</span>
                  {title}
                </span>
              ))}
              <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute -inset-y-[45%] inset-x-0 h-[190%] w-full overflow-visible" fill="none" stroke="#fff" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 4px rgba(160,195,255,.9))" }}>
                {CUT.map((x, i) => (
                  <path key={x} className="bd-ray" pathLength={1} vectorEffect="non-scaling-stroke" strokeWidth="1.2" d={`M${(x + SLANT * 0.45).toFixed(1)} 0 L${(x - SLANT * 1.45).toFixed(1)} 100`} style={{ "--d": `${0.05 + i * 0.08}s` } as CSSProperties} />
                ))}
                <path className="bd-ray" pathLength={1} vectorEffect="non-scaling-stroke" strokeWidth="1" d="M-8 80 L108 26" style={{ "--d": "0.18s" } as CSSProperties} />
              </svg>
            </h1>
            <p className="max-w-[420px] break-keep pb-2 text-[16px] leading-[1.7] text-[#aab2bf] md:text-[17px]">{lead}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
    </BoardGate>
  );
}

/** 판 맨 아래 한 줄과 문의로 가는 링크 하나 */
export function BoardClose({ text, href = "/#apply", label = "Contact" }: { text: string; href?: string; label?: string }) {
  return (
    <div className="mt-16 flex flex-col gap-5 border-t border-white/12 pt-10 md:mt-24 md:flex-row md:items-center md:justify-between">
      <p className="break-keep text-[22px] font-[800] leading-[1.35] tracking-[-0.04em] md:text-[30px]">{text}</p>
      <Link href={href} className="inline-flex min-h-[52px] shrink-0 items-center gap-2 self-start rounded-full bg-white px-6 text-[16px] font-bold text-[#0b0d12] hover:bg-[#dfe9ff]">
        {label} <ArrowUpRight size={18} aria-hidden />
      </Link>
    </div>
  );
}
