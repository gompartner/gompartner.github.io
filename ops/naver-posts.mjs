// 네이버 블로그(gompartner) 공개 글 목록을 data/classic/naverPosts.ts 로 받는다. node ops/naver-posts.mjs
// 11-04: 구글이 네이버 블로그 글을 찾도록 인사이트 페이지 아래에 글 링크를 둔다(구글 색인 0건이었음).
import fs from "fs"; import { fileURLToPath } from "url";
const out = fileURLToPath(new URL("../data/classic/naverPosts.ts", import.meta.url));
const posts = [];
for (let pg = 1; pg <= 10; pg++) {
  const r = await fetch(`https://blog.naver.com/PostTitleListAsync.naver?blogId=gompartner&viewdate=&currentPage=${pg}&categoryNo=0&parentCategoryNo=0&countPerPage=30`, { headers: { "User-Agent": "Mozilla/5.0" } });
  const t = await r.text();
  const rows = [...t.matchAll(/"logNo":"(\d+)","title":"([^"]*)".*?"addDate":"([^"]*)"/g)].map((m) => ({ logNo: m[1], title: decodeURIComponent(m[2].replace(/\+/g, " ")).replace(/&quot;/g, '"').replace(/&amp;/g, "&").trim(), date: m[3].replace(/\.\s*/g, "-").replace(/-$/, "") }));
  const fresh = rows.filter((x) => !posts.some((p) => p.logNo === x.logNo));
  if (!fresh.length) break;
  posts.push(...fresh);
}
posts.sort((a, b) => b.date.localeCompare(a.date) || b.logNo.localeCompare(a.logNo));
const body = `// ops/naver-posts.mjs 가 만든 파일. 직접 고치지 않는다.\nexport type NaverPost = { logNo: string; title: string; date: string };\nexport const naverPosts: NaverPost[] = ${JSON.stringify(posts, null, 2)};\n`;
fs.writeFileSync(out, body);
console.log("naverPosts", posts.length);
