"use client";

// 시안마다 따로 불러온다(11-25). 시안 하나를 열 때 다른 업종 시안 코드까지 받지 않게.
import dynamic from "next/dynamic";
import { useVariant } from "@/lib/useVariant";
import { QuickMenu } from "./QuickMenu";
const TaxA = dynamic(() => import("./TaxA").then((m) => m.TaxA));
const TaxB = dynamic(() => import("./TaxB").then((m) => m.TaxB));
const DentalA = dynamic(() => import("./DentalA").then((m) => m.DentalA));
const DentalB = dynamic(() => import("./DentalB").then((m) => m.DentalB));
const Dental2026 = dynamic(() => import("./Dental2026").then((m) => m.Dental2026));
const Dental2027Window = dynamic(() => import("./Dental2027Window").then((m) => m.Dental2027Window));
const AcademyA = dynamic(() => import("./AcademyA").then((m) => m.AcademyA));
const AcademyB = dynamic(() => import("./AcademyB").then((m) => m.AcademyB));
const InteriorA = dynamic(() => import("./InteriorA").then((m) => m.InteriorA));
const InteriorB = dynamic(() => import("./InteriorB").then((m) => m.InteriorB));
const SkinA = dynamic(() => import("./SkinA").then((m) => m.SkinA));
const SkinB = dynamic(() => import("./SkinB").then((m) => m.SkinB));
const FoodA = dynamic(() => import("./FoodA").then((m) => m.FoodA));
const FoodB = dynamic(() => import("./FoodB").then((m) => m.FoodB));
const PilatesA = dynamic(() => import("./PilatesA").then((m) => m.PilatesA));
const PilatesB = dynamic(() => import("./PilatesB").then((m) => m.PilatesB));
const EstateA = dynamic(() => import("./EstateA").then((m) => m.EstateA));
const EstateB = dynamic(() => import("./EstateB").then((m) => m.EstateB));
const HairA = dynamic(() => import("./HairA").then((m) => m.HairA));
const HairB = dynamic(() => import("./HairB").then((m) => m.HairB));
const NailA = dynamic(() => import("./NailA").then((m) => m.NailA));
const NailB = dynamic(() => import("./NailB").then((m) => m.NailB));
const CoffeeA = dynamic(() => import("./CoffeeA").then((m) => m.CoffeeA));
const CoffeeB = dynamic(() => import("./CoffeeB").then((m) => m.CoffeeB));
const OrthoA = dynamic(() => import("./OrthoA").then((m) => m.OrthoA));
const OrthoB = dynamic(() => import("./OrthoB").then((m) => m.OrthoB));
const PedA = dynamic(() => import("./PedA").then((m) => m.PedA));
const PedB = dynamic(() => import("./PedB").then((m) => m.PedB));
const KmA = dynamic(() => import("./KmA").then((m) => m.KmA));
const KmB = dynamic(() => import("./KmB").then((m) => m.KmB));
const EyeA = dynamic(() => import("./EyeA").then((m) => m.EyeA));
const EyeB = dynamic(() => import("./EyeB").then((m) => m.EyeB));
const VetA = dynamic(() => import("./VetA").then((m) => m.VetA));
const VetB = dynamic(() => import("./VetB").then((m) => m.VetB));
const LaborA = dynamic(() => import("./LaborA").then((m) => m.LaborA));
const LaborB = dynamic(() => import("./LaborB").then((m) => m.LaborB));
const ScrA = dynamic(() => import("./ScrA").then((m) => m.ScrA));
const ScrB = dynamic(() => import("./ScrB").then((m) => m.ScrB));
const ArcA = dynamic(() => import("./ArcA").then((m) => m.ArcA));
const ArcB = dynamic(() => import("./ArcB").then((m) => m.ArcB));
const PhoA = dynamic(() => import("./PhoA").then((m) => m.PhoA));
const PhoB = dynamic(() => import("./PhoB").then((m) => m.PhoB));
const PatA = dynamic(() => import("./PatA").then((m) => m.PatA));
const PatB = dynamic(() => import("./PatB").then((m) => m.PatB));
const FamA = dynamic(() => import("./FamA").then((m) => m.FamA));
const FamB = dynamic(() => import("./FamB").then((m) => m.FamB));
const VisaA = dynamic(() => import("./VisaA").then((m) => m.VisaA));
const VisaB = dynamic(() => import("./VisaB").then((m) => m.VisaB));
const NhA = dynamic(() => import("./NhA").then((m) => m.NhA));
const NhB = dynamic(() => import("./NhB").then((m) => m.NhB));
const OptA = dynamic(() => import("./OptA").then((m) => m.OptA));
const OptB = dynamic(() => import("./OptB").then((m) => m.OptB));
const CarA = dynamic(() => import("./CarA").then((m) => m.CarA));
const CarB = dynamic(() => import("./CarB").then((m) => m.CarB));
const PiaA = dynamic(() => import("./PiaA").then((m) => m.PiaA));
const PiaB = dynamic(() => import("./PiaB").then((m) => m.PiaB));
const TkA = dynamic(() => import("./TkA").then((m) => m.TkA));
const TkB = dynamic(() => import("./TkB").then((m) => m.TkB));
const ArtA = dynamic(() => import("./ArtA").then((m) => m.ArtA));
const ArtB = dynamic(() => import("./ArtB").then((m) => m.ArtB));
const EngA = dynamic(() => import("./EngA").then((m) => m.EngA));
const EngB = dynamic(() => import("./EngB").then((m) => m.EngB));
const DrvA = dynamic(() => import("./DrvA").then((m) => m.DrvA));
const DrvB = dynamic(() => import("./DrvB").then((m) => m.DrvB));
const ReadA = dynamic(() => import("./ReadA").then((m) => m.ReadA));
const ReadB = dynamic(() => import("./ReadB").then((m) => m.ReadB));
const PhA = dynamic(() => import("./PhA").then((m) => m.PhA));
const PhB = dynamic(() => import("./PhB").then((m) => m.PhB));
const PenA = dynamic(() => import("./PenA").then((m) => m.PenA));
const PenB = dynamic(() => import("./PenB").then((m) => m.PenB));
const BkA = dynamic(() => import("./BkA").then((m) => m.BkA));
const BkB = dynamic(() => import("./BkB").then((m) => m.BkB));
const HkA = dynamic(() => import("./HkA").then((m) => m.HkA));
const HkB = dynamic(() => import("./HkB").then((m) => m.HkB));
const FwA = dynamic(() => import("./FwA").then((m) => m.FwA));
const FwB = dynamic(() => import("./FwB").then((m) => m.FwB));
const CwA = dynamic(() => import("./CwA").then((m) => m.CwA));
const CwB = dynamic(() => import("./CwB").then((m) => m.CwB));
const CpA = dynamic(() => import("./CpA").then((m) => m.CpA));
const CpB = dynamic(() => import("./CpB").then((m) => m.CpB));
const LtA = dynamic(() => import("./LtA").then((m) => m.LtA));
const LtB = dynamic(() => import("./LtB").then((m) => m.LtB));
const LqA = dynamic(() => import("./LqA").then((m) => m.LqA));
const LqB = dynamic(() => import("./LqB").then((m) => m.LqB));
const WdA = dynamic(() => import("./WdA").then((m) => m.WdA));
const WdB = dynamic(() => import("./WdB").then((m) => m.WdB));
const CeA = dynamic(() => import("./CeA").then((m) => m.CeA));
const CeB = dynamic(() => import("./CeB").then((m) => m.CeB));
const SaA = dynamic(() => import("./SaA").then((m) => m.SaA));
const SaB = dynamic(() => import("./SaB").then((m) => m.SaB));
const LgA = dynamic(() => import("./LgA").then((m) => m.LgA));
const LgB = dynamic(() => import("./LgB").then((m) => m.LgB));
const FoA = dynamic(() => import("./FoA").then((m) => m.FoA));
const FoB = dynamic(() => import("./FoB").then((m) => m.FoB));
const OsA = dynamic(() => import("./OsA").then((m) => m.OsA));
const OsB = dynamic(() => import("./OsB").then((m) => m.OsB));
const PsA = dynamic(() => import("./PsA").then((m) => m.PsA));
const PsB = dynamic(() => import("./PsB").then((m) => m.PsB));
const FxA = dynamic(() => import("./FxA").then((m) => m.FxA));
const FxB = dynamic(() => import("./FxB").then((m) => m.FxB));
const CoA = dynamic(() => import("./CoA").then((m) => m.CoA));
const CoB = dynamic(() => import("./CoB").then((m) => m.CoB));

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
  const v = useVariant("dental-homepage");
  // 11-25 연도별 시안(2026형, 2027형). 예약 기능 대신 3D 장면으로 차이를 둔다
  if (v === "2026") return <Dental2026 />;
  if (v === "2027-window") return <Dental2027Window />;
  return v === "b" ? (
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

export function OnlineStoreDrafts() {
  return useVariant("online-store") === "b" ? (
    <>
      <OsB />
      <QuickMenu accent="#9a5a33" cta="공방 문의" tel="031-000-0000" />
    </>
  ) : (
    <>
      <OsA />
      <QuickMenu accent="#1c1a17" cta="공방 문의" tel="031-000-0000" />
    </>
  );
}

export function PresaleDrafts() {
  return useVariant("presale") === "b" ? (
    <>
      <PsB />
      <QuickMenu accent="#a8874a" cta="분양문의" tel="1600-0000" />
    </>
  ) : (
    <>
      <PsA />
      <QuickMenu accent="#173a6b" cta="분양문의" tel="1600-0000" />
    </>
  );
}

export function FlowerExpoDrafts() {
  return useVariant("flower-expo") === "b" ? (
    <>
      <FxB />
      <QuickMenu accent="#d9412f" cta="축제 안내" tel="041-000-0000" />
    </>
  ) : (
    <>
      <FxA />
      <QuickMenu accent="#d6336c" cta="축제 안내" tel="031-000-0000" />
    </>
  );
}

export function CompanyDrafts() {
  return useVariant("company") === "b" ? (
    <>
      <CoB />
      <QuickMenu accent="#1b2f5e" cta="거래 문의" tel="031-000-0000" />
    </>
  ) : (
    <>
      <CoA />
      <QuickMenu accent="#10141c" cta="견적문의" tel="031-000-0000" />
    </>
  );
}
