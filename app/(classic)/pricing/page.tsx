import type { Metadata } from "next";
import { PriceBoard } from "@/components/classic/price/PriceBoard";
import { pageMeta } from "@/lib/seo";

// 11-26 비용 한 판으로 바꿈. 종류, 패키지, 추가 기능을 고르면 합계와 기간이 나온다
export const metadata: Metadata = pageMeta({
  title: "제작, 유지보수 비용",
  description: "홈페이지 제작 29.9만 원부터, 수정 한 건 10,000원부터. 종류와 패키지, 추가 기능을 선택하면 예상 견적과 제작 기간이 계산됩니다.",
  alt: "곰파트너 제작, 유지보수 비용. 홈페이지 패키지별 금액과 제작 기간",
  path: "/pricing",
});

export default function PricingPage() {
  return <PriceBoard />;
}
