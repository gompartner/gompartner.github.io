"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChannelTalkButton } from "@/components/layout/ChannelTalk";

// 휴대폰 화면 아래에 고정하는 상담 줄. 채널톡 말풍선만으로는 무엇을 누르는 버튼인지 알기 어려워서 글자 버튼으로 둔다.
// 가격 페이지에서는 가격 대신 샘플 목록으로 보낸다.
export function MobileCtaBar() {
  const pathname = usePathname();
  const onPricing = pathname === "/pricing";
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t border-border bg-white/95 px-4 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2.5 backdrop-blur md:hidden print:hidden">
      <Link
        href={onPricing ? "/works" : "/pricing"}
        data-gtm-cta={onPricing ? "mobilebar_works" : "mobilebar_pricing"}
        className="flex h-12 items-center justify-center rounded-[6px] border border-border text-[16px] font-bold"
      >
        {onPricing ? "샘플 보기" : "가격 보기"}
      </Link>
      <ChannelTalkButton cta="mobilebar_chat" className="flex h-12 items-center justify-center rounded-[6px] bg-accent text-[16px] font-bold text-accent-foreground">
        채팅 상담
      </ChannelTalkButton>
    </div>
  );
}
