import type { Metadata } from "next";
import type { ComponentType } from "react";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { projects } from "@/data/projects";

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
const PilatesStudioDemo = dynamic(() => import("@/components/demos/PilatesStudioDemo").then((m) => m.PilatesStudioDemo));
const HomepageDemo = dynamic(() => import("@/components/demos/HomepageDemo").then((m) => m.HomepageDemo));
const LmsDemo = dynamic(() => import("@/components/demos/LmsDemo").then((m) => m.LmsDemo));
const JobPortalDemo = dynamic(() => import("@/components/demos/JobPortalDemo").then((m) => m.JobPortalDemo));
const MaintenanceDemo = dynamic(() => import("@/components/demos/MaintenanceDemo").then((m) => m.MaintenanceDemo));
const RetirementDemo = dynamic(() => import("@/components/demos/RetirementDemo").then((m) => m.RetirementDemo));
const ShopAdminDemo = dynamic(() => import("@/components/demos/ShopAdminDemo").then((m) => m.ShopAdminDemo));

interface DemoPageProps {
  params: Promise<{ slug: string }>;
}

const demoComponents: Record<string, ComponentType> = {
  "clinic-report": ClinicReportDemo,
  "clinic-homepage": ClinicHomepageDemo,
  "dental-homepage": DentalHomepageDemo,
  "hanok-cafe": HanokCafeDemo,
  "pilates-studio": PilatesStudioDemo,
  "flower-expo": FlowerExpoDemo,
  "bakery-cafe": BakeryCafeDemo,
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
  "retirement-calculator": RetirementDemo,
  "job-portal": JobPortalDemo,
  "accessibility-review": AccessibilityDemo,
  "district-portal": DistrictPortalDemo,
  "small-business-homepage": HomepageDemo,
  "shop-admin": ShopAdminDemo,
  "excel-automation": ExcelAutomationDemo,
  lms: LmsDemo,
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

  return {
    title: `${demo.title} | 데모`,
    description: demo.description,
    alternates: { canonical: `/demo/${slug}` },
    openGraph: {
      title: `${demo.title} | 데모`,
      description: demo.description,
      url: `/demo/${slug}`,
      images: [{ url: `/og/${slug}.png`, width: 1200, height: 630, alt: `${demo.title} 데모 화면` }],
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
