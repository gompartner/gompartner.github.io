import type { MetadataRoute } from "next";
import { projects } from "@/data/projects";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

// 첫 화면과 데모 페이지를 색인 대상으로 둔다.
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
    ...demos,
  ];
}
