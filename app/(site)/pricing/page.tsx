import type { Metadata } from "next";
import { PricingSection } from "@/components/landing/PricingSection";
import { ProcessSection } from "@/components/landing/ProcessSection";
import { plans, formatWon } from "@/data/pricing";

export const metadata: Metadata = {
  title: "가격·진행 안내",
  description: `홈페이지 제작 패키지 ${plans.map((p) => `${p.title} ${formatWon(p.price)}`).join(", ")}. 추가 기능 가격, 진행 순서, 수정·환불 기준을 안내합니다.`,
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <>
      <div className="mx-auto w-full max-w-[1248px] px-4 pt-14 md:px-6">
        <h1 className="text-[28px] font-bold leading-[1.4] tracking-[-0.01em] md:text-[36px]">가격·진행 안내</h1>
      </div>
      <PricingSection />
      <ProcessSection />
    </>
  );
}
