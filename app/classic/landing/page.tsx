import type { Metadata } from "next";
import Link from "next/link";
import { Check, ChevronDown, ChevronRight } from "lucide-react";
import { ClassicOwnerPreview } from "@/components/classic/landing/ClassicOwnerPreview";
import { PlanTable } from "@/components/classic/pricing/PlanTable";
import { StepList } from "@/components/classic/pricing/StepList";
import { serviceTabs } from "@/components/classic/pricing/tabs";
import { PageHead, SubTabs, h2, more, wrap } from "@/components/classic/ui";
import { SampleGrid } from "@/components/classic/works/SampleGrid";
import { samplesIn } from "@/components/classic/works/samples";
import { processSteps } from "@/data/classic/faq";
import { landingPlans } from "@/data/classic/pricing";
import { fitDescription } from "@/lib/seo";

// 광고 랜딩페이지 서비스 상세. 홈페이지 제작, 업무 프로그램, 유지보수 페이지와 같은 틀(페이지 머리, 서비스 탭, 한 줄 소개, 구획)을 쓴다(10-30).
// metadata는 /landing과 같다(검색 제외는 레이아웃이 한다).
export const metadata: Metadata = {
  title: { absolute: "광고 신청 접수 랜딩페이지 제작 | 곰파트너" },
  description: fitDescription("광고 유입 고객의 상담 신청을 접수하는 랜딩페이지 제작. 접수 즉시 알림, 구글 시트 기록, 광고 채널별 성과 집계를 제공합니다."),
  alternates: { canonical: "/landing" },
  openGraph: {
    title: "광고 신청 접수 랜딩페이지 제작",
    url: "/landing",
    images: [{ url: "/og/landing-water-rental.png", width: 1200, height: 630, alt: "광고 신청 접수 랜딩페이지 카탈로그" }],
  },
};

const FOR_WHOM = [
  "광고 신청을 메일과 문자로 따로 확인하는 경우",
  "신청 확인이 늦어 상담을 놓치는 경우",
  "광고별 계약 건수를 확인하기 어려운 경우",
  "홈페이지보다 신청 페이지가 먼저 필요한 경우",
];

const FAQ: [string, string][] = [
  ["문자, 알림톡 발송 비용은 별도인가요?", "발송 비용은 건당 20원 내외이며 고객 부담입니다. 카카오 알림톡은 비즈니스 채널 인증과 템플릿 심사가 필요합니다. 메일 알림은 무료입니다."],
  ["신청 내용은 어디에 저장되나요?", "고객 구글 계정의 구글 시트에 저장됩니다. 곰파트너는 신청 내용을 보관하지 않습니다."],
  ["월 비용이 있나요?", "무료 호스팅을 사용하여 월 비용은 없습니다. 도메인은 고객 명의로 직접 구매하며 연 2만 원 내외입니다."],
  ["진행하지 않는 업종이 있나요?", "대부 중개, 주식과 코인 리딩 업종은 진행하지 않습니다."],
];

const section = "scroll-mt-20 border-t border-[#e6e9ee] md:scroll-mt-24";

export default function ClassicLandingServicePage() {
  const samples = samplesIn("landing");
  return (
    <>
      <PageHead
        title="광고 랜딩페이지"
        trail={[
          { href: "/classic/homepage", label: "서비스" },
          { href: "/classic/landing", label: "광고 랜딩페이지" },
        ]}
      />
      <SubTabs items={serviceTabs} current="/classic/landing" />

      <section aria-labelledby="ld-lead" className={`${wrap} py-12 md:py-16`}>
        <div className="border-t-2 border-[#15171c] pt-6">
          <h2 id="ld-lead" className="break-keep text-[26px] font-[800] leading-[1.35] tracking-[-0.04em] md:text-[34px]">
            광고 유입 고객의 상담 신청을 접수하고 관리하는 단일 페이지
          </h2>
        </div>
      </section>

      <section aria-labelledby="ld-whom" className={section}>
        <div className={`${wrap} py-16 md:py-24`}>
          <h2 id="ld-whom" className={h2}>
            도입이 필요한 경우
          </h2>
          <ul className="mt-10 border-t-2 border-[#15171c]" role="list">
            {FOR_WHOM.map((t) => (
              <li key={t} className="flex gap-3 border-b border-[#e6e9ee] py-5 text-[17px] font-bold leading-[1.55] md:py-6 md:text-[19px]">
                <Check size={22} strokeWidth={2.5} aria-hidden className="mt-0.5 shrink-0 text-[#256ef4]" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="ld-owner" className={section}>
        <div className={`${wrap} py-16 md:py-24`}>
          <h2 id="ld-owner" className={h2}>
            신청 접수 화면
          </h2>
          <div className="mt-10">
            <ClassicOwnerPreview />
          </div>
        </div>
      </section>

      <section id="plans" aria-labelledby="ld-plans" className={section}>
        <div className={`${wrap} py-16 md:py-24`}>
          <h2 id="ld-plans" className={h2}>
            패키지
          </h2>
          <PlanTable plans={landingPlans} product="광고 랜딩페이지" />
        </div>
      </section>

      {samples.length > 0 && (
        <section id="samples" aria-labelledby="ld-samples" className={section}>
          <div className={`${wrap} py-16 md:py-24`}>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="ld-samples" className={h2}>
                카탈로그
              </h2>
              <Link href="/classic/works/landing" className={more}>
                전체 카탈로그 <ChevronRight size={16} aria-hidden />
              </Link>
            </div>
            <div className="mt-10">
              <SampleGrid items={samples} cols={3} />
            </div>
          </div>
        </section>
      )}

      <StepList steps={processSteps} title="진행 절차" id="process" />

      <section aria-labelledby="ld-faq" className={section}>
        <div className={`${wrap} py-16 md:py-24`}>
          <h2 id="ld-faq" className={h2}>
            자주 묻는 질문
          </h2>
          <div className="mt-10 border-t-2 border-[#15171c]">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group border-b border-[#e6e9ee]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[17px] font-bold leading-[1.5] hover:text-[#256ef4] md:py-6 md:text-[19px] [&::-webkit-details-marker]:hidden">
                  {q}
                  <ChevronDown size={22} aria-hidden className="shrink-0 text-[#6b7280] transition-transform group-open:rotate-180 motion-reduce:transition-none" />
                </summary>
                <p className="pb-6 text-[16px] leading-[1.7] text-[#3d4450] md:text-[17px]">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
