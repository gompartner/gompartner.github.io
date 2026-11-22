import type { Metadata } from "next";
import type { ComponentType } from "react";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { liveProjects as projects, hiddenIds } from "@/data/projects";
import { VARIANTS } from "@/lib/variants";
import { fitDescription } from "@/lib/seo";

// 데모를 각각 따로 불러와, 데모 하나를 열 때 다른 데모 코드까지 받지 않게 한다.
const AccessibilityDemo = dynamic(() => import("@/components/demos/AccessibilityDemo").then((m) => m.AccessibilityDemo));
const OnlineStoreDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.OnlineStoreDrafts));
const PensionDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.PensionDrafts));
const CompanyDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.CompanyDrafts));
const CertLabDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.CertLabDrafts));
const LawFirmDrafts = dynamic(() => import("@/components/drafts/LawFirmDrafts").then((m) => m.LawFirmDrafts));
const TaxDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.TaxDrafts));
const EstateDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.EstateDrafts));
const BakeryCafeDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.BakeryCafeDrafts));
const PharmacyDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.PharmacyDrafts));
const ApplicationDemo = dynamic(() => import("@/components/demos/ApplicationDemo").then((m) => m.ApplicationDemo));
const SkinDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.SkinDrafts));
const DentalDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.DentalDrafts));
const ClinicReportDemo = dynamic(() => import("@/components/demos/ClinicReportDemo").then((m) => m.ClinicReportDemo));
const CommunityMapDemo = dynamic(() => import("@/components/demos/CommunityMapDemo").then((m) => m.CommunityMapDemo));
const ExcelAutomationDemo = dynamic(() => import("@/components/demos/ExcelAutomationDemo").then((m) => m.ExcelAutomationDemo));
const DistrictPortalDemo = dynamic(() => import("@/components/demos/DistrictPortalDemo").then((m) => m.DistrictPortalDemo));
const FlowerExpoDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.FlowerExpoDrafts));
const HanokCafeDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.HanokCafeDrafts));
const FoodDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.FoodDrafts));
const InteriorDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.InteriorDrafts));
const AcademyDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.AcademyDrafts));
const PilatesDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.PilatesDrafts));
const HomepageDemo = dynamic(() => import("@/components/demos/HomepageDemo").then((m) => m.HomepageDemo));
const LmsDemo = dynamic(() => import("@/components/demos/LmsDemo").then((m) => m.LmsDemo));
const JobPortalDemo = dynamic(() => import("@/components/demos/JobPortalDemo").then((m) => m.JobPortalDemo));
const MaintenanceDemo = dynamic(() => import("@/components/demos/MaintenanceDemo").then((m) => m.MaintenanceDemo));
const RetirementDemo = dynamic(() => import("@/components/demos/RetirementDemo").then((m) => m.RetirementDemo));
const LandingCodingCampDrafts = dynamic(() => import("@/components/drafts/LandingDrafts").then((m) => m.LandingCodingCampDrafts));
const LandingMoveCleanDrafts = dynamic(() => import("@/components/drafts/LandingDrafts").then((m) => m.LandingMoveCleanDrafts));
const LandingPopupStoreDrafts = dynamic(() => import("@/components/drafts/LandingDrafts").then((m) => m.LandingPopupStoreDrafts));
const LandingStampTourDemo = dynamic(() => import("@/components/demos/LandingStampTourDemo").then((m) => m.LandingStampTourDemo));
const LandingZineFairDrafts = dynamic(() => import("@/components/drafts/LandingDrafts").then((m) => m.LandingZineFairDrafts));
const LandingLeatherClassDrafts = dynamic(() => import("@/components/drafts/LandingDrafts").then((m) => m.LandingLeatherClassDrafts));
const MaintenanceUrgentFixDemo = dynamic(() => import("@/components/demos/MaintenanceUrgentFixDemo").then((m) => m.MaintenanceUrgentFixDemo));
const AppAcademyDemo = dynamic(() => import("@/components/demos/AppAcademyDemo").then((m) => m.AppAcademyDemo));
const AppPilatesDemo = dynamic(() => import("@/components/demos/AppPilatesDemo").then((m) => m.AppPilatesDemo));
const KioskClinicDemo = dynamic(() => import("@/components/demos/KioskClinicDemo").then((m) => m.KioskClinicDemo));
const KioskAcademyDemo = dynamic(() => import("@/components/demos/KioskAcademyDemo").then((m) => m.KioskAcademyDemo));
const LandingWaterRentalDrafts = dynamic(() => import("@/components/drafts/LandingDrafts").then((m) => m.LandingWaterRentalDrafts));
const ShopAdminDemo = dynamic(() => import("@/components/demos/ShopAdminDemo").then((m) => m.ShopAdminDemo));
const CoffeeDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.CoffeeDrafts));
const HairDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.HairDrafts));
const OpticalDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.OpticalDrafts));
const FurnitureWorkshopDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.FurnitureWorkshopDrafts));
const CoworkingDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.CoworkingDrafts));
const CampsiteDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.CampsiteDrafts));
const PhotoStudioDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.PhotoStudioDrafts));
const NailDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.NailDrafts));
const CarDetailingDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.CarDetailingDrafts));
const LightingShopDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.LightingShopDrafts));
const LiquorShopDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.LiquorShopDrafts));
const SmallWeddingDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.SmallWeddingDrafts));
const KmDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.KmDrafts));
const OrthoDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.OrthoDrafts));
const PedDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.PedDrafts));
const EyeDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.EyeDrafts));
const VetDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.VetDrafts));
const NursingDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.NursingDrafts));
const LaborDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.LaborDrafts));
const ScrivenerDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.ScrivenerDrafts));
const PatentDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.PatentDrafts));
const FamilyLawDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.FamilyLawDrafts));
const VisaDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.VisaDrafts));
const ArchitectDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.ArchitectDrafts));
const PresaleDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.PresaleDrafts));
const SaasDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.SaasDrafts));
const LogisticsDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.LogisticsDrafts));
const FoodOemDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.FoodOemDrafts));
const PianoDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.PianoDrafts));
const TaekwondoDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.TaekwondoDrafts));
const ArtAcademyDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.ArtAcademyDrafts));
const EnglishTalkDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.EnglishTalkDrafts));
const DrivingSchoolDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.DrivingSchoolDrafts));
const ReadingAcademyDrafts = dynamic(() => import("@/components/drafts/Drafts").then((m) => m.ReadingAcademyDrafts));

