import fs from "node:fs";
import path from "node:path";
import type { Project } from "@/lib/types";
import { industries } from "@/data/classic/industries";
import { projects } from "@/data/classic/projects";
import { fieldsById } from "@/data/classic/workFilters";
import { PROGRAM_IDS } from "@/data/classic/programIds";
import { threeDemos } from "@/data/classic/three";
import { VARIANTS } from "@/lib/variants";

// 클래식 샘플 페이지 공용 계산. 서버에서만 쓴다(파일 존재 확인).

export const slugOf = (demoUrl: string) => demoUrl.replace("/work/", "");
export const demoProjects = projects.filter((p) => p.demoUrl.startsWith("/work/"));
export const findBySlug = (slug: string) => demoProjects.find((p) => slugOf(p.demoUrl) === slug);

/** 11-04 3D 데모 6종(public/3d 정적 페이지). 상세 페이지(/sample) 없이 카드에서 데모로 바로 간다 */
export const threeProjects: Project[] = threeDemos.map((d) => ({
  id: `3d-${d.href.split("/").filter(Boolean).pop()}`,
  kind: "신규 제작",
  category: "3D",
  layout: d.category,
  title: `${d.category} ${d.title}`,
  description: d.desc,
  features: d.features,
  imageUrl: d.img,
  imageAlt: `${d.category} ${d.title} 3D 화면`,
  demoUrl: d.href,
}));

/** 카드가 여는 주소: 일반 데모는 상세 페이지, 3D는 데모로 바로 */
export const hrefOf = (p: Project) => (p.demoUrl.startsWith("/work/") ? `/sample/${slugOf(p.demoUrl)}` : p.demoUrl);

/** 썸네일을 다시 찍으면 올린다. /images는 하루 캐시라 같은 이름이면 휴대폰에 예전 사진이 남는다(11-22). */
const IMG_VER = "1122";

const exists = (src: string) => fs.existsSync(path.join(process.cwd(), "public", src));

/** 목록 썸네일. 작은 캡처가 없으면 PC 캡처를 쓴다. */
export function thumbOf(p: Project) {
  const sm = `/images/demos/sm/${slugOf(p.demoUrl)}.jpg`;
  return exists(sm) ? `${sm}?v=${IMG_VER}` : p.imageUrl;
}

/** 11-22 시안 A, B가 있는 업종 홈페이지(메인 한 장 디자인 제안) */
export const isDraft = (p: Project) => p.layout === "시안 2종";
/** 시안이 둘 이상 있는 샘플(업종 홈페이지와 랜딩). 카드와 상세 첫 화면에 두 시안을 나란히 둔다 */
export const hasPair = (p: Project) => (VARIANTS[slugOf(p.demoUrl)]?.length ?? 0) >= 2;

/** 시안 B 첫 화면 작은 캡처(public/images/demos/sm-b). 없으면 null */
export function thumbBOf(p: Project) {
  const b = `/images/demos/sm-b/${slugOf(p.demoUrl)}.jpg`;
  return exists(b) ? `${b}?v=${IMG_VER}` : null;
}

export function mobileShotOf(p: Project) {
  const m = `/images/demos/m/${slugOf(p.demoUrl)}.jpg`;
  return exists(m) ? `${m}?v=${IMG_VER}` : null;
}

export const isMaintenance = (p: Project) => p.kind === "유지보수" || ["maintenance-dashboard", "maintenance-urgent-fix", "accessibility-review"].includes(p.id);

/** 앱, 키오스크 카탈로그: 브라우저 틀 없이 기기만 보여 준다 */
export const isDeviceCatalog = (p: Project) => p.category === "앱" || p.category === "키오스크" || p.category === "3D";

export const isLanding = (p: Project) => p.category === "랜딩페이지" || p.id.startsWith("landing-");
export const isProgram = (p: Project) => PROGRAM_IDS.includes(p.id);

