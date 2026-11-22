// 11-22 클래식 사이트 다크모드 CSS 생성기. 사용: node scripts/dark-css.mjs > app/classic-dark.css
// 화면 코드의 색 클래스(bg-[#..], text-[#..], border-[#..])를 모두 모아, 어두운 화면에서 쓸 색으로 바꾸는 규칙을 만든다.
// 손으로 정한 대응표(MAP)가 먼저, 나머지는 밝기와 대비(4.5:1 이상)로 자동 계산. 클래식 사이트(.cl) 안에서만, .keep-light 안은 그대로.
// 화면에 새 색을 쓰면 이 스크립트를 다시 돌린다(package.json prebuild가 돌린다).
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const BG = "#0f1218", SURF = "#161a22", SURF2 = "#1c212b", LINE = "#2a303b", LINE2 = "#4a5361";
const TXT = "#e8ebf0", TXT2 = "#c9d0da", MUTED = "#a3adbb", BLUE = "#7aa7ff";

// 손으로 정한 대응(사이트 기본 팔레트)
const MAP = {
  bg: { white: SURF, "#ffffff": SURF, "#fff": SURF, "#15171c": "#2a303b", "#0f1b3d": "#0f1b3d", "#256ef4": "#256ef4", "#0b50d0": "#0b50d0" },
  text: { "#15171c": TXT, "#2b313b": TXT2, "#3d4450": TXT2, "#5b6370": MUTED, "#6b7280": MUTED, "#6b7380": MUTED, "#256ef4": BLUE, "#1d5fd6": BLUE, white: "#ffffff" },
  border: { "#15171c": TXT2, "#256ef4": BLUE, "#e6e9ee": LINE, "#d9dee5": LINE, "#c9cfd8": LINE2, white: LINE },
};

// 색 계산
const hex = (h) => { h = h.replace("#", ""); if (h.length === 3) h = [...h].map((c) => c + c).join(""); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255); };
const toHex = (rgb) => "#" + rgb.map((v) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, "0")).join("");
const lum = (h) => { const c = hex(h).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const toHsl = ([r, g, b]) => { const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; if (mx === mn) return [0, 0, l]; const d = mx - mn, s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); const h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return [h / 6, s, l]; };
const fromHsl = ([h, s, l]) => { if (!s) return [l, l, l]; const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q; const f = (t) => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; }; return [f(h + 1 / 3), f(h), f(h - 1 / 3)]; };
const named = (c) => (c === "white" ? "#ffffff" : c === "black" ? "#000000" : c);

function autoText(c) {
  c = named(c);
  if (ratio(c, SURF) >= 4.5 && ratio(c, SURF2) >= 4.5) return null; // 이미 읽힘
  const [h, s] = toHsl(hex(c));
  for (let l = 0.55; l <= 0.95; l += 0.02) { const n = toHex(fromHsl([h, Math.min(s, 0.75), l])); if (ratio(n, SURF2) >= 4.6 && ratio(n, BG) >= 4.6) return n; }
  return TXT;
}
function autoBg(c) {
  c = named(c);
  const [h, s, l] = toHsl(hex(c));
  if (l < 0.6) return null; // 진한 바탕(버튼, 띠)은 그대로
  return toHex(fromHsl([h, s * 0.45, 0.09 + (1 - l) * 0.55]));
}
function autoBorder(c) {
  c = named(c);
  const [h, s, l] = toHsl(hex(c));
  if (l < 0.35) return TXT2;
  if (l < 0.6) return LINE2;
  return toHex(fromHsl([h, s * 0.3, 0.19 + (1 - l) * 0.5]));
}

