// 아카이브 실제 사례 링크 점검(11-21). 보관본이 열리지 않으면 알려 준다. 고칠 때는 data/classic/trendData.ts 의 alive 를 false 로.
// 사용: node scripts/check-archive-links.mjs
import { readFileSync } from "node:fs";
const src = readFileSync(new URL("../data/classic/trendData.ts", import.meta.url), "utf8");
const urls = [...src.matchAll(/url: "(http[^"]+web\.archive\.org[^"]+)"/g)].map((m) => m[1]);
let bad = 0;
for (const u of urls) {
  try {
    const r = await fetch(u, { method: "GET", redirect: "follow", signal: AbortSignal.timeout(30000) });
    const ok = r.status === 200;
    if (!ok) bad++;
    console.log(ok ? "정상" : `확인 필요(${r.status})`, u);
  } catch (e) {
    bad++;
    console.log("확인 필요(접속 실패)", u);
  }
}
console.log(`${urls.length}개 중 확인 필요 ${bad}개`);
process.exit(bad ? 1 : 0);
