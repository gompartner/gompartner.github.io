import Link from "next/link";
import { ChevronRight } from "lucide-react";

// 11-07 무료 이어받기 3곳(사용자 승인, 아임웹 강의의 "퍼주기"를 이어받기로 바꾼 시험). 11-22에 결과로 판단.
// 남은 자리는 신청을 받아 수락할 때마다 직접 줄인다. 0이 되면 띠를 내린다.
// 주소 칸은 상담 신청서로 가고, 신청서가 ?site=&promo=takeover 를 읽어 문의 내용을 미리 채운다.
export const TAKEOVER_FREE_LEFT = 3;

export function TakeoverFreePromo({ id = "takeover-free" }: { id?: string }) {
  if (TAKEOVER_FREE_LEFT <= 0) return null;
  return (
    <section aria-labelledby={id} className="border-t border-white/10 bg-[#0f1b3d] text-white">
      <div className="mx-auto grid w-full max-w-[1248px] gap-6 px-4 py-8 md:px-6 md:py-10 lg:grid-cols-[1fr_480px] lg:items-center lg:gap-12">
        <div>
          <p className="text-[14px] font-bold text-[#9fc0ff]">남은 자리 {TAKEOVER_FREE_LEFT}곳</p>
          <h2 id={id} className="mt-1 text-[24px] font-[800] leading-[1.3] tracking-[-0.04em] md:text-[30px]">
            유지보수 업체 변경 무료 지원
          </h2>
          <ul className="mt-3 flex flex-col gap-1 text-[16px] text-white md:flex-row md:flex-wrap md:gap-x-6" role="list">
            <li>인수 점검 보고서와 인계 문서</li>
            <li>첫 달 월 유지보수</li>
            <li>작업 후기와 사례 공개에 동의하는 곳</li>
          </ul>
        </div>
        <div>
          <form action="/contact" method="get" className="flex overflow-hidden rounded-md bg-white">
            <input type="hidden" name="promo" value="takeover" />
            <label htmlFor={`${id}-site`} className="sr-only">
              홈페이지 주소
            </label>
            <input
              id={`${id}-site`}
              name="site"
              type="text"
              inputMode="url"
              autoComplete="url"
              placeholder="홈페이지 주소"
              className="min-w-0 flex-1 px-4 text-[16px] text-[#15171c] outline-none placeholder:text-[#8a94a6]"
            />
            <button type="submit" data-gtm-cta="takeover_free_apply" className="h-12 shrink-0 bg-[#256ef4] px-5 text-[16px] font-bold text-white transition-colors hover:bg-[#1b5bd1]">
              무료 지원 신청
            </button>
          </form>
          <Link href="/notice/takeover-free-2026-11" className="mt-3 inline-flex min-h-11 items-center gap-1 text-[14px] font-bold text-white underline-offset-4 hover:underline">
            지원 안내 <ChevronRight size={15} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
