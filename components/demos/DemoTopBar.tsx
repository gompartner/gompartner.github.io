"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

// 카탈로그 데모 맨 위의 곰파트너 바로가기 줄(11-01). 하단 집 버튼과 사용법 가이드를 대신한다.
// 화면 위에 떠 있지 않고 데모 위에 한 줄로 붙어, 데모 자체 머리글을 가리지 않는다. 썸네일 캡처에서는 숨긴다(.demo-topbar).
export function DemoTopBar({ projectId }: { projectId: string }) {
  const home = "/";
  return (
    <div className="demo-topbar print:hidden relative z-[60] bg-[#15171c] text-white">
      <div className="mx-auto flex h-10 w-full max-w-[1248px] items-center px-4 md:px-6">
        <Link href={home} data-gtm-cta={`demo_home_${projectId}`} className="inline-flex items-center gap-1 text-[14px] font-bold hover:text-[#8fb4ff]">
          <ChevronLeft size={16} aria-hidden />
          곰파트너 바로가기
        </Link>
      </div>
    </div>
  );
}
