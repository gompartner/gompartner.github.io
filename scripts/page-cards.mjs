// 페이지의 공유 미리보기 이미지(1200x630 JPG)를 만든다. 그림체와 틀은 scripts/og-card.mjs (11-26 지금 사이트의 어두운 화면에 맞춰 다시 그림).
// 사용: node scripts/page-cards.mjs <사이트 주소, 예 http://localhost:3123> [--all] [--features] [--only <주소 앞부분>] [--page <주소>]
//  아무것도 안 주면 아직 없는 카드만 만든다. --all 은 모두 다시, --only /knowledge 는 그 주소로 시작하는 페이지만 다시,
//  --page /3d 는 딱 그 주소의 카드 한 장만 다시(--only /3d 는 /3d/sofa/ 같은 아래 화면 그림까지 다시 만든다).
//  --features 는 화면이 들어가는 주요 페이지 카드만 다시(그 페이지의 화면을 고친 뒤).
//  CDP=http://127.0.0.1:9333 을 주면 새 크롬을 띄우지 않고 이미 떠 있는 업무용 크롬의 새 탭으로 만든다(끝나면 그 탭만 닫는다)
// 만드는 것
//  1. 주요 페이지(FEATURES): 위쪽 가운데에 꼬리표와 제목, 그 아래에 그 페이지의 실제 화면 일부. 메인은 public/og-image.png, 나머지는 public/og/page/<주소>.jpg
//  2. 그 밖의 사이트맵 페이지와 점검표(/jaryo): 제목 카드(꼬리표 + 제목). public/og/page/<주소>.jpg. 꼬리표와 제목은 페이지의 위치 표시와 h1에서 읽는다
//  3. 정적 3D 화면(SCREENS): 그 화면을 1200x630으로 찍은 그림. public/3d/ 아래 og 이미지
// 운영 노트(/insight) 카드는 scripts/insight-cards.mjs 가 만든다.
// 그림을 다시 만들어 배포할 때는 lib/seo.ts 의 OG_VERSION 과 public/3d, public/go/jaryo 의 head 에 적힌 ?v= 값을 같이 올린다(공유 서비스가 옛 그림을 기억한다).
import { existsSync, mkdirSync } from "node:fs";
import { H, SHOT, W, drawCard, openTab, root } from "./og-card.mjs";

const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const all = process.argv.includes("--all");
const only = process.argv.includes("--only") ? process.argv[process.argv.indexOf("--only") + 1] : "";
const one = process.argv.includes("--page") ? process.argv[process.argv.indexOf("--page") + 1] : "";
const OUT = `${root}public/og/page`;
mkdirSync(OUT, { recursive: true });
const key = (p) => p.replace(/^\/|\/$/g, "").replaceAll("/", "--") || "home";

