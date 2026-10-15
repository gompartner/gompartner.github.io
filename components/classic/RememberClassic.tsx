"use client";

import { useEffect } from "react";

// 클래식 페이지에 들어오면 클래식 보기를 고른 것으로 기억한다.
// 샘플(데모)을 체험하고 집 아이콘이나 웹툰 주소로 돌아와도 클래식으로 이어진다. 웹툰 아이콘을 누르면 지운다.
export function RememberClassic() {
  useEffect(() => {
    try {
      localStorage.setItem("look", "classic");
    } catch {}
  }, []);
  return null;
}
