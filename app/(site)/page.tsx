import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { Statement } from "@/components/home/Statement";
import { PainPoints } from "@/components/home/PainPoints";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import { DemoShowcase } from "@/components/home/DemoShowcase";
import { Differentiators } from "@/components/home/Differentiators";
import { ProcessTimeline } from "@/components/home/ProcessTimeline";
import { PricingGuide } from "@/components/home/PricingGuide";
import { Faq } from "@/components/home/Faq";
import { CtaBand } from "@/components/home/CtaBand";
import { FaqJsonLd } from "@/components/seo/JsonLd";
import { profile } from "@/data/profile";

export const metadata: Metadata = {
  // 루트 템플릿(`%s | 곰선임`)이 브랜드를 또 붙이지 않도록 absolute 사용
  title: {
    absolute: `홈페이지 제작·랜딩페이지 제작 — ${profile.name} | 만들고 오래 운영합니다`,
  },
  description:
    "홈페이지 제작, 랜딩페이지 제작, 예약·관리 시스템까지. 소상공인·1인 사업자를 위해 제작부터 유지보수, 검색 노출까지 직접 챙깁니다. 상담과 견적은 무료입니다.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <FaqJsonLd />
      <Hero />
      <Statement />
      <PainPoints />
      <ServicesGrid />
      <Differentiators />
      <ProcessTimeline />
      <DemoShowcase />
      <PricingGuide />
      <Faq />
      <CtaBand />
    </>
  );
}