interface DemoPageProps {
  params: Promise<{ slug: string }>;
}

const demoComponents: Record<string, ComponentType> = {
  "clinic-report": ClinicReportDemo,
  "clinic-homepage": SkinDrafts,
  "dental-homepage": DentalDrafts,
  "hanok-cafe": HanokCafeDrafts,
  "korean-restaurant": FoodDrafts,
  interior: InteriorDrafts,
  academy: AcademyDrafts,
  "pilates-studio": PilatesDrafts,
  "flower-expo": FlowerExpoDrafts,
  "bakery-cafe": BakeryCafeDrafts,
  "app-academy": AppAcademyDemo,
  "app-pilates": AppPilatesDemo,
  "kiosk-clinic": KioskClinicDemo,
  "kiosk-academy": KioskAcademyDemo,
  "landing-water-rental": LandingWaterRentalDrafts,
  "landing-coding-camp": LandingCodingCampDrafts,
  "landing-move-clean": LandingMoveCleanDrafts,
  "landing-popup-store": LandingPopupStoreDrafts,
  "landing-stamp-tour": LandingStampTourDemo,
  "landing-zine-fair": LandingZineFairDrafts,
  "landing-leather-class": LandingLeatherClassDrafts,
  pharmacy: PharmacyDrafts,
  "online-store": OnlineStoreDrafts,
  pension: PensionDrafts,
  company: CompanyDrafts,
  "cert-lab": CertLabDrafts,
  "law-firm": LawFirmDrafts,
  "tax-office": TaxDrafts,
  "real-estate": EstateDrafts,
  "community-map": CommunityMapDemo,
  "program-application": ApplicationDemo,
  "maintenance-dashboard": MaintenanceDemo,
  "maintenance-urgent-fix": MaintenanceUrgentFixDemo,
  "retirement-calculator": RetirementDemo,
  "job-portal": JobPortalDemo,
  "accessibility-review": AccessibilityDemo,
  "district-portal": DistrictPortalDemo,
  "small-business-homepage": HomepageDemo,
  "shop-admin": ShopAdminDemo,
  "excel-automation": ExcelAutomationDemo,
  lms: LmsDemo,
  "roastery": CoffeeDrafts,
  "hair-salon": HairDrafts,
  "optical": OpticalDrafts,
  "furniture-workshop": FurnitureWorkshopDrafts,
  "coworking": CoworkingDrafts,
  "campsite": CampsiteDrafts,
  "photo-studio": PhotoStudioDrafts,
  "nail-shop": NailDrafts,
  "car-detailing": CarDetailingDrafts,
  "lighting-shop": LightingShopDrafts,
  "liquor-shop": LiquorShopDrafts,
  "small-wedding": SmallWeddingDrafts,
  "korean-medicine": KmDrafts,
  "orthopedics": OrthoDrafts,
  "pediatrics": PedDrafts,
  "eye-clinic": EyeDrafts,
  "animal-hospital": VetDrafts,
  "nursing-hospital": NursingDrafts,
  "labor-firm": LaborDrafts,
  "scrivener": ScrivenerDrafts,
  "patent-office": PatentDrafts,
  "family-law": FamilyLawDrafts,
  "visa-agent": VisaDrafts,
  "architect-office": ArchitectDrafts,
  "presale": PresaleDrafts,
  "saas-startup": SaasDrafts,
  "logistics": LogisticsDrafts,
  "food-oem": FoodOemDrafts,
  "piano-academy": PianoDrafts,
  "taekwondo": TaekwondoDrafts,
  "art-academy": ArtAcademyDrafts,
  "english-talk": EnglishTalkDrafts,
  "driving-school": DrivingSchoolDrafts,
  "reading-academy": ReadingAcademyDrafts,
};

