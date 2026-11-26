// 11-26 공유 미리보기 카드(1200x630 JPG) 공통 틀. scripts/page-cards.mjs 와 scripts/insight-cards.mjs 가 같이 쓴다.
// 그림체는 사이트 그대로: 바탕 #0b0d12 와 옅은 모눈, 흰 글자, 제목 앞부분 얼음색(components/classic/ui.tsx 의 ice), 꼬리표 색 #7aa7ff.
// 글자는 모두 가운데 정렬로 가운데 560px 폭(SAFE) 안에만 둔다: 메신저와 검색 썸네일이 가운데를 정사각(630x630)으로 잘라도 로고, 꼬리표, 제목이 다 보이게(11-04에 정한 것, 11-26 다시 확인).
// 카드는 두 가지다.
//  - 제목 카드: 로고, 꼬리표(WIKI / 개발 처럼 영어 이름과 분류), 제목(세 줄까지, 길면 글자를 줄인다)
//  - 화면 카드: 위쪽 가운데에 로고, 꼬리표, 제목, 한 줄. 그 아래 가운데에 그 페이지의 실제 화면(shot)을 창틀에 넣고 아래는 카드 밖으로 이어지게 둔다
// 카카오톡은 위아래를 조금 잘라 2:1로 보여 주므로 글자는 위아래 30px 안쪽에만 둔다.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

export const root = fileURLToPath(new URL("..", import.meta.url));
export const W = 1200;
export const H = 630;
/** 글자가 들어가는 가운데 폭 */
export const SAFE = 560;
/** 화면 카드의 창 안쪽 크기(가로로 긴 띠). page-cards.mjs 가 같은 비율로 화면을 찍는다 */
export const SHOT = { w: 760, h: 320 };

const font = readFileSync(`${root}assets/fonts/PretendardVariable.woff2`).toString("base64");
const avatar = readFileSync(`${root}public/images/bear-avatar.webp`).toString("base64");
const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// 꼬리표의 구분 색: 사이트 회사소개의 Build(파랑), Care(노랑)와 같은 색을 작은 네모로만 쓴다
const DOT = { build: "#3d6df2", care: "#f8d75e" };

/** 꼬리표: "WIKI / 개발" 처럼 영어 이름 뒤에 분류를 붙일 수 있다 */
function labelHtml(label, accent) {
  const [en, ...rest] = label.split(" / ");
  // 가운데 정렬이라 양쪽에 같은 표시를 둔다
  const mark = DOT[accent] ? `<i class="dot" style="background:${DOT[accent]}"></i>` : `<i class="ln"></i>`;
  return `${mark}<span>${esc(en)}</span>${rest.map((r) => `<i class="sl">/</i><span class="ko">${esc(r)}</span>`).join("")}${mark}`;
}

/**
 * 여러 줄로 나뉠 제목의 줄 바꿈 자리: "주제: 부제" 는 쌍점 뒤에서, 쉼표가 가운데쯤 있으면 쉼표 뒤에서 나눈다.
 * 한쪽이 너무 길어지는 자리(쌍점은 전체의 70%, 쉼표는 60% 초과)는 쓰지 않고 브라우저가 고르게 나누게 둔다.
 */
export function breakTitle(title) {
  if (title.includes("\n") || title.length <= 12) return title;
  const cut = (mark, limit) => {
    const at = [...title.matchAll(new RegExp(mark, "g"))].map((m) => m.index + m[0].length);
    const best = at.sort((x, y) => Math.max(x, title.length - x) - Math.max(y, title.length - y))[0];
    return best && Math.max(best, title.length - best) <= title.length * limit ? `${title.slice(0, best).trimEnd()}\n${title.slice(best)}` : null;
  };
  return cut(": ", 0.7) ?? cut(", ", 0.6) ?? title;
}