// 주요 페이지. title 은 페이지 이름(큰 제목이 질문 문장인 판은 카드에 페이지 이름을 쓴다), sub 는 그 아래 한 줄.
// shot 은 제목 아래에 넣을 화면(가로로 긴 띠, og-card.mjs 의 SHOT 비율): vw 폭으로 연 페이지에서 sel 요소의 왼쪽 위부터(center 면 가운데부터) 폭 cw 만큼을 찍는다.
//  dx, dy 는 시작점을 옮기는 값, up 은 sel 에서 몇 단계 위 요소를 쓸지, wait 는 화면이 다 그려질 때까지 기다리는 시간(ms).
//  sel 없이 from 만 주면 그 주소(정적 3D 화면)를 띠 비율의 창으로 열어 화면 전체를 찍는다(3D가 창 크기에 맞춰 다시 잡힌다)
const FEATURES = {
  "/": { file: `${root}public/og-image.png`, title: "Build, Run, Care.", ice: "Build, Run, Care.", sub: "홈페이지, 앱 제작과 유지보수", shot: { vw: 1440, sel: 'iframe[title^="3D 마을"]', cw: 590, dy: 64, wait: 9000 } },
  "/make": { label: "BUILD", accent: "build", title: "홈페이지, 앱 제작", sub: "종류별 화면과 금액, 제작 기간", shot: { vw: 1280, sel: "#mk-panel", cw: 892, dx: -16, dy: 196 } },
  "/3d": { label: "3D WEB", title: "3D 웹 제작", ice: "3D 웹", sub: "고객이 직접 구성하는 3D 견적 화면", shot: { from: "/3d/sofa/?embed=1", vw: 1140, wait: 7000 } },
  "/maintenance": { label: "CARE", accent: "care", title: "홈페이지 유지보수", sub: "수정, 업체 변경, 월 유지관리", shot: { vw: 1280, sel: '[role=tablist][aria-label="상황"]', cw: 1264, dx: -16, dy: -20 } },
  "/pricing": { label: "PRICE", title: "제작, 유지보수 비용", ice: "제작,", sub: "홈페이지 제작 29.9만 원부터", shot: { vw: 1280, sel: 'section[aria-labelledby="pr-2"]', cw: 1264, dx: -16, dy: -16 } },
  "/works": { label: "CATALOG", title: "업종별 화면 카탈로그", sub: "홈페이지, 랜딩페이지, 앱, 키오스크, 3D 웹", shot: { vw: 1280, sel: "main article", cw: 1264, dx: -16, dy: -16 } },
  "/knowledge": { label: "WIKI", title: "위키", sub: "홈페이지 기획, 제작, 운영 문서", shot: { vw: 1280, sel: "main input[type=search]", up: 2, cw: 1264, dx: -16, dy: -20 } },
  "/story": { label: "ABOUT", title: "회사소개", sub: "만들고, 운영하고, 관리합니다", shot: { vw: 1280, sel: "main ul.grid", cw: 1264, dx: -16, dy: -60 } },
  "/contact": { label: "CONTACT", title: "상담 신청", ice: "상담", sub: "검토 후 견적서로 회신합니다", shot: { vw: 1280, sel: 'section[aria-labelledby="contact-form"]', cw: 960, center: true, dy: -20 } },
};

// 정적 3D 화면: [주소, 저장할 파일]. 섬 화면(/3d/island.html)은 바로 열면 /3d 로 넘어가므로 /3d 카드를 같이 쓴다
const SCREENS = [
  ["/3d/room/", "public/3d/room/og.jpg"],
  ...["sofa", "configurator", "space", "door", "sign", "hanok"].map((n) => [`/3d/${n}/`, `public/3d/assets/og/${n}.jpg`]),
];

const text = (h) => h.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();
const get = async (p) => (await fetch(base + p)).text();

