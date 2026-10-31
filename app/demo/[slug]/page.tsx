import type { Metadata } from "next";
import type { ComponentType } from "react";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { allProjects as projects, hiddenIds } from "@/data/projects";
import { fitDescription } from "@/lib/seo";

// 데모를 각각 따로 불러와, 데모 하나를 열 때 다른 데모 코드까지 받지 않게 한다.
const AccessibilityDemo = dynamic(() => import("@/components/demos/AccessibilityDemo").then((m) => m.AccessibilityDemo));
const OnlineStoreDemo = dynamic(() => import("@/components/demos/OnlineStoreDemo").then((m) => m.OnlineStoreDemo));
const PensionDemo = dynamic(() => import("@/components/demos/PensionDemo").then((m) => m.PensionDemo));
const CompanyDemo = dynamic(() => import("@/components/demos/CompanyDemo").then((m) => m.CompanyDemo));
const CertLabDemo = dynamic(() => import("@/components/demos/CertLabDemo").then((m) => m.CertLabDemo));
const LawFirmDemo = dynamic(() => import("@/components/demos/LawFirmDemo").then((m) => m.LawFirmDemo));
const TaxOfficeDemo = dynamic(() => import("@/components/demos/TaxOfficeDemo").then((m) => m.TaxOfficeDemo));
const RealEstateDemo = dynamic(() => import("@/components/demos/RealEstateDemo").then((m) => m.RealEstateDemo));
const BakeryCafeDemo = dynamic(() => import("@/components/demos/BakeryCafeDemo").then((m) => m.BakeryCafeDemo));
const PharmacyDemo = dynamic(() => import("@/components/demos/PharmacyDemo").then((m) => m.PharmacyDemo));
const ApplicationDemo = dynamic(() => import("@/components/demos/ApplicationDemo").then((m) => m.ApplicationDemo));
const ClinicHomepageDemo = dynamic(() => import("@/components/demos/ClinicHomepageDemo").then((m) => m.ClinicHomepageDemo));
const DentalHomepageDemo = dynamic(() => import("@/components/demos/DentalHomepageDemo").then((m) => m.DentalHomepageDemo));
const ClinicReportDemo = dynamic(() => import("@/components/demos/ClinicReportDemo").then((m) => m.ClinicReportDemo));
const CommunityMapDemo = dynamic(() => import("@/components/demos/CommunityMapDemo").then((m) => m.CommunityMapDemo));
const ExcelAutomationDemo = dynamic(() => import("@/components/demos/ExcelAutomationDemo").then((m) => m.ExcelAutomationDemo));
const DistrictPortalDemo = dynamic(() => import("@/components/demos/DistrictPortalDemo").then((m) => m.DistrictPortalDemo));
const FlowerExpoDemo = dynamic(() => import("@/components/demos/FlowerExpoDemo").then((m) => m.FlowerExpoDemo));
const HanokCafeDemo = dynamic(() => import("@/components/demos/HanokCafeDemo").then((m) => m.HanokCafeDemo));
const KoreanRestaurantDemo = dynamic(() => import("@/components/demos/KoreanRestaurantDemo").then((m) => m.KoreanRestaurantDemo));
const InteriorDemo = dynamic(() => import("@/components/demos/InteriorDemo").then((m) => m.InteriorDemo));
const AcademyDemo = dynamic(() => import("@/components/demos/AcademyDemo").then((m) => m.AcademyDemo));
const PilatesStudioDemo = dynamic(() => import("@/components/demos/PilatesStudioDemo").then((m) => m.PilatesStudioDemo));
const HomepageDemo = dynamic(() => import("@/components/demos/HomepageDemo").then((m) => m.HomepageDemo));
const LmsDemo = dynamic(() => import("@/components/demos/LmsDemo").then((m) => m.LmsDemo));
const JobPortalDemo = dynamic(() => import("@/components/demos/JobPortalDemo").then((m) => m.JobPortalDemo));
const MaintenanceDemo = dynamic(() => import("@/components/demos/MaintenanceDemo").then((m) => m.MaintenanceDemo));
const RetirementDemo = dynamic(() => import("@/components/demos/RetirementDemo").then((m) => m.RetirementDemo));
const LandingCodingCampDemo = dynamic(() => import("@/components/demos/LandingCodingCampDemo").then((m) => m.LandingCodingCampDemo));
const LandingMoveCleanDemo = dynamic(() => import("@/components/demos/LandingMoveCleanDemo").then((m) => m.LandingMoveCleanDemo));
const LandingPopupStoreDemo = dynamic(() => import("@/components/demos/LandingPopupStoreDemo").then((m) => m.LandingPopupStoreDemo));
const LandingStampTourDemo = dynamic(() => import("@/components/demos/LandingStampTourDemo").then((m) => m.LandingStampTourDemo));
const LandingZineFairDemo = dynamic(() => import("@/components/demos/LandingZineFairDemo").then((m) => m.LandingZineFairDemo));
const LandingLeatherClassDemo = dynamic(() => import("@/components/demos/LandingLeatherClassDemo").then((m) => m.LandingLeatherClassDemo));
const MaintenanceUrgentFixDemo = dynamic(() => import("@/components/demos/MaintenanceUrgentFixDemo").then((m) => m.MaintenanceUrgentFixDemo));
const LandingWaterRentalDemo = dynamic(() => import("@/components/demos/LandingWaterRentalDemo").then((m) => m.LandingWaterRentalDemo));
const ShopAdminDemo = dynamic(() => import("@/components/demos/ShopAdminDemo").then((m) => m.ShopAdminDemo));
const RoasteryDemo = dynamic(() => import("@/components/demos/RoasteryDemo").then((m) => m.RoasteryDemo));
const HairSalonDemo = dynamic(() => import("@/components/demos/HairSalonDemo").then((m) => m.HairSalonDemo));
const OpticalDemo = dynamic(() => import("@/components/demos/OpticalDemo").then((m) => m.OpticalDemo));
const FurnitureWorkshopDemo = dynamic(() => import("@/components/demos/FurnitureWorkshopDemo").then((m) => m.FurnitureWorkshopDemo));
const CoworkingDemo = dynamic(() => import("@/components/demos/CoworkingDemo").then((m) => m.CoworkingDemo));
const CampsiteDemo = dynamic(() => import("@/components/demos/CampsiteDemo").then((m) => m.CampsiteDemo));
const PhotoStudioDemo = dynamic(() => import("@/components/demos/PhotoStudioDemo").then((m) => m.PhotoStudioDemo));
const NailShopDemo = dynamic(() => import("@/components/demos/NailShopDemo").then((m) => m.NailShopDemo));
const CarDetailingDemo = dynamic(() => import("@/components/demos/CarDetailingDemo").then((m) => m.CarDetailingDemo));
const LightingShopDemo = dynamic(() => import("@/components/demos/LightingShopDemo").then((m) => m.LightingShopDemo));
const LiquorShopDemo = dynamic(() => import("@/components/demos/LiquorShopDemo").then((m) => m.LiquorShopDemo));
const SmallWeddingDemo = dynamic(() => import("@/components/demos/SmallWeddingDemo").then((m) => m.SmallWeddingDemo));
const KoreanMedicineDemo = dynamic(() => import("@/components/demos/KoreanMedicineDemo").then((m) => m.KoreanMedicineDemo));
const OrthopedicsDemo = dynamic(() => import("@/components/demos/OrthopedicsDemo").then((m) => m.OrthopedicsDemo));
const PediatricsDemo = dynamic(() => import("@/components/demos/PediatricsDemo").then((m) => m.PediatricsDemo));
const EyeClinicDemo = dynamic(() => import("@/components/demos/EyeClinicDemo").then((m) => m.EyeClinicDemo));
const AnimalHospitalDemo = dynamic(() => import("@/components/demos/AnimalHospitalDemo").then((m) => m.AnimalHospitalDemo));
const NursingHospitalDemo = dynamic(() => import("@/components/demos/NursingHospitalDemo").then((m) => m.NursingHospitalDemo));
const LaborFirmDemo = dynamic(() => import("@/components/demos/LaborFirmDemo").then((m) => m.LaborFirmDemo));
const ScrivenerDemo = dynamic(() => import("@/components/demos/ScrivenerDemo").then((m) => m.ScrivenerDemo));
const PatentOfficeDemo = dynamic(() => import("@/components/demos/PatentOfficeDemo").then((m) => m.PatentOfficeDemo));
const FamilyLawDemo = dynamic(() => import("@/components/demos/FamilyLawDemo").then((m) => m.FamilyLawDemo));
const VisaAgentDemo = dynamic(() => import("@/components/demos/VisaAgentDemo").then((m) => m.VisaAgentDemo));
const ArchitectDemo = dynamic(() => import("@/components/demos/ArchitectDemo").then((m) => m.ArchitectDemo));
const PresaleDemo = dynamic(() => import("@/components/demos/PresaleDemo").then((m) => m.PresaleDemo));
const SaasDemo = dynamic(() => import("@/components/demos/SaasDemo").then((m) => m.SaasDemo));
const LogisticsDemo = dynamic(() => import("@/components/demos/LogisticsDemo").then((m) => m.LogisticsDemo));
const FoodOemDemo = dynamic(() => import("@/components/demos/FoodOemDemo").then((m) => m.FoodOemDemo));
const PianoAcademyDemo = dynamic(() => import("@/components/demos/PianoAcademyDemo").then((m) => m.PianoAcademyDemo));
const TaekwondoDemo = dynamic(() => import("@/components/demos/TaekwondoDemo").then((m) => m.TaekwondoDemo));
const ArtAcademyDemo = dynamic(() => import("@/components/demos/ArtAcademyDemo").then((m) => m.ArtAcademyDemo));
const EnglishTalkDemo = dynamic(() => import("@/components/demos/EnglishTalkDemo").then((m) => m.EnglishTalkDemo));
const DrivingSchoolDemo = dynamic(() => import("@/components/demos/DrivingSchoolDemo").then((m) => m.DrivingSchoolDemo));
const ReadingAcademyDemo = dynamic(() => import("@/components/demos/ReadingAcademyDemo").then((m) => m.ReadingAcademyDemo));

