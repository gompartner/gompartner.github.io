import type { Metadata } from "next";
import { Doodles } from "@/components/landing/Doodles";
import { SampleStackHero } from "@/components/landing/SampleStackHero";
import { projects } from "@/data/projects";
import { homeDescription, homeTitle } from "@/data/seo";
import { landingPlans, manwon } from "@/data/pricing";
import { HomeFaq } from "@/components/landing/HomeFaq";
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
  title: { absolute: homeTitle },
  description: homeDescription,
  alternates: { canonical: "/" },
};

// 첫 화면에 카드로 쌓아 넘겨 볼 샘플. 지금 집중하는 광고 신청 접수 랜딩만 둔다.
const heroTabs = [
  ["정수기 렌탈", "landing-water-rental"],
  ["입주청소", "landing-move-clean"],
  ["코딩 특강 모집", "landing-coding-camp"],
].map(([label, id]) => ({ label, project: projects.find((p) => p.id === id)! }));

// 포트폴리오 구간 6개. 배너(랜딩)와 겹치지 않게 홈페이지·업무 프로그램 사례로 고르고 전체는 /works에서 본다.
const showcaseIds = ["company", "cert-lab", "excel-automation", "shop-admin", "online-store", "dental-homepage"];
const showcase = showcaseIds.map((id) => projects.find((p) => p.id === id)!);

const promises = ["접수 즉시 알림", "구글 시트 상담 상태 기록", "광고별 신청·계약 집계", "원본 소스 제공"];


const container = "mx-auto w-full max-w-[1248px] px-4 md:px-6";
const h2 = "text-[24px] font-bold leading-[1.5] tracking-[-0.01em] md:text-[32px]";

export default function HomePage() {
  return (
    <>
      <SampleStackHero tabs={heroTabs} promises={promises} startPrice={`${manwon(landingPlans[0].price)}부터 · 작업 ${landingPlans[0].days}일`} />

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

      <PricingSection compact primary="landing" />
      <ProcessSteps />
      <HomeFaq />
    </>
  );
}
