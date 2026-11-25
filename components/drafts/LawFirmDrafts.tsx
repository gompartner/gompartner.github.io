"use client";

// 시안마다 따로 불러온다(11-25). 시안 하나를 열 때 다른 업종 시안 코드까지 받지 않게.
import dynamic from "next/dynamic";
import { useVariant } from "@/lib/useVariant";
const LawFirmA = dynamic(() => import("./LawFirmA").then((m) => m.LawFirmA));
const LawFirmB = dynamic(() => import("./LawFirmB").then((m) => m.LawFirmB));
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
