import type { MetadataRoute } from "next";
import { blogPosts } from "@/data/blog";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { url: "/", priority: 1.0, changeFrequency: "weekly" as const },
    { url: "/about", priority: 0.8, changeFrequency: "monthly" as const },
    { url: "/portfolio", priority: 0.9, changeFrequency: "weekly" as const },
    { url: "/blog", priority: 0.8, changeFrequency: "weekly" as const },
    { url: "/contact", priority: 0.8, changeFrequency: "yearly" as const },
  ];

  const staticRoutes = routes.map((route) => ({
    url: `${siteUrl}${route.url}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const blogRoutes = blogPosts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // /demo/*는 noindex 정책이라 사이트맵에서 제외한다.
  return [...staticRoutes, ...blogRoutes];
}
