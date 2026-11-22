"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { VARIANTS, setVariant, useVariant } from "@/lib/useVariant";

// 카탈로그 데모 맨 위의 곰파트너 바로가기 줄(11-01). 하단 집 버튼과 사용법 가이드를 대신한다.
// 화면 위에 떠 있지 않고 데모 위에 한 줄로 붙어, 데모 자체 머리글을 가리지 않는다. 썸네일 캡처에서는 숨긴다(.demo-topbar).
// 시안이 둘 이상인 사례는 오른쪽에서 시안을 바꿔 본다(11-21).
function backToCatalog(e: React.MouseEvent<HTMLAnchorElement>) {
  // 카탈로그 카드에서 연 체험은 주소에 from=c가 붙는다. 그때는 뒤로 가서 보던 자리로 돌아간다
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
  const list = VARIANTS[projectId];
  const v = useVariant(projectId);
  return (
    <div className="demo-topbar print:hidden relative z-[60] bg-[#15171c] text-white">
      <div className="mx-auto flex h-10 w-full max-w-[1248px] items-center justify-between gap-3 px-4 md:px-6">
        <Link href={home} onClick={backToCatalog} data-gtm-cta={`demo_home_${projectId}`} className="inline-flex shrink-0 items-center gap-1 text-[14px] font-bold hover:text-[#8fb4ff]">
          <ChevronLeft size={16} aria-hidden />
          <span className="hidden sm:inline">카탈로그로 돌아가기</span>
          <span className="sm:hidden">카탈로그</span>
        </Link>
        {list && (
          <div role="group" aria-label="시안 선택" className="flex min-w-0 items-center gap-1 rounded-full bg-white/10 p-[3px]">
            {list.map((x) => (
              <button
                key={x.id}
                type="button"
                aria-pressed={v === x.id}
                onClick={() => setVariant(x.id)}
                data-gtm-cta={`demo_variant_${projectId}_${x.id}`}
                className="h-[30px] whitespace-nowrap rounded-full px-3 text-[13px] font-bold transition-colors"
                style={{ background: v === x.id ? "#fff" : "transparent", color: v === x.id ? "#15171c" : "rgba(255,255,255,0.75)" }}
              >
                {x.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
