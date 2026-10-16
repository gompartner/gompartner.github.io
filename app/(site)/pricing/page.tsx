import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PricingSection } from "@/components/landing/PricingSection";
import { ProcessSteps } from "@/components/landing/ProcessSteps";
import { ChannelTalkButton } from "@/components/layout/ChannelTalk";
import { PriceCalculator } from "@/components/renewal/PriceCalculator";
import { maintenanceServices } from "@/data/maintenance";
import { landingPlans, manwon, plans } from "@/data/pricing";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMeta({
    title: "홈페이지 제작 비용·가격표",
    description: `${plans.map((p) => `${p.title} ${manwon(p.price)}`).join(", ")}. 예약, 결제, 회원가입 같은 추가 기능 가격도 함께 적었습니다.`,
    path: "/pricing",
  }),
};

const h2 = "text-[24px] font-bold leading-[1.5] tracking-[-0.01em] md:text-[32px]";

// 파는 상품 네 가지. 가격 페이지 맨 위에서 고르고, 아래는 상품마다 따로 나눈다(섞어 보이지 않게).
const products = [
  { href: "#landing", name: "광고 랜딩페이지", price: `${manwon(landingPlans[0].price)}부터`, what: "광고 보고 온 사람의 신청을 받는 한 페이지" },
  { href: "#homepage", name: "홈페이지 제작", price: `${manwon(plans[0].price)}부터`, what: "회사·가게 소개, 문의·예약을 받는 홈페이지" },
  { href: "#maintenance", name: "유지보수", price: "월 5만 원부터", what: "만든 홈페이지 수정과 오류 수정" },
  { href: "#program", name: "업무 프로그램", price: "별도 견적", what: "엑셀로 하던 일을 화면으로 옮기기" },
];

export default function PricingPage() {
  return (
    <>
      <section aria-labelledby="price-title" className="border-b-[3px] border-[#1d1d1f]">
        <div className="mx-auto w-full max-w-[1248px] px-4 py-12 md:px-6 md:py-16">
          <h1 id="price-title" className="text-[32px] leading-[1.25] md:text-[44px]">
            가격
          </h1>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4" role="list">
            {products.map((p) => (
              <li key={p.href}>
                <a
                  href={p.href}
                  className="group flex h-full flex-col border-[3px] border-[#1d1d1f] bg-white p-5 shadow-[4px_4px_0_#1d1d1f] transition-[transform,box-shadow,background-color] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#fff3b0] hover:shadow-[6px_6px_0_#1d1d1f]"
                >
                  <span className="flex items-center justify-between gap-2 text-[19px] font-bold">
                    {p.name}
                    <ChevronRight size={20} strokeWidth={3} aria-hidden className="shrink-0 rotate-90 text-accent" />
                  </span>
                  <span className="mt-1 text-[22px] font-bold tabular-nums text-accent">{p.price}</span>
                  <span className="mt-2 text-[15px] leading-[1.5] text-foreground-secondary">{p.what}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <PricingSection id="landing" primary="landing" crossRow={false} />
      <PricingSection id="homepage" crossRow={false} />
      <PriceCalculator />

      <section id="maintenance" aria-labelledby="maintenance-price-title" className="scroll-mt-16 border-t-[3px] border-[#1d1d1f]">
        <div className="mx-auto w-full max-w-[1248px] px-4 py-14 md:px-6 md:py-20">
          <h2 id="maintenance-price-title" className={h2}>
            유지보수 가격
          </h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4" role="list">
            {maintenanceServices.map((s) => (
              <li key={s.id} className="flex flex-col border-[3px] border-[#1d1d1f] bg-white shadow-[4px_4px_0_#1d1d1f]">
                <p className="border-b-[3px] border-[#1d1d1f] bg-[#fff3b0] px-4 py-2.5 text-[17px] font-bold">{s.title}</p>
                <div className="flex flex-1 flex-col p-4">
                  <p className="text-[18px] font-bold leading-[1.45] text-accent">{s.price}</p>
                  <p className="mt-1 text-[15px] text-foreground-secondary">{s.term}</p>
                </div>
              </li>
            ))}
          </ul>
          <Link href="/maintenance" className="mt-6 inline-flex items-center gap-1 text-[16px] font-bold text-accent underline-offset-4 hover:underline">
            1건 기준과 맡지 않는 일
            <ChevronRight size={18} strokeWidth={3} aria-hidden />
          </Link>
        </div>
      </section>

      <section id="program" aria-labelledby="program-price-title" className="scroll-mt-16 border-t-[3px] border-[#1d1d1f]">
        <div className="mx-auto flex w-full max-w-[1248px] flex-col gap-5 px-4 py-14 md:flex-row md:items-center md:justify-between md:px-6 md:py-20">
          <div>
            <h2 id="program-price-title" className={h2}>
              업무 프로그램은 별도 견적
            </h2>
            <p className="mt-2 text-[16px] leading-[1.6] text-foreground-secondary md:text-[17px]">화면 수와 쓰는 사람을 듣고 금액과 기간을 알려 드립니다.</p>
          </div>
          <ChannelTalkButton
            cta="pricing_chat_program"
            message="업무 프로그램 견적을 받고 싶어요."
            className="flex h-12 shrink-0 items-center justify-center rounded-[6px] border-[2.5px] border-[#1d1d1f] bg-accent px-6 text-[17px] font-bold text-white shadow-[3px_3px_0_#1d1d1f] transition-[transform,box-shadow] duration-150 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
          >
            업무 프로그램 상담
          </ChannelTalkButton>
        </div>
      </section>

      <ProcessSteps title="제작 진행 절차" />
    </>
  );
}
