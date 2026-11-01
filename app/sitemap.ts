import { execFileSync } from "node:child_process";
import type { MetadataRoute } from "next";
import { catalogProjects, demoProjects, isProgram, slugOf } from "@/components/classic/works/samples";
import { industries } from "@/data/classic/industries";
import { notices } from "@/data/classic/notices";
import { maintenanceServices } from "@/data/classic/maintenance";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

// 색인 대상은 첫 화면과 /classic 새 페이지뿐이다. 옛 웹툰 주소(/story, 이동 페이지), 데모(/demo), 크몽 연결용 /landing 은 넣지 않는다.
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

    { path: "/classic/homepage", priority: 0.9, files: ["app/classic/homepage/page.tsx"] },
    { path: "/classic/landing", priority: 0.8, files: ["app/classic/landing/page.tsx", "data/classic/pricing.ts"] },
    { path: "/classic/program", priority: 0.8, files: ["app/classic/program/page.tsx"] },
    { path: "/classic/maintenance", priority: 0.9, files: ["app/classic/maintenance/page.tsx", maintenanceData] },
    ...maintenanceServices.map((m) => ({ path: `/classic/maintenance/${m.id}`, priority: 0.9, files: ["app/classic/maintenance/[id]/page.tsx", maintenanceData] })),

    { path: "/classic/story", priority: 0.7, files: ["app/classic/story/page.tsx", "data/classic/about.ts"] },
    { path: "/classic/faq", priority: 0.7, files: ["app/classic/faq/page.tsx", "data/classic/faq.ts"] },
    { path: "/classic/contact", priority: 0.7, files: ["app/classic/contact/page.tsx"] },
    { path: "/classic/works", priority: 0.7, files: ["app/classic/works/page.tsx", "components/classic/works/samples.ts"] },
    ...industries.map((i) => ({ path: `/classic/works/${i.slug}`, priority: 0.7, files: ["app/classic/works/[slug]/page.tsx", "data/classic/industries.ts"] })),
    { path: "/classic/works/landing", priority: 0.6, files: ["app/classic/works/[slug]/page.tsx", "components/classic/works/samples.ts"] },

    ...[...catalogProjects, ...demoProjects.filter(isProgram)].map((p) => ({ path: `/classic/sample/${slugOf(p.demoUrl)}`, priority: 0.5, files: ["app/classic/sample/[slug]/page.tsx", "components/classic/works/samples.ts"] })),

    { path: "/classic/notice", priority: 0.3, files: ["app/classic/notice/page.tsx", "data/classic/notices.ts"] },
    // 공지 글은 글에 적힌 날짜가 내용이 바뀐 날이다
    ...notices.map((n) => ({ path: `/classic/notice/${n.id}`, priority: 0.3, date: new Date(`${n.date}T00:00:00+09:00`) })),

    { path: "/classic/privacy", priority: 0.2, files: ["app/classic/privacy/page.tsx", "data/classic/privacyPolicy.ts"] },
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
