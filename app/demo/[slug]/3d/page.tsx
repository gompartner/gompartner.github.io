import type { Metadata } from "next";
import type { ComponentType } from "react";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { allProjects as projects } from "@/data/projects";

// 11-02 키오스크 3D 체험(별도 주소). 기본 "체험하기"(/demo/<slug>)는 기능 중심 평면 화면이고, 여기서만 장소 무대 3D를 띄운다.
const KioskClinicDemo = dynamic(() => import("@/components/demos/KioskClinicDemo").then((m) => m.KioskClinicDemo));
const KioskAcademyDemo = dynamic(() => import("@/components/demos/KioskAcademyDemo").then((m) => m.KioskAcademyDemo));

const demos3d: Record<string, ComponentType<{ threeD?: boolean }>> = {
  "kiosk-clinic": KioskClinicDemo,
  "kiosk-academy": KioskAcademyDemo,
};

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return Object.keys(demos3d).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const demo = projects.find((p) => p.demoUrl === `/demo/${slug}`);
  if (!demo) return {};
  return {
    title: `${demo.title} 3D 체험`,
    alternates: { canonical: `/demo/${slug}` },
    robots: { index: false, follow: true },
  };
}

export default async function Demo3dPage({ params }: Props) {
  const { slug } = await params;
  const Demo = demos3d[slug];
  if (!Demo) notFound();
  return <Demo threeD />;
}
