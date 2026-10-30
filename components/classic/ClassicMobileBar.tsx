"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// 클래식 보기의 휴대폰 하단 상담 줄. 샘플 소개에서는 샘플을 바로 연다.
export function ClassicMobileBar() {
  const pathname = usePathname();
  const onSample = pathname.startsWith("/classic/sample/");
  const href = onSample ? pathname.replace("/classic/sample/", "/demo/") : "/classic/works";
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t border-[#e6e9ee] bg-white/95 px-4 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2.5 backdrop-blur md:hidden print:hidden">
      <Link href={href} prefetch={onSample ? false : undefined} data-gtm-cta="classic_mobilebar_left" className="flex h-12 items-center justify-center rounded-md border border-[#c9cfd8] text-[16px] font-bold text-[#15171c]">
        {onSample ? "샘플 열기" : "샘플 보기"}
      </Link>
      <Link href="/classic/contact" data-gtm-cta="classic_mobilebar_contact" className="flex h-12 items-center justify-center rounded-md bg-[#256ef4] text-[16px] font-bold text-white">
        상담 신청
      </Link>
    </div>
  );
}
