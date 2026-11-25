import Link from "next/link";
import { NavLink } from "@/components/classic/NavLink";
import { TabScroll } from "@/components/classic/TabScroll";
import { BackLink } from "./BackLink";

// 안쪽 페이지 공용 조각. 11-26 메인과 안쪽 판(components/classic/board/ui.tsx)에 맞춰 어두운 화면으로 통일했다.
// 색: 바탕 #0b0d12, 면 #121722, 글자 흰색과 #c9ced6, #aab2bf, 강조 #7aa7ff(글자), #256ef4(버튼). 옛 밝은 색 클래스는 app/classic-dark.css가 같은 색으로 바꾼다.
// 제목은 Pretendard 800, 자간을 좁혀 크게.

export const INK = "#15171c";
export const NAVY = "#0f1b3d";
export const BLUE = "#256ef4";

export const wrap = "mx-auto w-full max-w-[1248px] px-4 md:px-6";
export const h2 = "text-[30px] font-[800] leading-[1.25] tracking-[-0.04em] md:text-[44px]";
export const h3 = "text-[22px] font-[800] leading-[1.35] tracking-[-0.03em] md:text-[26px]";
export const more = "inline-flex items-center gap-1 text-[15px] font-bold text-[#5b6370] hover:text-[#15171c]";
export const btnPrimary = "inline-flex h-12 items-center justify-center rounded-md bg-[#256ef4] px-6 text-[16px] font-bold text-white transition-colors hover:bg-[#0b50d0]";
// 판의 선 버튼(더 보기)과 같은 모양. hover:border-white 대신 /90을 쓴다(다크 색표가 border-white를 선 색으로 바꾸기 때문)
export const btnLine = "inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/30 px-7 text-[16px] font-bold text-white transition-colors hover:border-white/90";
export const muted = "text-[#5b6370]";
export const line = "border-[#e6e9ee]";

/** 판 머리와 같은 얼음색 글자(제목 앞부분) */
export const ice = "bg-[linear-gradient(112deg,#ffffff_0%,#d5e4ff_30%,#8db4ff_52%,#e8f1ff_74%,#ffffff_100%)] bg-clip-text text-transparent";
/** 판과 같은 바탕(옅은 격자) */
export const boardBg = "bg-[#0b0d12] bg-[linear-gradient(rgba(122,167,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(122,167,255,.05)_1px,transparent_1px)] bg-[size:48px_48px]";
/** 판 머리의 작은 줄(번호, 선, 영어 이름)과 같은 글자 */
export const eyebrow = "text-[13px] font-bold tracking-[0.18em] text-[#7aa7ff] md:text-[14px]";

/**
 * 안쪽 페이지 머리. 판 머리(BoardShell)와 같은 모양: 작은 줄(위치), 큰 제목(앞부분 얼음색), 한 줄 설명.
 * 작은 줄은 위치 표시를 겸한다: trail의 앞 항목들은 링크, 마지막 항목(지금 페이지)은 제목이 대신하고 그 자리에 영어 이름(en)을 둔다.
 * ice는 얼음색으로 칠할 제목 앞부분(안 주면 첫 낱말, 띄어쓰기가 없으면 제목 전체).
 */
export function PageHead({ title, trail = [], en, lead, ice: icePart }: { title: string; trail?: { href: string; label: string }[]; en?: string; lead?: string; ice?: string }) {
  // 맨 앞은 늘 GOMPARTNER(처음으로). 옛 위치 표시의 첫 항목 "곰파트너"는 같은 말이라 뺀다
  const parents = trail.slice(0, -1).filter((t) => t.label !== "곰파트너");
  const here = trail[trail.length - 1];
  const sp = title.indexOf(" ");
  const head = icePart && title.startsWith(icePart) ? icePart : sp > 0 ? title.slice(0, sp + 1) : title;
  const long = title.length > 12;
  return (
    <section className={`relative text-white ${boardBg}`}>
      {/* 격자는 머리에서 끝나고 본문은 민바탕(긴 글 읽기) */}
      <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-[#0b0d12]" />
      <div className={`${wrap} relative pb-9 pt-10 md:pb-12 md:pt-16`}>
        <nav aria-label="현재 위치">
          <ol className={`flex flex-wrap items-center gap-x-3 gap-y-1 ${eyebrow}`}>
            <li className="flex items-center">
              <Link href="/" className="-my-3 py-3 hover:text-white">
                GOMPARTNER
              </Link>
            </li>
            {parents.map((t, i) => (
              <li key={`${i}-${t.href}`} className="flex items-center gap-3">
                <span aria-hidden className="text-white/30">/</span>
                {/* 11-25 바로 앞 화면이면 뒤로 간다(목록의 검색어, 보던 자리 유지) */}
                <BackLink href={t.href} className="-my-3 py-3 tracking-[0.02em] hover:text-white">
                  {t.label}
                </BackLink>
              </li>
            ))}
            {en ? (
              <li aria-hidden className="flex items-center gap-3">
                <span className="h-px w-10 bg-current" />
                {en}
              </li>
            ) : null}
            {here ? (
              <li className="sr-only">
                <span aria-current="page">{here.label}</span>
              </li>
            ) : null}
          </ol>
        </nav>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <h1 className={`break-keep font-[800] tracking-[-0.05em] ${long ? "max-w-[900px] text-[30px] leading-[1.22] md:text-[46px]" : "text-[40px] leading-[1.1] md:text-[68px]"}`}>
            <span className={ice}>{head}</span>
            {title.slice(head.length)}
          </h1>
          {lead ? <p className="max-w-[420px] break-keep pb-2 text-[16px] leading-[1.7] text-[#aab2bf] md:text-[17px]">{lead}</p> : null}
        </div>
      </div>
    </section>
  );
}

/** 페이지 안 하위 메뉴 탭(같은 메뉴 묶음의 다른 페이지로 이동). */
export function SubTabs({ items, current, level = 2 }: { items: { href: string; label: string }[]; current: string; level?: 2 | 3 }) {
  // 11-25 level 3은 2단 탭 아래 한 단 더(포트폴리오 업종). 작은 글씨
  if (level === 3)
    return (
      <div className="border-b border-white/10 bg-[#0b0d12]">
        <ul data-subtabs className={`${wrap} relative flex gap-5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`} role="list">
          {items.map((i) => (
            <li key={i.href} className="shrink-0">
              <NavLink href={i.href} aria-current={i.href === current ? "page" : undefined} className={`flex min-h-11 items-center text-[15px] ${i.href === current ? "font-bold text-white" : "text-[#aab2bf] hover:text-white"}`}>
                {i.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    );
  return (
    <div className="border-b border-white/10 bg-[#0b0d12]">
      <TabScroll />
      <ul data-subtabs className={`${wrap} relative flex gap-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`} role="list">
        {items.map((i) => (
          <li key={i.href} className="shrink-0">
            <NavLink
              href={i.href}
              aria-current={i.href === current ? "page" : undefined}
              className={`block border-b-2 py-4 text-[16px] font-bold ${i.href === current ? "border-[#7aa7ff] text-white" : "border-transparent text-[#aab2bf] hover:text-white"}`}
            >
              {i.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
