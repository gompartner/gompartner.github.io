// 사이트 문구 점검. 빌드 뒤 check-pages.mjs가 부르고, 오류가 있으면 빌드가 실패해 배포되지 않는다.
// 규칙 한 줄: 나열 부호(쉼표, 가운뎃점, 겹낫표)는 금지가 아니라 아껴 쓴다. 문제는 남발이다.
//   (10-14 가운뎃점 지적 뒤 쉼표로 옮겨 남발, 11-26 사용자 "쓰지 말라는 게 아니라 너무 많이 사용해서", "이젠 쉼표잖아, 정리 좀 해")
//  1. 한 문장에 나열 부호(쉼표와 가운뎃점) 3개 이상이면 오류, 2개는 경고 수만 센다.
//     세지 않는 것: 숫자 자릿수, 영문과 숫자 기술 목록(GLB, GLTF), "이름표: 짧은 명사 목록", 괄호 안 짧은 목록, 출처 줄, 법 조문 번호, 표어.
//     참고 문서(위키, 인사이트, 자료실)는 용어 목록처럼 명사 나열이 내용인 곳이 많아 명사 나열은 두고 쉼표로 절을 잇는 문장만 잡는다.
//  2. 한 쪽에 가운뎃점 5개, 겹낫표 5쌍까지.
//  3. 장식 기호(엠대시, 화살표, 당구장, 원 숫자, 굽은 따옴표, 이모지)는 쓰지 않는다. 단위 기호(㎡, ℃, %)는 쓴다.
// 규칙은 채널 공용 점검기(01_Work/03_Resource/글-점검/textcheck.py)와 같다. 배포 서버에서도 돌아야 해서 저장소 안에 따로 둔다.
// 사용: node scripts/copy-check.mjs [out 폴더]   오류가 있으면 종료 코드 1
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const SYMBOLS = /[•‧・–—―←-⇿※…①-⓿‘’“”\u{1f300}-\u{1faff}☀-➿⭐⭕]/gu;
const MOTTO = ["만들고, 운영하고, 관리해 드립니다", "만들고, 운영하고, 관리합니다", "만들고, 운영하고, 관리"];
// 4. 업계에서 쓰지 않는 구어체 말(11-28 대표 "엽니다 표현 안 쓴다", "매번 지적하는데 토큰 낭비"). 판매 페이지에서 나오면 오류.
//    말을 더하려면 여기 한 줄만 늘린다. [잡을 말, 대신 쓸 말]
const WORDS = [
  [/엽니다|열립니다|열어 보기/, "오픈합니다, 이동합니다, 바로가기"],
  [/잇는|잇습니다|이어 줍니다/, "연결하는, 연결합니다"],
  [/손봐|손봅니다|살려 둡니다/, "점검하고 보완해, 복구합니다"],
  [/키워 갑니다|고칠 곳을 찾/, "고도화합니다, 개선 사항을 도출"],
  [/고르면[^.]{0,30}나옵니다/, "선택하면 ~를 확인할 수 있습니다"],
  [/맡깁니다|^맡기기$/, "맡기실 수 있습니다, 견적 요청하기"],
  [/^앗,|지웠어요/, "페이지를 찾을 수 없습니다"],
];
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
  const pairs = (body.match(/[「『]/g) || []).length;
  if (pairs > 5) errors.push(`겹낫표 ${pairs}쌍(한 쪽에 5쌍까지)`);
  const dots = (body.match(/·/g) || []).length;
  if (dots > 5) errors.push(`가운뎃점 ${dots}개(한 쪽에 5개까지)`);
  const seen = new Set();
  for (const raw of [...sentences(desc), ...sentences(body)]) {
    if (seen.has(raw)) continue;
    seen.add(raw);
    const s = raw.replace(/·/g, ","); // 가운뎃점도 나열 부호로 함께 센다
    const sym = raw.match(SYMBOLS);
    if (sym) errors.push(`기호 ${[...new Set(sym)].join(" ")}: ${raw.slice(0, 80)}`);
    if (!reference) for (const [re, alt] of WORDS) if (re.test(raw)) errors.push(`어휘 "${raw.match(re)[0]}" 대신 ${alt}: ${raw.slice(0, 80)}`);
    const c = countedCommas(s);
    if (reference && c >= 3 && isNounList(s) && clauseCommas(s) < 2) { warns++; continue; }
    if (c >= 3) errors.push(`나열 부호 ${c}개: ${raw.slice(0, 80)}`);
    else if (reference && clauseCommas(s) >= 2) errors.push(`쉼표로 이은 절 ${clauseCommas(s)}개: ${raw.slice(0, 80)}`);
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
  console.log(`문구 점검: ${pages}쪽, 오류 ${n}건(${bad.length}쪽), 나열 부호 2개 문장 ${warns}개`);
  process.exit(n ? 1 : 0);
}
