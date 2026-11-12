import Link from "next/link";
import { ChevronRight } from "lucide-react";

// 11-01 PHP 업그레이드 프로모션(사용자 승인). PHP 8.2 보안 지원 종료일(2026-12-31, php.net) 기준.
// 무상 업그레이드는 월 유지보수 3개월 계약과 묶는다. 호환성 수정 범위는 무료 점검 결과로 정한다.
// 주소 칸은 상담 신청서로 가고, 신청서가 ?site=&promo=php 를 읽어 문의 내용을 미리 채운다.
export const PHP_PROMO_END = "2026년 12월 31일";

export function PhpPromo({ id = "php-promo" }: { id?: string }) {
  return (
    <section aria-labelledby={id} className="bg-[#256ef4] text-white">
      <div className="mx-auto grid w-full max-w-[1248px] grid-cols-1 gap-6 px-4 py-8 md:px-6 md:py-10 lg:grid-cols-[1fr_480px] lg:items-center lg:gap-12">
        <div>
          <p className="text-[14px] font-bold text-white">{PHP_PROMO_END}까지</p>
          <h2 id={id} className="mt-1 text-[24px] font-[800] leading-[1.3] tracking-[-0.04em] md:text-[30px]">
            PHP 8.2 보안 지원 종료 대비 프로모션
          </h2>
          <ul className="mt-3 flex flex-col gap-1 text-[16px] text-white md:flex-row md:gap-6" role="list">
            <li>PHP 버전 무료 점검</li>
            <li>월 유지보수 3개월 계약 시 PHP 업그레이드 무상</li>
          </ul>
        </div>
        <div>
          <form action="/contact" method="get" className="flex overflow-hidden rounded-md bg-white">
            <input type="hidden" name="promo" value="php" />
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
            <button type="submit" data-gtm-cta="php_promo_check" className="h-12 shrink-0 bg-[#15171c] px-5 text-[16px] font-bold text-white transition-colors hover:bg-black">
              무료 점검 요청
            </button>
          </form>
          <Link href="/notice/php-promo-2026-11" className="mt-3 inline-flex min-h-11 items-center gap-1 text-[14px] font-bold text-white underline-offset-4 hover:underline">
            프로모션 안내 <ChevronRight size={15} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
