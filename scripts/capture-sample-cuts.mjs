// 샘플 표지용 캡처: 휴대폰 첫 화면(public/images/demos/m/<slug>.jpg)과
// 사용법 단계(tours)마다 그 영역 화면(public/images/sample-cuts/<slug>-<n>.jpg).
// 사용: npm run build 후 out 폴더를 띄우고(예: npx serve@14.2.4 out -l 5055) node scripts/capture-sample-cuts.mjs [slug]
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE = process.env.BASE ?? "http://localhost:5055";
const src = fs.readFileSync(path.join(ROOT, "data/tours.ts"), "utf8");
const projects = fs.readFileSync(path.join(ROOT, "data/projects.ts"), "utf8");
const pairs = [...projects.matchAll(/id: "([\w-]+)",[\s\S]*?demoUrl: "\/demo\/([\w-]+)"/g)].map((m) => ({ id: m[1], slug: m[2] }));
// tours.ts에서 id별 target 목록만 뽑는다
const tours = {};
for (const m of src.matchAll(/^  "?([\w-]+)"?: \[([\s\S]*?)^  \],/gm)) {
  tours[m[1]] = [...m[2].matchAll(/target: (["'])(.*?)\1/g)].map((x) => x[2]);
}
const only = process.argv[2];
const b = await chromium.launch({ channel: "chrome" });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, reducedMotion: "reduce" });
for (const { id, slug } of pairs) {
  if (only && only !== slug) continue;
  const p = await ctx.newPage();
  await p.goto(`${BASE}/demo/${slug}`, { waitUntil: "networkidle" });
  await p.addStyleTag({ content: "[data-gtm-cta^='demo_guide'], .print\\:hidden.fixed { display: none !important }" });
  await p.waitForTimeout(1200);
  await p.screenshot({ path: path.join(ROOT, `public/images/demos/m/${slug}.jpg`), type: "jpeg", quality: 82 });
  const targets = tours[id] ?? [];
  for (const [n, sel] of targets.entries()) {
    const box = await p.evaluate((sel) => {
      let el = document.querySelector(sel);
      if (!el || !el.getClientRects().length) return null;
      if (/^H[1-6]$/.test(el.tagName)) el = el.closest("section") ?? el.parentElement;
      el.scrollIntoView({ block: "start", behavior: "instant" });
      window.scrollBy(0, -64);
      const r = el.getBoundingClientRect();
      return { x: 0, y: Math.max(r.top - 8, 0) + scrollY, width: 390, height: Math.min(r.height + 16, 720) };
    }, sel);
    if (!box) { console.log("skip", slug, n, sel); continue; }
    await p.waitForTimeout(500);
    await p.screenshot({ path: path.join(ROOT, `public/images/sample-cuts/${slug}-${n}.jpg`), type: "jpeg", quality: 82, fullPage: true, clip: box });
  }
  console.log(slug, targets.length);
  await p.close();
}
await b.close();
