import Link from "next/link";
import { ChevronRight } from "lucide-react";

// 11-23 무료 이어받기(11-08~22) 수락 0곳이라 11-07에 정한 대로 무료 범위를 원페이지 제작 1건으로 바꿈(사용자 승인 11-23).
// 남은 자리는 수락하면 0으로 바꾼다. 0이거나 마감일이 지나면 띠를 내린다.
// 업종 칸은 상담 신청서로 가고, 신청서가 ?site=&promo=onepage 를 읽어 문의 내용을 미리 채운다.
export const ONEPAGE_FREE_LEFT = 1;
export const ONEPAGE_FREE_END = "2026-12-06";
export const ONEPAGE_FREE_PERIOD_LABEL = "11월 23일부터 12월 6일까지";
const ended = () => new Date() > new Date(`${ONEPAGE_FREE_END}T23:59:59+09:00`);

export function OnepageFreePromo({ id = "onepage-free" }: { id?: string }) {
  if (ONEPAGE_FREE_LEFT <= 0 || ended()) return null;
  return (
    <section aria-labelledby={id} className="bg-[#f1f4f9] text-[#15171c]">
      <div className="mx-auto grid w-full max-w-[1248px] grid-cols-1 gap-6 px-4 py-8 md:px-6 md:py-10 lg:grid-cols-[1fr_480px] lg:items-center lg:gap-12">
        <div>
          <p className="text-[14px] font-bold text-[#1d5fd6]">{ONEPAGE_FREE_PERIOD_LABEL}, 남은 자리 {ONEPAGE_FREE_LEFT}곳</p>
          <h2 id={id} className="mt-1 text-[24px] font-[800] leading-[1.3] tracking-[-0.04em] md:text-[30px]">
            원페이지 홈페이지 무료 제작
          </h2>
          <ul className="mt-3 flex flex-col gap-1 text-[16px] text-[#3b4250] md:flex-row md:flex-wrap md:gap-x-6" role="list">
            <li>한 페이지 홈페이지 기획과 제작</li>
            <li>상담 신청서와 접수 알림</li>
            <li>첫 달 무상 관리</li>
          </ul>
        </div>
        <div>
          <form action="/contact" method="get" className="flex overflow-hidden rounded-md border border-[#cfd6e2] bg-white">
            <input type="hidden" name="promo" value="onepage" />
            <label htmlFor={`${id}-site`} className="sr-only">
              업종
            </label>
            <input
              id={`${id}-site`}
              name="site"
              type="text"
              placeholder="업종 (예: 필라테스)"
              className="min-w-0 flex-1 px-4 text-[16px] text-[#15171c] outline-none placeholder:text-[#8a94a6]"
            />
            <button type="submit" data-gtm-cta="onepage_free_apply" className="h-12 shrink-0 bg-[#256ef4] px-5 text-[16px] font-bold text-white transition-colors hover:bg-[#1b5bd1]">
              무료 제작 신청
            </button>
          </form>
          <Link href="/notice/onepage-free-2026-11" className="mt-3 inline-flex min-h-11 items-center gap-1 text-[14px] font-bold text-[#15171c] underline-offset-4 hover:underline">
            모집 안내 <ChevronRight size={15} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
