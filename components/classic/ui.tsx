import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

// 클래식 보기 공용 조각. 색은 흰 바탕 + 남색 배너 + 곰파트너 파랑 하나.
// 제목은 Pretendard 800, 자간을 좁혀 크게. 제목 밑 설명 문단은 두지 않는다.

export const INK = "#15171c";
export const NAVY = "#0f1b3d";
export const BLUE = "#256ef4";

export const wrap = "mx-auto w-full max-w-[1248px] px-4 md:px-6";
export const h2 = "text-[30px] font-[800] leading-[1.25] tracking-[-0.04em] md:text-[44px]";
export const h3 = "text-[22px] font-[800] leading-[1.35] tracking-[-0.03em] md:text-[26px]";
export const more = "inline-flex items-center gap-1 text-[15px] font-bold text-[#5b6370] hover:text-[#15171c]";
export const btnPrimary = "inline-flex h-12 items-center justify-center rounded-md bg-[#256ef4] px-6 text-[16px] font-bold text-white transition-colors hover:bg-[#0b50d0]";
export const btnLine = "inline-flex h-12 items-center justify-center rounded-md border border-[#c9cfd8] bg-white px-6 text-[16px] font-bold text-[#15171c] transition-colors hover:border-[#15171c]";
export const muted = "text-[#5b6370]";
export const line = "border-[#e6e9ee]";

/** 서브 페이지 머리 배너: 남색 띠 위에 위치 표시와 큰 제목. 회사 홈페이지의 서브 비주얼 자리. */
export function PageHead({ title, trail = [] }: { title: string; trail?: { href: string; label: string }[] }) {
  return (
    <section className="text-white" style={{ backgroundColor: NAVY }}>
      <div className={`${wrap} pb-12 pt-10 md:pb-16 md:pt-14`}>
        <nav aria-label="현재 위치">
          <ol className="flex flex-wrap items-center gap-1.5 text-[14px] text-[#aebbd6]">
            <li>
              <Link href="/" aria-label="처음" className="inline-flex hover:text-white">
                <Home size={15} aria-hidden />
              </Link>
            </li>
            {trail.map((t, i) => (
              <li key={`${i}-${t.href}`} className="inline-flex items-center gap-1.5">
                <ChevronRight size={14} aria-hidden />
                <Link href={t.href} className="hover:text-white">
                  {t.label}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
        <h1 className="mt-5 text-[40px] font-[800] leading-[1.1] tracking-[-0.05em] md:text-[64px]">{title}</h1>
      </div>
    </section>
  );
}

/** 페이지 안 하위 메뉴 탭(같은 메뉴 묶음의 다른 페이지로 이동). */
export function SubTabs({ items, current }: { items: { href: string; label: string }[]; current: string }) {
  return (
    <div className={`border-b ${line} bg-white`}>
      <ul className={`${wrap} flex gap-6 overflow-x-auto`} role="list">
        {items.map((i) => (
          <li key={i.href} className="shrink-0">
            <Link
              href={i.href}
              aria-current={i.href === current ? "page" : undefined}
              className={`block border-b-2 py-4 text-[16px] font-bold ${i.href === current ? "border-[#256ef4] text-[#256ef4]" : "border-transparent text-[#3d4450] hover:text-[#15171c]"}`}
            >
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
