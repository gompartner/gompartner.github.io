import type { Project } from "@/lib/types";
import { estimateFor } from "@/data/pricing";

// 썸네일 위 라벨은 파는 상품 기준으로 나눈다. 견적이 없는 샘플은 업무 프로그램(별도 견적)이다.
export const KIND_STYLE = { 홈페이지: "bg-accent", 랜딩페이지: "bg-[#0f5e5a]", 유지보수: "bg-[#464c53]", "업무 프로그램": "bg-[#7a4dd8]" } as const;
export function productOf(w: Project): keyof typeof KIND_STYLE {
  if (w.category === "랜딩페이지") return "랜딩페이지";
  if (w.id === "maintenance-dashboard" || w.id === "maintenance-urgent-fix" || w.id === "accessibility-review") return "유지보수";
  const est = estimateFor(w.id);
  if (!est) return "업무 프로그램";
  return "홈페이지";
}

