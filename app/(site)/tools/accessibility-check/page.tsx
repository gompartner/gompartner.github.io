import type { Metadata } from "next";
import { AccessibilityChecker } from "@/components/tools/AccessibilityChecker";

export const metadata: Metadata = {
  title: "웹접근성 자가 점검표 (KWCAG 2.2, 무료)",
  description:
    "한국형 웹 콘텐츠 접근성 지침 2.2의 33개 검사 항목을 담당자가 직접 확인하고, 원칙별 준수율과 고칠 항목, 개선 방법을 바로 봅니다. 결과는 인쇄할 수 있습니다.",
  alternates: { canonical: "/tools/accessibility-check" },
};

export default function AccessibilityCheckPage() {
  return (
    <div className="mx-auto w-full max-w-[1248px] px-4 pb-10 pt-14 md:px-6 md:py-14">
      <p className="text-[15px] font-bold text-accent print:hidden">무료 도구</p>
      <h1 className="mt-1 text-[28px] font-bold leading-[1.4] tracking-[-0.01em] md:text-[36px]">웹접근성 자가 점검표</h1>
      <p className="mt-2 max-w-[720px] text-[17px] leading-[1.6] text-foreground-secondary print:hidden">
        한국형 웹 콘텐츠 접근성 지침(KWCAG) 2.2의 33개 검사 항목입니다. 항목마다 확인 방법을 읽고 예, 아니오를 고르면 원칙별 준수율과 고칠 항목을 보여 드립니다.
      </p>
      <AccessibilityChecker />
    </div>
  );
}
