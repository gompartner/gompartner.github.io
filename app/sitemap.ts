import type { MetadataRoute } from "next";
import { demoProjects, slugOf } from "@/components/classic/works/samples";
import { tools } from "@/data/tools";
import { industries } from "@/data/classic/industries";
import { guides } from "@/data/guides";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

// 첫 화면(클래식), 클래식 샘플 소개, 가이드, 자료실을 색인 대상으로 둔다. 데모(/demo)는 noindex라 넣지 않는다.
// 10-22부터 클래식이 기본이라 웹툰과 짝이 있는 페이지는 /classic 주소를 넣고, 웹툰(/story)은 뺀다.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const samples = demoProjects
    .map((project) => ({
      url: `${siteUrl}/classic/sample/${slugOf(project.demoUrl)}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

  return [
    {
      url: `${siteUrl}/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/landing`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    },
    ...["/classic/works", "/classic/homepage", "/classic/story", "/classic/maintenance", "/classic/program", "/classic/faq", "/classic/contact", "/classic/privacy", "/guide", ...guides.map((g) => `/guide/${g.slug}`), ...industries.map((i) => `/classic/works/${i.slug}`)].map((path) => ({
      url: `${siteUrl}${path}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    ...["/tools", ...tools.map((t) => t.href)].map((path) => ({
      url: `${siteUrl}${path}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...samples,
  ];
}
