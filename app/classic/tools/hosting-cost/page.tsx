import type { Metadata } from "next";
import { HostingCostCalculator } from "@/components/tools/HostingCostCalculator";
import { fitDescription } from "@/lib/seo";
import { ToolFrame } from "@/components/classic/support/ToolFrame";

export const metadata: Metadata = {
  title: "홈페이지 유지비 계산 (웹호스팅·도메인 비용 비교)",
  description: fitDescription("카페24, 가비아, 닷홈, 아임웹 같은 웹호스팅과 도메인 요금을 비교해 첫해와 다음 해 유지비를 계산합니다."),
  alternates: { canonical: "/tools/hosting-cost" },
};

export default function ClassicHostingCostPage() {
  return (
    <ToolFrame href="/classic/tools/hosting-cost">
      <HostingCostCalculator />
    </ToolFrame>
  );
}
