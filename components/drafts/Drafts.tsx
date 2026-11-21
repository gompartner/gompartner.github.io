"use client";

import { useVariant } from "@/lib/useVariant";
import { TaxA } from "./TaxA";
import { TaxB } from "./TaxB";
import { DentalA } from "./DentalA";
import { DentalB } from "./DentalB";
import { QuickMenu } from "./QuickMenu";

// 컨셉 시안 두 장씩(11-21). 맨 위 줄에서 바꿔 본다. 기존 기능형 데모는 코드만 남긴다.
export function TaxDrafts() {
  return useVariant("tax-office") === "b" ? (
    <>
      <TaxB />
      <QuickMenu accent="#0e9f6e" cta="기장료 문의" />
    </>
  ) : (
    <>
      <TaxA />
      <QuickMenu accent="#2f6bff" cta="무료 진단" />
    </>
  );
}
export function DentalDrafts() {
  return useVariant("dental-homepage") === "b" ? (
    <>
      <DentalB />
      <QuickMenu accent="#f06a2f" cta="진료 예약" />
    </>
  ) : (
    <>
      <DentalA />
      <QuickMenu accent="#1a1c1f" cta="진료 예약" />
    </>
  );
}
