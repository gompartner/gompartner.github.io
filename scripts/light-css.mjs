// 11-26 밝은 화면(화이트 모드) CSS 생성기. 사용: node scripts/light-css.mjs  (app/classic-light.css의 "생성 구간"만 다시 쓴다. 손으로 쓴 구간은 그대로 둔다)
// 사이트는 어두운 화면으로 지었고(html.gp-dark), 밝은 화면을 고르면 html.gp-light가 붙는다. 이 스크립트는 어둡게 지은 색 클래스를 밝은 값으로 바꾸는 규칙을 만든다.
//
// 방법(넷을 견줬다)
//  (가) 색 클래스 이름을 정규식으로 모아 규칙을 손으로 조립(scripts/dark-css.mjs 방식): hover, group-open, aria, lg: 같은 접두마다 선택자를 직접 만들어야 해서 빠지는 것이 생긴다.
//  (나) 어두운 영역에 filter: invert를 건다: 파랑, 노랑이 틀어지고 그림과 3D를 다시 뒤집어야 하며 고정 요소가 깨진다.
//  (다) 컴포넌트의 색을 모두 변수 이름(bg-[var(--..)])으로 바꾼다: 가장 깔끔하지만 화면 코드 전부를 고쳐야 하고 어두운 화면이 달라질 위험이 있다.
//  (라) Tailwind가 실제로 만든 CSS를 읽어 색 선언마다 같은 선택자로 덮는다(채택): 화면 코드는 그대로 두고, 접두, 미디어 조건, 우선순위가 Tailwind와 똑같이 따라온다.
//      파란 타일 안을 빼는 방법은 :not(섬, 섬 *) 목록을 규칙마다 붙이는 것(파일이 수백 KB)과 변수를 껐다 켜는 것 가운데 뒤쪽을 골랐다(규칙 한 줄이 짧고, hover일 때만 생기는 섬도 미디어 조건째 맞는다).
//
// 규칙
//  1) 바꾸는 것은 "어두운 바탕용 값"뿐이다: 어두운 면(#0b0d12 등), 흰 글자와 밝은 회색 글자, 흰 투명 선과 면, 하늘색, 노랑 글자. 원래 밝게 지은 옛 페이지의 색은 값이 밝은 바탕용이라 그대로 남는다.
//  2) 색을 직접 쓰지 않고 변수로 쓴다: color: var(--gl-t-ffffff, #fff). 변수는 .cl에서 밝은 값으로 정의하고,
//     밝은 화면에서도 그대로 남는 진한 바탕(파랑 타일, 노랑 타일, 바닥글, 3D 창 등 "섬") 위에서는 initial로 꺼서 원래 값(쉼표 뒤)이 쓰이게 한다.
//     그래서 파란 타일 안의 흰 글자, 흰 투명 선은 바뀌지 않는다. 섬 목록은 Tailwind 출력의 배경색 규칙에서 자동으로 만든다(hover, group-open 같은 상태 포함).
//  3) 글자색은 밝은 면 중 가장 진한 면(WORST) 위에서 4.6:1 이상이 되게 계산한다. 옛 밝은 페이지의 글자색 중 이 기준에 못 미치는 값(#256ef4, #6b7380 등)도 같은 색 계열로 조금 진해진다.
//  4) 흰 면(bg-white)은 건드리지 않는다. 어두운 화면에서 강조로 쓰던 흰 알약, 흰 타일을 먹색으로 뒤집는 일은 손으로 쓴 구간이 맡는다.
// 화면에 새 색을 쓰면 다시 돌린다. 인라인 style, <style> 문자열, SVG 속성 색은 여기서 못 잡으니 app/classic-light.css의 손으로 쓴 구간에 적는다.
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const require = createRequire(root + "package.json");
const postcss = require("postcss");
const tailwind = require("@tailwindcss/postcss");
const OUT = root + "app/classic-light.css";
const BEGIN = "/* ==== 생성 구간 시작: node scripts/light-css.mjs 가 다시 쓴다(직접 고치지 않는다) ==== */";
const END = "/* ==== 생성 구간 끝 ==== */";

