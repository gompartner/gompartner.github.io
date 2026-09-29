import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { ChannelTalkButton } from "@/components/layout/ChannelTalk";
import { WorksTabs } from "@/components/landing/WorksTabs";
import { history, projects } from "@/data/projects";
import { profile } from "@/data/profile";

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
    "17년 경력의 1인 웹 개발자가 홈페이지, 업무 프로그램, 기존 시스템 고도화를 직접 작업합니다.",
  alternates: { canonical: "/" },
};

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
      <section aria-labelledby="hero-title" className="border-b border-border bg-surface">
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
          <Link
            href="/demo/clinic-report"
            aria-label="피부 진단 결과 보고서 프로그램 데모 보기"
            className="block overflow-hidden rounded-[10px] border border-border bg-white lg:col-span-7"
          >
            <Image
              src="/images/demos/clinic-report.jpg"
              alt="피부 진단 결과 보고서 미리보기 화면"
              width={1440}
              height={900}
              priority
              className="h-auto w-full"
            />
          </Link>
        </div>
      </section>

      <section id="works" aria-labelledby="works-title" className="scroll-mt-16">
        <div className={`${container} py-16 md:py-24`}>
          <h2 id="works-title" className={h2}>
            제작 사례
          </h2>
          <p className={lead}>고객 정보 보호를 위해 기관명과 데이터는 가상으로 재구성했습니다.</p>

          <div className="mt-8">
            <WorksTabs projects={projects} />
          </div>
        </div>
      </section>

      <section id="history" aria-labelledby="history-title" className="scroll-mt-16 border-t border-border">
        <div className={`${container} py-16 md:py-24`}>
          <h2 id="history-title" className={h2}>
            작업 이력
          </h2>
          <p className={lead}>발주처와 소속 회사명은 공개하지 않습니다.</p>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[560px] text-[17px] leading-[1.5]">
              <caption className="sr-only">연도별 작업 이력</caption>
              <thead>
                <tr className="border-y-2 border-foreground text-left">
                  <th scope="col" className="w-[140px] py-3 font-bold">기간</th>
                  <th scope="col" className="w-[120px] py-3 font-bold">구분</th>
                  <th scope="col" className="py-3 font-bold">내용</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.period + h.work} className="border-b border-border">
                    <td className="py-4 tabular-nums text-foreground-secondary">{h.period}</td>
                    <td className="py-4">
                      <span
                        className={`rounded-[4px] px-2 py-0.5 text-[15px] font-bold ${
                          h.kind === "유지보수" ? "bg-surface text-foreground-secondary" : "bg-accent-surface text-accent-hover"
                        }`}
                      >
                        {h.kind}
                      </span>
                    </td>
                    <td className="py-4">{h.work}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
