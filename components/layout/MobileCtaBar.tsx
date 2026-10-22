"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChannelTalkButton } from "@/components/layout/ChannelTalk";

// 휴대폰 화면 아래에 고정하는 상담 줄. 채널톡 말풍선만으로는 무엇을 누르는 버튼인지 알기 어려워서 글자 버튼으로 둔다.
// 가격 페이지에서는 가격 대신 샘플 목록으로 보낸다.
export function MobileCtaBar() {
  const pathname = usePathname();
  const onPricing = pathname === "/pricing";
  // 샘플 표지에서는 가격이 이미 보이므로 샘플을 바로 여는 버튼을 둔다
  const onSample = pathname.startsWith("/sample/");
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t-[3px] border-[#1d1d1f] bg-[#f3ece0] px-4 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2.5 md:hidden print:hidden">
      <Link
        href={onSample ? pathname.replace("/sample/", "/demo/") : onPricing ? "/works" : "/pricing"}
        prefetch={onSample ? false : undefined}
        data-gtm-cta={onSample ? "mobilebar_sample_open" : onPricing ? "mobilebar_works" : "mobilebar_pricing"}
        className="flex h-12 items-center justify-center rounded-[6px] border-[2.5px] border-[#1d1d1f] bg-white text-[16px] font-bold"
      >
        {onSample ? "샘플 열기" : onPricing ? "샘플 보기" : "가격 보기"}
      </Link>
      <ChannelTalkButton cta="mobilebar_chat" className="flex h-12 items-center justify-center rounded-[6px] border-[2.5px] border-[#1d1d1f] bg-accent text-[16px] font-bold text-accent-foreground shadow-[3px_3px_0_#1d1d1f] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none">
        채팅 상담
      </ChannelTalkButton>
    </div>
  );
}
