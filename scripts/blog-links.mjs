// 곰파트너 티스토리 RSS에서 공개된 제작기를 찾아 data/blogPosts.json에 "데모 id → 글 주소"로 적는다.
// 글 본문의 gompartner.co.kr/demo/<id> 링크로 어느 데모 글인지 안다. 예약 글은 공개된 뒤 빌드 때 들어온다.
// RSS는 최근 글만 주므로 이미 적힌 줄은 지우지 않고 더하기만 한다. 받아 오지 못하면 파일을 그대로 둔다.
import { readFileSync, writeFileSync } from "node:fs";

const FILE = new URL("../data/blogPosts.json", import.meta.url);
const current = JSON.parse(readFileSync(FILE, "utf8"));

try {
  const res = await fetch("https://gompartner.tistory.com/rss", { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`RSS ${res.status}`);
  const xml = await res.text();
  const next = { ...current };
  for (const item of xml.split("<item>").slice(1)) {
    const link = item.match(/<link>\s*(https:\/\/gompartner\.tistory\.com\/\d+)\s*<\/link>/)?.[1];
    const demo = item.match(/gompartner\.co\.kr\/demo\/([a-z0-9-]+)/)?.[1];
    if (link && demo && !next[demo]) next[demo] = link;
  }
  const sorted = Object.fromEntries(Object.entries(next).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(FILE, JSON.stringify(sorted, null, 2) + "\n");
  console.log(`blog links: ${Object.keys(sorted).length}`);
} catch (e) {
  console.warn(`blog links: RSS를 못 받아 기존 목록 사용 (${e.message})`);
}
