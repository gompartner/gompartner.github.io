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
lines.push("/jaryo /archive/checklists 301");
writeFileSync(join(root, "_redirects"), lines.sort().join("\n") + "\n");
console.log(`_redirects ${lines.length}줄`);
