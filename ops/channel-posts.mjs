// 곰파트너 채널 글(네이버 블로그, 티스토리, 유튜브)을 RSS로 받아 data/classic/channelPosts.ts 로 쓴다. node ops/channel-posts.mjs
// 11-04: 인사이트 목록과 통합검색에 같이 보여 주고, 구글이 바깥 채널 글을 찾게 한다.
// RSS는 최근 글만 담으니 이미 저장된 목록과 합친다. 티스토리는 사이트맵에 있는데 RSS에 없는 옛 글을 글 페이지 메타로 채운다.
// 채널 하나가 실패해도 그 채널은 저장된 목록을 그대로 쓴다.
import fs from "fs";
import { fileURLToPath } from "url";
const out = fileURLToPath(new URL("../data/classic/channelPosts.ts", import.meta.url));
const UA = { headers: { "User-Agent": "Mozilla/5.0" } };
const YT_CHANNEL = "UCcznASh0HmgO3_VV55QW90g";

const prev = fs.existsSync(out) ? JSON.parse((fs.readFileSync(out, "utf8").match(/= (\[[\s\S]*\]);/) || [, "[]"])[1]) : [];
const get = async (u) => { const r = await fetch(u, UA); if (!r.ok) throw new Error(u + " " + r.status); return r.text(); };
const tag = (s, t) => ((s.match(new RegExp(`<${t}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${t}>`)) || [])[1] || "").trim();
const unesc = (s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");
const text = (html) => unesc(unesc(html).replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const kst = (d) => new Date(new Date(d).getTime() + 9 * 3600e3).toISOString().slice(0, 10);
const meta = (html, p) => unesc((html.match(new RegExp(`<meta[^>]+(?:property|name)="${p}"[^>]+content="([^"]*)"`)) || [])[1] || "");

async function naver() {
  const xml = await get("https://rss.blog.naver.com/gompartner.xml");
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, it]) => {
    const id = (tag(it, "guid").match(/\/(\d+)$/) || [])[1];
    return { source: "naver", id, title: unesc(tag(it, "title")), date: kst(tag(it, "pubDate")), url: `https://blog.naver.com/gompartner/${id}`, desc: text(tag(it, "description")).slice(0, 160), tags: tag(it, "tag").split(",").map((t) => t.trim()).filter(Boolean) };
  }).filter((p) => p.id && p.title);
}

async function tistory(known) {
  const xml = await get("https://gompartner.tistory.com/rss");
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, it]) => {
    const url = tag(it, "link"); const id = (url.match(/\/(\d+)$/) || [])[1]; const d = unesc(tag(it, "description"));
    return { source: "tistory", id, title: unesc(tag(it, "title")), date: kst(tag(it, "pubDate")), url, desc: text(d).slice(0, 160), tags: [...it.matchAll(/<category>([\s\S]*?)<\/category>/g)].map((m) => unesc(m[1]).trim()), thumb: (d.match(/data-url="(https:\/\/blog\.kakaocdn\.net[^"]+)"/) || [])[1] };
  }).filter((p) => p.id && p.title);
  const sm = await get("https://gompartner.tistory.com/sitemap.xml");
  const ids = [...new Set([...sm.matchAll(/gompartner\.tistory\.com\/(\d+)<\/loc>/g)].map((m) => m[1]))];
  for (const id of ids) {
    if (items.some((p) => p.id === id) || known.has("tistory:" + id)) continue;
    try {
      const h = await get(`https://gompartner.tistory.com/${id}`);
      const title = meta(h, "og:title"); if (!title) continue;
      items.push({ source: "tistory", id, title, date: kst(meta(h, "article:published_time") || Date.now()), url: `https://gompartner.tistory.com/${id}`, desc: meta(h, "og:description").replace(/([.?!]["']?)(?=[^\s"'.,])/g, "$1 ").slice(0, 160), tags: [], thumb: meta(h, "og:image") || undefined });
    } catch (e) { console.log("티스토리", id, e.message); }
  }
  return items;
}

async function youtube() {
  const xml = await get(`https://www.youtube.com/feeds/videos.xml?channel_id=${YT_CHANNEL}`);
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(([, it]) => {
    const id = tag(it, "yt:videoId"); const desc = unesc(tag(it, "media:description"));
    return { source: "youtube", id, title: unesc(tag(it, "title")), date: kst(tag(it, "published")), url: (it.match(/<link rel="alternate" href="([^"]+)"/) || [])[1] || `https://www.youtube.com/watch?v=${id}`, desc: desc.replace(/#\S+/g, "").replace(/gompartner\.co\.kr/g, "").replace(/\s+/g, " ").trim().slice(0, 160), tags: [...desc.matchAll(/#(\S+)/g)].map((m) => m[1]).filter((t) => t !== "곰파트너"), thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg` };
  }).filter((p) => p.id && p.title);
}

const key = (p) => `${p.source}:${p.id}`;
const byKey = new Map(prev.map((p) => [key(p), p]));
const known = new Set(byKey.keys());
for (const [name, fn] of [["naver", naver], ["tistory", () => tistory(known)], ["youtube", youtube]]) {
  try { const got = await fn(); for (const p of got) byKey.set(key(p), { ...byKey.get(key(p)), ...p }); console.log(name, got.length); }
  catch (e) { console.log(name, "실패, 저장된 목록 사용:", e.message); }
}
const posts = [...byKey.values()].map((p) => Object.fromEntries(Object.entries(p).filter(([, v]) => v !== undefined))).sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
fs.writeFileSync(out, `// ops/channel-posts.mjs 가 채널 RSS로 만든 파일. 직접 고치지 않는다.
export type ChannelSource = "naver" | "tistory" | "youtube";
export type ChannelPost = { source: ChannelSource; id: string; title: string; date: string; url: string; desc: string; tags: string[]; thumb?: string };
export const channelPosts: ChannelPost[] = ${JSON.stringify(posts, null, 2)};
export const channelLabel: Record<ChannelSource, string> = { naver: "네이버 블로그", tistory: "티스토리", youtube: "유튜브" };
`);
console.log("channelPosts", posts.length);
