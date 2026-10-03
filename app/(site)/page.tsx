import type { Metadata } from "next";
import { Check } from "lucide-react";
import { ChannelTalkButton } from "@/components/layout/ChannelTalk";
import { Doodles } from "@/components/landing/Doodles";
import { HistoryTimeline } from "@/components/landing/HistoryTimeline";
import { careerYears, historyFields, historyTotal } from "@/lib/history";
import { HeroSlider } from "@/components/landing/HeroSlider";
import { WorksSearch } from "@/components/landing/WorksSearch";
import { projects } from "@/data/projects";
import { profile } from "@/data/profile";
import { formatWon, planByProject, plans } from "@/data/pricing";

// KRDS(범정부 디자인 시스템) 기준 원페이지 랜딩.
// 서체 Pretendard, 굵기 400/700, 행간 1.5 이상, 본문 17px,
// 타입 스케일 Display M 44/32 · Heading L 32/24 · Body L 19 · Body S 15,
// 최대 폭 1200px, 화면 여백 16/24px, 버튼·입력 radius 6px, 카드 10px.

export const metadata: Metadata = {
  // 루트 템플릿(`%s | 곰선임`)이 브랜드를 또 붙이지 않도록 absolute 사용
  title: {
    absolute: `홈페이지·업무 프로그램 제작 | ${profile.name}`,
  },
  description:
    "17년 경력 개발자가 홈페이지와 업무 프로그램을 직접 만듭니다. 원본 소스를 제공하고 완료 후 1개월 무상 유지보수합니다.",
  alternates: { canonical: "/" },
};

// 첫 화면 배너에 넘겨 보여 줄 대표 제작 사례
const featuredIds = ["private-gym", "clinic-homepage", "district-portal"];
const featured = featuredIds.map((id) => projects.find((p) => p.id === id)!);

const promises = ["17년 경력 개발자 직접 작업", "채팅으로 바로 상담", "원본 소스 제공", "완료 후 1개월 무상 유지보수"];


const container = "mx-auto w-full max-w-[1248px] px-4 md:px-6";
const h2 = "text-[24px] font-bold leading-[1.5] tracking-[-0.01em] md:text-[32px]";
const lead = "mt-2 text-[17px] leading-[1.5] text-foreground-secondary";
const primaryButton =
  "inline-flex h-12 items-center justify-center rounded-md bg-accent px-6 text-[17px] font-bold text-accent-foreground transition-colors hover:bg-accent-hover md:h-14 md:px-7";
const secondaryButton =
  "inline-flex h-12 items-center justify-center rounded-md border border-[#6d7882] bg-white px-6 text-[17px] font-bold text-foreground transition-colors hover:bg-surface md:h-14 md:px-7";

export default function HomePage() {
  return (
    <>
      <section aria-labelledby="hero-title" className="relative isolate overflow-hidden border-b border-border bg-surface">
        <Doodles variant={0} />
        <div className={`${container} grid gap-10 py-12 md:py-20 lg:grid-cols-12 lg:items-center lg:gap-6`}>
          <div className="lg:col-span-5">
            <h1 id="hero-title" className="text-[32px] font-bold leading-[1.4] tracking-[-0.02em] md:text-[44px]">
              홈페이지·업무 프로그램 제작
            </h1>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2" aria-label="작업 조건">
              {promises.map((item) => (
                <li key={item} className="flex items-center gap-2 text-[17px] font-bold leading-[1.5]">
                  <Check size={20} strokeWidth={2.5} className="shrink-0 text-accent" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <ChannelTalkButton cta="hero_chat" className={primaryButton}>
                채팅 상담
              </ChannelTalkButton>
              <a href="#works" data-gtm-cta="hero_works" className={secondaryButton}>
                제작 사례
              </a>
            </div>
          </div>
          <HeroSlider slides={featured} />
        </div>
      </section>

      <section id="works" aria-labelledby="works-title" className="relative isolate scroll-mt-16 overflow-hidden">
        <Doodles variant={1} />
        <div className={`${container} py-16 md:py-24`}>
          <h2 id="works-title" className={h2}>
            제작 사례
          </h2>
          <p className={lead}>고객 정보 보호를 위해 기관명과 데이터는 가상으로 재구성했습니다.</p>

          <div className="mt-8">
            <WorksSearch projects={projects} />
          </div>
        </div>
      </section>

      <section id="pricing" aria-labelledby="pricing-title" className="relative isolate scroll-mt-16 overflow-hidden border-t border-border bg-surface">
        <div className={`${container} py-16 md:py-24`}>
          <h2 id="pricing-title" className={h2}>
            홈페이지 제작 가격
          </h2>
          <p className={lead}>모든 패키지에 원본 소스와 완료 후 1개월 무상 유지보수가 들어갑니다. 업무 프로그램은 기능을 듣고 따로 견적을 드립니다.</p>

          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {plans.map((plan) => {
              const examples = projects.filter((p) => planByProject[p.id] === plan.id);
              return (
                <li key={plan.id} className="flex flex-col rounded-[10px] border border-border bg-white p-6">
                  <p className="text-[17px] font-bold">
                    {plan.name} <span className="font-normal text-foreground-secondary">· {plan.days}일</span>
                  </p>
                  <p className="mt-1 text-[32px] font-bold leading-[1.3] tabular-nums">{formatWon(plan.price)}</p>
                  <p className="mt-1 text-[17px] text-foreground-secondary">{plan.summary}</p>
                  <ul className="mt-5 space-y-2 border-t border-border pt-5 text-[17px]">
                    {plan.includes.map((item) => (
                      <li key={item} className="flex gap-2">
                        <Check size={20} strokeWidth={2.5} className="mt-[3px] shrink-0 text-accent" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                  {examples.length > 0 && (
                    <p className="mt-5 text-[15px] leading-[1.6] text-foreground-secondary">
                      비슷한 데모:{" "}
                      {examples.map((p, i) => (
                        <span key={p.id}>
                          {i > 0 && ", "}
                          <a href={p.demoUrl} className="underline underline-offset-4 hover:text-accent">
                            {p.title.replace(" 홈페이지", "")}
                          </a>
                        </span>
                      ))}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="mt-8">
            <ChannelTalkButton cta="pricing_chat" className={primaryButton}>
              채팅으로 상담하기
            </ChannelTalkButton>
          </div>
        </div>
      </section>

      <section id="history" aria-labelledby="history-title" className="relative isolate scroll-mt-16 overflow-clip border-t border-border">
        <Doodles variant={2} />
        <div className={`${container} py-16 md:py-24`}>
          <h2 id="history-title" className={h2}>
            작업 이력
          </h2>
          <p className={lead}>발주처와 소속 회사명은 공개하지 않습니다.</p>
          <HistoryTimeline fields={historyFields} total={historyTotal} careerYears={careerYears} />
        </div>
      </section>
    </>
  );
}
