import { termGroups } from "@/data/classic/glossary";
import { termHref, topics, trendDocs } from "@/data/classic/archive";
import { execFileSync } from "node:child_process";
import type { MetadataRoute } from "next";
import { notices } from "@/data/classic/notices";
import { insights } from "@/data/classic/insights";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

// 색인 대상은 첫 화면과 app/(classic) 페이지뿐이다. 옛 /classic 주소(이동 페이지), 데모(/demo), 크몽 연결용 /landing 은 넣지 않는다.
// priority는 검색어 페이지(제작, 유지보수) 먼저, 공지와 개인정보는 낮게(11-01 점검).
// lastmod는 빌드 시각이 아니라 원본 파일의 마지막 커밋일이다. git이 없거나 기록이 없으면 생략한다.

const dateCache = new Map<string, string | null>();

function commitDate(file: string): string | null {
  if (!dateCache.has(file)) {
    let out: string | null = null;
    try {
      out = execFileSync("git", ["log", "-1", "--format=%cI", "--", file], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim() || null;
    } catch {
      out = null;
    }
    dateCache.set(file, out);
  }
  return dateCache.get(file) ?? null;
}

/** 여러 원본 파일 중 가장 최근 커밋일 */
function lastmod(...files: string[]): Date | undefined {
  const dates = files.map(commitDate).filter((d): d is string => !!d).map((d) => new Date(d).getTime());
  return dates.length ? new Date(Math.max(...dates)) : undefined;
}

type Entry = { path: string; priority: number; files?: string[]; date?: Date };

export default function sitemap(): MetadataRoute.Sitemap {
  const maintenanceData = "data/classic/maintenance.ts";
  const entries: Entry[] = [
    { path: "/", priority: 1.0, files: ["app/(home)/page.tsx", "components/classic/ClassicHome.tsx", "data/seo.ts"] },
    // 11-26 안쪽 한 판: 제작, 유지보수, 비용, 카탈로그
    { path: "/make", priority: 0.9, files: ["app/(classic)/make/page.tsx", "components/classic/make/MakeBoard.tsx", "data/classic/pricing.ts"] },
    { path: "/works", priority: 0.7, files: ["app/(classic)/works/page.tsx", "components/classic/works/WorksBoard.tsx", "data/classic/workCases.ts"] },

    // 11-03 3D 웹 제작. 본문은 사이트 페이지(11-26 한 판으로), 섬 화면과 3D 화면들은 public/3d 정적 페이지(원본 모션-카탈로그)
    { path: "/3d", priority: 0.8, files: ["app/(classic)/3d/page.tsx", "components/classic/three/ThreeBoard.tsx", "data/classic/three.ts"] },
    ...["room", "sofa", "configurator", "space", "door", "sign"].map((d) => ({ path: `/3d/${d}/`, priority: 0.6, files: [`public/3d/${d}/index.html`] })),
    { path: "/maintenance", priority: 0.9, files: ["app/(classic)/maintenance/page.tsx", maintenanceData] },

    { path: "/pricing", priority: 0.8, files: ["app/(classic)/pricing/page.tsx", "data/classic/pricing.ts"] },
    { path: "/story", priority: 0.7, files: ["app/(classic)/story/page.tsx", "data/classic/about.ts"] },
    { path: "/faq", priority: 0.7, files: ["app/(classic)/faq/page.tsx", "data/classic/faq.ts"] },
    { path: "/contact", priority: 0.7, files: ["app/(classic)/contact/page.tsx"] },


    ...insights.map((n) => ({ path: `/insight/${n.slug}`, priority: 0.6, date: new Date(`${n.updated ?? n.date}T00:00:00+09:00`) })),
    // 11-21 아카이브(문서 사이트형). /jaryo 첫 화면은 /archive/checklists 로 넘긴다
    { path: "/knowledge", priority: 0.7, files: ["app/(classic)/knowledge/page.tsx", "data/classic/archive.ts"] },
    ...["terms", "screens", "data", "notes", "checklists"].map((s) => ({ path: `/knowledge/${s}`, priority: 0.6, files: [`app/(classic)/knowledge/${s}/page.tsx`, "data/classic/archive.ts"] })),
    ...topics().map((t) => ({ path: `/knowledge/${t.id}`, priority: 0.6, files: ["data/classic/archive.ts"] })),
    ...trendDocs.map((d) => ({ path: d.href, priority: 0.6, files: [`app/(classic)${d.href}/page.tsx`, "data/classic/trendData.ts"] })),
    ...termGroups.map((g) => ({ path: termHref(g), priority: 0.6, files: ["app/(classic)/knowledge/terms/[slug]/page.tsx", "data/classic/glossary.ts", "data/classic/archive.ts"] })),
    { path: "/notice", priority: 0.3, files: ["app/(classic)/notice/page.tsx", "data/classic/notices.ts"] },
    // 공지 글은 글에 적힌 날짜가 내용이 바뀐 날이다
    ...notices.map((n) => ({ path: `/notice/${n.id}`, priority: 0.3, date: new Date(`${n.date}T00:00:00+09:00`) })),

    { path: "/privacy", priority: 0.2, files: ["app/(classic)/privacy/page.tsx", "data/classic/privacyPolicy.ts"] },
  ];

  return entries.map((e) => {
    const lastModified = e.date ?? (e.files ? lastmod(...e.files) : undefined);
    return {
      url: `${siteUrl}${e.path}`,
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: "monthly" as const,
      priority: e.priority,
    };
  });
}
