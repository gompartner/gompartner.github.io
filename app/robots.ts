import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  // /demo는 noindex 메타로 제외한다 — robots.txt에서 Disallow하면
  // 크롤러가 noindex 메타 자체를 읽지 못하므로 여기서 막지 않는다.
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/_next/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
