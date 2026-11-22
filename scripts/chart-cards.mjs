// 11-22 트렌드 문서 대표 이미지(1200x675 JPG): 제목 카드에 그 문서의 첫 차트(제목 "chart" 아래 첫 덩어리)를 넣는다.
// 사용: 빌드 뒤 out/을 띄우고 SUFFIX=.html node scripts/chart-cards.mjs http://localhost:3124 (개발 서버는 Next 표시가 찍혀 쓰지 않는다)
// 결과는 public/og/page/<주소>.jpg(page-cards.mjs의 제목 카드를 덮어쓴다). 카톡 정사각 잘림을 생각해 가운데 600px 안에 둔다.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const root = fileURLToPath(new URL("..", import.meta.url));
const base = process.argv[2] ?? "http://localhost:3000";
const src = readFileSync(`${root}data/classic/archive.ts`, "utf8");
const docs = [...src.matchAll(/\{ href: "(\/knowledge\/[a-z0-9-]+)", title: "((?:[^"\\]|\\.)*)"/g)].map((m) => ({ href: m[1], title: m[2].replace(/\\"/g, '"') }));
const uniq = [...new Map(docs.map((d) => [d.href, d])).values()];
const key = (p) => p.replace(/^\/|\/$/g, "").replaceAll("/", "--");
const font = readFileSync(`${root}assets/fonts/PretendardVariable.woff2`).toString("base64");
const avatar = readFileSync(`${root}public/images/bear-avatar.webp`).toString("base64");
const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;");
// 제목은 콜론 앞(짧은 이름)만 크게
const short = (t) => t.split(":")[0].trim();
const card = (t, img) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: P; src: url(data:font/woff2;base64,${font}) format("woff2"); font-weight: 100 900; }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 675px; background: #0f1b3d; font-family: P; color: #fff; overflow: hidden; position: relative;
  background-image: linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px); background-size: 48px 48px; }
.box { position: absolute; left: 270px; top: 0; width: 660px; height: 675px; display: flex; flex-direction: column; align-items: center; padding-top: 44px; text-align: center; }
.top { display: flex; align-items: center; gap: 12px; font-size: 24px; font-weight: 800; letter-spacing: -0.04em; }
.s { margin-left: 6px; padding: 5px 11px; border-radius: 6px; background: #256ef4; font-size: 18px; font-weight: 700; }
h1 { margin-top: 18px; font-size: 46px; font-weight: 800; line-height: 1.25; letter-spacing: -0.04em; word-break: keep-all; }
.c { margin-top: 26px; width: 660px; height: 420px; background: #fff; border-radius: 14px; padding: 18px; display: flex; align-items: flex-start; justify-content: center; overflow: hidden; }
.c img { max-width: 100%; max-height: 100%; object-fit: contain; object-position: top; }
</style></head><body><div class="box"><div class="top"><img src="data:image/webp;base64,${avatar}" style="width:38px;height:38px;border-radius:50%;object-fit:cover">곰파트너<span class="s">웹 지식</span></div><h1>${esc(t)}</h1><div class="c"><img src="data:image/png;base64,${img}"></div></div></body></html>`;

const b = await chromium.launch({ channel: "chrome" });
const page = await b.newPage({ viewport: { width: 900, height: 1200 }, deviceScaleFactor: 2 });
const out = await b.newPage({ viewport: { width: 1200, height: 675 } });
let n = 0;
for (const d of uniq) {
  await page.goto(base + d.href + (process.env.SUFFIX ?? ""), { waitUntil: "networkidle" });
  const el = page.locator("#chart + *").first();
  if (!(await el.count())) { console.log("차트 없음", d.href); continue; }
  await page.addStyleTag({ content: "header{position:static!important}" });
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  const bb = await el.boundingBox();
  // 아주 긴 덩어리(연표)는 위쪽만: 가로 대비 0.64 높이까지
  const h = Math.min(bb.height, bb.width * 0.64);
  const shot = await page.screenshot({ clip: { x: bb.x, y: bb.y, width: bb.width, height: h } });
  await out.setContent(card(short(d.title), shot.toString("base64")));
  await out.evaluate(() => document.fonts.ready);
  await out.screenshot({ path: `${root}public/og/page/${key(d.href)}.jpg`, type: "jpeg", quality: 86 });
  n++;
  console.log(d.href, "|", short(d.title), Math.round(bb.height));
}
await b.close();
console.log("만든 카드", n);
