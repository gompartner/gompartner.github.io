import type { MetadataRoute } from "next";
import { projects } from "@/data/projects";
import { tools } from "@/data/tools";
import { industries } from "@/data/industries";
import { guides } from "@/data/guides";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

// 첫 화면, 샘플 소개, 가이드, 자료실을 색인 대상으로 둔다. 데모(/demo)는 noindex라 넣지 않는다.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const samples = projects
    .filter((project) => project.demoUrl.startsWith("/demo/"))
    .map((project) => ({
      url: `${siteUrl}${project.demoUrl.replace("/demo/", "/sample/")}`,
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
    ...["/works", "/pricing", "/maintenance", "/faq", "/privacy", "/guide", ...guides.map((g) => `/guide/${g.slug}`), ...industries.map((i) => `/works/${i.slug}`)].map((path) => ({
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
