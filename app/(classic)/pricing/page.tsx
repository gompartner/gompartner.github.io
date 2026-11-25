import type { Metadata } from "next";
import { PriceBoard } from "@/components/classic/price/PriceBoard";
import { pageMeta } from "@/lib/seo";

// 11-26 비용 한 판으로 바꿈. 종류, 패키지, 추가 기능을 고르면 합계와 기간이 나온다
export const metadata: Metadata = pageMeta({
  title: "비용",
  description: "홈페이지 제작 29.9만 원부터, 수정 한 건 10,000원부터. 종류와 패키지, 추가 기능을 고르면 합계 금액과 제작 기간이 바로 나옵니다(부가세 별도).",
  path: "/pricing",
});

export default function PricingPage() {
  return <PriceBoard />;
}
