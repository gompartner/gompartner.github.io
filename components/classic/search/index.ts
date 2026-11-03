import { catalogProjects, demoProjects, hrefOf, industryOf, isProgram, threeProjects, thumbOf } from "@/components/classic/works/samples";
import { threeFaq, threeForWhom, threeMeta, threeScope } from "@/data/classic/three";
import { industries } from "@/data/classic/industries";
import { faq } from "@/data/classic/faq";
import { maintenanceFaq, maintenanceServices } from "@/data/classic/maintenance";
import { notices } from "@/data/classic/notices";
import { tools } from "@/data/classic/tools";
import { insights } from "@/data/classic/insights";
import { channelLabel, channelPosts } from "@/data/classic/channelPosts";
import { makeExtras } from "@/data/classic/makeExtra";

// 통합검색 색인. 서버에서 만들어 검색 페이지(클라이언트)에 넘긴다(11-01).
export type SearchKind = "서비스" | "카탈로그" | "인사이트" | "네이버 블로그" | "티스토리" | "유튜브" | "자료실" | "자주 묻는 질문" | "공지사항";
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
    { kind: "서비스", title: "홈페이지 제작", desc: "병원, 매장, 전문직, 기업, 학원 홈페이지를 업종에 맞게 만듭니다", href: "/homepage", hay: "홈페이지 제작 반응형 패키지 소개 문의 예약 맞춤 기능 검색엔진 등록 원본 소스" },
    { kind: "서비스", title: "랜딩페이지 제작", desc: "광고로 들어온 고객의 상담, 예약 신청을 바로 받는 홍보용 페이지를 만듭니다", href: "/landing-page", hay: "랜딩 랜딩페이지 광고 신청 접수 구글 시트 문자 알림톡 이벤트 홍보" },
    { kind: "서비스", title: "업무 프로그램 제작", desc: "엑셀로 하던 주문 취합, 관리, 출력 업무를 웹 프로그램으로 만듭니다", href: "/program", hay: "업무 프로그램 엑셀 자동화 관리자 주문 취합 결과지 출력 발주서" },
    ...makeExtras.map((m) => ({ kind: "서비스" as const, title: m.title, desc: m.lead, href: `/${m.id}`, hay: [m.metaDescription, ...m.scope.flatMap((g) => g.items), ...m.forWhom].join(" ") })),
    { kind: "서비스", title: threeMeta.title, desc: threeMeta.lead, href: "/3d", hay: ["3D 쓰리디 견적 컨피규레이터 쇼룸 가구 중문 간판 인테리어", threeMeta.metaDescription, ...threeScope.flatMap((g) => g.items), ...threeForWhom].join(" ") },
    ...threeFaq.map((f) => ({ kind: "자주 묻는 질문" as const, title: f.q, desc: f.a, href: "/3d#t3d-faq", hay: threeMeta.title })),
    { kind: "서비스", title: "홈페이지 유지보수", desc: "오류 수정, 업체 변경, 보안 업데이트, 월 관리", href: "/maintenance", hay: "유지보수 관리 수정" },
    ...maintenanceServices.map((s) => ({
      kind: "서비스" as const,
      title: s.h1,
      desc: s.term,
      href: `/maintenance/${s.id}`,
      hay: [s.title, s.metaDescription, ...s.blocks.flatMap((b) => b.items), ...s.cases.flatMap((c) => [c.title, ...c.items])].join(" "),
    })),
    ...makeExtras.flatMap((m) => m.faq.map((f) => ({ kind: "자주 묻는 질문" as const, title: f.q, desc: f.a, href: `/${m.id}#${m.id}-faq`, hay: m.title }))).map((x) => ({ ...x, kind: "자주 묻는 질문" as const })),
    ...industries.map((i) => ({ kind: "서비스" as const, title: i.title, desc: i.needs.join(", "), href: `/works/${i.slug}`, hay: [i.label, i.description, ...i.needs].join(" ") })),
  ];
  const catalogs: SearchItem[] = [...catalogProjects, ...demoProjects.filter(isProgram), ...threeProjects].map((p) => ({
    kind: "카탈로그",
    title: plain(p.title),
    desc: plain(p.features.join(", ")),
    href: hrefOf(p),
    hay: [p.category, p.layout, industryOf(p)?.label ?? "", plain(p.description)].join(" "),
    thumb: thumbOf(p),
  }));
  // 11-04 키오스크 3D 체험(/demo/<slug>/3d). 목록은 app/demo/[slug]/3d/page.tsx 의 demos3d 와 같게 둔다
  const kiosk3d: SearchItem[] = ["kiosk-clinic", "kiosk-academy"].flatMap((slug) => {
    const p = demoProjects.find((x) => x.demoUrl === `/demo/${slug}`);
    return p ? [{ kind: "카탈로그" as const, title: `${plain(p.title)} 3D 체험`, desc: "실제 장소에 놓인 키오스크를 3D로 돌려 보며 화면을 눌러 봅니다", href: `/demo/${slug}/3d`, hay: ["키오스크 3D 쓰리디 체험", p.category, plain(p.description)].join(" "), thumb: thumbOf(p) }] : [];
  });
  const faqs: SearchItem[] = [
    ...faq.map((f) => ({ kind: "자주 묻는 질문" as const, title: f.q, desc: f.a, href: "/faq", hay: "" })),
    ...maintenanceServices.flatMap((s) => (maintenanceFaq[s.id] ?? []).map((f) => ({ kind: "자주 묻는 질문" as const, title: f.q, desc: f.a, href: `/maintenance/${s.id}#md-faq`, hay: s.h1 }))),
  ];
  const files: SearchItem[] = tools.map((t) => ({ kind: "자료실", title: t.title, desc: t.description, href: t.href, hay: `자료실 무료 도구 ${t.category}` }));
  const news: SearchItem[] = notices.map((n) => ({ kind: "공지사항", title: n.title, desc: n.summary, href: `/notice/${n.id}`, hay: n.sections.flatMap((x) => [x.h, ...(x.p ?? []), ...(x.list ?? [])]).join(" ") }));
  const posts: SearchItem[] = insights.map((n) => ({
    kind: "인사이트",
    title: n.title,
    desc: n.summary,
    href: `/insight/${n.slug}`,
    hay: [n.series, ...n.blocks.flatMap((b) => [b.h ?? "", ...(b.p ?? []), ...(b.steps ?? []).flatMap((s) => [s.b, s.t]), ...(b.table?.rows.flat() ?? [])])].join(" "),
  }));
  // 11-04 채널 글(ops/channel-posts.mjs가 RSS로 받음). 결과를 누르면 그 채널 글로 새 창이 열린다
  const blog: SearchItem[] = channelPosts.map((p) => ({
    kind: channelLabel[p.source] as SearchKind,
    title: p.title,
    desc: p.desc,
    href: p.url,
    hay: [channelLabel[p.source], ...p.tags].join(" "),
  }));
  return [...services, ...catalogs, ...kiosk3d, ...posts, ...blog, ...files, ...faqs, ...news];
}

/** 카탈로그 검색용(카탈로그 목록 페이지) */
export function buildCatalogIndex(only?: { demoUrl: string }[]): SearchItem[] {
  const ids = new Set((only ?? [...catalogProjects, ...threeProjects]).map((p) => (p.demoUrl.startsWith("/demo/") ? `/sample/${p.demoUrl.replace("/demo/", "")}` : p.demoUrl)));
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