function findDemo(slug: string) {
  return projects.find((project) => project.demoUrl === `/work/${slug}`);
}

export function generateStaticParams() {
  return projects
    .filter((project) => project.demoUrl.startsWith("/work/"))
    .map((project) => ({ slug: project.demoUrl.replace("/work/", "") }));
}

export async function generateMetadata({ params }: DemoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const demo = findDemo(slug);

  if (!demo) {
    return {
      title: "데모를 찾을 수 없습니다",
    };
  }

  // "치과 홈페이지 제작 카탈로그"처럼 사장님이 찾는 말로 제목을 짓는다. 금액과 기간은 싣지 않는다(10-30).
  // 11-22 제목 규칙: 시안이 둘이면 "OO 시안", 앱, 키오스크는 "OO 체험"(뒤에 "| 곰파트너")
  const title = `${demo.title} ${(VARIANTS[slug]?.length ?? 0) >= 2 ? "시안" : "체험"}`;
  const description = fitDescription(demo.description);
  return {
    title,
    description,
    alternates: { canonical: `/work/${slug}` },
    // 데모는 가짜 상호가 든 화면이라 검색에서 빼고, 소개 페이지(/sample)로 검색 유입을 모은다.
    robots: hiddenIds.has(demo.id) ? { index: false, follow: false } : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url: `/work/${slug}`,
      images: [{ url: `/og/${slug}.jpg`, width: 1200, height: 630, alt: `${demo.title} 첫 화면` }],
    },
    twitter: { card: "summary_large_image", images: [`/og/${slug}.jpg`] },
  };
}

export default async function DemoPage({ params }: DemoPageProps) {
  const { slug } = await params;
  const Demo = demoComponents[slug];

  if (!Demo || !findDemo(slug)) {
    notFound();
  }

  return <Demo />;
}
