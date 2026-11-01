import { catalogProjects, demoProjects, industryOf, isProgram, slugOf, thumbOf } from "@/components/classic/works/samples";
import { industries } from "@/data/classic/industries";
import { faq } from "@/data/classic/faq";
import { maintenanceFaq, maintenanceServices } from "@/data/classic/maintenance";
import { notices } from "@/data/classic/notices";

// 통합검색 색인. 서버에서 만들어 검색 페이지(클라이언트)에 넘긴다(11-01).
export type SearchKind = "서비스" | "카탈로그" | "자주 묻는 질문" | "공지사항";
export interface SearchItem {
  kind: SearchKind;
  title: string;
  desc: string;
  href: string;
  /** 검색에만 쓰는 낱말(화면에 안 보임) */
  hay: string;
  thumb?: string;
}

const plain = (t: string) => t.replaceAll("·", ", ");

export function buildSearchIndex(): SearchItem[] {
  const services: SearchItem[] = [
    { kind: "서비스", title: "홈페이지 제작", desc: "병원, 매장, 전문직, 기업, 학원 홈페이지를 업종에 맞게 만듭니다", href: "/classic/homepage", hay: "홈페이지 제작 반응형 패키지 소개 문의 예약 맞춤 기능 검색엔진 등록 원본 소스" },
    { kind: "서비스", title: "랜딩페이지 제작", desc: "광고로 들어온 고객의 상담, 예약 신청을 바로 받는 홍보용 페이지를 만듭니다", href: "/classic/landing", hay: "랜딩 랜딩페이지 광고 신청 접수 구글 시트 문자 알림톡 이벤트 홍보" },
    { kind: "서비스", title: "업무 프로그램 제작", desc: "엑셀로 하던 주문 취합, 관리, 출력 업무를 웹 프로그램으로 만듭니다", href: "/classic/program", hay: "업무 프로그램 엑셀 자동화 관리자 주문 취합 결과지 출력 발주서" },
    { kind: "서비스", title: "홈페이지 유지보수", desc: "오류 수정, 업체 변경, 보안 업데이트, 월 관리", href: "/classic/maintenance", hay: "유지보수 관리 수정" },
    ...maintenanceServices.map((s) => ({
      kind: "서비스" as const,
      title: s.h1,
      desc: s.term,
      href: `/classic/maintenance/${s.id}`,
      hay: [s.title, s.metaDescription, ...s.blocks.flatMap((b) => b.items), ...s.cases.flatMap((c) => [c.title, ...c.items])].join(" "),
    })),
    ...industries.map((i) => ({ kind: "서비스" as const, title: i.title, desc: i.needs.join(", "), href: `/classic/works/${i.slug}`, hay: [i.label, i.description, ...i.needs].join(" ") })),
  ];
  const catalogs: SearchItem[] = [...catalogProjects, ...demoProjects.filter(isProgram)].map((p) => ({
    kind: "카탈로그",
    title: plain(p.title),
    desc: plain(p.features.join(", ")),
    href: `/classic/sample/${slugOf(p.demoUrl)}`,
    hay: [p.category, industryOf(p)?.label ?? "", plain(p.description)].join(" "),
    thumb: thumbOf(p),
  }));
  const faqs: SearchItem[] = [
    ...faq.map((f) => ({ kind: "자주 묻는 질문" as const, title: f.q, desc: f.a, href: "/classic/faq", hay: "" })),
    ...maintenanceServices.flatMap((s) => (maintenanceFaq[s.id] ?? []).map((f) => ({ kind: "자주 묻는 질문" as const, title: f.q, desc: f.a, href: `/classic/maintenance/${s.id}#md-faq`, hay: s.h1 }))),
  ];
  const news: SearchItem[] = notices.map((n) => ({ kind: "공지사항", title: n.title, desc: n.summary, href: `/classic/notice/${n.id}`, hay: n.sections.flatMap((x) => [x.h, ...(x.p ?? []), ...(x.list ?? [])]).join(" ") }));
  return [...services, ...catalogs, ...faqs, ...news];
}

/** 카탈로그 검색용(카탈로그 목록 페이지) */
export function buildCatalogIndex(): SearchItem[] {
  const ids = new Set(catalogProjects.map((p) => `/classic/sample/${slugOf(p.demoUrl)}`));
  return buildSearchIndex().filter((i) => i.kind === "카탈로그" && ids.has(i.href));
}