// ── 밝은 화면 색 ──────────────────────────────────────────────
const DARK_BG = "#0b0d12";
const BG = "#ffffff", BAND = "#f6f8fb", CARD = "#f1f4f9", CHROME = "#e9edf3";
const INK = "#15171c", TXT2 = "#3d4450", MUTED = "#5b6370", BLUE = "#256ef4", BLUE_TXT = "#1d5fd6", AMBER = "#8a5a00";
const WORST = "#e6eaf0"; // 글자가 놓일 수 있는 가장 진한 밝은 면(창틀 위 알약 등). 글자 대비는 이 면 기준으로 잰다
// 어둡게 지은 면(뒤집는다). 여기에 없는 배경색은 밝은 화면에서도 그대로 남는다
const FLIP_BG = { "#0b0d12": BG, "#0f131b": BAND, "#121722": CARD, "#1b2130": CHROME };
// 글자색 대응(사이트 기본 팔레트). 없는 값은 계산한다
const TEXT_MAP = { "#ffffff": INK, "#c9ced6": TXT2, "#aab2bf": MUTED, "#7aa7ff": BLUE_TXT, "#256ef4": BLUE_TXT, "#ffd84d": AMBER };
// 옅게 깐 강조색 면(bg-[#7aa7ff]/15 등)과 선: 흰 바탕에서 보이는 같은 계열 색으로
const TINT = { "#ffffff": [INK, 1], "#7aa7ff": [BLUE, 1], "#ffd84d": ["#e8a800", 1.4] };
// 자동 목록에 없는 섬(밝은 화면에서도 어두운 그대로 두는 것): 메인 첫 화면의 3D 창, 휴대폰 캡처의 검은 테두리
const EXTRA_ISLANDS = [".gp-body", ".border-\\[\\#2b3346\\]"];
// Tailwind가 훑을 곳: 클래식 사이트(.cl) 안에 그려지는 코드
const SOURCES = ["components/classic", "components/layout", "components/seo", "app/(classic)", "app/classic", "app/not-found.tsx", "lib", "data"];

// ── 색 계산 ──────────────────────────────────────────────────
const hex2rgb = (h) => { h = h.replace("#", ""); if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join(""); return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1 }; };
const toHex = ({ r, g, b }) => "#" + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const over = (c, bg) => ({ r: c.r * c.a + bg.r * (1 - c.a), g: c.g * c.a + bg.g * (1 - c.a), b: c.b * c.a + bg.b * (1 - c.a), a: 1 });
const toHsl = (c) => { const r = c.r / 255, g = c.g / 255, b = c.b / 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; if (mx === mn) return [0, 0, l]; const d = mx - mn, s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); const h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return [h / 6, s, l]; };
const fromHsl = ([h, s, l]) => { const f = (p, q, t) => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; }; if (!s) return { r: l * 255, g: l * 255, b: l * 255, a: 1 }; const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q; return { r: f(p, q, h + 1 / 3) * 255, g: f(p, q, h) * 255, b: f(p, q, h - 1 / 3) * 255, a: 1 }; };
const C = (h) => hex2rgb(h);
const css = (c) => (c.a >= 0.999 ? toHex(c) : `rgb(${Math.round(c.r)} ${Math.round(c.g)} ${Math.round(c.b)} / ${+c.a.toFixed(3)})`);
const key = (c) => toHex(c).slice(1) + (c.a >= 0.999 ? "" : "-" + Math.round(c.a * 100));

