// 사이트 문구 점검(11-26 사용자 "가운뎃점 쓰지 말라니 쉼표 남발", "규칙 넣어야"). 빌드 뒤 check-pages.mjs가 부른다.
// 규칙은 채널 공용 점검기(01_Work/03_Resource/글-점검/textcheck.py)와 같다. 배포 서버에서도 돌아야 해서 저장소 안에 따로 둔다.
//  1. 키보드로 못 누르는 장식 기호(가운뎃점, 엠대시, 화살표, 당구장, 원 숫자, 겹낫표, 굽은 따옴표, 이모지). 단위 기호(㎡, ℃, %)는 쓴다.
//  2. 한 문장에 쉼표 3개 이상이면 오류, 2개는 경고 수만 센다.
//     세지 않는 쉼표: 숫자 자릿수, 영문과 숫자 기술 목록(GLB, GLTF), 이름표 뒤 짧은 명사 나열("팝업 6가지: 모달, 팝오버, 바텀시트"), 표어.
// 사용: node scripts/copy-check.mjs [out 폴더]   오류가 있으면 종료 코드 1
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const SYMBOLS = /[·•‧・–—―←-⇿※…①-⓿「-』‘’“”\u{1f300}-\u{1faff}☀-➿⭐⭕]/gu;
const MOTTO = ["만들고, 운영하고, 관리합니다", "만들고, 운영하고, 관리"];
const VERB_END = /(니다|어요|아요|해요|세요|하고|하며|해서|하면|되고|이고|는지|은지|는데|으며)[.?!]?$/;

const decode = (s) => s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'");

function isItemList(s) {
  if (!s.includes(":")) return false;
  const items = s.slice(s.lastIndexOf(":") + 1).split(",").map((x) => x.trim());
  return items.length >= 3 && items.every((x) => x && x.length <= 14 && (x.length <= 3 || !VERB_END.test(x)));
}

// 쉼표 앞 조각이 이어 주는 어미로 끝나면 절을 잇는 쉼표("확인하고, 드립니다")
const CLAUSE_END = /(하고|되고|이고|았고|었고|했고|보고|받고|두고|하며|되며|으며|이며|해서|되서|하면|되면|이면|으면|지만|는데|거나|하여|되어|해야)$/;
// 명사 나열인가: 처음과 끝 조각을 뺀 가운데 조각이 모두 짧고 어미로 끝나지 않는다
function isNounList(s) {
  const parts = s.split(",").map((x) => x.trim());
  if (parts.length < 4) return parts.length === 3 && parts[1].length <= 16 && !CLAUSE_END.test(parts[1]) && !VERB_END.test(parts[1]);
  return parts.slice(1, -1).every((x) => x && x.length <= 16 && !CLAUSE_END.test(x) && (x.length <= 3 || !VERB_END.test(x)));
}
const clauseCommas = (s) => s.split(",").slice(0, -1).filter((x) => CLAUSE_END.test(x.trim())).length;

export function countedCommas(sentence) {
  if (isItemList(sentence) || /^(참고|출처|자료)\s*:/.test(sentence)) return 0;
  let s = sentence;
  for (const m of MOTTO) s = s.split(m).join("");
  s = s.replace(/(?<=\d),(?=\d{3})/g, "");
  // 괄호 안의 짧은 명사 목록(도메인, 서버, 계정, 소스, DB)은 보충 설명이라 세지 않는다
  s = s.replace(/\(([^()]*)\)/g, (m, inner) => (inner.split(",").length >= 3 && inner.split(",").every((x) => x.trim().length <= 12) ? "" : m));
  s = s.replace(/(?<=[A-Za-z0-9)])\s*,\s*(?=[A-Za-z0-9(])/g, " ");
  // 법 조문 번호 나열(제29조, 제34조), 출처 줄(주소가 붙은 줄)
  if (/https?:\/\//.test(s)) return 0;
  s = s.replace(/(?<=조(의\d+)?)\s*,\s*(?=제\d)/g, " ");
  return (s.match(/,/g) || []).length;
}

// 화면에 보이는 본문(<main>)과 검색 결과 설명(meta description)
function textOf(html) {
  const desc = decode(html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "");
  let body = html.replace(/<(script|style|svg)[^>]*>[\s\S]*?<\/\1>/gi, " ");
  const a = body.indexOf("<main"), b = body.indexOf("</main>");
  if (a >= 0 && b > a) body = body.slice(a, b);
  // 화면 낭독기용 숨은 글(sr-only)과 장식(aria-hidden)은 보이는 글과 겹치므로 그대로 두되 같은 문장은 한 번만 센다
  body = decode(body.replace(/<[^>]+>/g, "\n"));
  return { desc, body };
}

function sentences(text) {
  const out = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    for (const s of line.split(/(?<=[.?!])\s+/)) if (s.trim()) out.push(s.trim());
  }
  return out;
}

