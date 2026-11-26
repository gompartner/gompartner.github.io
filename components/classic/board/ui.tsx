import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { BoardGate } from "@/components/classic/board/BoardGate";
import { longShotCss } from "@/components/classic/board/longShotCss";
import { cssMin } from "@/lib/cssMin";

// 11-26 안쪽 "한 판" 페이지들이 함께 쓰는 틀. 메인(ClassicHome)과 같은 바탕, 같은 머리 모양, 같은 글자를 쓴다.
// 판마다 따로 만들어 한 사이트로 보이지 않던 것을 여기서 하나로 맞춘다(사용자 "각자 유닛으로 만들어 일원화가 안 됨").

export const wrap = "mx-auto w-full max-w-[1248px] px-4 md:px-6";

// 메인의 컨셉은 "조립"이다(사용자: 면과 선이 조합되면서 완성되는, 합체 로봇처럼 조립되는 화면). 안쪽 판도 같은 방식으로 조립된다.
//  - 큰 제목: 빛줄기가 그어지고 그 사이 면(비스듬한 조각)이 차오르며 글자가 된다(메인 HeroBuild와 같은 방식, 더 짧게)
//  - 카드, 표, 그림은 조립하지 않는다(11-26 사용자 "효과는 메인에만, 서브는 타이틀만. 누를 때마다 나와서 불편")
//  - 새로고침 전까지 판마다 한 번만(BoardGate가 data-built를 붙인다). 움직임 줄이기 설정이면 처음부터 완성된 화면
// 아래 스타일 설명(11-26 점검: 스타일 문자열 안의 주석은 공개 파일에 그대로 실려서 밖으로 뺐다)
// 팝업(크게 보기, 필터)이 열려 있는 동안 뒤 페이지는 스크롤되지 않는다(11-26 사용자 "뒤쪽이 스크롤되는 버그"). 그 규칙들은 어느 페이지에서나 쓰게 머리글(ClassicHeader)에 있다
// 조립이 끝나면(1.2초) 면 조각은 사라지고 실제 제목 글자가 그 자리에 보인다. 연출이 없을 때(이미 본 판, 움직임 줄이기)는 처음부터 실제 글자만
// 메인과 같게: 휴대폰 아래에 떠 있는 전화, 카카오톡 상담 바와 그 높이만큼의 바닥글 여백을 뺀다
// 사이트 다크모드가 흰 판과 입력 칸을 어둡게 바꾸지 않게
const css = `${longShotCss}
@keyframes bd-ray { 0% { opacity: 1; stroke-dashoffset: 1; } 34% { opacity: 1; stroke-dashoffset: 0; } 78% { opacity: 1; stroke-dashoffset: 0; } 100% { opacity: 0; stroke-dashoffset: 0; } }
@keyframes bd-shard { 0% { visibility: visible; opacity: 0; transform: translate(var(--sx), var(--sy)); filter: brightness(2.6); } 55% { visibility: visible; opacity: 1; transform: none; filter: brightness(2.2); } 100% { visibility: visible; opacity: 1; transform: none; filter: brightness(1); } }
@keyframes bd-gone { to { visibility: hidden; } }
@keyframes bd-real { from { opacity: 0; } to { opacity: 1; } }
.bd-ray { opacity: 0; stroke-dasharray: 1; animation: bd-ray 1.2s cubic-bezier(0.6, 0, 0.2, 1) both; animation-delay: var(--d, 0s); }
.bd-shard { visibility: hidden; animation: bd-shard 0.5s cubic-bezier(0.2, 0.8, 0.3, 1) var(--d, 0s) both, bd-gone 0.01s linear 1.2s forwards; }
.bd-real { animation: bd-real 0.01s linear 1.2s both; }
.bd-gen::before { content: attr(data-t); }
[data-built] :is(.bd-ray, .bd-shard, .bd-real) { animation: none; }
@media (prefers-reduced-motion: reduce) { .bd-ray, .bd-shard, .bd-real { animation: none; } }
.bd-ice { background-image: linear-gradient(112deg, #ffffff 0%, #d5e4ff 30%, #8db4ff 52%, #e8f1ff 74%, #ffffff 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
html:has(.gp-home) [aria-label="전화와 카카오톡 상담"] { display: none; }
@media (max-width: 767px) { html:has(.gp-home) footer { padding-bottom: 0; } }
html.gp-dark .cl .gp-home input:not([type=checkbox]):not([type=radio]):not([type=hidden]):not(.on-dark):not(.use-dark *), html.gp-dark .cl .gp-home textarea:not([hidden]):not([type=x]):not([type=y]):not(.use-dark *) { background-color: #fff; color: #15171c; }
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

/**
 * 판의 바탕과 머리(번호, 영어 이름, 큰 제목, 한 줄). ice는 제목에서 얼음색으로 칠할 앞부분.
 * kw는 작은 줄의 영어 이름 옆에 두는 검색어(예: 홈페이지 제작). 주면 h1의 앞부분이 된다.
 * 11-26 검색 점검: 조립 연출의 면 조각마다 제목 글자를 다시 적어 h1 글자가 다섯 번 겹쳐 읽혔다.
 * 지금은 실제 글자는 한 번만 두고, 번호와 영어 이름, 면 조각의 글자는 CSS 그림 글자(::before, data-t)로 그린다(문서 글자에 섞이지 않는다).
 */
export function BoardShell({ no, en, ice, title, lead, kw, children }: { no: string; en: string; ice: string; title: string; lead: string; kw?: string; children: ReactNode }) {
  return (
    <BoardGate>
    <div className="keep-light gp-home">
      <style>{cssMin(css)}</style>
      <div className="bg-[#0b0d12] bg-[linear-gradient(rgba(122,167,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(122,167,255,.05)_1px,transparent_1px)] bg-[size:48px_48px] text-white">
        <div className={`${wrap} pb-20 pt-10 md:pb-28 md:pt-16`}>
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
            <h1 className="min-w-0">
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] font-bold tracking-[0.18em] text-[#7aa7ff] md:text-[14px]">
                <span aria-hidden className="bd-gen" data-t={no} />
                <span aria-hidden className="h-px w-10 bg-current" />
                <span aria-hidden className="bd-gen" data-t={en} />
                {kw ? (
                  <>
                    <span aria-hidden className="h-3 w-px bg-white/25" />
                    <span className="tracking-[-0.01em] text-[#c9ced6]">{kw}</span>
                  </>
                ) : null}
              </span>{" "}
              <span className="relative mt-4 block break-keep text-[40px] font-[800] leading-[1.1] tracking-[-0.05em] md:text-[68px]">
                {/* 실제 제목 글자(한 번만). 조립이 끝나면 보인다 */}
                <span className="bd-real">
                  <span className="bd-ice">{ice}</span>
                  {title}
                </span>
                {/* 보이는 글자는 면 네 장으로 나눠 조립한다. 면의 글자는 그림 글자라 문서와 화면 읽기에 들어가지 않는다 */}
                {SHARDS.map((clip, i) => (
                  <span key={i} aria-hidden className="bd-shard absolute inset-0" style={{ clipPath: clip, "--d": `${0.3 + ORDER.indexOf(i) * 0.09}s`, "--sx": `${i % 2 ? 14 : -14}px`, "--sy": `${i % 2 ? -34 : 34}px` } as CSSProperties}>
                    <span className="bd-ice bd-gen" data-t={ice} />
                    <span className="bd-gen" data-t={title} />
                  </span>
                ))}
                <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute -inset-y-[45%] inset-x-0 h-[190%] w-full overflow-visible" fill="none" stroke="#fff" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 4px rgba(160,195,255,.9))" }}>
                  {CUT.map((x, i) => (
                    <path key={x} className="bd-ray" pathLength={1} vectorEffect="non-scaling-stroke" strokeWidth="1.2" d={`M${(x + SLANT * 0.45).toFixed(1)} 0 L${(x - SLANT * 1.45).toFixed(1)} 100`} style={{ "--d": `${0.05 + i * 0.08}s` } as CSSProperties} />
                  ))}
                  <path className="bd-ray" pathLength={1} vectorEffect="non-scaling-stroke" strokeWidth="1" d="M-8 80 L108 26" style={{ "--d": "0.18s" } as CSSProperties} />
                </svg>
              </span>
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
