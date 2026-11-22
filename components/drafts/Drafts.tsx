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
import { HairA } from "./HairA";
import { HairB } from "./HairB";
import { NailA } from "./NailA";
import { NailB } from "./NailB";
import { CoffeeA } from "./CoffeeA";
import { CoffeeB } from "./CoffeeB";
import { OrthoA } from "./OrthoA";
import { OrthoB } from "./OrthoB";
import { PedA } from "./PedA";
import { PedB } from "./PedB";
import { KmA } from "./KmA";
import { KmB } from "./KmB";
import { EyeA } from "./EyeA";
import { EyeB } from "./EyeB";
import { VetA } from "./VetA";
import { VetB } from "./VetB";
import { LaborA } from "./LaborA";
import { LaborB } from "./LaborB";
import { ScrA } from "./ScrA";
import { ScrB } from "./ScrB";
import { ArcA } from "./ArcA";
import { ArcB } from "./ArcB";
import { PhoA } from "./PhoA";
import { PhoB } from "./PhoB";
import { PatA } from "./PatA";
import { PatB } from "./PatB";
import { FamA } from "./FamA";
import { FamB } from "./FamB";
import { VisaA } from "./VisaA";
import { VisaB } from "./VisaB";

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
export function HairDrafts() {
  return useVariant("hair-salon") === "b" ? (
    <>
      <HairB />
      <QuickMenu accent="#c2603e" cta="예약하기" tel="031-000-0000" />
    </>
  ) : (
    <>
      <HairA />
      <QuickMenu accent="#1f3a32" cta="예약 문의" tel="02-000-0000" />
    </>
  );
}
export function NailDrafts() {
  return useVariant("nail-shop") === "b" ? (
    <>
      <NailB />
      <QuickMenu accent="#c94f6d" cta="예약하기" tel="031-000-0000" />
    </>
  ) : (
    <>
      <NailA />
      <QuickMenu accent="#1a1718" cta="예약 문의" tel="02-000-0000" />
    </>
  );
}
export function CoffeeDrafts() {
  return useVariant("roastery") === "b" ? (
    <>
      <CoffeeB />
      <QuickMenu accent="#5b3a24" cta="원두 주문" tel="042-000-0000" />
    </>
  ) : (
    <>
      <CoffeeA />
      <QuickMenu accent="#7a4a2a" cta="납품 상담" tel="02-000-0000" />
    </>
  );
}
export function OrthoDrafts() {
  return useVariant("orthopedics") === "b" ? (
    <>
      <OrthoB />
      <QuickMenu accent="#1f6fe5" cta="전화 걸기" tel="031-000-0000" />
    </>
  ) : (
    <>
      <OrthoA />
      <QuickMenu accent="#13294b" cta="진료 예약" tel="02-000-0000" />
    </>
  );
}
export function PedDrafts() {
  return useVariant("pediatrics") === "b" ? (
    <>
      <PedB />
      <QuickMenu accent="#1f9d62" cta="검진 예약" tel="031-000-0000" />
    </>
  ) : (
    <>
      <PedA />
      <QuickMenu accent="#1b8fd6" cta="진료 접수" tel="02-000-0000" />
    </>
  );
}
export function KmDrafts() {
  return useVariant("korean-medicine") === "b" ? (
    <>
      <KmB />
      <QuickMenu accent="#4e6b3a" cta="상담 예약" tel="031-000-0000" />
    </>
  ) : (
    <>
      <KmA />
      <QuickMenu accent="#4a3020" cta="진료 예약" tel="02-000-0000" />
    </>
  );
}
export function EyeDrafts() {
  return useVariant("eye-clinic") === "b" ? (
    <>
      <EyeB />
      <QuickMenu accent="#1677c9" cta="전화 걸기" tel="02-000-0000" />
    </>
  ) : (
    <>
      <EyeA />
      <QuickMenu accent="#0d4a57" cta="검사 예약" tel="051-000-0000" />
    </>
  );
}
export function VetDrafts() {
  return useVariant("animal-hospital") === "b" ? (
    <>
      <VetB />
      <QuickMenu accent="#2e8b57" cta="진료 예약" tel="031-000-0000" />
    </>
  ) : (
    <>
      <VetA />
      <QuickMenu accent="#ec6b2d" cta="응급 전화" tel="02-000-0000" />
    </>
  );
}
export function LaborDrafts() {
  return useVariant("labor-firm") === "b" ? (
    <>
      <LaborB />
      <QuickMenu accent="#1d5c4a" cta="상담 예약" tel="031-000-0000" />
    </>
  ) : (
    <>
      <LaborA />
      <QuickMenu accent="#0f2a5c" cta="상담 신청" tel="02-000-0000" />
    </>
  );
}

export function ScrivenerDrafts() {
  return useVariant("scrivener") === "b" ? (
    <>
      <ScrB />
      <QuickMenu accent="#34488c" cta="상담 신청" tel="031-000-0000" />
    </>
  ) : (
    <>
      <ScrA />
      <QuickMenu accent="#1c2f5a" cta="등기 견적" tel="02-000-0000" />
    </>
  );
}

export function ArchitectDrafts() {
  return useVariant("architect-office") === "b" ? (
    <>
      <ArcB />
      <QuickMenu accent="#8a5a3c" cta="대지 상담" tel="031-000-0000" />
    </>
  ) : (
    <>
      <ArcA />
      <QuickMenu accent="#111111" cta="설계 문의" tel="02-000-0000" />
    </>
  );
}

export function PhotoStudioDrafts() {
  return useVariant("photo-studio") === "b" ? (
    <>
      <PhoB />
      <QuickMenu accent="#8b5e3c" cta="촬영 문의" tel="031-000-0000" />
    </>
  ) : (
    <>
      <PhoA />
      <QuickMenu accent="#111111" cta="오시는 길" tel="02-000-0000" />
    </>
  );
}

export function PatentDrafts() {
  return useVariant("patent-office") === "b" ? (
    <>
      <PatB />
      <QuickMenu accent="#d9541e" cta="무료 검토" tel="031-000-0000" />
    </>
  ) : (
    <>
      <PatA />
      <QuickMenu accent="#14407a" cta="출원 상담" tel="02-000-0000" />
    </>
  );
}

export function FamilyLawDrafts() {
  return useVariant("family-law") === "b" ? (
    <>
      <FamB />
      <QuickMenu accent="#6b2f4a" cta="상담 예약" tel="031-000-0000" />
    </>
  ) : (
    <>
      <FamA />
      <QuickMenu accent="#24304f" cta="비공개 상담" tel="02-000-0000" />
    </>
  );
}

export function VisaDrafts() {
  return useVariant("visa-agent") === "b" ? (
    <>
      <VisaB />
      <QuickMenu accent="#13795b" cta="비자 상담" tel="032-000-0000" />
    </>
  ) : (
    <>
      <VisaA />
      <QuickMenu accent="#13265a" cta="채용 비자" tel="02-000-0000" />
    </>
  );
}
