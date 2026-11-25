import { catalogProjects, demoProjects, industryOf, isProgram, threeProjects, thumbOf } from "@/components/classic/works/samples";
import { threeFaq, threeForWhom, threeMeta, threeScope } from "@/data/classic/three";
import { faq } from "@/data/classic/faq";
import { maintenanceFaq, maintenanceServices } from "@/data/classic/maintenance";
import { notices } from "@/data/classic/notices";
import { insights } from "@/data/classic/insights";
import { makeExtras } from "@/data/classic/makeExtra";
import { termGroups } from "@/data/classic/glossary";
import { designDocs, shortTitle, takeover, techDocs, termHref } from "@/data/classic/archive";
import { datasets } from "@/data/classic/trendData";

// 통합검색 색인. 서버에서 만들어 검색 페이지(클라이언트)에 넘긴다(11-01).
export type SearchKind = "서비스" | "카탈로그" | "위키" | "운영 노트" | "네이버 블로그" | "티스토리" | "유튜브" | "무료 도구" | "용어" | "자주 묻는 질문" | "공지사항";
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
    { kind: "서비스", title: "홈페이지 제작", desc: "병원, 매장, 전문직, 기업, 학원 홈페이지를 업종에 맞게 만듭니다", href: "/make", hay: "홈페이지 제작 반응형 패키지 소개 문의 예약 맞춤 기능 검색엔진 등록 원본 소스" },
    { kind: "서비스", title: "랜딩페이지 제작", desc: "광고로 들어온 고객의 상담, 예약 신청을 바로 받는 홍보용 페이지를 만듭니다", href: "/make", hay: "랜딩 랜딩페이지 광고 신청 접수 구글 시트 문자 알림톡 이벤트 홍보" },
    { kind: "서비스", title: "업무 프로그램 제작", desc: "엑셀로 하던 주문 취합, 관리, 출력 업무를 웹 프로그램으로 만듭니다", href: "/make", hay: "업무 프로그램 엑셀 자동화 관리자 주문 취합 결과지 출력 발주서" },
    ...makeExtras.map((m) => ({ kind: "서비스" as const, title: m.title, desc: m.lead, href: "/make", hay: [m.metaDescription, ...m.scope.flatMap((g) => g.items), ...m.forWhom].join(" ") })),
    { kind: "서비스", title: threeMeta.title, desc: threeMeta.lead, href: "/3d", hay: ["3D 쓰리디 견적 컨피규레이터 쇼룸 가구 중문 간판 인테리어", threeMeta.metaDescription, ...threeScope.flatMap((g) => g.items), ...threeForWhom].join(" ") },
    ...threeFaq.map((f) => ({ kind: "자주 묻는 질문" as const, title: f.q, desc: f.a, href: "/3d#t3d-faq", hay: threeMeta.title })),
    { kind: "서비스", title: "홈페이지 유지보수", desc: "유지보수, 유지관리, 성능 개선, 고도화, 업체 변경, 보안 업데이트", href: "/maintenance", hay: "유지보수 관리 수정 바이브코딩" },
    ...maintenanceServices.map((s) => ({
      kind: "서비스" as const,
      title: s.h1,
      desc: s.term,
      href: "/maintenance",
      hay: [s.title, s.metaDescription, ...s.blocks.flatMap((b) => b.items), ...s.cases.flatMap((c) => [c.title, ...c.items])].join(" "),
    })),
    ...makeExtras.flatMap((m) => m.faq.map((f) => ({ kind: "자주 묻는 질문" as const, title: f.q, desc: f.a, href: "/make", hay: m.title }))).map((x) => ({ ...x, kind: "자주 묻는 질문" as const })),
  ];
  const catalogs: SearchItem[] = [...catalogProjects, ...demoProjects.filter(isProgram), ...threeProjects].map((p) => ({
    kind: "카탈로그",
    title: plain(p.title),
    desc: plain(p.features.join(", ")),
    href: "/works",
    hay: [p.category, p.layout, industryOf(p)?.label ?? "", plain(p.description)].join(" "),
    thumb: thumbOf(p),
  }));
  // 11-04 키오스크 3D 체험(/work/<slug>/3d). 목록은 app/work/[slug]/3d/page.tsx 의 demos3d 와 같게 둔다
  // 11-26 데모, 샘플 주소를 내려 화면은 카탈로그 한 판(/works)으로만 잇는다
  const kiosk3d: SearchItem[] = [];
  const faqs: SearchItem[] = [
    ...faq.map((f) => ({ kind: "자주 묻는 질문" as const, title: f.q, desc: f.a, href: "/faq", hay: "" })),
    ...maintenanceServices.flatMap((s) => (maintenanceFaq[s.id] ?? []).map((f) => ({ kind: "자주 묻는 질문" as const, title: f.q, desc: f.a, href: "/maintenance", hay: s.h1 }))),
  ];
  const news: SearchItem[] = notices.map((n) => ({ kind: "공지사항", title: n.title, desc: n.summary, href: `/notice/${n.id}`, hay: n.sections.flatMap((x) => [x.h, ...(x.p ?? []), ...(x.list ?? [])]).join(" ") }));
  const posts: SearchItem[] = insights.map((n) => ({
    kind: "운영 노트",
    title: n.title,
    desc: n.summary,
    href: `/insight/${n.slug}`,
    hay: [n.series, ...n.blocks.flatMap((b) => [b.h ?? "", ...(b.p ?? []), ...(b.steps ?? []).flatMap((s) => [s.b, s.t]), ...(b.table?.rows.flat() ?? [])])].join(" "),
  }));
  // 11-15 용어: 용어 하나가 결과 한 줄, 누르면 그 용어 자리로 간다(11-21부터 아카이브 용어 문서)
  const terms: SearchItem[] = termGroups.flatMap((g) => g.terms.map((t) => ({ kind: "용어" as const, title: t.name, desc: `${t.look}. ${t.alt}`, href: `${termHref(g)}#${t.id}`, hay: [t.alt, t.use, t.say, g.title, g.cat, g.sec].join(" ") })));
  // 11-21 아카이브 문서: 트렌드, 용어 묶음 문서, 데이터
  const archive: SearchItem[] = [
    { kind: "위키", title: "화면 예시: 페이지 종류별 와이어프레임", desc: "첫 화면, 회사 소개, 게시판, 로그인, 결제, 예약, 접수, 검색, 관리자", href: "/knowledge/screens", hay: "화면 예시 와이어프레임 시안 레이아웃 페이지 구성 디자인" },
    { kind: "위키", title: "위키 홈", desc: "기획, 디자인, 개발, 인프라, 보안, 검색, 운영과 유지보수, 법과 규정", href: "/knowledge", hay: "위키 아카이브 자료 자료실 문서 허브 위키" },
    ...designDocs.map((d) => ({ kind: "위키" as const, title: d.title, desc: d.desc, href: d.href, hay: "트렌드 디자인 화면 기기 한국 일본 미국 비교 차트 연도별 역사 변화" })),
    ...techDocs.map((d) => ({ kind: "위키" as const, title: d.title, desc: d.desc, href: d.href, hay: "트렌드 기술 한국 일본 미국 비교 차트 연도별 역사 변화" })),
    ...termGroups.map((g) => ({ kind: "위키" as const, title: `용어 문서: ${shortTitle(g)}`, desc: g.terms.map((t) => t.name).join(", "), href: termHref(g), hay: [g.title, g.cat, g.sec, ...(takeover[g.id] ?? []).flatMap((x) => [x.b, x.t]), takeover[g.id] ? "인수 시 확인 사항" : ""].join(" ") })),
    ...datasets.map((d) => ({ kind: "위키" as const, title: `데이터: ${d.title}`, desc: d.desc, href: `/knowledge/data#${d.id}`, hay: `데이터 통계 차트 CSV ${d.source.label}` })),
  ];
  return [...services, ...catalogs, ...archive, ...kiosk3d, ...posts, ...terms, ...faqs, ...news];
}

