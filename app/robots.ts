import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  // /_next(CSS·JS)를 막으면 구글이 화면을 렌더링하지 못하므로 전체를 허용한다.
  // /admin은 noindex 메타로 제외한다.
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
