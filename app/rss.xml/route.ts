// 11-22 RSS 구독: 인사이트 글과 웹 지식 트렌드 문서. 피드 리더와 네이버 서치어드바이저 RSS 제출용
import { insights } from "@/data/classic/insights";
import { trendDocs, manualLog } from "@/data/classic/archive";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

const x = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const date = (d: string) => new Date(`${d}T09:00:00+09:00`).toUTCString();

export function GET() {
  const posts = insights.map((n) => ({ title: n.title, link: `${siteUrl}/insight/${n.slug}`, desc: n.summary, date: n.updated ?? n.date, cat: n.series }));
  const docs = trendDocs.map((d) => ({ title: d.title, link: `${siteUrl}${d.href}`, desc: d.desc, date: manualLog.find((l) => l.href === d.href)?.date ?? "2026-11-21", cat: "웹 지식" }));
  const items = [...posts, ...docs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 60);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>곰파트너 웹 지식</title>
<link>${siteUrl}/knowledge</link>
<atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
<description>홈페이지 유지보수, 보안, 검색, 인프라 실무 글과 연도별 웹 트렌드 문서</description>
<language>ko</language>
<lastBuildDate>${date(items[0].date)}</lastBuildDate>
${items.map((i) => `<item><title>${x(i.title)}</title><link>${i.link}</link><guid isPermaLink="true">${i.link}</guid><description>${x(i.desc)}</description><category>${x(i.cat)}</category><pubDate>${date(i.date)}</pubDate></item>`).join("\n")}
</channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
