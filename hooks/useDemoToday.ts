"use client";

import { useEffect, useState } from "react";

// 데모의 게시일·접수일·주문일 같은 날짜를 "오늘 기준 며칠 전"으로 계산해, 언제 봐도 관리 중인 사이트처럼 보이게 한다.
// 정적 빌드라 서버 렌더와 첫 화면은 기준일(BASE)로 그리고, 브라우저에서 바로 오늘 날짜로 다시 그린다(하이드레이션 불일치 없음).
const BASE = new Date(2026, 9, 7);

const startOfToday = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

export function useDemoToday(): Date {
  const [today, setToday] = useState(BASE);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setToday(startOfToday()));
    return () => cancelAnimationFrame(frame);
  }, []);
  return today;
}

/** 기준일에서 n일 전(음수면 n일 뒤) */
export const daysAgo = (today: Date, n: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() - n);

const p2 = (n: number) => String(n).padStart(2, "0");
const DOW = ["일", "월", "화", "수", "목", "금", "토"];

/** 2026.10.05 */
export const fmtDot = (d: Date) => `${d.getFullYear()}.${p2(d.getMonth() + 1)}.${p2(d.getDate())}`;
/** 2026-10-05 */
export const fmtDash = (d: Date) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
/** 10.05 */
export const fmtMD = (d: Date) => `${p2(d.getMonth() + 1)}.${p2(d.getDate())}`;
/** 10월 5일(월) */
export const fmtKo = (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일(${DOW[d.getDay()]})`;