// 참고 문서(위키, 인사이트, 자료실)는 용어 목록, 표의 칸 이름, 다른 이름 목록처럼 명사 나열이 내용인 곳이 많다.
// 거기서는 명사 나열은 두고, 절을 쉼표로 잇는 문장(쉼표로 이은 절 2개 이상)과 긴 구절 나열만 잡는다.
// 판매 페이지(메인, 제작, 3D, 유지보수, 비용, 카탈로그, 회사소개 등)는 명사 나열도 셋 이상이면 잡는다.
export function checkHtml(html, reference = false) {
  const { desc, body } = textOf(html);
  const errors = [];
  let warns = 0;
  const seen = new Set();
  for (const s of [...sentences(desc), ...sentences(body)]) {
    if (seen.has(s)) continue;
    seen.add(s);
    const sym = s.match(SYMBOLS);
    if (sym) errors.push(`기호 ${[...new Set(sym)].join(" ")}: ${s.slice(0, 80)}`);
    const c = countedCommas(s);
    if (reference && c >= 3 && isNounList(s) && clauseCommas(s) < 2) { warns++; continue; }
    if (c >= 3) errors.push(`쉼표 ${c}개: ${s.slice(0, 80)}`);
    else if (reference && clauseCommas(s) >= 2) errors.push(`쉼표로 이은 절 ${clauseCommas(s)}개: ${s.slice(0, 80)}`);
    else if (c === 2) warns++;
  }
  return { errors, warns };
}

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!e.name.startsWith("_") && e.name !== "3d" && e.name !== "guide" && e.name !== "classic") walk(p, acc);
    } else if (e.name.endsWith(".html") && !e.name.startsWith("_") && e.name !== "404.html") acc.push(p);
  }
  return acc;
}

// 빌드 결과의 페이지 전체를 본다. 3d, guide, classic 폴더는 사이트 밖 정적 화면이라 뺀다
// 빼는 쪽: 개인정보처리방침(법정 항목 이름을 법 문구대로 늘어놓는 문서), 공지(이미 낸 기록이라 고치지 않는다, 새 공지는 쓸 때 점검)
const SKIP = [/^\/privacy/, /^\/notice\//];

export function checkOut(outDir = "out") {
  const pages = walk(outDir).filter((f) => !SKIP.some((r) => r.test("/" + path.relative(outDir, f).replace(/\.html$/, ""))));
  const bad = [];
  let warns = 0;
  for (const f of pages) {
    const rel = "/" + path.relative(outDir, f);
    const r = checkHtml(fs.readFileSync(f, "utf8"), /^\/(knowledge|insight|jaryo)/.test(rel));
    warns += r.warns;
    if (r.errors.length) bad.push({ page: "/" + path.relative(outDir, f).replace(/(index)?\.html$/, "").replace(/\/$/, ""), errors: r.errors });
  }
  return { pages: pages.length, bad, warns };
}

if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1] ?? "")) {
  const { pages, bad, warns } = checkOut(process.argv[2] || "out");
  const n = bad.reduce((a, b) => a + b.errors.length, 0);
  for (const b of bad) {
    console.log(b.page);
    for (const e of b.errors) console.log("  " + e);
  }
  console.log(`문구 점검: ${pages}쪽, 오류 ${n}건(${bad.length}쪽), 쉼표 2개 문장 ${warns}개`);
  process.exit(n ? 1 : 0);
}