/** Tailwind가 내놓는 색 값 하나를 읽는다. 변수로 된 테마 색(text-accent 등)과 모르는 꼴은 null(건드리지 않는다) */
function parseColor(v) {
  v = v.trim();
  let m;
  if (v === "var(--color-white)") return C("#ffffff");
  if (v === "var(--color-black)") return C("#000000");
  if ((m = v.match(/^#[0-9a-fA-F]{3,8}$/))) return C(v);
  if ((m = v.match(/^color-mix\(in (?:srgb|oklab), (#[0-9a-fA-F]{3,8}|var\(--color-(?:white|black)\)) ([\d.]+)%, transparent\)$/))) { const c = parseColor(m[1]); return c && { ...c, a: c.a * (Number(m[2]) / 100) }; }
  if ((m = v.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\/\s]+([\d.]+%?))?\s*\)$/))) return { r: +m[1], g: +m[2], b: +m[3], a: m[4] == null ? 1 : m[4].endsWith("%") ? parseFloat(m[4]) / 100 : +m[4] };
  return null;
}

/** 글자색: 밝은 면에서 4.6:1이 안 되는 값만 바꾼다. 어두운 바탕에서의 세기(대비)를 따라 진하기를 정한다 */
function flipText(c) {
  if (ratio(over(c, C(BG)), C(WORST)) >= 4.6) return null; // 밝은 면에서 이미 읽힌다
  const solid = toHex(c);
  if (c.a >= 0.999 && TEXT_MAP[solid]) return C(TEXT_MAP[solid]);
  const onDark = over(c, C(DARK_BG));
  const [h, s] = toHsl(onDark);
  const gray = Math.max(onDark.r, onDark.g, onDark.b) - Math.min(onDark.r, onDark.g, onDark.b) < 28;
  // 회색은 어두운 바탕에서의 세기를 따라 진하게, 색이 있는 글자는 색이 죽지 않게 6:1 안쪽에서
  const want = Math.max(4.7, Math.min(gray ? 13 : 6, ratio(onDark, C(DARK_BG)) * 0.62));
  for (let l = 0.62; l >= 0.08; l -= 0.01) { const n = fromHsl([gray ? 219 / 360 : h, gray ? 0.11 : Math.min(s, 0.85), l]); if (ratio(n, C(WORST)) >= want) return n; }
  return C(INK);
}
/** 면: 어둡게 지은 면은 밝은 면으로, 옅게 깐 흰색과 강조색은 같은 세기의 먹색과 진한 강조색으로 */
function flipBg(c) {
  const solid = toHex(c);
  if (c.a >= 0.999) return FLIP_BG[solid] ? C(FLIP_BG[solid]) : null;
  if (c.a < 0.6 && TINT[solid]) { const [to, k] = TINT[solid]; return { ...C(to), a: Math.min(0.9, c.a * k) }; }
  return null;
}
/** 선: 흰 선과 흰 투명 선은 먹색으로, 하늘색 선은 파랑으로 */
function flipLine(c) {
  const solid = toHex(c);
  if (solid === "#ffffff") return { ...C(INK), a: c.a >= 0.999 ? 1 : Math.min(0.9, c.a) };
  if (solid === "#7aa7ff") return { ...C(BLUE), a: c.a };
  return null;
}
/** 그림자: 어두운 바탕용 짙은 검정 그림자는 흰 바탕에서 얼룩이 되니 옅은 남색으로 */
function flipShadow(v) {
  if (/^0 0 0 /.test(v)) return null; // 번짐 없는 테두리 그림자(캡처 위 막대의 윤곽)는 그대로
  let hit = false;
  const out = v.replace(/rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*([\d.]+)\s*\)/g, (m, a) => { if (+a < 0.3) return m; hit = true; return `rgba(16,24,40,${+(+a * 0.26).toFixed(3)})`; });
  return hit ? out : null;
}
/** 그 배경이 "섬"인가: 밝은 화면에서도 남는 진한 바탕이나 채도 높은 바탕. 흰 글자가 얹힌다 */
function islandKind(c) {
  if (c.a < 0.4) return null;
  if (c.a >= 0.999 && FLIP_BG[toHex(c)]) return null;
  const s = over(c, C(BG));
  const [, sat, l] = toHsl(s);
  if (ratio(C("#ffffff"), s) >= 3) return "dark";
  if (sat >= 0.6 && l >= 0.3 && l <= 0.8) return "vivid";
  return null;
}

// ── Tailwind 출력 읽기 ───────────────────────────────────────
const entry = `@import "tailwindcss/theme" layer(theme);\n@import "tailwindcss/utilities" layer(utilities) source(none);\n${SOURCES.map((s) => `@source "${root}${s}";`).join("\n")}\n`;
const compiled = await postcss([tailwind({ base: root, optimize: false })]).process(entry, { from: root + "app/__light-entry.css" });
const decls = []; // { sel, ats, prop, value }
(function walk(node, sel, ats) {
  for (const n of node.nodes ?? []) {
    if (n.type === "rule") walk(n, sel ? n.selector.replace(/&/g, sel) : n.selector, ats);
    else if (n.type === "atrule") { if (n.name === "layer") walk(n, sel, ats); else if (n.name === "media") walk(n, sel, [...ats, `@media ${n.params}`]); /* @supports 안은 같은 값의 다른 표기라 건너뛴다 */ }
    else if (n.type === "decl" && sel && (sel.startsWith(".") || sel.startsWith(":where(."))) decls.push({ sel, ats, prop: n.prop, value: n.value });
  }
})(postcss.parse(compiled.css), "", []);

const LINE_PROP = /^(border(-(top|right|bottom|left|inline|block|inline-start|inline-end|block-start|block-end))?-color|outline-color|--tw-ring-color|--tw-ring-offset-color|stroke)$/;
const TEXT_PROP = /^(color|caret-color|text-decoration-color|fill)$/;
const BG_PROP = /^(background-color|--tw-gradient-(from|via|to)|--asm-bg)$/;
const isBase = (d) => d.ats.length === 0 && /^\.(?:[\w-]|\\.)+$/.test(d.sel);
const pseudoSplit = (sel) => { const i = sel.indexOf("::"); return i < 0 ? [sel, ""] : [sel.slice(0, i), sel.slice(i)]; };

// 1) 섬 찾기
const islands = new Map(); // at-rule 묶음 -> 선택자 목록
const whiteDefault = []; // 흰 글자가 기본인 섬(자기 글자색 클래스가 없을 때)
for (const d of decls) {
  if (!/^(background-color|--tw-gradient-from)$/.test(d.prop) || d.sel.includes("::")) continue;
  const c = parseColor(d.value);
  const kind = c && islandKind(c);
  if (!kind) continue;
  const k = d.ats.join(" ");
  if (!islands.has(k)) islands.set(k, []);
  islands.get(k).push(d.sel);
  if (kind === "dark" && isBase(d)) whiteDefault.push(d.sel);
}
const baseIslands = islands.get("") ?? [];
baseIslands.push(...EXTRA_ISLANDS);
// 밝은 면(흰 카드, 옅은 색 면) 안의 먹색 버튼(bg-[#0b0d12] text-white)은 그대로 먹색 버튼이어야 한다. 같은 클래스가 화면 바탕으로도 쓰여서 a, button, span일 때만 섬으로 본다
const lightFaces = [...new Set(decls.filter((d) => d.prop === "background-color" && isBase(d)).filter((d) => { const c = parseColor(d.value); return c && c.a >= 0.6 && !islandKind(c) && !flipBg(c) && lum(over(c, C(BG))) > 0.6; }).map((d) => d.sel))];
const inkOnLight = `:where(${lightFaces.map((s) => `${s}:not(.cl)`).join(", ")}) :where(a, button, span).bg-\\[\\#0b0d12\\]`;
baseIslands.push(inkOnLight);

// 2) 색 선언마다 변수로 덮기
const vars = new Map(); // 변수 이름 -> 밝은 값
const lines = [];
let shadowN = 0;
const shadowVar = new Map();
for (const d of decls) {
  let name = null, orig = null;
  if (d.prop === "--tw-shadow") {
    const to = flipShadow(d.value);
    if (!to) continue;
    if (!shadowVar.has(d.value)) { shadowVar.set(d.value, `--gl-sh${++shadowN}`); vars.set(shadowVar.get(d.value), to); }
    name = shadowVar.get(d.value); orig = d.value;
  } else {
    const kind = TEXT_PROP.test(d.prop) ? "t" : BG_PROP.test(d.prop) ? "b" : LINE_PROP.test(d.prop) ? "l" : null;
    if (!kind) continue;
    const c = parseColor(d.value);
    if (!c) continue;
    if (d.sel.includes("::backdrop")) continue; // 팝업 뒤 가림막은 아래에서 한 값으로 정한다
    const to = kind === "t" ? flipText(c) : kind === "b" ? flipBg(c) : flipLine(c);
    orig = css(c);
    if (to) { name = `--gl-${kind}-${key(c)}`; vars.set(name, css(to)); }
    else if (isBase(d)) continue; // 안 바뀌는 기본 클래스는 Tailwind 값 그대로
    // 안 바뀌는 상태 클래스(hover: 등)는 원래 값을 다시 적는다. 같은 요소의 기본 클래스를 위에서 덮었을 때 상태 값이 밀리지 않게
  }
  let [head, tail] = pseudoSplit(d.sel);
  // 흰 실선 테두리는 자기 배경이 있는 요소(흰 알약, 점)에서는 바꾸지 않는다
  if (name === "--gl-l-ffffff") head += `:not(.bg-white, [class*="bg-[#"])`;
  const rule = `html.gp-light .cl ${head}${tail} { ${d.prop}: ${name ? `var(${name}, ${orig})` : orig}; }`;
  lines.push(d.ats.reduceRight((inner, at) => `${at} { ${inner} }`, rule));
}

// 3) 출력
const names = [...vars.keys()].sort();
const off = names.map((n) => `${n}: initial;`).join(" ");
let out = `${BEGIN}
/* 밝은 값. 어둡게 지은 색 클래스는 아래에서 이 변수를 읽는다 */
html.gp-light .cl { ${names.map((n) => `${n}: ${vars.get(n)};`).join(" ")} }
/* 섬: 밝은 화면에서도 남는 진한 바탕. 그 안에서는 변수를 꺼서 원래 색(흰 글자, 흰 투명 선)이 쓰인다 */
html.gp-light .cl :where(${baseIslands.join(",\n  ")}) { ${off} }
`;
for (const [k, sels] of islands) {
  if (!k) continue;
  out += k.split(/ (?=@media)/).reduceRight((inner, at) => `${at} { ${inner} }`, `html.gp-light .cl :where(${sels.join(", ")}) { ${off} }`) + "\n";
}
out += `/* 섬에 글자색 클래스가 없으면 흰 글자(어두운 화면에서는 바깥의 흰 글자를 물려받던 곳). 낮은 층이라 글자색 클래스가 있으면 그쪽이 이긴다 */
@layer base { html.gp-light .cl :where(${[...new Set(whiteDefault)].join(", ")}, ${inkOnLight}) { color: #fff; } }
/* 팝업 뒤 가림막은 밝은 화면에 맞게 옅게 */
html.gp-light .cl dialog::backdrop { background-color: rgb(16 24 40 / 0.5); }
${lines.join("\n")}
${END}`;

const prev = readFileSync(OUT, "utf8");
const a = prev.indexOf(BEGIN), b = prev.indexOf(END);
const next = a >= 0 && b > a ? prev.slice(0, a) + out + prev.slice(b + END.length) : prev.trimEnd() + "\n\n" + out + "\n";
writeFileSync(OUT, next);
console.error(`light-css: 색 선언 ${lines.length}개, 변수 ${names.length}개, 섬 ${[...islands.values()].flat().length + EXTRA_ISLANDS.length + 1}개`);
if (process.argv.includes("--table")) for (const n of names) console.error(n.padEnd(26), vars.get(n));
