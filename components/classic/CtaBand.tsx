"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { profile } from "@/data/classic/profile";

// 모든 클래식 페이지 바닥글 위 상담 띠(11-01 보편 구성). 상담 신청 페이지에서는 숨긴다.
export function CtaBand() {
  const pathname = usePathname();
  if (pathname?.startsWith("/classic/contact")) return null;
  return (
    <section aria-label="상담 신청" className="bg-[#256ef4] text-white">
      <div className="mx-auto flex w-full max-w-[1248px] flex-col gap-6 px-4 py-12 md:flex-row md:items-center md:justify-between md:px-6 md:py-14">
        <p className="text-[24px] font-[800] leading-[1.3] tracking-[-0.04em] md:text-[32px]">홈페이지 제작, 유지보수 상담</p>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/classic/contact" data-gtm-cta="cta_band_contact" className="inline-flex h-12 items-center rounded-md bg-white px-6 text-[16px] font-bold text-[#15171c] transition-colors hover:bg-[#e8efff]">
            상담 신청
          </Link>
          <a href={`tel:${profile.phone.replace(/-/g, "")}`} data-gtm-cta="cta_band_tel" className="inline-flex h-12 items-center rounded-md border border-white/50 px-6 text-[16px] font-bold text-white tabular-nums transition-colors hover:bg-white/10">
            {profile.phone}
          </a>
        </div>
      </div>
    </section>
  );
}
