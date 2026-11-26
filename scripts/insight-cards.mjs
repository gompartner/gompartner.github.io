// 운영 노트(/insight) 글의 대표 이미지(1200x630 JPG)를 글 제목으로 만든다. 공유 미리보기, 구글 디스커버, 구조화 데이터에만 쓰고 본문에는 넣지 않는다.
// 사용: node scripts/insight-cards.mjs (없는 것만 만든다) / --all (모두 다시)
//  CDP=http://127.0.0.1:9333 을 주면 새 크롬을 띄우지 않고 이미 떠 있는 업무용 크롬의 새 탭으로 만든다
// 11-26 페이지 카드와 같은 틀(scripts/og-card.mjs)로 맞췄다: 어두운 바탕, 가운데 정렬, 꼬리표 "WIKI / 운영 노트", 제목 세 줄까지.
// 폰트(Pretendard woff2)를 쓰려고 크롬으로 그린다. 빌드 서버에는 폰트가 없어 만든 JPG를 저장소에 올린다.
// 그림을 다시 만들어 배포할 때는 lib/seo.ts 의 OG_VERSION 을 올린다.
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { drawCard, openTab, root } from "./og-card.mjs";

const src = readFileSync(`${root}data/classic/insights.ts`, "utf8");
const items = [...src.matchAll(/slug: "([^"]+)",[\s\S]*?series: "([^"]+)",\s*no: (\d+),\s*title:\s*(?:"((?:[^"\\]|\\.)*)"|'([^']*)')/g)].map((m) => ({
  slug: m[1],
  title: (m[4] ?? m[5]).replace(/\\"/g, '"'),
}));

const all = process.argv.includes("--all");
const OUT = `${root}public/images/insight`;
mkdirSync(OUT, { recursive: true });
const todo = items.filter((n) => all || !existsSync(`${OUT}/${n.slug}.jpg`));
if (!todo.length) {
  console.log("새로 만들 이미지 없음");
  process.exit(0);
}
const { page, close } = await openTab();
const failed = [];
try {
  for (const n of todo) {
    try {
      const fit = await drawCard(page, { label: "WIKI / 운영 노트", title: n.title }, `${OUT}/${n.slug}.jpg`);
      console.log(n.slug, "|", `${fit.size}px ${fit.lines}줄`);
    } catch (e) {
      failed.push(`${n.slug}: ${e.message}`);
    }
  }
} finally {
  await close();
}
if (failed.length) {
  console.error(`\n만들지 못한 그림 ${failed.length}건\n${failed.join("\n")}`);
  process.exit(1);
}
process.exit(0);
