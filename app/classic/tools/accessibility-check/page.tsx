import type { Metadata } from "next";
import { AccessibilityChecker } from "@/components/tools/AccessibilityChecker";
import { fitDescription } from "@/lib/seo";
import { ToolFrame } from "@/components/classic/support/ToolFrame";

export const metadata: Metadata = {
  title: "웹접근성 자가 점검표 (KWCAG 2.2, 무료)",
  description: fitDescription("한국형 웹 콘텐츠 접근성 지침 2.2의 33개 검사 항목을 담당자가 직접 확인하고, 원칙별 준수율과 고칠 항목, 개선 방법을 바로 봅니다. 결과는 인쇄할 수 있습니다."),
  alternates: { canonical: "/tools/accessibility-check" },
};

export default function ClassicAccessibilityCheckPage() {
  return (
    <ToolFrame href="/classic/tools/accessibility-check">
      <AccessibilityChecker />
    </ToolFrame>
  );
}
