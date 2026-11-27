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
// 11-27 사용자 "그만 넘겨, 페이지 찾을 수 없다만 표시해도 되잖아": 옛 주소를 새 주소로 넘기던 규칙 79개(/archive, /tools, /works 하위,
// /maintenance 하위, /en, /sample, /demo 등)를 모두 뺐다. 옛 주소는 이제 404(찾을 수 없음) 화면이 나온다.
// Cloudflare 넘김 규칙 상한(100개 안팎)에 붙어 새 폴더 페이지를 만들면 배포가 실패하던 문제(11-27 /trend)도 같이 풀린다.
// 위의 "끝에 / 붙이기"(폴더형 페이지마다 301)는 검색엔진에 영구 이동으로 알리려고 남긴다
// 11-27 사용자 "그냥 빼고": 끝에 / 붙이기(301)도 넣지 않는다. 끝 슬래시는 Cloudflare 기본 동작(auto-trailing-slash)이 맡는다
lines.length = 0;
writeFileSync(join(root, "_redirects"), "# 11-27 넘김 규칙 없음. 없는 주소는 404 화면\n");
console.log(`_redirects ${lines.length}줄`);