// 화면 코드에서 색 클래스 모으기(샘플 데모는 자기 디자인이라 뺀다)
const SKIP = /components\/(demos|work|site|webtoon)|app\/(work|demo|landing|en|\(site\)|\(home\))/;
const files = [];
const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); const st = statSync(p); if (st.isDirectory()) { if (!/node_modules|\.next/.test(p)) walk(p); } else if (/\.(tsx|ts)$/.test(f) && !SKIP.test(p.replace(root, ""))) files.push(p); } };
walk(join(root, "components")); walk(join(root, "app"));
const found = new Set();
const inline = new Set();
for (const f of files) {
  const s = readFileSync(f, "utf8");
  for (const m of s.matchAll(/(?<![\w-])((?:hover:|focus:|focus-visible:|group-hover:|placeholder:)?)(bg|text|border(?:-[trblxy])?)-(\[#[0-9a-fA-F]{3,6}\]|white)(?![\w\]-])/g)) found.add(m[0]);
  if (/components\/classic\/tools/.test(f)) for (const m of s.matchAll(/["'](#[0-9a-fA-F]{6})["']/g)) inline.add(m[1].toLowerCase());
}

const esc = (s) => s.replace(/[#\[\]:./]/g, (c) => "\\" + c);
const S = "html.gp-dark .cl";
const NOT = ":not(.keep-light *)";
const rules = new Map(); // css 값 -> 선택자 목록
const add = (sel, decl) => { if (!rules.has(decl)) rules.set(decl, []); rules.get(decl).push(sel); };
for (const full of [...found].sort()) {
  const [, pre, kind, raw] = full.match(/^((?:hover:|focus:|focus-visible:|group-hover:|placeholder:)?)(bg|text|border(?:-[trblxy])?)-(\[#[0-9a-fA-F]{3,6}\]|white)$/);
  const c = raw.startsWith("[") ? raw.slice(1, -1).toLowerCase() : raw;
  const base = kind.startsWith("border") ? "border" : kind;
  const v = MAP[base][c] ?? (base === "text" ? autoText(c) : base === "bg" ? autoBg(c) : autoBorder(c));
  if (!v || v.toLowerCase() === named(c).toLowerCase()) continue;
  const prop = base === "bg" ? "background-color" : base === "text" ? "color" : "border-color";
  let sel;
  if (pre === "placeholder:") sel = `${S} .${esc(full)}::placeholder`;
  else if (pre === "hover:" || pre === "group-hover:") sel = pre === "hover:" ? `${S} .${esc(full)}:hover${NOT}` : `${S} .group:hover .${esc(full)}${NOT}`;
  else if (pre === "focus:" || pre === "focus-visible:") sel = `${S} .${esc(full)}:${pre.slice(0, -1)}${NOT}`;
  else sel = `${S} .${esc(full)}${NOT}`;
  add(sel, `${prop}: ${v}`);
}
// 도구 화면의 인라인 색(글자색으로 쓰는 것)
for (const c of [...inline].sort()) {
  const v = autoText(c);
  if (v) add(`${S} [style*="color:${c}"]:not([style*="background"])`, `color: ${v} !important`);
}

let css = `/* 생성 파일: node scripts/dark-css.mjs > app/classic-dark.css (직접 고치지 않는다) */
html.gp-dark { color-scheme: dark !important; }
html.gp-dark body:has(.cl) { background: ${BG}; }
${S}, html.gp-dark .cl { --background: ${BG}; --foreground: ${TXT}; --foreground-secondary: ${TXT2}; --foreground-tertiary: ${MUTED}; --surface: ${SURF2}; --surface-secondary: ${LINE}; --border: ${LINE}; --accent: #256ef4; --accent-hover: #0b50d0; --accent-surface: #1a2a4a; --teal: #5cc2ad; --coral: #ff8a70; --yellow: #f3c26b; --green: #7ad192; --success: #7ad192; --warning: #f3c26b; --destructive: #ff8a70; }
html.gp-dark .cl.flex.min-h-screen { background: ${BG}; color: ${TXT}; }
${S} .text-accent${NOT}, ${S} .text-accent-hover${NOT}, ${S} .hover\\:text-accent:hover${NOT}, ${S} .hover\\:text-accent-hover:hover${NOT} { color: ${BLUE}; }
${S} .border-accent${NOT} { border-color: ${BLUE}; }
${S} svg [stroke="#e6e9ee"], ${S} svg [stroke="#eef0f3"], ${S} svg [stroke="#d9dee5"] { stroke: ${LINE}; }
${S} svg [fill="#6b7380"], ${S} svg [fill="#5b6370"], ${S} svg [fill="#8a93a1"] { fill: ${MUTED}; }
${S} svg [fill="#15171c"], ${S} svg [fill="#3d4450"] { fill: ${TXT}; }
${S} svg [fill="#fff"]${NOT}, ${S} svg [fill="white"]${NOT}, ${S} svg [fill="#ffffff"]${NOT} { fill: ${SURF}; }
${S} input:not([type=checkbox]):not([type=radio]):not([class*="bg-transparent"]), ${S} textarea, ${S} select { background-color: ${SURF2}; color: ${TXT}; }
`;
for (const [decl, sels] of rules) css += `${sels.join(",\n")} { ${decl}; }\n`;
process.stdout.write(css);
