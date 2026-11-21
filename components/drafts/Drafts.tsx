"use client";

import { useVariant } from "@/lib/useVariant";
import { TaxA } from "./TaxA";
import { TaxB } from "./TaxB";
import { DentalA } from "./DentalA";
import { DentalB } from "./DentalB";
import { QuickMenu } from "./QuickMenu";
import { AcademyA } from "./AcademyA";
import { AcademyB } from "./AcademyB";
import { InteriorA } from "./InteriorA";
import { InteriorB } from "./InteriorB";
import { SkinA } from "./SkinA";
import { SkinB } from "./SkinB";
import { FoodA } from "./FoodA";
import { FoodB } from "./FoodB";
import { PilatesA } from "./PilatesA";
import { PilatesB } from "./PilatesB";
import { EstateA } from "./EstateA";
import { EstateB } from "./EstateB";

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
export function AcademyDrafts() {
  return useVariant("academy") === "b" ? (
    <>
      <AcademyB />
      <QuickMenu accent="#13a06f" cta="레벨테스트" />
    </>
  ) : (
    <>
      <AcademyA />
      <QuickMenu accent="#1638d8" cta="1:1 상담" />
    </>
  );
}
export function InteriorDrafts() {
  return useVariant("interior") === "b" ? (
    <>
      <InteriorB />
      <QuickMenu accent="#a5743f" cta="견적 받기" />
    </>
  ) : (
    <>
      <InteriorA />
      <QuickMenu accent="#141414" cta="견적 요청" />
    </>
  );
}
export function SkinDrafts() {
  return useVariant("clinic-homepage") === "b" ? (
    <>
      <SkinB />
      <QuickMenu accent="#d14d6a" cta="예약 문의" />
    </>
  ) : (
    <>
      <SkinA />
      <QuickMenu accent="#1f1d1b" cta="진료 예약" />
    </>
  );
}
export function FoodDrafts() {
  return useVariant("korean-restaurant") === "b" ? (
    <>
      <FoodB />
      <QuickMenu accent="#d8321f" cta="단체 예약" tel="02-000-0000" />
    </>
  ) : (
    <>
      <FoodA />
      <QuickMenu accent="#a4271c" cta="단체 예약" tel="02-000-0000" />
    </>
  );
}
export function PilatesDrafts() {
  return useVariant("pilates-studio") === "b" ? (
    <>
      <PilatesB />
      <QuickMenu accent="#4f7a64" cta="체험 신청" tel="031-000-0000" />
    </>
  ) : (
    <>
      <PilatesA />
      <QuickMenu accent="#141312" cta="상담 예약" tel="02-000-0000" />
    </>
  );
}
export function EstateDrafts() {
  return useVariant("real-estate") === "b" ? (
    <>
      <EstateB />
      <QuickMenu accent="#2563eb" cta="매물 문의" tel="02-000-0000" />
    </>
  ) : (
    <>
      <EstateA />
      <QuickMenu accent="#1d3557" cta="매물 문의" tel="02-000-0000" />
    </>
  );
}
