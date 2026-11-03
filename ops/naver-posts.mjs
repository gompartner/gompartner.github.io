// 네이버 블로그(gompartner) 공개 글 목록을 RSS에서 받아 data/classic/naverPosts.ts 로 쓴다. node ops/naver-posts.mjs
// 11-04: 구글이 네이버 블로그 글을 찾도록 인사이트 페이지 아래에 글 링크를 두고, 통합검색에도 넣는다.
// RSS는 최근 글 일부만 담을 수 있어서, 이미 저장된 목록과 합친다(RSS에서 빠진 옛 글도 남는다).
import fs from "fs";
import { fileURLToPath } from "url";
const out = fileURLToPath(new URL("../data/classic/naverPosts.ts", import.meta.url));

const prev = fs.existsSync(out) ? JSON.parse((fs.readFileSync(out, "utf8").match(/= (\[[\s\S]*\]);/) || [, "[]"])[1]) : [];
const res = await fetch("https://rss.blog.naver.com/gompartner.xml", { headers: { "User-Agent": "Mozilla/5.0" } });
if (!res.ok) throw new Error("RSS " + res.status);
const xml = await res.text();
const cdata = (s, tag) => ((s.match(new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`)) || [])[1] || "").trim();
const unesc = (s) => s.replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'");
const kst = (d) => new Date(new Date(d).getTime() + 9 * 3600e3).toISOString().slice(0, 10);
const fresh = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, it]) => {
  const logNo = (cdata(it, "guid").match(/\/(\d+)$/) || [])[1];
  return {
    logNo,
    title: unesc(cdata(it, "title")),
    date: kst(cdata(it, "pubDate")),
    category: unesc(cdata(it, "category")),
    tags: cdata(it, "tag").split(",").map((t) => t.trim()).filter(Boolean),
    desc: unesc(cdata(it, "description")).replace(/\s+/g, " ").slice(0, 160),
  };
}).filter((p) => p.logNo && p.title);
if (!fresh.length) throw new Error("RSS에 글이 없음");

const byNo = new Map(prev.map((p) => [p.logNo, p]));
for (const p of fresh) byNo.set(p.logNo, p);
const posts = [...byNo.values()].sort((a, b) => b.date.localeCompare(a.date) || b.logNo.localeCompare(a.logNo));
const body = `// ops/naver-posts.mjs 가 네이버 블로그 RSS로 만든 파일. 직접 고치지 않는다.
export type NaverPost = { logNo: string; title: string; date: string; category?: string; tags?: string[]; desc?: string };
export const naverPosts: NaverPost[] = ${JSON.stringify(posts, null, 2)};
`;
fs.writeFileSync(out, body);
console.log("naverPosts", posts.length, "(RSS", fresh.length + ")");
