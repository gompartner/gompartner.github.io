import type { Metadata } from "next";
import { HostingCostCalculator } from "@/components/tools/HostingCostCalculator";

export const metadata: Metadata = {
  title: "홈페이지 유지비 계산 (웹호스팅·도메인 비용 비교)",
  description:
    "카페24, 가비아, 닷홈, 호스팅케이알, 아이비호스팅 웹호스팅과 아임웹, 식스샵 구독 요금, 도메인 1년 비용을 비교하고 첫해와 다음 해 유지비를 계산합니다.",
  alternates: { canonical: "/tools/hosting-cost" },
};

export default function HostingCostPage() {
  return (
    <div className="mx-auto w-full max-w-[1248px] px-4 pb-10 pt-14 md:px-6 md:py-14">
      <h1 className="text-[28px] font-bold leading-[1.4] tracking-[-0.01em] md:text-[36px]">홈페이지 유지비 계산</h1>
      <HostingCostCalculator />
    </div>
  );
}
