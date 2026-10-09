import type { Metadata } from "next";
import { Doodles } from "@/components/landing/Doodles";
import { BrowserHero } from "@/components/landing/BrowserHero";
import { projects } from "@/data/projects";
import { profile } from "@/data/profile";
import { PricingSection } from "@/components/landing/PricingSection";
import { ProcessSteps } from "@/components/landing/ProcessSteps";
import { WorksGrid } from "@/components/landing/WorksGrid";
import Link from "next/link";

// KRDS(범정부 디자인 시스템) 기준 원페이지 랜딩.
// 서체 Pretendard, 굵기 400/700, 행간 1.5 이상, 본문 17px,
// 타입 스케일 Display M 44/32 · Heading L 32/24 · Body L 19 · Body S 15,
// 최대 폭 1200px, 화면 여백 16/24px, 버튼·입력 radius 6px, 카드 10px.

export const metadata: Metadata = {
  // 루트 템플릿(`%s | 곰파트너`)이 브랜드를 또 붙이지 않도록 absolute 사용
  title: {
    absolute: `홈페이지·업무 프로그램 제작 | ${profile.name}`,
  },
  description:
    "쇼핑몰, 펜션, 회사, 병원 홈페이지와 업무 프로그램을 직접 만듭니다. 원본 소스를 제공하고 완료 후 1개월 동안 오류를 무상으로 수정합니다.",
  alternates: { canonical: "/" },
};

// 첫 화면 브라우저 창에 탭으로 띄울 데모. 크몽 판매량 순(쇼핑몰, 숙박, 기업, 병원, 전문직)에 동네 가게 하나.
const heroTabs = [
  ["쇼핑몰", "online-store"],
  ["펜션", "pension"],
  ["회사", "company"],
  ["치과", "dental-homepage"],
  ["법률사무소", "law-firm"],
  ["빵집", "bakery-cafe"],
].map(([label, id]) => ({ label, project: projects.find((p) => p.id === id)! }));

// 포트폴리오 구간에 보여 줄 6개. 배너와 겹치지 않게 다른 업종으로 고르고 전체는 /works에서 본다.
const showcaseIds = ["pharmacy", "tax-office", "real-estate", "clinic-homepage", "hanok-cafe", "pilates-studio"];
const showcase = showcaseIds.map((id) => projects.find((p) => p.id === id)!);

const promises = ["1인 개발자가 직접 제작", "원본 소스 제공", "완료 후 1개월 무상 오류 수정"];


const container = "mx-auto w-full max-w-[1248px] px-4 md:px-6";
const h2 = "text-[24px] font-bold leading-[1.5] tracking-[-0.01em] md:text-[32px]";

export default function HomePage() {
  return (
    <>
      <BrowserHero tabs={heroTabs} promises={promises} />

      <section id="works" aria-labelledby="works-title" className="relative isolate scroll-mt-16 overflow-hidden">
        <Doodles variant={1} />
        <div className={`${container} py-16 md:py-24`}>
          <div className="flex items-end justify-between gap-4">
            <h2 id="works-title" className={h2}>
              포트폴리오
            </h2>
            <Link href="/works" data-gtm-cta="works_all" className="shrink-0 text-[16px] font-bold text-foreground-secondary underline-offset-4 hover:text-accent hover:underline md:text-[17px]">
              전체 보기 {projects.length}건
            </Link>
          </div>

          <div className="mt-8">
            <WorksGrid projects={showcase} />
          </div>
        </div>
      </section>

      <PricingSection compact />
      <ProcessSteps />
    </>
  );
}
