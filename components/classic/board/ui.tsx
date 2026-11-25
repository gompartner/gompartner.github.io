import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

// 11-26 안쪽 "한 판" 페이지들이 함께 쓰는 틀. 메인(ClassicHome)과 같은 바탕, 같은 머리 모양, 같은 글자를 쓴다.
// 판마다 따로 만들어 한 사이트로 보이지 않던 것을 여기서 하나로 맞춘다(사용자 "각자 유닛으로 만들어 일원화가 안 됨").

export const wrap = "mx-auto w-full max-w-[1248px] px-4 md:px-6";

const css = `
@keyframes bd-in { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
.bd-in { animation: bd-in 0.38s cubic-bezier(0.2, 0.8, 0.3, 1) both; animation-delay: var(--d, 0s); }
@media (prefers-reduced-motion: reduce) { .bd-in { animation: none; } }
.bd-ice { background-image: linear-gradient(112deg, #ffffff 0%, #d5e4ff 30%, #8db4ff 52%, #e8f1ff 74%, #ffffff 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
/* 메인과 같게: 휴대폰 아래에 떠 있는 전화, 카카오톡 상담 바와 그 높이만큼의 바닥글 여백을 뺀다 */
html:has(.gp-home) [aria-label="전화와 카카오톡 상담"] { display: none; }
@media (max-width: 767px) { html:has(.gp-home) footer { padding-bottom: 0; } }
/* 사이트 다크모드가 흰 판과 입력 칸을 어둡게 바꾸지 않게 */
html.gp-dark .cl .gp-home input:not([type=checkbox]):not([type=radio]):not([type=hidden]), html.gp-dark .cl .gp-home textarea:not([hidden]):not([type=x]):not([type=y]) { background-color: #fff; color: #15171c; }
html.gp-dark .cl .gp-home { color-scheme: light; }
`;

/** 판의 바탕과 머리(번호, 영어 이름, 큰 제목, 한 줄). ice는 제목에서 얼음색으로 칠할 앞부분 */
export function BoardShell({ no, en, ice, title, lead, children }: { no: string; en: string; ice: string; title: string; lead: string; children: ReactNode }) {
  return (
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
            <h1 className="break-keep text-[40px] font-[800] leading-[1.1] tracking-[-0.05em] md:text-[68px]">
              <span className="bd-ice">{ice}</span>
              {title}
            </h1>
            <p className="max-w-[420px] break-keep pb-2 text-[16px] leading-[1.7] text-[#aab2bf] md:text-[17px]">{lead}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
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
