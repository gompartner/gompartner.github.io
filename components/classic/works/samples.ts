import fs from "node:fs";
import path from "node:path";
import type { Project } from "@/lib/types";
import { industries } from "@/data/classic/industries";
import { projects } from "@/data/classic/projects";
import { fieldsById } from "@/data/classic/workFilters";
import { PROGRAM_IDS } from "@/data/classic/programIds";

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

export const isLanding = (p: Project) => p.category === "랜딩페이지" || p.id.startsWith("landing-");
export const isProgram = (p: Project) => PROGRAM_IDS.includes(p.id);

/** 업종 홈페이지와 섞이지 않게 따로 묶는 샘플 묶음. 탭 주소는 /classic/works/<slug> */
export const groups: { slug: string; label: string; title: string; description: string; keywords: string[]; needs: string[]; match: (p: Project) => boolean }[] = [
  {
    slug: "program",
    label: "업무 프로그램",
    title: "업무 프로그램 제작",
    description: "주문 취합, 쇼핑몰 관리, 결과지 출력, 강의 운영처럼 엑셀로 처리하던 반복 업무를 웹 프로그램으로 옮긴 카탈로그입니다. 실제 화면을 직접 사용해 볼 수 있습니다.",
    keywords: ["업무 프로그램 제작", "관리자 페이지 제작", "업무 자동화 프로그램", "엑셀 자동화"],
    needs: ["엑셀 업로드와 취합", "관리자 화면", "결과지, 문서 출력", "권한별 화면"],
    match: isProgram,
  },
  {
    slug: "landing",
    label: "랜딩페이지",
    title: "광고 신청 접수 랜딩페이지 제작",
    description: "광고로 유입된 고객이 상담이나 예약을 신청하는 단일 페이지 카탈로그입니다. 신청이 담당자 메일과 구글 시트에 바로 기록되는 흐름을 직접 확인할 수 있습니다.",
    keywords: ["랜딩페이지 제작", "광고 랜딩페이지", "상담 신청 페이지", "이벤트 페이지 제작"],
    needs: ["첫 화면에 신청 버튼", "신청 접수 알림", "남은 자리, 마감일 표시", "견적 계산기"],
    match: isLanding,
  },
  {
    slug: "maintenance",
    label: "유지보수",
    title: "홈페이지 유지보수",
    description: "운영 중인 홈페이지의 유지보수 카탈로그입니다. 긴급 오류 접수부터 처리 완료까지의 과정을 직접 확인할 수 있습니다.",
    keywords: ["홈페이지 유지보수", "홈페이지 수정", "홈페이지 오류 수정"],
    needs: ["급한 오류 접수", "처리 과정 공유", "월 점검 기록"],
    match: isMaintenance,
  },
];

/** 업종 홈페이지 샘플(랜딩, 유지보수 제외) */
export const homepageProjects = demoProjects.filter((p) => !groups.some((g) => g.match(p)));

export const groupOf = (p: Project) => groups.find((g) => g.match(p));

export const samplesIn = (slug: string) => {
  const g = groups.find((x) => x.slug === slug);
  if (g) return demoProjects.filter(g.match);
  const ind = industries.find((i) => i.slug === slug);
  return ind ? homepageProjects.filter((p) => (fieldsById[p.id] ?? []).includes(ind.field)) : [];
};

/** 샘플이 속한 첫 업종 */
export const industryOf = (p: Project) => industries.find((i) => (fieldsById[p.id] ?? []).includes(i.field));

/** 샘플 메뉴 하위 탭: 전체와 업종 */
export const worksTabs = [
  { href: "/classic/works", label: "전체" },
  ...industries.map((i) => ({ href: `/classic/works/${i.slug}`, label: i.label })),
  ...groups.map((g) => ({ href: `/classic/works/${g.slug}`, label: g.label })),
];