/** 카탈로그 검색용(카탈로그 목록 페이지) */
export function buildCatalogIndex(only?: { demoUrl: string }[]): SearchItem[] {
  const ids = new Set((only ?? [...catalogProjects, ...threeProjects]).map((p) => (p.demoUrl.startsWith("/work/") ? `/sample/${p.demoUrl.replace("/work/", "")}` : p.demoUrl)));
  return buildSearchIndex().filter((i) => i.kind === "카탈로그" && ids.has(i.href));
}

/** 업종 탭 추천 검색어: 그 탭 카탈로그 기능 이름에 두 번 이상 나오는 낱말(눌렀을 때 결과가 있는 말만) */
const STOP = new Set(["안내", "관리", "화면", "목록", "정보", "보기", "신청", "소개", "확인", "자주", "묻는", "질문", "오시는", "남은", "자리", "이번", "달"]);
export function topKeywords(items: { features: string[] }[], n = 5) {
  const count = new Map<string, number>();
  for (const p of items) {
    const words = new Set(plain(p.features.join(" ")).split(/[\s,()]+/).filter((w) => w.length >= 2 && w.length <= 6 && !STOP.has(w)));
    for (const w of words) count.set(w, (count.get(w) ?? 0) + 1);
  }
  return [...count.entries()].filter(([, c]) => c >= 2).sort((a, b) => b[1] - a[1]).slice(0, n).map(([w]) => w);
}
