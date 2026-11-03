import type { Metadata } from "next";
import { AccessibilityChecker } from "@/components/classic/tools/AccessibilityChecker";
import { pageMeta } from "@/lib/seo";
import { ToolFrame } from "@/components/classic/support/ToolFrame";

// 11-04 공유 미리보기(카톡 등)도 이 도구의 제목, 설명, 주소로 나오게 pageMeta를 쓴다
export const metadata: Metadata = pageMeta({ title: "웹접근성 자가 점검표 (KWCAG 2.2, 무료)", description: "한국형 웹 콘텐츠 접근성 지침 2.2의 33개 검사 항목을 담당자가 직접 확인하고, 원칙별 준수율과 고칠 항목, 개선 방법을 바로 봅니다. 결과는 인쇄할 수 있습니다.", path: "/tools/accessibility-check" });

export default function ClassicAccessibilityCheckPage() {
  return (
    <ToolFrame href="/tools/accessibility-check">
      <AccessibilityChecker />
    </ToolFrame>
  );
}
