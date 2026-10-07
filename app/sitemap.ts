import type { MetadataRoute } from "next";
import { projects } from "@/data/projects";
import { tools } from "@/data/tools";
import { industries } from "@/data/industries";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

// 첫 화면, 포트폴리오, 자료실, 데모 페이지를 색인 대상으로 둔다.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const demos = projects
    .filter((project) => project.demoUrl.startsWith("/demo/"))
    .map((project) => ({
      url: `${siteUrl}${project.demoUrl}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  return [
    {
      url: `${siteUrl}/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 1.0,
    },
    ...["/works", "/pricing", "/faq", "/career", "/privacy", ...industries.map((i) => `/works/${i.slug}`)].map((path) => ({
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
    ...demos,
  ];
}
