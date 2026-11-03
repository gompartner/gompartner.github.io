// 인사이트 대표 이미지(1200x675 JPG)를 글 제목으로 만든다. 공유 미리보기, 구글 디스커버, 구조화 데이터에만 쓰고 본문에는 넣지 않는다.
// 사용: node scripts/insight-cards.mjs (없는 것만 만든다) / --all (모두 다시)
// 폰트(Pretendard woff2)를 쓰려고 크롬으로 그린다. 빌드 서버에는 폰트가 없어 만든 JPG를 저장소에 올린다.
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const root = fileURLToPath(new URL("..", import.meta.url));
const src = readFileSync(`${root}data/classic/insights.ts`, "utf8");
const items = [...src.matchAll(/slug: "([^"]+)",[\s\S]*?series: "([^"]+)",\s*no: (\d+),\s*title:\s*(?:"((?:[^"\\]|\\.)*)"|'([^']*)')/g)].map((m) => ({
  slug: m[1],
  series: m[2],
  no: m[3],
  title: (m[4] ?? m[5]).replace(/\\"/g, '"'),
}));

const font = readFileSync(`${root}assets/fonts/PretendardVariable.woff2`).toString("base64");
// 로고는 바닥글과 같은 곰 얼굴(bear-avatar.webp) + "곰파트너"
const avatar = readFileSync(`${root}public/images/bear-avatar.webp`).toString("base64");
const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;");

// 배경: 남색 바탕에 옅은 모눈, 오른쪽 아래 파란 계단 세 칸(11-02 시안 B 선택)
const DECO = {
  css: `body { background-image: linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px); background-size: 48px 48px; } .st { position: absolute; right: 0; bottom: 0; background: #256ef4; } .st1 { width: 144px; height: 288px; } .st2 { right: 144px; width: 144px; height: 192px; opacity: .75; } .st3 { right: 288px; width: 144px; height: 96px; opacity: .5; }`,
  html: `<div class="st st3"></div><div class="st st2"></div><div class="st st1"></div>`,
};
// 위시켓 블로그처럼 브랜드 바탕(남색)에 로고(바닥글과 같은 곰 얼굴 + 곰파트너), 묶음 이름, 제목만. 큰 캐릭터 그림은 넣지 않는다(11-02)
// 쉼표 앞이 짧으면(10자 이하) 쉼표 뒤에서 줄을 바꾸고, 길면 줄 길이를 고르게 나눈다("때,"만 한 줄에 남지 않게, 11-04)
const title = (t) => {
  const i = t.indexOf(", ");
  return i > 0 && i <= 10 ? `${esc(t.slice(0, i + 1))}<br>${esc(t.slice(i + 2))}` : esc(t);
};
const page = (n) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: P; src: url(data:font/woff2;base64,${font}) format("woff2"); font-weight: 100 900; }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 675px; background: #0f1b3d; font-family: P; color: #fff; overflow: hidden; position: relative; font-feature-settings: "calt" 0; }
/* 11-04 카톡처럼 가운데 정사각(가로 262~937px)으로 잘려도 다 보이게, 로고와 이름표와 제목을 가운데 600px 안에 가운데 정렬로 둔다 */
.box { position: absolute; left: 300px; top: 0; width: 600px; height: 675px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding-bottom: 12px; }
.logo { display: flex; align-items: center; gap: 12px; font-size: 30px; font-weight: 800; letter-spacing: -0.04em; }
.s { margin-top: 44px; display: inline-block; padding: 9px 16px; border-radius: 8px; background: #256ef4; font-size: 24px; font-weight: 700; }
h1 { margin-top: 26px; font-size: 56px; font-weight: 800; line-height: 1.3; letter-spacing: -0.04em; word-break: keep-all; text-wrap: balance; }
${DECO.css}
</style></head><body>${DECO.html}<div class="box"><div class="logo"><img src="data:image/webp;base64,${avatar}" style="width:46px;height:46px;border-radius:50%;object-fit:cover">곰파트너</div><div class="s">${esc(n.series)} ${n.no}편</div><h1>${title(n.title)}</h1></div></body></html>`;

const all = process.argv.includes("--all");
mkdirSync(`${root}public/images/insight`, { recursive: true });
const OUT = `${root}public/images/insight`;
const todo = items.filter((n) => all || !existsSync(`${OUT}/${n.slug}.jpg`));
if (!todo.length) {
  console.log("새로 만들 이미지 없음");
  process.exit(0);
}
const b = await chromium.launch({ channel: "chrome" });
const p = await b.newPage({ viewport: { width: 1200, height: 675 } });
for (const n of todo) {
  await p.setContent(page(n));
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: `${OUT}/${n.slug}.jpg`, type: "jpeg", quality: 88 });
  console.log(n.slug);
}
await b.close();
