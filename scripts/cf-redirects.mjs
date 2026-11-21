// 빌드 뒤 out에서 폴더/index.html 형태 페이지를 찾아 out/_redirects를 만든다.
// Cloudflare는 끝 슬래시를 붙일 때 307(임시)로 넘기므로, GitHub Pages 때와 같은 301로 맞춘다.
import { readdirSync, statSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = "out";
const lines = [];
function walk(dir, rel) {
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    if (!statSync(abs).isDirectory() || name.startsWith("_")) continue;
    const r = rel ? `${rel}/${name}` : name;
    if (existsSync(join(abs, "index.html")) && !existsSync(`${abs}.html`)) lines.push(`/${r} /${r}/ 301`);
    walk(abs, r);
  }
}
walk(root, "");
// 고정 넘김(11-21 자료 첫 화면은 아카이브 점검표로. 점검표 상세 /jaryo/<id> 는 그대로)
lines.push("/jaryo /knowledge/checklists 301");
// 11-21 웹 용어 사전을 아카이브 용어로 합침(#용어 는 브라우저가 그대로 붙여 가고, 용어 첫 화면이 그 문서로 넘긴다)
lines.push("/glossary /knowledge/terms 301");
// 11-21 옛 목록 페이지(글, 도구 상세 주소는 그대로)
lines.push("/insight /knowledge/notes 301");
lines.push("/tools /knowledge/checklists 301");
// 11-21 아카이브(/archive)를 웹 지식(/knowledge)으로 옮김. 같은 날 공개한 옛 주소를 모두 새 주소로
const moved = [
  ["/archive", "/knowledge"], ["/archive/trends", "/knowledge"], ["/archive/design", "/knowledge/design"], ["/archive/tech", "/knowledge/frontend"],
  ["/archive/design/styles", "/knowledge/design-styles"], ["/archive/design/mobile", "/knowledge/mobile-screen"], ["/archive/design/screen-size", "/knowledge/screen-size"],
  ["/archive/tech/ie", "/knowledge/browser"], ["/archive/tech/flash", "/knowledge/flash-jquery"], ["/archive/trends/korea-ie", "/knowledge/browser"],
  ["/archive/trends/mobile", "/knowledge/mobile-screen"], ["/archive/trends/design", "/knowledge/design-styles"], ["/archive/trends/flash", "/knowledge/flash-jquery"],
  ...["https", "cms", "page-weight", "app", "php"].flatMap((d) => [[`/archive/tech/${d}`, `/knowledge/${d}`], [`/archive/trends/${d}`, `/knowledge/${d}`]]),
  ...["terms", "screens", "drafts", "data", "notes", "checklists"].map((d) => [`/archive/${d}`, `/knowledge/${d}`]),
  ["/archive/terms/*", "/knowledge/terms/:splat"],
];
for (const [from, to] of moved) lines.push(`${from} ${to} 301`);
writeFileSync(join(root, "_redirects"), lines.sort().join("\n") + "\n");
console.log(`_redirects ${lines.length}줄`);
