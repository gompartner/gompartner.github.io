"use client";

import { useVariant } from "@/lib/useVariant";
import { LawFirmA } from "./LawFirmA";
import { LawFirmB } from "./LawFirmB";

// 법률사무소 시안 두 장(11-21). 맨 위 줄에서 바꿔 본다. 기존 기능형 데모(LawFirmDemo)는 코드만 남긴다.
export function LawFirmDrafts() {
  return useVariant("law-firm") === "b" ? <LawFirmB /> : <LawFirmA />;
}
