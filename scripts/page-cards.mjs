// 11-22 대표 이미지가 따로 없는 페이지의 공유, 검색 썸네일(1200x675 JPG). 인사이트 카드와 같은 그림체.
// 사용: node scripts/page-cards.mjs <사이트 주소, 예 http://localhost:3123> [--all]
// 사이트맵의 각 페이지를 열어 og:image가 공통 이미지(og-image.png)인 페이지만 h1과 분류로 카드를 만든다. 결과는 public/og/page/<주소>.jpg
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const root = fileURLToPath(new URL("..", import.meta.url));
const base = process.argv[2] ?? "http://localhost:3000";
const all = process.argv.includes("--all");
const OUT = `${root}public/og/page`;
mkdirSync(OUT, { recursive: true });
const key = (p) => p.replace(/^\/|\/$/g, "").replaceAll("/", "--") || "home";
const font = readFileSync(`${root}assets/fonts/PretendardVariable.woff2`).toString("base64");
const avatar = readFileSync(`${root}public/images/bear-avatar.webp`).toString("base64");
const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;");
// 분류 이름표: 주소 앞부분으로 정한다
const label = (p) =>
  p.startsWith("/knowledge/terms/") ? "용어" : p.startsWith("/knowledge") ? "웹 지식" : p.startsWith("/tools/") ? "무료 도구" : p.startsWith("/notice") ? "공지사항" : p.startsWith("/maintenance") ? "유지보수" : p.startsWith("/works") ? "업종별 홈페이지" : "곰파트너";
const page = (lb, t) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: P; src: url(data:font/woff2;base64,${font}) format("woff2"); font-weight: 100 900; }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 675px; background: #0f1b3d; font-family: P; color: #fff; overflow: hidden; position: relative; font-feature-settings: "calt" 0;
  background-image: linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px); background-size: 48px 48px; }
.st { position: absolute; right: 0; bottom: 0; background: #256ef4; } .st1 { width: 144px; height: 288px; } .st2 { right: 144px; width: 144px; height: 192px; opacity: .75; } .st3 { right: 288px; width: 144px; height: 96px; opacity: .5; }
.box { position: absolute; left: 300px; top: 0; width: 600px; height: 675px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding-bottom: 12px; }
.logo { display: flex; align-items: center; gap: 12px; font-size: 30px; font-weight: 800; letter-spacing: -0.04em; }
.s { margin-top: 44px; display: inline-block; padding: 9px 16px; border-radius: 8px; background: #256ef4; font-size: 24px; font-weight: 700; }
h1 { margin-top: 26px; font-size: ${t.length > 22 ? 48 : 56}px; font-weight: 800; line-height: 1.3; letter-spacing: -0.04em; word-break: keep-all; text-wrap: balance; }
</style></head><body><div class="st st3"></div><div class="st st2"></div><div class="st st1"></div><div class="box"><div class="logo"><img src="data:image/webp;base64,${avatar}" style="width:46px;height:46px;border-radius:50%;object-fit:cover">곰파트너</div><div class="s">${esc(lb)}</div><h1>${esc(t)}</h1></div></body></html>`;

const xml = await (await fetch(`${base}/sitemap.xml`)).text();
const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname).filter((p) => p !== "/" && !p.startsWith("/en") && !p.startsWith("/3d/") && !p.startsWith("/insight/"));
const b = await chromium.launch({ channel: "chrome" });
const p = await b.newPage({ viewport: { width: 1200, height: 675 } });
let n = 0;
for (const path of paths) {
  const file = `${OUT}/${key(path)}.jpg`;
  if (!all && existsSync(file)) continue;
  const html = await (await fetch(base + path)).text();
  const og = html.match(/<meta property="og:image" content="([^"]*)/)?.[1] ?? "";
  if (!/og-image\.png/.test(og) && !og.includes("/og/page/")) continue;
  const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? "").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
  if (!h1) continue;
  await p.setContent(page(label(path), h1));
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: file, type: "jpeg", quality: 86 });
  n++;
  console.log(path, "|", h1);
}
await b.close();
console.log("만든 카드", n);
