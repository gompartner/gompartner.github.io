import type { Metadata } from "next";
import { PricingSection } from "@/components/landing/PricingSection";
import { plans, formatWon } from "@/data/pricing";

export const metadata: Metadata = {
  title: "가격",
  description: `홈페이지 제작 패키지 ${plans.map((p) => `${p.title} ${formatWon(p.price)}`).join(", ")}와 예약, 결제, 회원 같은 추가 기능 가격입니다.`,
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return <PricingSection heading="h1" />;
}
