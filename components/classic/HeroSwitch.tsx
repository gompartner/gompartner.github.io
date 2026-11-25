"use client";

import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

// 11-25 메인 첫 화면 비교용(사용자 "한국, 일본, 미국 각각 비교"). ?v=kr | jp | us, 없으면 us
export function useHeroVariant(): "kr" | "jp" | "us" {
  const v = useSearchParams().get("v");
  return v === "kr" || v === "jp" ? v : "us";
}

export function HeroSwitch({ kr, jp, us }: { kr: ReactNode; jp: ReactNode; us: ReactNode }) {
  const v = useHeroVariant();
  return <>{v === "kr" ? kr : v === "jp" ? jp : us}</>;
}
