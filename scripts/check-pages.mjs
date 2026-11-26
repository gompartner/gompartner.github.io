// 11-22 배포 전 기본 점검. 사이트맵의 모든 페이지가 검색, 공유, AI, 접근성 기본을 갖췄는지 빌드 결과(out/)로 본다.
// 하나라도 빠지면 빌드를 실패시킨다(점검표를 사람이 보는 대신 장치로). 빌드 뒤 자동 실행(package.json postbuild).
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const out = `${root}out`;
const sm = readFileSync(`${out}/sitemap.xml`, "utf8");
const paths = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
const llms = readFileSync(`${out}/llms.txt`, "utf8");
const brandOk = (p) => p === "/" || p.startsWith("/en") || p.startsWith("/3d/");
const errs = [];
for (const p of paths) {
  const f = [`${out}${p.replace(/\/$/, "")}.html`, `${out}${p}/index.html`, `${out}${p}index.html`].find(existsSync);
  if (!f) { errs.push(`${p}: 파일 없음`); continue; }
  const h = readFileSync(f, "utf8");
  const body = h.replace(/<script[\s\S]*?<\/script>/g, "");
  const need = (ok, msg) => { if (!ok) errs.push(`${p}: ${msg}`); };
  const desc = h.match(/<meta name="description" content="([^"]*)/)?.[1] ?? "";
  need(/<title>[^<]{2,}/.test(h), "title 없음");
  need(desc.length >= 40, `설명 짧음(${desc.length}자)`);
  need(/<link rel="canonical"/.test(h) || p.startsWith("/3d/"), "canonical 없음");
  need((body.match(/<h1[\s>]/g) || []).length === 1, "h1이 하나가 아님");
  need(!/<img(?![^>]*\balt=)[^>]*>/.test(body), "alt 없는 이미지");
  need((body.match(/<main[\s>]/g) || []).length <= 1, "main 중복");
  need(/application\/ld\+json/.test(h) || p.startsWith("/3d/"), "구조화 데이터 없음");
  if (!brandOk(p)) need(!/og:image" content="[^"]*og-image\.png/.test(h), "대표 이미지 없음(node scripts/page-cards.mjs)");
  // 11-26 공유 미리보기: 그림 파일이 실제로 있고, 1200x630으로 적혀 있고, 주소에 버전 값이 붙어 있을 것(그림을 바꾸면 lib/seo.ts 의 OG_VERSION 을 올린다)
  const og = (h.match(/<meta property="og:image" content="([^"]*)/)?.[1] ?? "").replace(/&amp;/g, "&");
  const ogFile = og ? decodeURIComponent(new URL(og, "https://gompartner.co.kr").pathname) : "";
  need(og && existsSync(`${out}${ogFile}`), `대표 이미지 파일 없음(${og || "og:image 없음"})`);
  need(/og:image:width" content="1200"/.test(h) && /og:image:height" content="630"/.test(h), "대표 이미지 크기가 1200x630으로 적혀 있지 않음");
  need(/\?v=\d{8}/.test(og), "대표 이미지 주소에 버전 값(?v=) 없음");
  need(/og:image:alt" content="[^"]+/.test(h), "대표 이미지 alt 없음");
  need(/name="twitter:card" content="summary_large_image"/.test(h) && /name="twitter:image" content="[^"]+/.test(h), "twitter 카드 없음");
  if (/^\/(insight|knowledge|tools)\//.test(p)) need(llms.includes(p), "llms.txt에 없음");
}
if (errs.length) {
  console.error(`\n기본 점검 실패 ${errs.length}건\n` + errs.join("\n"));
  process.exit(1);
}
console.log(`기본 점검 통과: ${paths.length}쪽`);
