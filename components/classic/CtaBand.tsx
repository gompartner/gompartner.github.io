"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, PenLine } from "lucide-react";
import { KakaoChatButton } from "@/components/layout/KakaoChat";

// 모든 클래식 페이지 바닥글 위 상담 띠(11-01 보편 구성). 상담 신청과 카카오톡 상담. 상담 신청 페이지에서는 숨긴다.
export function CtaBand() {
  const pathname = usePathname();
  if (pathname?.startsWith("/classic/contact")) return null;
  return (
    <section aria-label="상담 신청" className="bg-[#256ef4] text-white">
      <div className="mx-auto flex w-full max-w-[1248px] flex-col gap-6 px-4 py-12 md:flex-row md:items-center md:justify-between md:px-6 md:py-14">
        <p className="text-[24px] font-[800] leading-[1.3] tracking-[-0.04em] md:text-[32px]">홈페이지 제작, 유지보수 상담</p>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/classic/contact" data-gtm-cta="cta_band_contact" className="inline-flex h-12 items-center gap-2 rounded-md bg-white px-6 text-[16px] font-bold text-[#15171c] transition-colors hover:bg-[#e8efff]">
            <PenLine size={18} aria-hidden />
            상담 신청
          </Link>
          <KakaoChatButton cta="cta_band_chat" className="inline-flex h-12 items-center gap-2 rounded-md border border-white/50 px-6 text-[16px] font-bold text-white transition-colors hover:bg-white/10">
            <MessageCircle size={18} aria-hidden />
            카카오톡 상담
          </KakaoChatButton>
        </div>
      </div>
    </section>
  );
}
