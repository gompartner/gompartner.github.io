import type { Metadata } from "next";
import Link from "next/link";
import { BellRing, ChartColumn, Check, ChevronRight, ClipboardList, MousePointerClick, Table2 } from "lucide-react";
import { ClassicLeadScreens } from "@/components/classic/landing/ClassicLeadScreens";
import { PlanTable } from "@/components/classic/pricing/PlanTable";
import { AddonList } from "@/components/classic/pricing/AddonList";
import { StepList } from "@/components/classic/pricing/StepList";
import { serviceTabs } from "@/components/classic/pricing/tabs";
import { PageHead, SubTabs, h2, h3, more, wrap } from "@/components/classic/ui";
import { DeliverBlock } from "@/components/classic/DeliverBlock";
import { OtherServices } from "@/components/classic/OtherServices";
import { FaqBlock } from "@/components/classic/FaqBlock";
import { replyTerm } from "@/data/classic/maintenance";
import { SampleGrid } from "@/components/classic/works/SampleGrid";
import { samplesIn } from "@/components/classic/works/samples";
import { processSteps } from "@/data/classic/faq";
import { landingPlans, runningCostNote } from "@/data/classic/pricing";
import { fitDescription } from "@/lib/seo";

// 광고 랜딩페이지 서비스 상세. 홈페이지 제작, 업무 프로그램, 유지보수 페이지와 같은 틀(페이지 머리, 서비스 탭, 한 줄 소개, 구획)을 쓴다(10-30).
// 11-01 제작 안의 서비스로 되살림(10-29 사용자 결정). 서비스 안내의 대표 주소는 이 페이지다.
export const metadata: Metadata = {
  title: { absolute: "광고 신청 접수 랜딩페이지 제작 | 곰파트너" },
  description: fitDescription("광고 유입 고객의 상담 신청을 접수하는 랜딩페이지 제작. 접수 즉시 알림, 구글 시트 기록, 광고 채널별 성과 집계를 제공합니다."),
  alternates: { canonical: "/landing-page" },
  openGraph: {
    title: "광고 신청 접수 랜딩페이지 제작",
    url: "/landing-page",
    images: [{ url: "/og/landing-water-rental.png", width: 1200, height: 630, alt: "광고 신청 접수 랜딩페이지 카탈로그" }],
  },
};

const FOR_WHOM = [
  "광고 신청을 메일과 문자로 따로 확인하는 경우",
  "신청 확인이 늦어 상담을 놓치는 경우",
  "광고별 계약 건수를 확인하기 어려운 경우",
  "홈페이지보다 신청 페이지가 먼저 필요한 경우",
];

// 11-01 톤 맞춤: 질문은 실제 질문 형태, 금액과 안 맡는 일은 쓰지 않는다
const FAQ = [
  { q: "신청이 들어오면 어떻게 알 수 있나요?", a: "신청 즉시 담당자 메일로 알림이 갑니다. 상담 관리 이상 패키지는 문자와 카카오 알림톡으로도 받을 수 있습니다." },
  { q: "신청 내용은 어디에 저장되나요?", a: "고객 구글 계정의 구글 시트에 저장됩니다. 곰파트너는 신청 내용을 보관하지 않습니다." },
  { q: "문자, 알림톡을 쓰려면 무엇이 필요한가요?", a: "카카오 알림톡은 비즈니스 채널 인증과 템플릿 심사가 필요합니다. 신청 절차를 함께 안내하고, 발송 비용은 견적서에 함께 적어 드립니다." },
  { q: "운영 비용은 어떻게 되나요?", a: "도메인과 호스팅은 고객 명의로 계약합니다. 연간 비용은 호스팅 종류에 따라 견적서에 함께 안내합니다." },
  { q: "광고별로 신청 수를 볼 수 있나요?", a: "광고 성과 정리 패키지는 네이버, 메타, 구글 등 광고 채널별 신청과 계약 건수를 시트에서 집계해 보여 드립니다." },
];

