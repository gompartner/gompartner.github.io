"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { recordNav } from "@/lib/navHistory";

// 지나온 화면을 세션에 적는다(lib/navHistory). 시안 주소의 ?v= 처럼 같은 화면 안에서 바뀌는 값까지 담는다.
export function NavMemory() {
  const pathname = usePathname();
  useEffect(() => {
    // 메인 미리보기처럼 틀(iframe) 안에서 열린 화면은 지나온 화면이 아니다
    if (window.self !== window.top) return;
    recordNav(window.location.pathname + window.location.search);
  }, [pathname]);
  return null;
}
