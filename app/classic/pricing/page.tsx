import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { ClassicPriceCalculator } from "@/components/classic/pricing/ClassicPriceCalculator";
import { PlanTable } from "@/components/classic/pricing/PlanTable";
import { StepList } from "@/components/classic/pricing/StepList";
import { PageHead, btnLine, btnPrimary, h2, more, wrap } from "@/components/classic/ui";
import { ChannelTalkButton } from "@/components/layout/ChannelTalk";
import { processSteps } from "@/data/classic/faq";
import { maintenanceServices } from "@/data/classic/maintenance";
import { addons, formatWon, landingPlans, manwon, plans, previewDetail, previewPromise, runningCostNote } from "@/data/classic/pricing";
import { fitDescription } from "@/lib/seo";

export const metadata: Metadata = {
  title: "홈페이지 제작 비용·가격표",
  description: fitDescription(`${plans.map((p) => `${p.title} ${manwon(p.price)}`).join(", ")}. 예약, 결제, 회원가입 같은 추가 기능 가격도 함께 적었습니다.`),
};

const products = [
  { href: "#landing", name: "광고 랜딩페이지", price: `${manwon(landingPlans[0].price)}부터`, what: "광고 보고 온 사람의 신청을 받는 한 페이지" },
  { href: "#homepage", name: "홈페이지 제작", price: `${manwon(plans[0].price)}부터`, what: "회사와 가게 소개, 문의와 예약을 받는 홈페이지" },
  { href: "#maintenance", name: "유지보수", price: "월 5만 원부터", what: "만든 홈페이지 수정과 오류 수정" },
  { href: "#program", name: "업무 프로그램", price: "별도 견적", what: "엑셀로 하던 일을 화면으로 옮기기" },
];

const section = "scroll-mt-20 border-t border-[#e6e9ee] md:scroll-mt-32";
const cellTh = "px-4 py-3.5 text-left text-[15px] font-bold text-[#3d4450] md:px-5";
const cell = "px-4 py-3.5 text-[16px] md:px-5";

