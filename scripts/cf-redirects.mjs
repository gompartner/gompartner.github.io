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
// 11-22 자료실 도구 13개를 내림. 진단 도구는 사이트 지킴이로, 나머지는 점검표로
lines.push("/tools /knowledge/checklists 301");
for (const t of ["site-check", "php-check"]) lines.push(`/tools/${t} https://jikimi.gompartner.co.kr/ 301`);
for (const t of ["accessibility-check", "cron", "estimate-questions", "hosting-cost", "image-compress", "jwt-parser", "privacy-policy", "qr-code", "search-preview", "terms", "unix-time"]) lines.push(`/tools/${t} /knowledge/checklists 301`);
// 11-26 안쪽을 판 네 개로 다시 만들며 내린 주소. 제작 상세 5종은 제작 판, 유지보수 하위는 유지보수 판, 데모와 샘플과 업종별 목록은 카탈로그 판으로
for (const p of ["homepage", "landing-page", "program", "app", "kiosk"]) lines.push(`/${p} /make 301`);
// 유지보수, 카탈로그 하위는 옛 주소를 하나씩 적는다. /maintenance/*, /works/* 로 통째로 넘기면 지금 페이지가 화면 전환 때 읽는 내부 파일(/works/__next.*.txt)까지 넘어가 버린다
for (const id of ["takeover", "ai-site", "fix", "perf", "update", "monthly", "standard"]) lines.push(`/maintenance/${id} /maintenance 301`);
for (const slug of ["hospital", "store", "stay", "professional", "company", "academy", "program", "landing", "app", "kiosk", "3d", "maintenance"]) lines.push(`/works/${slug} /works 301`);
lines.push("/sample/* /works 301", "/demo/* /works 301", "/work/* /works 301", "/knowledge/drafts /knowledge 301", "/history /story 301");
// 11-25 영문 페이지(/en)를 내림(사용자: 영문 유입이 없음). 옛 주소는 메인으로
lines.push("/en / 301", "/en/* / 301");
// 11-21 아카이브(/archive)를 위키(/knowledge)으로 옮김. 같은 날 공개한 옛 주소를 모두 새 주소로
const moved = [
  ["/archive", "/knowledge"], ["/archive/trends", "/knowledge"], ["/archive/design", "/knowledge/design"], ["/archive/tech", "/knowledge/dev"], ["/knowledge/frontend", "/knowledge/dev"],
  ["/archive/design/styles", "/knowledge/design-styles"], ["/archive/design/mobile", "/knowledge/mobile-screen"], ["/archive/design/screen-size", "/knowledge/screen-size"],
  ["/archive/tech/ie", "/knowledge/browser"], ["/archive/tech/flash", "/knowledge/flash-jquery"], ["/archive/trends/korea-ie", "/knowledge/browser"],
  ["/archive/trends/mobile", "/knowledge/mobile-screen"], ["/archive/trends/design", "/knowledge/design-styles"], ["/archive/trends/flash", "/knowledge/flash-jquery"],
  ...["https", "cms", "page-weight", "app", "php"].flatMap((d) => [[`/archive/tech/${d}`, `/knowledge/${d}`], [`/archive/trends/${d}`, `/knowledge/${d}`]]),
  ...["terms", "screens", "data", "notes", "checklists"].map((d) => [`/archive/${d}`, `/knowledge/${d}`]),
  // 시안 목록(/knowledge/drafts)은 11-26에 내렸다. 두 번 넘기지 않게 바로 위키 첫 화면으로
  ["/archive/drafts", "/knowledge"],
  ["/archive/terms/*", "/knowledge/terms/:splat"],
];
for (const [from, to] of moved) lines.push(`${from} ${to} 301`);
writeFileSync(join(root, "_redirects"), lines.sort().join("\n") + "\n");
console.log(`_redirects ${lines.length}줄`);