/** 업종 홈페이지와 섞이지 않게 따로 묶는 샘플 묶음. 탭 주소는 /works/<slug> */
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
    slug: "app",
    label: "앱",
    title: "앱 제작",
    description: "예약, 출결, 회원권처럼 고객이 휴대폰으로 쓰는 앱 카탈로그입니다. 화면을 직접 눌러 볼 수 있습니다.",
    keywords: ["앱 제작", "앱 개발", "예약 앱", "학원 앱"],
    needs: ["푸시 알림", "예약, 출결", "회원권, 적립", "관리자 웹"],
    match: (p) => p.category === "앱",
  },
  {
    slug: "kiosk",
    label: "키오스크",
    title: "키오스크 화면 제작",
    description: "병원 접수, 학원 출결처럼 현장에서 직접 누르는 키오스크 화면 카탈로그입니다.",
    keywords: ["키오스크 제작", "접수 키오스크", "출결 키오스크", "키오스크 프로그램"],
    needs: ["큰 글씨, 음성 안내", "대기번호 출력", "QR, 번호 입력", "관리자 화면"],
    match: (p) => p.category === "키오스크",
  },
  {
    slug: "3d",
    label: "3D",
    title: "3D 웹 제작",
    description: "고객이 제품을 직접 구성하면 3D와 견적이 바로 나오는 카탈로그입니다. 가구, 중문, 간판, 인테리어 화면을 직접 돌려 볼 수 있습니다.",
    keywords: ["3D 웹 제작", "3D 견적", "제품 컨피규레이터", "3D 쇼룸"],
    needs: ["3D 구성", "실시간 견적", "견적 요청 접수", "기존 홈페이지 연결"],
    match: (p) => p.category === "3D",
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

/** 카탈로그로 보여 주는 묶음. 업종 홈페이지, 랜딩, 앱, 키오스크(11-01). 업무 프로그램은 서비스 페이지에서 화면으로 보여 준다 */
export const catalogGroups = groups.filter((g) => ["landing", "app", "kiosk", "3d"].includes(g.slug));
/** 카탈로그 목록에 나오는 것(업종 홈페이지와 랜딩) */
export const catalogProjects = demoProjects.filter((p) => !isProgram(p) && !isMaintenance(p));

export const samplesIn = (slug: string) => {
  const g = groups.find((x) => x.slug === slug);
  if (g) return [...demoProjects, ...threeProjects].filter(g.match);
  const ind = industries.find((i) => i.slug === slug);
  // 11-01 카탈로그마다 대표 분야 하나만(분야별 개수 합이 전체와 맞게)
  return ind ? homepageProjects.filter((p) => industryOf(p)?.slug === ind.slug) : [];
};

/** 샘플이 속한 첫 업종 */
export const industryOf = (p: Project) => industries.find((i) => (fieldsById[p.id] ?? []).includes(i.field));

/** 샘플 메뉴 하위 탭: 전체와 업종 */
export const worksTabs = [
  { href: "/works", label: "전체" },
  ...industries.map((i) => ({ href: `/works/${i.slug}`, label: i.label })),
  ...catalogGroups.map((g) => ({ href: `/works/${g.slug}`, label: g.label })),
];

/** 11-24 진열대(넘겨 보기)에 올릴 목록. 휴대폰 첫 화면 캡처(public/images/shelf)가 있는 것만. 3D를 맨 앞에 둔다 */
export function shelfItems() {
  const secs = [
    ...catalogGroups.filter((g) => g.slug === "3d").map((g) => ({ label: g.label, items: samplesIn(g.slug) })),
    ...industries.map((i) => ({ label: i.label, items: samplesIn(i.slug) })),
    ...catalogGroups.filter((g) => g.slug !== "3d").map((g) => ({ label: g.label, items: samplesIn(g.slug) })),
  ];
  const out: { id: string; name: string; group: string; variants: { ab: string; label: string; href: string; img: string }[] }[] = [];
  for (const sec of secs)
    for (const p of sec.items) {
      const is3d = !p.demoUrl.startsWith("/work/");
      const slug = is3d ? p.demoUrl.split("/").filter(Boolean).pop()! : slugOf(p.demoUrl);
      const vs = is3d ? [] : VARIANTS[slug] ?? [];
      const variants = (vs.length >= 2
        ? vs.map((v) => ({ ab: v.id.toUpperCase(), label: v.label.replace(/^시안 \S+ /, ""), href: `${p.demoUrl}?v=${v.id}`, img: `/images/shelf/${slug}-${v.id}.jpg` }))
        : [{ ab: "", label: "", href: p.demoUrl, img: `/images/shelf/${is3d ? "3d-" : ""}${slug}.jpg` }]
      ).filter((v) => exists(v.img));
      if (variants.length) out.push({ id: p.id, name: p.title, group: sec.label, variants });
    }
  return out;
}

/** 11-24 메인 "시안 고르기"에 넘길 목록: 업종 묶음별 업종 홈페이지와 시안 이름 */
export function builderItems() {
  return industries.flatMap((i) =>
    samplesIn(i.slug)
      .map((p) => ({ group: i.label, id: p.id, slug: slugOf(p.demoUrl), name: p.title.replace(/ 홈페이지$/, ""), variants: (VARIANTS[slugOf(p.demoUrl)] ?? []).map((v) => ({ id: v.id, label: v.label.replace(/^시안 \S+ /, "") })) }))
      .filter((x) => x.variants.length >= 2),
  );
}
