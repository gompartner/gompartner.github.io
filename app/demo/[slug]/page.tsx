import type { Metadata } from "next";
import type { ComponentType } from "react";
import { notFound } from "next/navigation";
import { projects } from "@/data/projects";
import { AccessibilityDemo } from "@/components/demos/AccessibilityDemo";
import { ApplicationDemo } from "@/components/demos/ApplicationDemo";
import { ClinicHomepageDemo } from "@/components/demos/ClinicHomepageDemo";
import { ClinicReportDemo } from "@/components/demos/ClinicReportDemo";
import { CommunityMapDemo } from "@/components/demos/CommunityMapDemo";
import { DistrictPortalDemo } from "@/components/demos/DistrictPortalDemo";
import { HomepageDemo } from "@/components/demos/HomepageDemo";
import { JobPortalDemo } from "@/components/demos/JobPortalDemo";
import { MaintenanceDemo } from "@/components/demos/MaintenanceDemo";
import { RetirementDemo } from "@/components/demos/RetirementDemo";

interface DemoPageProps {
  params: Promise<{ slug: string }>;
}

const demoComponents: Record<string, ComponentType> = {
  "clinic-report": ClinicReportDemo,
  "clinic-homepage": ClinicHomepageDemo,
  "community-map": CommunityMapDemo,
  "program-application": ApplicationDemo,
  "maintenance-dashboard": MaintenanceDemo,
  "retirement-calculator": RetirementDemo,
  "job-portal": JobPortalDemo,
  "accessibility-review": AccessibilityDemo,
  "district-portal": DistrictPortalDemo,
  "small-business-homepage": HomepageDemo,
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
