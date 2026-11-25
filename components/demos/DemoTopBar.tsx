"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { backIfPrev } from "@/lib/navHistory";

// 카탈로그 데모 맨 위의 곰파트너 바로가기 줄(11-01). 하단 집 버튼과 사용법 가이드를 대신한다.
// 화면 위에 떠 있지 않고 데모 위에 한 줄로 붙어, 데모 자체 머리글을 가리지 않는다. 썸네일 캡처에서는 숨긴다(.demo-topbar).
// 11-25 시안 A, B 선택 버튼은 뺐다. 시안은 주소의 ?v= 로만 고른다.
function backToCatalog(e: React.MouseEvent<HTMLAnchorElement>) {
  // 11-25 사이트 안(메인, 포트폴리오, 상세)에서 들어왔으면 어디서 왔든 그 화면으로 뒤로 간다(보던 자리, 검색어 그대로).
  // 바깥에서 바로 들어왔으면 포트폴리오 첫 화면으로 간다
  if (backIfPrev(e, "/works", (prev) => !prev.startsWith("/work/"))) return;
  try {
    if (new URLSearchParams(window.location.search).get("from") === "c" && window.history.length > 1) {
      e.preventDefault();
      window.history.back();
    }
  } catch {}
}

export function DemoTopBar({ projectId }: { projectId: string }) {
  // 11-22 카탈로그에서 들어왔으면(from=c) 그 자리로 되돌아가고, 아니면 카탈로그 첫 화면으로 간다
  const home = "/works";
  return (
    <div className="demo-topbar print:hidden relative z-[60] bg-[#15171c] text-white">
      <div className="mx-auto flex h-10 w-full max-w-[1248px] items-center justify-between gap-3 px-4 md:px-6">
        <Link href={home} onClick={backToCatalog} data-gtm-cta={`demo_home_${projectId}`} className="inline-flex shrink-0 items-center gap-1 text-[14px] font-bold hover:text-[#8fb4ff]">
          <ChevronLeft size={16} aria-hidden />
          <span className="hidden sm:inline">포트폴리오로 돌아가기</span>
          <span className="sm:hidden">포트폴리오</span>
        </Link>
      </div>
    </div>
  );
}