/** 꼬리표: 페이지의 위치 표시(현재 위치)에서 읽는다. 위키 문서는 "WIKI / 주제", 그 밖의 페이지는 머리의 영어 이름 */
function labelOf(html) {
  const nav = html.match(/<nav aria-label="현재 위치"[^>]*>([\s\S]*?)<\/nav>/)?.[1] ?? "";
  const lis = [...nav.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map((m) => text(m[1]));
  if (/WIKI/.test(lis[0] ?? "")) return lis[1]?.startsWith("/") ? `WIKI / ${lis[1].slice(1).trim()}` : "WIKI";
  if (lis[1] && !lis[1].startsWith("/")) return lis[1];
  if (lis[1] === "/공지사항") return "NOTICE";
  return "GOMPARTNER";
}

const featuresOnly = process.argv.includes("--features");
const want = (path, file) => (one ? path === one : featuresOnly ? !!FEATURES[path] : only ? path.startsWith(only) : all || !existsSync(file));

const xml = await get("/sitemap.xml");
const sitemap = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
// 점검표 한 장(/jaryo/<id>)은 사이트맵에 없지만 인스타 DM으로 공유되는 주소라 카드를 만든다
const jaryo = [...new Set([...(await get("/knowledge/checklists")).matchAll(/href="(\/jaryo\/[a-z0-9-]+)"/g)].map((m) => m[1]))];
const titlePages = [...sitemap, ...jaryo].filter((p) => !FEATURES[p] && !p.startsWith("/insight/") && !SCREENS.some(([s]) => s === p));

const { page, close } = await openTab();
let made = 0;
const failed = [];
try {
  // 화면 색 선택(gp-theme)이 밝은 화면으로 저장돼 있어도 이 탭은 기본(어두운 화면)으로 연다. 저장된 값은 건드리지 않는다
  await page.addInitScript(() => {
    const g = Storage.prototype.getItem;
    Storage.prototype.getItem = function (k) {
      return k === "gp-theme" ? null : g.call(this, k);
    };
  });
  const open = async (path, vw, vh, wait) => {
    await page.setViewportSize({ width: vw, height: vh });
    await page.goto(base + path, { waitUntil: "load", timeout: 90000 });
    // 개발 서버 표시와 스크롤 막대는 그림에서 뺀다
    await page.addStyleTag({ content: "nextjs-portal{display:none!important} ::-webkit-scrollbar{display:none} html{scrollbar-width:none}" });
    await page.waitForTimeout(wait);
  };

  // 1. 주요 페이지
  for (const [path, f] of Object.entries(FEATURES)) {
    const file = f.file ?? `${OUT}/${key(path)}.jpg`;
    if (!want(path, file)) continue;
    const s = f.shot;
    let data;
    if (!s.sel) {
      await open(s.from, s.vw, Math.round((s.vw * SHOT.h) / SHOT.w), s.wait ?? 3000);
      data = await page.screenshot({ type: "png" });
    } else {
      await open(s.from ?? path, s.vw, 1100, s.wait ?? 3000);
      // 요소를 머리글(위에 붙어 다니는 메뉴) 아래로 오게 스크롤한 뒤, 그 자리에서 화면 좌표로 찍는다
      const TOP = 120;
      const box = await page.evaluate(
        ({ sel, up, dy, top }) => {
          // 같은 선택자가 휴대폰용, PC용으로 둘 있으면 지금 보이는 것을 고른다
          let el = [...document.querySelectorAll(sel)].find((e) => e.getBoundingClientRect().width > 0);
          for (let i = 0; el && i < up; i++) el = el.parentElement;
          if (!el) return null;
          window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + dy - top, behavior: "instant" });
          const r = el.getBoundingClientRect();
          return { x: r.left, y: r.top + dy, w: r.width };
        },
        { sel: s.sel, up: s.up ?? 0, dy: s.dy ?? 0, top: TOP },
      );
      if (!box) {
        failed.push(`${path}: 화면에서 ${s.sel} 을 찾지 못했습니다`);
        continue;
      }
      await page.waitForTimeout(800);
      // 카드의 창 안쪽(og-card.mjs 의 SHOT)과 같은 비율로 찍는다
      const clip = { x: Math.max(0, Math.round(s.center ? box.x + box.w / 2 - s.cw / 2 : box.x + (s.dx ?? 0))), y: Math.round(box.y), width: s.cw, height: Math.round((s.cw * SHOT.h) / SHOT.w) };
      data = await page.screenshot({ type: "png", clip });
    }
    await page.setViewportSize({ width: W, height: H });
    const fit = await drawCard(page, { ...f, shot: { data, url: `gompartner.co.kr${path === "/" ? "" : path}` } }, file);
    made++;
    console.log(path, "|", f.title.replace("\n", " "), "|", `${fit.size}px`);
  }

  // 2. 제목 카드
  await page.setViewportSize({ width: W, height: H });
  for (const path of titlePages) {
    const file = `${OUT}/${key(path)}.jpg`;
    if (!want(path, file)) continue;
    const html = await get(path);
    const h1 = text(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? "");
    if (!h1) {
      failed.push(`${path}: h1 없음`);
      continue;
    }
    try {
      const fit = await drawCard(page, { label: labelOf(html), title: h1 }, file);
      made++;
      console.log(path, "|", labelOf(html), "|", h1, "|", `${fit.size}px ${fit.lines}줄`);
    } catch (e) {
      failed.push(`${path}: ${e.message}`);
    }
  }

  // 3. 정적 3D 화면
  for (const [path, out] of SCREENS) {
    const file = `${root}${out}`;
    if (!want(path, file)) continue;
    await open(path, W, H, 7000);
    await page.screenshot({ path: file, type: "jpeg", quality: 86 });
    made++;
    console.log(path, "|", out);
  }
} finally {
  await close();
}
console.log("만든 그림", made);
if (failed.length) {
  console.error(`\n만들지 못한 그림 ${failed.length}건\n${failed.join("\n")}`);
  process.exit(1);
}
process.exit(0);