// 신청 한 건이 지나가는 길. 이 페이지의 디자인 포인트(10-30)
const FLOW = [
  { icon: MousePointerClick, title: "광고 클릭", body: "네이버, 메타, 구글 광고에서 들어옵니다" },
  { icon: ClipboardList, title: "신청서 작성", body: "이름, 연락처, 문의 내용을 받고 개인정보 동의를 거칩니다" },
  { icon: BellRing, title: "즉시 알림", body: "담당자 메일과 문자, 알림톡으로 바로 알립니다" },
  { icon: Table2, title: "시트 기록", body: "구글 시트에 쌓이고 상담 상태를 바로 관리합니다" },
  { icon: ChartColumn, title: "주간 집계", body: "광고 채널별 신청과 계약 건수를 정리합니다" },
];

const section = "scroll-mt-20 border-t border-[#e6e9ee] md:scroll-mt-24";

export default function ClassicLandingServicePage() {
  const samples = samplesIn("landing");
  return (
    <>
      <PageHead
        title="랜딩페이지 제작"
        trail={[
          { href: "/homepage", label: "제작" },
          { href: "/landing-page", label: "랜딩페이지 제작" },
        ]}
      />
      <SubTabs items={serviceTabs} current="/landing-page" />

      <section aria-labelledby="ld-lead" className={`${wrap} py-12 md:py-16`}>
        <div className="flex flex-col gap-2 border-b-2 border-[#15171c] pb-5 md:flex-row md:items-end md:justify-between">
          <h2 id="ld-lead" className={h3}>
            광고로 들어온 고객의 상담, 예약 신청을 바로 받는 홍보용 페이지를 만듭니다
          </h2>
          <p className="shrink-0 text-[15px] font-bold text-[#256ef4]">{replyTerm}</p>
        </div>
      </section>

      <section aria-labelledby="ld-flow" className="bg-[#f4f6f9]">
        <div className={`${wrap} py-16 md:py-20`}>
          <h2 id="ld-flow" className={h2}>
            신청 처리 흐름
          </h2>
          <ol className="mt-10 grid gap-3 md:grid-cols-5 md:gap-8">
            {FLOW.map((f, n) => (
              <li key={f.title} className="relative flex items-start gap-4 rounded-md border border-[#d9dee5] bg-white p-5 md:flex-col md:gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#256ef4] text-white">
                  <f.icon size={22} aria-hidden />
                </span>
                <div>
                  <p className="text-[14px] font-bold tabular-nums text-[#256ef4]">{n + 1}</p>
                  <h3 className="text-[19px] font-[800] tracking-[-0.03em]">{f.title}</h3>
                  <p className="mt-1 text-[15px] leading-[1.6] text-[#5b6370]">{f.body}</p>
                </div>
                {n < FLOW.length - 1 && (
                  <ChevronRight size={22} aria-hidden className="absolute -right-[27px] top-1/2 hidden -translate-y-1/2 text-[#8a94a6] md:block" />
                )}
              </li>
            ))}
          </ol>
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
            <ClassicLeadScreens />
          </div>
        </div>
      </section>

      <section id="plans" aria-labelledby="ld-plans" className={section}>
        <div className={`${wrap} py-16 md:py-24`}>
          <h2 id="ld-plans" className={h2}>
            패키지
          </h2>
          <PlanTable plans={landingPlans} product="랜딩페이지" />
          <AddonList id="ld-addons" only={["page", "tool", "pay", "map", "lang"]} />
          <p className="mt-6 text-[15px] leading-[1.65] text-[#5b6370] md:text-[16px]">{runningCostNote}</p>
        </div>
      </section>

      {samples.length > 0 && (
        <section id="samples" aria-labelledby="ld-samples" className={section}>
          <div className={`${wrap} py-16 md:py-24`}>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="ld-samples" className={h2}>
                카탈로그
              </h2>
              <Link href="/works/landing" className={more}>
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

      <DeliverBlock
        id="ld-deliver"
        name="랜딩페이지와 신청 접수 설정"
        items={["랜딩페이지(PC, 모바일)", "신청 알림 설정(메일, 문자, 알림톡)", "신청 기록용 구글 시트", "원본 소스", "계정 목록과 수정 방법을 정리한 인계 문서"]}
        photo="/images/site/scene-landing.jpg"
      />

      <FaqBlock items={FAQ} id="ld-faq" />

      <OtherServices current="/landing-page" />
    </>
  );
}