interface DemoPageProps {
  params: Promise<{ slug: string }>;
}

const demoComponents: Record<string, ComponentType> = {
  "clinic-report": ClinicReportDemo,
  "clinic-homepage": ClinicHomepageDemo,
  "dental-homepage": DentalHomepageDemo,
  "hanok-cafe": HanokCafeDemo,
  "korean-restaurant": KoreanRestaurantDemo,
  interior: InteriorDemo,
  academy: AcademyDemo,
  "pilates-studio": PilatesStudioDemo,
  "flower-expo": FlowerExpoDemo,
  "bakery-cafe": BakeryCafeDemo,
  "landing-water-rental": LandingWaterRentalDemo,
  "landing-coding-camp": LandingCodingCampDemo,
  "landing-move-clean": LandingMoveCleanDemo,
  "landing-popup-store": LandingPopupStoreDemo,
  "landing-stamp-tour": LandingStampTourDemo,
  "landing-zine-fair": LandingZineFairDemo,
  "landing-leather-class": LandingLeatherClassDemo,
  pharmacy: PharmacyDemo,
  "online-store": OnlineStoreDemo,
  pension: PensionDemo,
  company: CompanyDemo,
  "cert-lab": CertLabDemo,
  "law-firm": LawFirmDemo,
  "tax-office": TaxOfficeDemo,
  "real-estate": RealEstateDemo,
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
  "roastery": RoasteryDemo,
  "hair-salon": HairSalonDemo,
  "optical": OpticalDemo,
  "furniture-workshop": FurnitureWorkshopDemo,
  "coworking": CoworkingDemo,
  "campsite": CampsiteDemo,
  "photo-studio": PhotoStudioDemo,
  "nail-shop": NailShopDemo,
  "car-detailing": CarDetailingDemo,
  "lighting-shop": LightingShopDemo,
  "liquor-shop": LiquorShopDemo,
  "small-wedding": SmallWeddingDemo,
  "korean-medicine": KoreanMedicineDemo,
  "orthopedics": OrthopedicsDemo,
  "pediatrics": PediatricsDemo,
  "eye-clinic": EyeClinicDemo,
  "animal-hospital": AnimalHospitalDemo,
  "nursing-hospital": NursingHospitalDemo,
  "labor-firm": LaborFirmDemo,
  "scrivener": ScrivenerDemo,
  "patent-office": PatentOfficeDemo,
  "family-law": FamilyLawDemo,
  "visa-agent": VisaAgentDemo,
  "architect-office": ArchitectDemo,
  "presale": PresaleDemo,
  "saas-startup": SaasDemo,
  "logistics": LogisticsDemo,
  "food-oem": FoodOemDemo,
  "piano-academy": PianoAcademyDemo,
  "taekwondo": TaekwondoDemo,
  "art-academy": ArtAcademyDemo,
  "english-talk": EnglishTalkDemo,
  "driving-school": DrivingSchoolDemo,
  "reading-academy": ReadingAcademyDemo,
};