/** 제목: ice 는 얼음색으로 칠할 앞부분(안 주면 첫 낱말). 줄을 직접 나누려면 title 에 \n */
function titleHtml(title, ice) {
  const sp = title.search(/[ \n]/);
  const head = ice && title.startsWith(ice) ? ice : sp > 0 ? title.slice(0, sp) : title;
  const br = (t) => esc(t).replace(/\n/g, "<br>");
  return `<span class="ice">${br(head)}</span>${br(title.slice(head.length))}`;
}

/**
 * 카드 한 장의 HTML.
 * label 꼬리표, title 제목, ice 얼음색 앞부분, sub 제목 아래 한 줄, accent "build" | "care",
 * shot { data: PNG 버퍼, url: 창 머리에 적을 주소 } 를 주면 화면 카드.
 */
export function cardHtml({ label, title, ice, sub, accent, shot }) {
  const feature = !!shot;
  const win = feature;
  const left = (W - SAFE) / 2;
  const img = feature ? `data:image/png;base64,${shot.data.toString("base64")}` : "";
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>
@font-face { font-family: P; src: url(data:font/woff2;base64,${font}) format("woff2"); font-weight: 100 900; }
* { margin: 0; box-sizing: border-box; }
html, body { width: ${W}px; height: ${H}px; overflow: hidden; }
body { background-color: #0b0d12; font-family: P, sans-serif; color: #fff; position: relative; font-feature-settings: "calt" 0; -webkit-font-smoothing: antialiased; text-align: center;
  background-image: linear-gradient(rgba(122,167,255,.065) 1px, transparent 1px), linear-gradient(90deg, rgba(122,167,255,.065) 1px, transparent 1px); background-size: 48px 48px; background-position: 24px 27px; }
/* 메인 첫 화면의 옅은 원호. 가운데 정렬에 맞춰 카드 가운데를 중심으로 둔다 */
.arc { position: absolute; left: 50%; top: 50%; border: 1.5px solid rgba(122,167,255,.12); border-radius: 50%; transform: translate(-50%, -50%); }
.a1 { width: 820px; height: 820px; }
.a2 { width: 1260px; height: 1260px; border-color: rgba(122,167,255,.08); }
.logo { position: absolute; left: 0; right: 0; top: ${win ? 28 : 46}px; display: flex; align-items: center; justify-content: center; gap: ${win ? 11 : 13}px; font-size: ${win ? 27 : 32}px; font-weight: 800; letter-spacing: -0.04em; }
.logo img { width: ${win ? 40 : 48}px; height: ${win ? 40 : 48}px; border-radius: 50%; object-fit: cover; }
.block { position: absolute; left: ${left}px; width: ${SAFE}px; top: ${win ? 78 : 112}px; ${win ? "height: 204px" : "bottom: 84px"}; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.eb { display: flex; align-items: center; justify-content: center; gap: 14px; font-size: ${win ? 21 : 25}px; font-weight: 700; letter-spacing: 0.16em; color: #7aa7ff; white-space: nowrap; }
.eb span:first-of-type { margin-right: -0.16em; }
.eb .ln { width: 30px; height: 2px; background: currentColor; }
.eb .dot { width: 14px; height: 14px; border-radius: 4px; }
.eb .sl { font-style: normal; color: rgba(255,255,255,.34); letter-spacing: 0; }
.eb .ko { letter-spacing: 0.01em; }
h1 { max-width: ${SAFE}px; margin-top: ${win ? 12 : 18}px; font-weight: 800; line-height: 1.2; letter-spacing: -0.05em; word-break: keep-all; overflow-wrap: anywhere; text-wrap: balance; }
h1.en { line-height: 1.06; letter-spacing: -0.055em; }
.ice { background-image: linear-gradient(112deg, #ffffff 0%, #d5e4ff 30%, #8db4ff 52%, #e8f1ff 74%, #ffffff 100%); -webkit-background-clip: text; background-clip: text; color: transparent; -webkit-box-decoration-break: clone; box-decoration-break: clone; padding-bottom: 0.08em; }
.sub { max-width: ${SAFE}px; margin-top: ${win ? 12 : 18}px; font-weight: 600; line-height: 1.36; letter-spacing: -0.035em; color: #c9ced6; white-space: nowrap; }
.site { position: absolute; left: 0; right: 0; bottom: 40px; font-size: 22px; font-weight: 600; letter-spacing: 0.02em; color: #8b93a1; }
/* 화면: 메인의 3D 창과 같은 창틀. 가운데에 두고 아래는 카드 밖으로 이어진다 */
.win { position: absolute; left: ${(W - SHOT.w - 3) / 2}px; top: 292px; width: ${SHOT.w + 3}px; height: ${SHOT.h + 39}px; border-radius: 18px; border: 1.5px solid rgba(122,167,255,.6); background: #121722; overflow: hidden; box-shadow: 0 24px 80px rgba(0,0,0,.55); text-align: left; }
.bar { height: 36px; display: flex; align-items: center; gap: 8px; padding: 0 16px; border-bottom: 1px solid rgba(255,255,255,.1); background: #121722; }
.bar i { width: 10px; height: 10px; border-radius: 50%; }
.bar b { margin-left: 10px; flex: 0 0 320px; height: 20px; border-radius: 10px; background: rgba(255,255,255,.08); font-size: 13px; font-weight: 500; line-height: 20px; padding: 0 12px; color: #8b93a1; letter-spacing: 0.01em; }
.win img { display: block; width: ${SHOT.w}px; height: ${SHOT.h}px; object-fit: cover; object-position: center top; }
</style></head><body>
<div class="arc a2"></div><div class="arc a1"></div>
<div class="logo"><img alt="" src="data:image/webp;base64,${avatar}">곰파트너</div>
<div class="block">${label ? `<p class="eb">${labelHtml(label, accent)}</p>` : ""}<h1${/^[\x20-\x7e\n]+$/.test(title) ? ' class="en"' : ""}>${titleHtml(title, ice)}</h1>${sub ? `<p class="sub">${esc(sub)}</p>` : ""}</div>
${win ? `<div class="win"><div class="bar"><i style="background:#ff5f57"></i><i style="background:#febc2e"></i><i style="background:#28c840"></i><b>${esc(shot.url)}</b></div><img alt="" src="${img}"></div>` : `<p class="site">gompartner.co.kr</p>`}
</body></html>`;
}

// 제목 글자 크기. 한 줄로 크게 들어가면 한 줄(짧은 제목), 아니면 두 줄과 세 줄을 다 맞춰 보고 세 줄 쪽 글자가 눈에 띄게(8px 이상) 크면 세 줄로 한다.
// 작은 미리보기에서는 줄 수보다 글자 크기가 읽기를 좌우한다. 가장 작은 크기 40px 은 미리보기가 가로 300px 로 줄면 10px, 가운데 정사각을 150px 로 줄이면 9.5px 이다
const STEPS = {
  title: [
    [1, [112, 100, 88, 80, 72]],
    [2, [92, 84, 76, 68, 62, 56]],
    [3, [72, 66, 60, 56, 52, 48, 44, 40]],
  ],
  // 화면 카드(창틀): 제목은 한 줄
  win: [[1, [76, 70, 64, 58, 52, 48, 44]]],
};
const THREE_LINES_GAIN = 8;
const SUB_SIZES = [28, 26, 24, 22];

/** 카드를 그려 파일로 저장한다. 제목이 정한 줄 수를 넘거나 가운데 폭을 넘치면 오류 */
export async function drawCard(page, card, file) {
  const tryFit = async (title, sizes, maxLines) => {
    await page.setContent(cardHtml({ ...card, title }));
    await page.evaluate(() => (window.scrollTo(0, 0), document.fonts.ready));
    return page.evaluate(
      ({ sizes, maxLines, subSizes, safe }) => {
        const h1 = document.querySelector("h1");
        const block = document.querySelector(".block");
        const sub = document.querySelector(".sub");
        // 한 줄 설명은 가운데 폭에 들어가는 가장 큰 글자로
        if (sub) for (const s of subSizes) {
          sub.style.fontSize = `${s}px`;
          if (sub.scrollWidth <= safe) break;
        }
        if (sub && sub.scrollWidth > safe) return null;
        for (const s of sizes) {
          h1.style.fontSize = `${s}px`;
          const lh = parseFloat(getComputedStyle(h1).lineHeight);
          const lines = Math.round(h1.getBoundingClientRect().height / lh);
          // 낱말 하나가 폭보다 길어 낱말 안에서 끊긴 것(overflow-wrap)은 받아들이지 않는다
          const words = [...h1.textContent.split(/\s+/)].filter(Boolean);
          const probe = document.createElement("span");
          probe.style.cssText = `position:absolute;visibility:hidden;white-space:nowrap;font:inherit;letter-spacing:inherit`;
          h1.appendChild(probe);
          const tooLong = words.some((w) => ((probe.textContent = w), probe.getBoundingClientRect().width > safe));
          probe.remove();
          if (!tooLong && lines <= maxLines && h1.scrollWidth <= safe && block.scrollHeight <= block.clientHeight) return { size: s, lines };
        }
        return null;
      },
      { sizes, maxLines, subSizes: SUB_SIZES, safe: SAFE },
    );
  };
  let fit = null;
  for (const [maxLines, sizes] of STEPS[card.shot ? "win" : "title"]) {
    const plain = card.title.replace(/\n/g, " ");
    // 여러 줄로 갈 때만 쌍점, 쉼표 자리에서 줄을 나눠 본다. 그렇게 나눈 쪽이 글자가 더 작아지면 브라우저가 고르게 나눈 쪽을 쓴다
    const cands = maxLines > 1 ? [...new Set([breakTitle(card.title), plain])] : [plain];
    let best = null;
    for (const title of cands) {
      const f = await tryFit(title, sizes, maxLines);
      if (f && (!best || f.size > best.size)) best = { ...f, title };
    }
    if (!best) continue;
    if (maxLines === 1) {
      fit = best;
      break;
    }
    // 세 줄 쪽만 쌍점, 쉼표 자리에서 나뉘었으면(읽기 좋은 줄 바꿈) 글자가 같거나 크기만 해도 세 줄로 한다
    const meaning = best.title.includes("\n") && fit && !fit.title.includes("\n");
    if (!fit || best.size >= fit.size + (meaning ? 0 : THREE_LINES_GAIN)) fit = best;
  }
  if (!fit) throw new Error(`제목이 카드에 들어가지 않습니다: ${card.title}`);
  // 고른 제목과 크기로 다시 그린 뒤 찍는다
  await tryFit(fit.title, [fit.size], fit.lines);
  const jpg = file.endsWith(".jpg");
  await page.screenshot({ path: file, type: jpg ? "jpeg" : "png", ...(jpg ? { quality: 88 } : {}), clip: { x: 0, y: 0, width: W, height: H } });
  return fit;
}

/**
 * 그릴 탭을 연다. CDP=http://127.0.0.1:9333 을 주면 새 크롬을 띄우지 않고 이미 떠 있는 크롬의 새 탭으로 그린다.
 * 돌려주는 close 는 그 탭만 닫는다(다른 탭은 건드리지 않는다).
 */
export async function openTab() {
  const cdp = process.env.CDP;
  const browser = cdp ? await chromium.connectOverCDP(cdp) : await chromium.launch({ channel: "chrome" });
  const page = cdp ? await browser.contexts()[0].newPage() : await browser.newPage({ viewport: { width: W, height: H } });
  await page.setViewportSize({ width: W, height: H });
  const close = async () => {
    await page.close().catch(() => {});
    if (!cdp) await browser.close().catch(() => {});
  };
  return { page, close };
}
