import type { Metadata } from "next";
import type { ComponentType } from "react";
import { notFound } from "next/navigation";
import { projects } from "@/data/projects";
import { HomepageDemo } from "@/components/demos/HomepageDemo";
import { LandingDemo } from "@/components/demos/LandingDemo";
import { ReservationDemo } from "@/components/demos/ReservationDemo";
import { AdminDemo } from "@/components/demos/AdminDemo";
import { AutomationDemo } from "@/components/demos/AutomationDemo";
import { SaasLandingDemo } from "@/components/demos/SaasLandingDemo";

interface DemoPageProps {
  params: Promise<{ slug: string }>;
}

const demoComponents: Record<string, ComponentType> = {
  "small-business-homepage": HomepageDemo,
  "event-promotion-landing": LandingDemo,
  "reservation-inquiry-system": ReservationDemo,
  "operations-admin-dashboard": AdminDemo,
  "api-automation-hub": AutomationDemo,
  "saas-product-landing": SaasLandingDemo,
};

function findDemo(slug: string) {
  return projects.find((project) => project.demoUrl === `/demo/${slug}`);
}

export function generateStaticParams() {
  return projects
    .filter((project) => project.demoUrl?.startsWith("/demo/"))
    .map((project) => ({ slug: project.demoUrl?.replace("/demo/", "") ?? project.id }));
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
    // 체험용 샘플 페이지 — 검색 색인에서 제외하고 크롤은 핵심 페이지에 집중
    robots: { index: false, follow: true },
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
