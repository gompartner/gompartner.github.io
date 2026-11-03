import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

// /_next(CSS·JS)를 막으면 구글이 화면을 렌더링하지 못하므로 전체를 허용한다.
// /admin은 noindex 메타로 제외한다.
// 11-04 다음 웹마스터도구 소유 확인 줄(주석 형식이라 Next robots.ts로는 못 넣어 글자 그대로 내보낸다)
const body = `#DaumWebMasterTool:5ca9fcfe30a38ebbd317301b1364a711bc373b040d859d5af86ef739d50c522f:ObU+sFQzTvdXbIlCz16kkg==
User-Agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

export function GET() {
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
