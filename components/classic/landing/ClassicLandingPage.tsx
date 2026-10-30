"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BellRing, Check, ChevronDown, Plus } from "lucide-react";
import { h2, more, wrap } from "@/components/classic/ui";
import { landingPlans, planCommon, samplesForPlan } from "@/data/classic/pricing";
import { projects } from "@/data/classic/projects";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { ClassicLeadForm, type PackageName } from "./ClassicLeadForm";
import { ClassicOwnerPreview } from "./ClassicOwnerPreview";

/*
  클래식 보기의 광고 랜딩페이지 상품 소개. /landing(웹툰)과 내용은 같고 모양만 에이전시형이다.
  순서: 첫 화면(남색 배너 + 실제 카탈로그 캡처) -> 이럴 때 -> 신청 접수 화면 -> 패키지 -> 카탈로그 -> 자주 묻는 질문 -> 상담 신청 폼.
  패키지 표에서 고르면 폼의 관심 패키지에 그대로 들어간다.
*/

const NAVY = "#0f1b3d";
const slugOf = (demoUrl: string) => demoUrl.replace("/demo/", "");
const section = "scroll-mt-20 border-t border-[#e6e9ee] md:scroll-mt-32";

const FOR_WHOM = [
  "광고 신청을 메일과 문자로 따로 확인하는 경우",
  "신청 확인이 늦어 상담을 놓치는 경우",
  "광고별 계약 건수를 확인하기 어려운 경우",
  "홈페이지보다 신청 페이지가 먼저 필요한 경우",
];

const SAMPLE_IDS = ["landing-water-rental", "landing-coding-camp", "landing-move-clean", "landing-popup-store", "landing-zine-fair", "landing-leather-class"];

const FAQ: [string, string][] = [
  ["문자·카톡 알림 비용은 별도인가요?", "발송 비용은 건당 20원 내외이며 고객 부담입니다. 카카오 알림톡은 비즈니스 채널 인증과 템플릿 심사가 필요합니다. 메일 알림은 무료입니다."],
  ["신청 내용은 어디에 저장되나요?", "고객 구글 계정의 구글 시트에 저장됩니다. 곰파트너는 신청 내용을 보관하지 않습니다."],
  ["월 비용이 있나요?", "무료 호스팅을 사용하여 월 비용은 없습니다. 도메인은 고객 명의로 직접 구매하며 연 2만 원 내외입니다."],
  ["진행하지 않는 업종이 있나요?", "대부 중개 및 주식·코인 리딩 업종은 진행하지 않습니다."],
  ["작업 기간은 얼마나 걸리나요?", "작업 범위를 정할 때 일정도 같이 정합니다. 자료를 받은 날부터 계산합니다."],
];

const PLAN_TO_PKG: Record<string, PackageName> = {
  "landing-basic": "랜딩 기본",
  "landing-standard": "랜딩 표준",
  "landing-premium": "랜딩 고급",
};

const th = "sticky left-0 z-[1] w-[112px] bg-[#f6f7f9] px-4 py-4 text-left align-top text-[15px] font-bold text-[#3d4450] md:w-[180px] md:px-5";
const td = "px-4 py-4 align-top text-[16px] leading-[1.6] md:px-6";

export function ClassicLandingPage() {
  const [pkg, setPkg] = useState<PackageName | "">("");
  const formRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotionSafe();

  const toForm = () => formRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  const pickPlan = (planId: string) => {
    setPkg(PLAN_TO_PKG[planId]);
    toForm();
  };

  return (
    <div className="overflow-x-clip bg-white text-[#15171c]">
      <Hero onApply={toForm} />
      <ForWhom />
      <Owner />
      <Plans onPick={pickPlan} />
      <Samples />
      <Faq />
      <ClassicLeadForm ref={formRef} pkg={pkg} onPkg={setPkg} />
    </div>
  );
}

