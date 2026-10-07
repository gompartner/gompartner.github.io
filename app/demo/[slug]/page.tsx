import type { Metadata } from "next";
import type { ComponentType } from "react";
import { notFound } from "next/navigation";
import { projects } from "@/data/projects";
import { AccessibilityDemo } from "@/components/demos/AccessibilityDemo";
import { OnlineStoreDemo } from "@/components/demos/OnlineStoreDemo";
import { PensionDemo } from "@/components/demos/PensionDemo";
import { CompanyDemo } from "@/components/demos/CompanyDemo";
import { CertLabDemo } from "@/components/demos/CertLabDemo";
import { LawFirmDemo } from "@/components/demos/LawFirmDemo";
import { TaxOfficeDemo } from "@/components/demos/TaxOfficeDemo";
import { RealEstateDemo } from "@/components/demos/RealEstateDemo";
import { BakeryCafeDemo } from "@/components/demos/BakeryCafeDemo";
import { PharmacyDemo } from "@/components/demos/PharmacyDemo";
import { ApplicationDemo } from "@/components/demos/ApplicationDemo";
import { ClinicHomepageDemo } from "@/components/demos/ClinicHomepageDemo";
import { DentalHomepageDemo } from "@/components/demos/DentalHomepageDemo";
import { ClinicReportDemo } from "@/components/demos/ClinicReportDemo";
import { CommunityMapDemo } from "@/components/demos/CommunityMapDemo";
import { ExcelAutomationDemo } from "@/components/demos/ExcelAutomationDemo";
import { DistrictPortalDemo } from "@/components/demos/DistrictPortalDemo";
import { FlowerExpoDemo } from "@/components/demos/FlowerExpoDemo";
import { HanokCafeDemo } from "@/components/demos/HanokCafeDemo";
import { PilatesStudioDemo } from "@/components/demos/PilatesStudioDemo";
import { HomepageDemo } from "@/components/demos/HomepageDemo";
import { LmsDemo } from "@/components/demos/LmsDemo";
import { JobPortalDemo } from "@/components/demos/JobPortalDemo";
import { MaintenanceDemo } from "@/components/demos/MaintenanceDemo";
import { RetirementDemo } from "@/components/demos/RetirementDemo";
import { ShopAdminDemo } from "@/components/demos/ShopAdminDemo";

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
