import fs from "node:fs";
import path from "node:path";
import type { Project } from "@/lib/types";
import { industries } from "@/data/classic/industries";
import { projects } from "@/data/classic/projects";
import { estimateFor, manwon } from "@/data/classic/pricing";
import { fieldsById } from "@/data/classic/workFilters";

// 클래식 샘플 페이지 공용 계산. 서버에서만 쓴다(파일 존재 확인).

export const slugOf = (demoUrl: string) => demoUrl.replace("/demo/", "");
export const demoProjects = projects.filter((p) => p.demoUrl.startsWith("/demo/"));
export const findBySlug = (slug: string) => demoProjects.find((p) => slugOf(p.demoUrl) === slug);

const exists = (src: string) => fs.existsSync(path.join(process.cwd(), "public", src));

/** 목록 썸네일. 작은 캡처가 없으면 PC 캡처를 쓴다. */
export function thumbOf(p: Project) {
  const sm = `/images/demos/sm/${slugOf(p.demoUrl)}.jpg`;
  return exists(sm) ? sm : p.imageUrl;
}

export function mobileShotOf(p: Project) {
  const m = `/images/demos/m/${slugOf(p.demoUrl)}.jpg`;
  return exists(m) ? m : null;
}

export const isMaintenance = (p: Project) => p.kind === "유지보수" || ["maintenance-dashboard", "maintenance-urgent-fix", "accessibility-review"].includes(p.id);

/** 카드 아래 금액 줄. 견적이 없으면 유지보수 또는 업무 프로그램(별도 견적). */
export function priceLine(p: Project) {
  const est = estimateFor(p.id);
  if (est) return `${manwon(est.total)}, ${est.days}일`;
  return isMaintenance(p) ? "월 5만 원부터" : "별도 견적";
}

export const samplesIn = (slug: string) => {
  const ind = industries.find((i) => i.slug === slug);
  return ind ? demoProjects.filter((p) => (fieldsById[p.id] ?? []).includes(ind.field)) : [];
};

/** 샘플이 속한 첫 업종 */
export const industryOf = (p: Project) => industries.find((i) => (fieldsById[p.id] ?? []).includes(i.field));

/** 샘플 메뉴 하위 탭: 전체와 업종 */
export const worksTabs = [{ href: "/classic/works", label: "전체" }, ...industries.map((i) => ({ href: `/classic/works/${i.slug}`, label: i.label }))];
