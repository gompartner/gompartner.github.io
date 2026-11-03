import { execFileSync } from "node:child_process";
import type { MetadataRoute } from "next";
import { catalogProjects, demoProjects, isProgram, slugOf } from "@/components/classic/works/samples";
import { industries } from "@/data/classic/industries";
import { notices } from "@/data/classic/notices";
import { tools } from "@/data/classic/tools";
import { insights } from "@/data/classic/insights";
import { maintenanceServices } from "@/data/classic/maintenance";
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

    { path: "/homepage", priority: 0.9, files: ["app/(classic)/homepage/page.tsx"] },
    { path: "/en", priority: 0.6, files: ["app/en/page.tsx"] },
    // 11-04 영문 서비스 상세 3종, 3D, 카탈로그
    ...["naver-setup", "korean-payments", "localization"].map((x) => ({ path: `/en/${x}`, priority: 0.5, files: ["app/en/[service]/page.tsx", "data/en/site.ts"] })),
    { path: "/en/3d", priority: 0.5, files: ["app/en/3d/page.tsx", "data/en/site.ts"] },
    { path: "/en/works", priority: 0.5, files: ["app/en/works/page.tsx", "data/en/site.ts"] },
    { path: "/landing-page", priority: 0.8, files: ["app/(classic)/landing/page.tsx", "data/classic/pricing.ts"] },
    { path: "/program", priority: 0.8, files: ["app/(classic)/program/page.tsx"] },
    { path: "/app", priority: 0.8, files: ["app/(classic)/app/page.tsx", "data/classic/makeExtra.ts"] },
    { path: "/kiosk", priority: 0.8, files: ["app/(classic)/kiosk/page.tsx", "data/classic/makeExtra.ts"] },
    // 11-03 3D 웹 제작. 본문은 사이트 페이지, 섬 화면과 데모 6종은 public/3d 정적 페이지(원본 모션-카탈로그)
    { path: "/3d", priority: 0.8, files: ["app/(classic)/3d/page.tsx", "data/classic/three.ts"] },
    ...["sofa", "configurator", "space", "door", "sign", "hanok"].map((d) => ({ path: `/3d/${d}/`, priority: 0.6, files: [`public/3d/${d}/index.html`] })),
    { path: "/maintenance", priority: 0.9, files: ["app/(classic)/maintenance/page.tsx", maintenanceData] },
    ...maintenanceServices.map((m) => ({ path: `/maintenance/${m.id}`, priority: 0.9, files: ["app/(classic)/maintenance/[id]/page.tsx", maintenanceData] })),

    { path: "/story", priority: 0.7, files: ["app/(classic)/story/page.tsx", "data/classic/about.ts"] },
    { path: "/faq", priority: 0.7, files: ["app/(classic)/faq/page.tsx", "data/classic/faq.ts"] },
    { path: "/contact", priority: 0.7, files: ["app/(classic)/contact/page.tsx"] },
    { path: "/works", priority: 0.7, files: ["app/(classic)/works/page.tsx", "components/classic/works/samples.ts"] },
    ...industries.map((i) => ({ path: `/works/${i.slug}`, priority: 0.7, files: ["app/(classic)/works/[slug]/page.tsx", "data/classic/industries.ts"] })),
    { path: "/works/landing", priority: 0.6, files: ["app/(classic)/works/[slug]/page.tsx", "components/classic/works/samples.ts"] },
    { path: "/works/app", priority: 0.6, files: ["app/(classic)/works/[slug]/page.tsx", "components/classic/works/samples.ts"] },
    { path: "/works/kiosk", priority: 0.6, files: ["app/(classic)/works/[slug]/page.tsx", "components/classic/works/samples.ts"] },
    { path: "/works/3d", priority: 0.6, files: ["app/(classic)/works/[slug]/page.tsx", "data/classic/three.ts"] },

    ...[...catalogProjects, ...demoProjects.filter(isProgram)].map((p) => ({ path: `/sample/${slugOf(p.demoUrl)}`, priority: 0.5, files: ["app/(classic)/sample/[slug]/page.tsx", "components/classic/works/samples.ts"] })),

    { path: "/insight", priority: 0.6, files: ["app/(classic)/insight/page.tsx", "data/classic/insights.ts"] },
    ...insights.map((n) => ({ path: `/insight/${n.slug}`, priority: 0.6, date: new Date(`${n.date}T00:00:00+09:00`) })),
    // 11-04 자료실(무료 도구)을 고객지원으로 되살림
    { path: "/tools", priority: 0.5, files: ["app/(classic)/tools/page.tsx", "data/classic/tools.ts"] },
    ...tools.map((t) => ({ path: t.href, priority: 0.4, files: [`app/(classic)${t.href}/page.tsx`] })),
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
