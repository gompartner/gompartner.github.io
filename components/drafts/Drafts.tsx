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
import { NhA } from "./NhA";
import { NhB } from "./NhB";
import { OptA } from "./OptA";
import { OptB } from "./OptB";
import { CarA } from "./CarA";
import { CarB } from "./CarB";
import { PiaA } from "./PiaA";
import { PiaB } from "./PiaB";
import { TkA } from "./TkA";
import { TkB } from "./TkB";
import { ArtA } from "./ArtA";
import { ArtB } from "./ArtB";
import { EngA } from "./EngA";
import { EngB } from "./EngB";
import { DrvA } from "./DrvA";
import { DrvB } from "./DrvB";
import { ReadA } from "./ReadA";
import { ReadB } from "./ReadB";
import { PhA } from "./PhA";
import { PhB } from "./PhB";
import { PenA } from "./PenA";
import { PenB } from "./PenB";
import { BkA } from "./BkA";
import { BkB } from "./BkB";
import { HkA } from "./HkA";
import { HkB } from "./HkB";
import { FwA } from "./FwA";
import { FwB } from "./FwB";
import { CwA } from "./CwA";
import { CwB } from "./CwB";
import { CpA } from "./CpA";
import { CpB } from "./CpB";
import { LtA } from "./LtA";
import { LtB } from "./LtB";
import { LqA } from "./LqA";
import { LqB } from "./LqB";
import { WdA } from "./WdA";
import { WdB } from "./WdB";
import { CeA } from "./CeA";
import { CeB } from "./CeB";
import { SaA } from "./SaA";
import { SaB } from "./SaB";
import { LgA } from "./LgA";
import { LgB } from "./LgB";
import { FoA } from "./FoA";
import { FoB } from "./FoB";

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

export function NursingDrafts() {
  return useVariant("nursing-hospital") === "b" ? (
    <>
      <NhB />
      <QuickMenu accent="#c8682c" cta="입원 상담" tel="031-000-0000" />
    </>
  ) : (
    <>
      <NhA />
      <QuickMenu accent="#1f5e45" cta="입원 상담" tel="031-000-0000" />
    </>
  );
}

export function OpticalDrafts() {
  return useVariant("optical") === "b" ? (
    <>
      <OptB />
      <QuickMenu accent="#111111" cta="매장 안내" tel="02-000-0000" />
    </>
  ) : (
    <>
      <OptA />
      <QuickMenu accent="#1d3366" cta="검사 예약" tel="031-000-0000" />
    </>
  );
}

export function CarDetailingDrafts() {
  return useVariant("car-detailing") === "b" ? (
    <>
      <CarB />
      <QuickMenu accent="#0f6fd6" cta="전화 예약" tel="02-000-0000" />
    </>
  ) : (
    <>
      <CarA />
      <QuickMenu accent="#d6322b" cta="견적 문의" tel="031-000-0000" />
    </>
  );
}

export function PianoDrafts() {
  return useVariant("piano-academy") === "b" ? (
    <>
      <PiaB />
      <QuickMenu accent="#a8823e" cta="체험 레슨" tel="02-000-0000" />
    </>
  ) : (
    <>
      <PiaA />
      <QuickMenu accent="#147a72" cta="상담 신청" tel="02-000-0000" />
    </>
  );
}

export function TaekwondoDrafts() {
  return useVariant("taekwondo") === "b" ? (
    <>
      <TkB />
      <QuickMenu accent="#d92b2b" cta="상담 신청" tel="031-000-0000" />
    </>
  ) : (
    <>
      <TkA />
      <QuickMenu accent="#e0342e" cta="체험 수업" tel="02-000-0000" />
    </>
  );
}

export function ArtAcademyDrafts() {
  return useVariant("art-academy") === "b" ? (
    <>
      <ArtB />
      <QuickMenu accent="#6a3fc8" cta="체험 수업" tel="031-000-0000" />
    </>
  ) : (
    <>
      <ArtA />
      <QuickMenu accent="#121212" cta="입시 상담" tel="02-000-0000" />
    </>
  );
}

export function EnglishTalkDrafts() {
  return useVariant("english-talk") === "b" ? (
    <>
      <EngB />
      <QuickMenu accent="#1f8a4c" cta="레벨 상담" tel="032-000-0000" />
    </>
  ) : (
    <>
      <EngA />
      <QuickMenu accent="#e23b2e" cta="레벨 테스트" tel="02-000-0000" />
    </>
  );
}

export function DrivingSchoolDrafts() {
  return useVariant("driving-school") === "b" ? (
    <>
      <DrvB />
      <QuickMenu accent="#1d5bd8" cta="연수 상담" tel="031-000-0000" />
    </>
  ) : (
    <>
      <DrvA />
      <QuickMenu accent="#142a5c" cta="등록 상담" tel="02-000-0000" />
    </>
  );
}

export function ReadingAcademyDrafts() {
  return useVariant("reading-academy") === "b" ? (
    <>
      <ReadB />
      <QuickMenu accent="#233a7a" cta="입학 상담" tel="031-000-0000" />
    </>
  ) : (
    <>
      <ReadA />
      <QuickMenu accent="#2a7a5c" cta="체험 수업" tel="02-000-0000" />
    </>
  );
}