function Hero({ onApply }: { onApply: () => void }) {
  const shot = projects.find((p) => p.id === "landing-water-rental")!;
  const slug = slugOf(shot.demoUrl);

  return (
    <section aria-labelledby="hero-title" className="text-white" style={{ backgroundColor: NAVY }}>
      <div className="mx-auto grid w-full max-w-[1248px] items-center gap-12 px-4 pb-16 pt-12 md:min-h-[600px] md:grid-cols-[1fr_1.15fr] md:px-6 md:py-20">
        <div>
          <p className="text-[15px] font-bold text-[#8fb4ff] md:text-[17px]">광고 랜딩페이지</p>
          <h1 id="hero-title" className="mt-4 text-[44px] font-extrabold leading-[1.08] tracking-[-0.05em] md:text-[72px]">
            광고 신청 접수
            <br />
            랜딩페이지 제작
          </h1>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onApply}
              data-gtm-cta="classic_landing_hero_apply"
              className="inline-flex h-12 items-center rounded-md bg-[#256ef4] px-6 text-[16px] font-bold text-white transition-colors hover:bg-[#0b50d0]"
            >
              상담 신청
            </button>
            <a href="#samples" className="inline-flex h-12 items-center rounded-md border border-white/40 px-6 text-[16px] font-bold text-white transition-colors hover:bg-white/10">
              카탈로그
            </a>
          </div>
        </div>

        {/* PC 화면 위에 휴대폰 화면과 새 신청 알림을 겹친다. 실제 랜딩 샘플 캡처 */}
        <div className="relative aspect-[16/11] w-full">
          <div className="absolute left-0 top-0 w-[88%] overflow-hidden rounded-lg bg-white shadow-[0_30px_60px_rgba(0,0,0,.35)]">
            <div className="flex h-6 items-center gap-1.5 bg-[#e9ecf1] px-3">
              <span className="h-2 w-2 rounded-full bg-[#c5cbd4]" />
              <span className="h-2 w-2 rounded-full bg-[#c5cbd4]" />
              <span className="h-2 w-2 rounded-full bg-[#c5cbd4]" />
            </div>
            <Image src={shot.imageUrl} alt={shot.imageAlt} width={1440} height={900} priority sizes="(min-width: 768px) 600px, 90vw" className="aspect-[16/10] w-full object-cover object-top" />
          </div>
          <div className="absolute bottom-0 right-0 w-[27%] overflow-hidden rounded-[18px] border-[5px] border-[#1c2a52] bg-white shadow-[0_24px_48px_rgba(0,0,0,.4)]">
            <Image src={`/images/demos/m/${slug}.jpg`} alt="" width={390} height={736} sizes="180px" className="aspect-[9/17] w-full object-cover object-top" />
          </div>
          <div className="absolute bottom-[6%] left-[4%] w-[62%] max-w-[300px] rounded-lg bg-white px-3 py-2.5 text-[#15171c] shadow-[0_16px_32px_rgba(0,0,0,.3)] md:px-4 md:py-3">
            <p className="flex items-center gap-1.5 text-[12px] font-bold text-[#5b6370] md:text-[13px]">
              <BellRing size={14} aria-hidden className="text-[#256ef4]" /> 문자, 지금
            </p>
            <p className="mt-0.5 text-[13px] font-bold md:text-[15px]">[곰파트너 렌탈] 새 신청 1건</p>
            <p className="truncate text-[12px] text-[#5b6370] md:text-[14px]">김ㅎ늘, 010-1234-****, 정수기, 네이버 검색광고</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ForWhom() {
  return (
    <section aria-labelledby="whom-title" className={`${wrap} py-16 md:py-24`}>
      <h2 id="whom-title" className={h2}>
        이럴 때 쓰시면 좋아요
      </h2>
      <ul className="mt-10 grid border-t-2 border-[#15171c] md:grid-cols-2" role="list">
        {FOR_WHOM.map((t, i) => (
          <li key={t} className={`flex gap-3 border-b border-[#e6e9ee] py-5 text-[17px] font-bold leading-[1.55] md:px-5 md:py-7 md:text-[19px] ${i % 2 ? "md:border-l" : ""}`}>
            <Check size={22} strokeWidth={2.5} aria-hidden className="mt-0.5 shrink-0 text-[#256ef4]" />
            {t}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Owner() {
  return (
    <section aria-labelledby="owner-title" className={section}>
      <div className={`${wrap} py-16 md:py-24`}>
        <h2 id="owner-title" className={h2}>
          신청 접수 화면
        </h2>
        <div className="mt-10">
          <ClassicOwnerPreview />
        </div>
      </div>
    </section>
  );
}

function Plans({ onPick }: { onPick: (planId: string) => void }) {
  const samples = landingPlans.map((p) =>
    samplesForPlan(p.id)
      .slice(0, 2)
      .map((s) => ({ ...s, project: projects.find((x) => x.id === s.id) }))
      .filter((s) => s.project?.demoUrl.startsWith("/demo/"))
  );
  const list = (items: string[]) => (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <Check size={18} strokeWidth={2.5} className="mt-[3px] shrink-0 text-[#256ef4]" aria-hidden />
          {item}
        </li>
      ))}
    </ul>
  );

  return (
    <section id="plans" aria-labelledby="plans-title" className={`${section} bg-[#f6f7f9]`}>
      <div className={`${wrap} py-16 md:py-24`}>
        <h2 id="plans-title" className={h2}>
          패키지
        </h2>
        <div className="-mx-4 mt-10 overflow-x-auto px-4 md:mx-0 md:px-0">
          <table className="w-full min-w-[720px] border-collapse border-t-2 border-[#15171c] bg-white">
            <caption className="sr-only">광고 랜딩페이지 패키지 비교</caption>
            <thead>
              <tr className="border-b border-[#e6e9ee]">
                <th scope="col" className={th}>
                  구분
                </th>
                {landingPlans.map((p) => (
                  <th key={p.id} scope="col" className="px-4 py-5 text-left align-top md:px-6">
                    <span className="block text-[19px] font-extrabold tracking-[-0.03em] md:text-[22px]">{p.title}</span>
                    <span className="mt-1 block text-[15px] font-normal text-[#5b6370]">{p.summary}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#e6e9ee]">
                <th scope="row" className={th}>
                  수정 횟수
                </th>
                {landingPlans.map((p) => (
                  <td key={p.id} className={`${td} tabular-nums`}>
                    {p.revisions}회
                  </td>
                ))}
              </tr>
              <tr className="border-b border-[#e6e9ee]">
                <th scope="row" className={th}>
                  포함 항목
                </th>
                {landingPlans.map((p) => (
                  <td key={p.id} className={td}>
                    {list(p.includes)}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-[#e6e9ee]">
                <th scope="row" className={th}>
                  공통 포함
                </th>
                {landingPlans.map((p) => (
                  <td key={p.id} className={td}>
                    {list(planCommon)}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-[#e6e9ee]">
                <th scope="row" className={th}>
                  이 패키지로 만든 카탈로그
                </th>
                {samples.map((items, i) => (
                  <td key={landingPlans[i].id} className={td}>
                    {items.length ? (
                      <ul className="grid gap-3">
                        {items.map((s) => {
                          const slug = slugOf(s.project!.demoUrl);
                          return (
                            <li key={s.id}>
                              <Link href={`/classic/sample/${slug}`} className="group grid grid-cols-[96px_minmax(0,1fr)] items-center gap-3">
                                <Image
                                  src={`/images/demos/sm/${slug}.jpg`}
                                  alt=""
                                  width={720}
                                  height={450}
                                  sizes="96px"
                                  className="aspect-[16/10] w-full rounded border border-[#e6e9ee] object-cover object-top"
                                />
                                <span className="min-w-0 text-[15px] leading-[1.45]">
                                  <span className="line-clamp-2 group-hover:text-[#256ef4] group-hover:underline">{s.project!.title}</span>
                                </span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <span className="text-[#6b7280]">없음</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-[#15171c]">
                <th scope="row" className={th}>
                  <span className="sr-only">상담</span>
                </th>
                {landingPlans.map((p) => (
                  <td key={p.id} className={td}>
                    <button
                      type="button"
                      onClick={() => onPick(p.id)}
                      data-gtm-cta={`classic_landing_plan_${p.id}`}
                      className="inline-flex h-12 w-full items-center justify-center rounded-md border border-[#c9cfd8] bg-white px-4 text-[16px] font-bold text-[#15171c] transition-colors hover:border-[#256ef4] hover:text-[#256ef4]"
                    >
                      이 패키지로 상담
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function Samples() {
  const list = SAMPLE_IDS.map((id) => projects.find((p) => p.id === id)).filter((p): p is (typeof projects)[number] => !!p);
  return (
    <section id="samples" aria-labelledby="samples-title" className={section}>
      <div className={`${wrap} py-16 md:py-24`}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="samples-title" className={h2}>
            카탈로그
          </h2>
          <Link href="/classic/works" className={more}>
            더보기 <Plus size={15} strokeWidth={2.5} aria-hidden />
          </Link>
        </div>
        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 md:gap-y-12 lg:grid-cols-4" role="list">
          {list.map((p) => {
            const slug = slugOf(p.demoUrl);
            return (
              <li key={p.id} className="min-w-0">
                <Link href={`/classic/sample/${slug}`} className="group block">
                  <span className="block overflow-hidden rounded-md border border-[#e1e5eb] bg-white">
                    <Image
                      src={`/images/demos/sm/${slug}.jpg`}
                      alt={p.imageAlt}
                      width={720}
                      height={450}
                      sizes="(min-width: 1024px) 290px, (min-width: 768px) 30vw, 45vw"
                      className="aspect-[16/10] w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none"
                    />
                  </span>
                  <span className="mt-3 block text-[13px] font-bold text-[#1d5fd6] md:text-[14px]">{p.layout}</span>
                  <span className="mt-1 block text-[16px] font-bold leading-[1.4] tracking-[-0.02em] group-hover:underline md:text-[18px]">{p.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section aria-labelledby="faq-title" className={section}>
      <div className={`${wrap} grid gap-10 py-16 md:py-24 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:gap-16`}>
        <h2 id="faq-title" className={h2}>
          자주 묻는 질문
        </h2>
        <div className="min-w-0 border-t-2 border-[#15171c]">
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
  );
}
