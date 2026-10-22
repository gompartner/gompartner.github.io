// 샘플 카드 썸네일(public/images/demos/<slug>.jpg, 1440x900)과 공유 이미지(public/og/<slug>.png, 1200x630)를 PC 첫 화면으로 찍는다.
// 사용: npm run build 후 out 폴더를 띄우고(예: npx serve@14.2.4 out -l 5055) node scripts/capture-thumbs.mjs [slug ...]
import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE = process.env.BASE ?? "http://localhost:5055";
const slugs = process.argv.slice(2);
if (!slugs.length) {
  console.log("slug를 하나 이상 적어 주세요");
  process.exit(1);
}
const HIDE = "[data-gtm-cta^='demo_guide'], .print\\:hidden.fixed { display: none !important }";

const b = await chromium.launch({ channel: "chrome" });
for (const slug of slugs) {
  for (const [w, h, file, type] of [
    [1440, 900, `public/images/demos/${slug}.jpg`, "jpeg"],
    [1200, 630, `public/og/${slug}.png`, "png"],
  ]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: "reduce" });
    const p = await ctx.newPage();
    await p.goto(`${BASE}/demo/${slug}`, { waitUntil: "networkidle" });
    await p.addStyleTag({ content: HIDE });
    // 성인 확인 창이 있는 샘플(술도가)은 확인을 누르고 찍는다
    const gate = p.getByRole("button", { name: /19세 이상/ });
    if (await gate.count()) await gate.first().click();
    await p.waitForTimeout(1500);
    await p.screenshot({ path: path.join(ROOT, file), type, ...(type === "jpeg" ? { quality: 82 } : {}) });
    await ctx.close();
  }
  console.log(slug);
}
await b.close();
