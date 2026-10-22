"use client";

import { useEffect } from "react";

// 클래식 페이지에 들어오면 웹툰 보기 기억을 지운다(클래식이 기본).
// 샘플(데모)을 체험하고 집 아이콘이나 웹툰 주소로 돌아와도 클래식으로 이어진다.
export function RememberClassic() {
  useEffect(() => {
    try {
      localStorage.removeItem("look");
    } catch {}
  }, []);
  return null;
}
