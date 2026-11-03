import type { Metadata } from "next";
import { HostingCostCalculator } from "@/components/classic/tools/HostingCostCalculator";
import { pageMeta } from "@/lib/seo";
import { ToolFrame } from "@/components/classic/support/ToolFrame";

// 11-04 공유 미리보기(카톡 등)도 이 도구의 제목, 설명, 주소로 나오게 pageMeta를 쓴다
export const metadata: Metadata = pageMeta({ title: "홈페이지 유지비 계산 (웹호스팅·도메인 비용 비교)", description: "카페24, 가비아, 닷홈, 아임웹 같은 웹호스팅과 도메인 요금을 비교해 첫해와 다음 해 유지비를 계산합니다.", path: "/tools/hosting-cost" });

export default function ClassicHostingCostPage() {
  return (
    <ToolFrame href="/tools/hosting-cost">
      <HostingCostCalculator />
    </ToolFrame>
  );
}
