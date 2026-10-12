import type { Metadata } from "next";
import { PricingSection } from "@/components/landing/PricingSection";
import { ProcessSteps } from "@/components/landing/ProcessSteps";
import { plans, formatWon } from "@/data/pricing";

export const metadata: Metadata = {
  title: "홈페이지 제작 비용·가격표",
  description: `홈페이지 제작 비용은 ${plans.map((p) => `${p.title} ${formatWon(p.price)}(${p.days}일)`).join(", ")}입니다. 예약, 결제, 회원가입, 영문 화면 같은 추가 기능 가격도 함께 적었습니다.`,
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <>
      <PricingSection heading="h1" />
      <ProcessSteps title="제작 진행 절차" />
    </>
  );
}
