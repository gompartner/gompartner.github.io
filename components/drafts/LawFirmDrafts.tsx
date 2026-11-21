"use client";

import { useVariant } from "@/lib/useVariant";
import { LawFirmA } from "./LawFirmA";
import { LawFirmB } from "./LawFirmB";
import { QuickMenu } from "./QuickMenu";

// 법률사무소 시안 두 장(11-21). 맨 위 줄에서 바꿔 본다. 기존 기능형 데모(LawFirmDemo)는 코드만 남긴다.
export function LawFirmDrafts() {
  return useVariant("law-firm") === "b" ? (
    <>
      <LawFirmB />
      <QuickMenu accent="#1f4fd8" cta="상담 신청" />
    </>
  ) : (
    <>
      <LawFirmA />
      <QuickMenu accent="#c8a96a" ink="#0e1116" cta="상담 문의" />
    </>
  );
}
