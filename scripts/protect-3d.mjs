// 11-26 3D 화면(out/3d) 보호. 빌드가 끝난 out에만 적용하고 원본(public/3d)은 그대로 둔다.
// 사용자 "누가 우리 것 복사하기 쉽나", "자바스크립트 난독화해 놔도 금방 풀지?": 완전히 막을 수는 없으니
//   1) 주석과 내부 메모(설계 이유, 요청 기록)를 지우고 코드를 줄여 읽기 어렵게
//   2) 곰파트너 주소가 아닌 곳에 통째로 올리면 곰파트너 3D 페이지로 넘어가게(주소 잠금)
//   3) 저작권 한 줄은 남긴다
// postbuild에서 check-pages 앞에 돈다.
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { minify } = require("next/dist/compiled/terser");
const root = fileURLToPath(new URL("..", import.meta.url));
const DIR = join(root, "out/3d");

const NOTE = "/*! Copyright 곰파트너 (gompartner.co.kr). 무단 복제와 재배포를 금합니다. */";
// 허용: 곰파트너 주소와 하위 주소, 이 컴퓨터와 같은 와이파이(시험), Cloudflare 미리보기 주소
const LOCK = `${NOTE}(function(){var h=location.hostname;if(!/(^|\\.)gompartner\\.co\\.kr$|^localhost$|^127\\.0\\.0\\.1$|^192\\.168\\.|^10\\.|\\.workers\\.dev$|\\.pages\\.dev$/.test(h)){location.replace("https://gompartner.co.kr/3d");}})();`;

const files = [];
(function walk(d) {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    if (statSync(p).isDirectory()) walk(p);
    else if (n.endsWith(".html")) files.push(p);
  }
})(DIR);

let n = 0, before = 0, after = 0;
for (const f of files) {
  let html = readFileSync(f, "utf8");
  before += html.length;
  const keep = [];
  // 스크립트와 스타일을 먼저 빼 두고(그 안의 글자는 건드리지 않게) 나머지에서 HTML 주석을 지운다
  html = html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (m, attrs, body) => { keep.push({ kind: "script", attrs, body }); return `\u0000${keep.length - 1}\u0000`; });
  html = html.replace(/<style\b([^>]*)>([\s\S]*?)<\/style>/gi, (m, attrs, body) => { keep.push({ kind: "style", attrs, body }); return `\u0000${keep.length - 1}\u0000`; });
  html = html.replace(/<!--[\s\S]*?-->/g, "");
  const out = [];
  for (const k of keep) {
    if (k.kind === "style") {
      out.push(`<style${k.attrs}>${k.body.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\n\s*\n+/g, "\n").replace(/^\s+/gm, "")}</style>`);
      continue;
    }
    const type = (/type\s*=\s*"([^"]+)"/i.exec(k.attrs) || [])[1] || "";
    if (/\bsrc\s*=/.test(k.attrs) || /importmap|json/i.test(type) || !k.body.trim()) { out.push(`<script${k.attrs}>${k.body}</script>`); continue; }
    const r = await minify(k.body, { module: type === "module", compress: { passes: 2 }, mangle: true, format: { comments: false } });
    if (r.code == null) throw new Error(`${f}: 줄이지 못함`);   // 할 일이 없는 스크립트는 빈 글자로 줄어든다(오류 아님)
    out.push(`<script${k.attrs}>${r.code}</script>`);
  }
  html = html.replace(/\u0000(\d+)\u0000/g, (m, i) => out[+i]);
  // 주소 잠금은 <head> 맨 앞에(다른 스크립트보다 먼저)
  html = html.replace(/<head([^>]*)>/i, (m) => `${m}<script>${LOCK}</script>`);
  after += html.length;
  writeFileSync(f, html);
  n++;
}
console.log(`3D 보호: ${n}개 파일, ${Math.round(before / 1024)}KB에서 ${Math.round(after / 1024)}KB로(주석과 내부 메모 삭제, 주소 잠금)`);
