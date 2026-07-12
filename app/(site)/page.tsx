import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { StatsBar } from "@/components/home/StatsBar";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import { DemoShowcase } from "@/components/home/DemoShowcase";
import { Differentiators } from "@/components/home/Differentiators";
import { ProcessTimeline } from "@/components/home/ProcessTimeline";
import { Faq } from "@/components/home/Faq";
import { CtaBand } from "@/components/home/CtaBand";
import { FaqJsonLd } from "@/components/seo/JsonLd";
import { profile } from "@/data/profile";

export const metadata: Metadata = {
  title: `${profile.name} — 사업에 필요한 웹사이트, 빠르게 만들고 오래 운영합니다`,
  description:
    "소상공인·1인 사업자를 위한 홈페이지, 랜딩페이지, 예약·관리 시스템 제작. AI를 적극 활용하는 15년차 운영 개발자가 제작부터 유지보수, 자동화, SEO까지 함께합니다.",
};

export default function HomePage() {
  return (
    <>
      <FaqJsonLd />
      <Hero />
      <StatsBar />
      <ServicesGrid />
      <DemoShowcase />
      <Differentiators />
      <ProcessTimeline />
      <Faq />
      <CtaBand />
    </>
  );
}