export default function ClassicPricingPage() {
  return (
    <>
      <PageHead title="가격" trail={[{ href: "/classic/pricing", label: "가격" }]} />

      {/* 상품 바로가기 */}
      <nav aria-label="상품" className={`${wrap} pt-12 md:pt-16`}>
        <ul className="grid border-t-2 border-[#15171c] sm:grid-cols-2 lg:grid-cols-4" role="list">
          {products.map((p) => (
            <li key={p.href} className="border-b border-[#e6e9ee] lg:border-b-0 lg:[&:not(:first-child)]:border-l">
              <a href={p.href} className="group flex h-full flex-col px-1 py-5 sm:px-5 lg:py-7">
                <span className="flex items-center justify-between gap-2 text-[20px] font-extrabold tracking-[-0.03em] group-hover:text-[#256ef4] md:text-[22px]">
                  {p.name}
                  <ChevronDown size={20} aria-hidden className="shrink-0 text-[#8a929e] group-hover:text-[#256ef4]" />
                </span>
                <span className="mt-1 text-[17px] font-bold tabular-nums text-[#256ef4]">{p.price}</span>
                <span className="mt-2 text-[15px] leading-[1.55] text-[#5b6370]">{p.what}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section id="landing" aria-labelledby="landing-title" className={`${section} mt-16 md:mt-24`}>
        <div className={`${wrap} py-16 md:py-24`}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="landing-title" className={h2}>
              광고 랜딩페이지
            </h2>
            <Link href="/classic/landing" className={more}>
              자세히 보기 <ChevronRight size={16} aria-hidden />
            </Link>
          </div>
          <PlanTable plans={landingPlans} product="광고 랜딩페이지" ctaPrefix="classic_pricing_chat" />
        </div>
      </section>

      <section id="homepage" aria-labelledby="homepage-title" className={section}>
        <div className={`${wrap} py-16 md:py-24`}>
          <h2 id="homepage-title" className={h2}>
            홈페이지 제작
          </h2>
          <PlanTable plans={plans} product="홈페이지" ctaPrefix="classic_pricing_chat" />
          <p className="mt-6 text-[15px] leading-[1.65] text-[#5b6370] md:text-[16px]">
            {runningCostNote}{" "}
            <Link href="/classic/tools/hosting-cost" className="font-bold text-[#256ef4] underline-offset-4 hover:underline">
              업체별 비교
            </Link>
          </p>
        </div>
      </section>

      <section id="addons" aria-labelledby="addons-title" className={section}>
        <div className={`${wrap} py-16 md:py-24`}>
          <h2 id="addons-title" className={h2}>
            추가 기능 단가
          </h2>
          <div className="-mx-4 mt-10 overflow-x-auto px-4 md:mx-0 md:px-0">
            <table className="w-full min-w-[480px] border-collapse border-t-2 border-[#15171c]">
              <caption className="sr-only">추가 기능 단가표</caption>
              <thead>
                <tr className="border-b border-[#e6e9ee] bg-[#f6f7f9]">
                  <th scope="col" className={cellTh}>
                    항목
                  </th>
                  <th scope="col" className={`${cellTh} text-right`}>
                    금액
                  </th>
                  <th scope="col" className={`${cellTh} w-[96px] text-center`}>
                    단위
                  </th>
                </tr>
              </thead>
              <tbody>
                {addons.map((a) => (
                  <tr key={a.id} className="border-b border-[#e6e9ee]">
                    <th scope="row" className={`${cell} text-left font-normal`}>
                      {a.name}
                    </th>
                    <td className={`${cell} text-right font-bold tabular-nums`}>{formatWon(a.price)}</td>
                    <td className={`${cell} text-center text-[#5b6370]`}>{a.unit === "식" ? "1식" : `1${a.unit}당`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[15px] leading-[1.65] text-[#5b6370] md:text-[16px]">고급 패키지의 맞춤 기능 1개는 패키지 금액에 포함됩니다.</p>
        </div>
      </section>

      <ClassicPriceCalculator />

      <section id="maintenance" aria-labelledby="maintenance-title" className={section}>
        <div className={`${wrap} py-16 md:py-24`}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="maintenance-title" className={h2}>
              유지보수
            </h2>
            <Link href="/classic/maintenance" className={more}>
              1건 기준과 맡지 않는 일 <ChevronRight size={16} aria-hidden />
            </Link>
          </div>
          <div className="-mx-4 mt-10 overflow-x-auto px-4 md:mx-0 md:px-0">
            <table className="w-full min-w-[560px] border-collapse border-t-2 border-[#15171c]">
              <caption className="sr-only">유지보수 가격</caption>
              <thead>
                <tr className="border-b border-[#e6e9ee] bg-[#f6f7f9]">
                  <th scope="col" className={cellTh}>
                    서비스
                  </th>
                  <th scope="col" className={cellTh}>
                    금액
                  </th>
                  <th scope="col" className={cellTh}>
                    기준
                  </th>
                </tr>
              </thead>
              <tbody>
                {maintenanceServices.map((s) => (
                  <tr key={s.id} className="border-b border-[#e6e9ee]">
                    <th scope="row" className={`${cell} text-left`}>
                      <Link href={`/classic/maintenance#${s.id}`} className="font-bold hover:text-[#256ef4]">
                        {s.title}
                      </Link>
                    </th>
                    <td className={`${cell} font-bold tabular-nums`}>{s.price}</td>
                    <td className={`${cell} text-[#5b6370]`}>{s.term}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="program" aria-labelledby="program-title" className={section}>
        <div className={`${wrap} flex flex-col gap-6 py-16 md:flex-row md:items-center md:justify-between md:py-24`}>
          <div>
            <h2 id="program-title" className={h2}>
              업무 프로그램
            </h2>
            <p className="mt-3 text-[17px] font-bold">별도 견적</p>
            <p className="mt-1 text-[16px] leading-[1.6] text-[#5b6370]">화면 수와 쓰는 사람을 듣고 금액과 기간을 알려 드립니다.</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <ChannelTalkButton cta="classic_pricing_chat_program" message="업무 프로그램 견적을 받고 싶어요." className={btnPrimary}>
              업무 프로그램 상담
            </ChannelTalkButton>
            <Link href="/classic/program" className={btnLine}>
              샘플 보기
            </Link>
          </div>
        </div>
      </section>

      <StepList steps={processSteps} title="제작 진행 절차" id="process" />

      <section aria-labelledby="pricing-band" className="text-white" style={{ backgroundColor: "#256ef4" }}>
        <div className={`${wrap} flex flex-col gap-8 py-16 md:flex-row md:items-center md:justify-between md:py-20`}>
          <div className="max-w-[640px]">
            <h2 id="pricing-band" className="text-[30px] font-extrabold leading-[1.25] tracking-[-0.04em] md:text-[40px]">
              {previewPromise}
            </h2>
            <p className="mt-3 text-[16px] leading-[1.65] text-white/85 md:text-[17px]">{previewDetail}</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <ChannelTalkButton cta="classic_pricing_band_chat" className="inline-flex h-14 items-center rounded-md bg-white px-7 text-[17px] font-bold text-[#15171c] hover:bg-[#e8efff]">
              채팅 상담
            </ChannelTalkButton>
            <Link href="/classic/contact" data-gtm-cta="classic_pricing_band_contact" className="inline-flex h-14 items-center rounded-md border border-white/60 px-7 text-[17px] font-bold hover:bg-white/10">
              상담 신청
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
