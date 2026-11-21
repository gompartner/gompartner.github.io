// 배포 뒤 아카이브 페이지를 인터넷 아카이브(Wayback Machine)에 저장한다(11-21 사용자: 날짜 증거는 제3자 기록으로).
// 사용: node scripts/wayback-save.mjs            -> 사이트맵의 /archive, /insight 주소 전부
//      node scripts/wayback-save.mjs <주소> ...  -> 지정한 주소만
// 결과(날짜, 주소, 보관본 주소)는 01_Work/03_Resource/아카이브-근거/wayback-saves.tsv 에 한 줄씩 더한다(저장소 밖, 맥에서 돌릴 때만).
import { appendFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";

const SITE = "https://gompartner.co.kr";
const LOG = `${homedir()}/MySpace/01_Work/03_Resource/아카이브-근거/wayback-saves.tsv`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let urls = process.argv.slice(2);
if (!urls.length) {
  const xml = await (await fetch(`${SITE}/sitemap.xml`)).text();
  urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => /\/(archive|insight)(\/|$)/.test(u));
}
console.log(`저장할 주소 ${urls.length}개`);
let ok = 0;
for (const u of urls) {
  let snap = "", status = 0;
  for (let attempt = 0; attempt < 3 && !snap; attempt++) {
    try {
      const r = await fetch(`https://web.archive.org/save/${u}`, { redirect: "manual", headers: { "User-Agent": "gompartner-archive-saver" }, signal: AbortSignal.timeout(120000) });
      status = r.status;
      const loc = r.headers.get("content-location") || r.headers.get("location") || "";
      if (loc.includes("/web/")) snap = loc.startsWith("http") ? loc : `https://web.archive.org${loc}`;
      else if (r.status === 429) await sleep(60000);
    } catch {
      status = -1;
    }
    if (!snap) await sleep(15000);
  }
  if (snap) ok++;
  console.log(snap ? "저장" : `실패(${status})`, u, snap);
  if (existsSync(`${homedir()}/MySpace/01_Work/03_Resource/아카이브-근거`)) appendFileSync(LOG, `${new Date().toISOString()}\t${u}\t${snap || `실패 ${status}`}\n`);
  await sleep(12000);
}
console.log(`${urls.length}개 중 저장 ${ok}개`);