export function PharmacyDrafts() {
  return useVariant("pharmacy") === "b" ? (
    <>
      <PhB />
      <QuickMenu accent="#0f6e6a" cta="상담 문의" tel="031-000-0000" />
    </>
  ) : (
    <>
      <PhA />
      <QuickMenu accent="#1d7a4e" cta="전화 문의" tel="02-000-0000" />
    </>
  );
}

export function PensionDrafts() {
  return useVariant("pension") === "b" ? (
    <>
      <PenB />
      <QuickMenu accent="#2f5a3c" cta="예약 문의" tel="033-000-0000" />
    </>
  ) : (
    <>
      <PenA />
      <QuickMenu accent="#173a63" cta="예약 문의" tel="033-000-0000" />
    </>
  );
}

export function BakeryCafeDrafts() {
  return useVariant("bakery-cafe") === "b" ? (
    <>
      <BkB />
      <QuickMenu accent="#151311" cta="단체 문의" tel="031-000-0000" />
    </>
  ) : (
    <>
      <BkA />
      <QuickMenu accent="#8a4b22" cta="케이크 주문" tel="02-000-0000" />
    </>
  );
}

export function HanokCafeDrafts() {
  return useVariant("hanok-cafe") === "b" ? (
    <>
      <HkB />
      <QuickMenu accent="#161412" cta="오시는 길" tel="063-000-0000" />
    </>
  ) : (
    <>
      <HkA />
      <QuickMenu accent="#9a6a2f" cta="단체 문의" tel="02-000-0000" />
    </>
  );
}

export function FurnitureWorkshopDrafts() {
  return useVariant("furniture-workshop") === "b" ? (
    <>
      <FwB />
      <QuickMenu accent="#5d6b3a" cta="쇼룸 방문" tel="02-000-0000" />
    </>
  ) : (
    <>
      <FwA />
      <QuickMenu accent="#171411" cta="맞춤 문의" tel="031-000-0000" />
    </>
  );
}

export function CoworkingDrafts() {
  return useVariant("coworking") === "b" ? (
    <>
      <CwB />
      <QuickMenu accent="#1f3a6e" cta="계약 문의" tel="031-000-0000" />
    </>
  ) : (
    <>
      <CwA />
      <QuickMenu accent="#1f6b47" cta="공간 투어" tel="02-000-0000" />
    </>
  );
}

export function CampsiteDrafts() {
  return useVariant("campsite") === "b" ? (
    <>
      <CpB />
      <QuickMenu accent="#9a6b3c" cta="예약 문의" tel="041-000-0000" />
    </>
  ) : (
    <>
      <CpA />
      <QuickMenu accent="#2c5a36" cta="예약 문의" tel="031-000-0000" />
    </>
  );
}

export function LightingShopDrafts() {
  return useVariant("lighting-shop") === "b" ? (
    <>
      <LtB />
      <QuickMenu accent="#17150f" cta="출장 문의" tel="042-000-0000" />
    </>
  ) : (
    <>
      <LtA />
      <QuickMenu accent="#141312" cta="조명 상담" tel="02-000-0000" />
    </>
  );
}

export function LiquorShopDrafts() {
  return useVariant("liquor-shop") === "b" ? (
    <>
      <LqB />
      <QuickMenu accent="#3f7d73" cta="선물 문의" tel="02-000-0000" />
    </>
  ) : (
    <>
      <LqA />
      <QuickMenu accent="#7a1f2b" cta="매장 안내" tel="02-000-0000" />
    </>
  );
}

export function SmallWeddingDrafts() {
  return useVariant("small-wedding") === "b" ? (
    <>
      <WdB />
      <QuickMenu accent="#b4606c" cta="상담 신청" tel="02-000-0000" />
    </>
  ) : (
    <>
      <WdA />
      <QuickMenu accent="#59663a" cta="투어 상담" tel="031-000-0000" />
    </>
  );
}

export function CertLabDrafts() {
  return useVariant("cert-lab") === "b" ? (
    <>
      <CeB />
      <QuickMenu accent="#4b3aa8" cta="분석 의뢰" tel="042-000-0000" />
    </>
  ) : (
    <>
      <CeA />
      <QuickMenu accent="#16325c" cta="견적문의" tel="031-000-0000" />
    </>
  );
}

export function SaasDrafts() {
  return useVariant("saas-startup") === "b" ? (
    <>
      <SaB />
      <QuickMenu accent="#121212" cta="도입 문의" tel="1600-0000" />
    </>
  ) : (
    <>
      <SaA />
      <QuickMenu accent="#1e3a8a" cta="도입 문의" tel="1600-0000" />
    </>
  );
}

export function LogisticsDrafts() {
  return useVariant("logistics") === "b" ? (
    <>
      <LgB />
      <QuickMenu accent="#141414" cta="견적 문의" tel="031-000-0000" />
    </>
  ) : (
    <>
      <LgA />
      <QuickMenu accent="#12345e" cta="도입 상담" tel="031-000-0000" />
    </>
  );
}

export function FoodOemDrafts() {
  return useVariant("food-oem") === "b" ? (
    <>
      <FoB />
      <QuickMenu accent="#4c3bb4" cta="개발 상담" tel="031-000-0000" />
    </>
  ) : (
    <>
      <FoA />
      <QuickMenu accent="#1f6f46" cta="샘플 의뢰" tel="043-000-0000" />
    </>
  );
}
