import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

// 원페이지 구성이라 색인 대상은 첫 화면 하나뿐이다.
// /demo/*는 noindex 정책이라 사이트맵에서 제외한다.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1.0,
    },
  ];
}