function findDemo(slug: string) {
  return projects.find((project) => project.demoUrl === `/demo/${slug}`);
}

export function generateStaticParams() {
  return projects
    .filter((project) => project.demoUrl.startsWith("/demo/"))
    .map((project) => ({ slug: project.demoUrl.replace("/demo/", "") }));
}

export async function generateMetadata({ params }: DemoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const demo = findDemo(slug);

  if (!demo) {
    return {
      title: "데모를 찾을 수 없습니다",
    };
  }

  // "치과 홈페이지 제작 샘플"처럼 사장님이 찾는 말로 제목을 짓는다. 금액과 기간은 싣지 않는다(10-30).
  const title = `${demo.title}${/(홈페이지|쇼핑몰)$/.test(demo.title) ? " 제작" : ""} 샘플`;
  const description = fitDescription(demo.description);
  return {
    title,
    description,
    alternates: { canonical: `/demo/${slug}` },
    // 데모는 가짜 상호가 든 화면이라 검색에서 빼고, 소개 페이지(/sample)로 검색 유입을 모은다.
    robots: hiddenIds.has(demo.id) ? { index: false, follow: false } : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url: `/demo/${slug}`,
      images: [{ url: `/og/${slug}.png`, width: 1200, height: 630, alt: `${demo.title} 첫 화면` }],
    },
    twitter: { card: "summary_large_image", images: [`/og/${slug}.png`] },
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
