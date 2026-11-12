// 11-01 내린 페이지(가이드, 자료실, 가격)의 옛 주소를 살아 있는 페이지로 바로 넘기는 정적 파일을 만든다.
// 네이버, 티스토리 글과 검색 결과에 남은 옛 링크가 404로 끝나지 않게 하려는 것이다.
// GitHub Pages 정적 배포라 301을 못 쓰므로 meta refresh 0초와 canonical을 쓴다.
// 고칠 때: 아래 표를 바꾸고 `node scripts/old-redirects.mjs` 를 돌린 뒤 public/ 아래 생긴 파일을 같이 커밋한다.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SITE = "https://gompartner.co.kr";
const HOME = "/";
const CONTACT = "/contact";
const CARE = "/maintenance";
const FIX = "/maintenance/fix";
const UPDATE = "/maintenance/update";
const ESTIMATE = "/jaryo/estimate";

const tools = {
  "": CARE,
  "estimate-questions": ESTIMATE,
  "hosting-cost": CARE,
  "site-check": FIX,
  "php-check": UPDATE,
  "accessibility-check": FIX,
  "search-preview": FIX,
  "image-compress": FIX,
  "privacy-policy": CARE,
  terms: CARE,
  "qr-code": HOME,
  cron: HOME,
  "jwt-parser": HOME,
  "unix-time": HOME,
};

const guides = {
  "": CARE,
  "agency-ranking": HOME,
  "homepage-cost": CONTACT,
  "contract-checklist": HOME,
  "builder-or-custom": HOME,
  "maintenance-cost": CARE,
  "vercel-deploy-error": FIX,
  "php8-upgrade-error": UPDATE,
  "php-vulnerability-check": UPDATE,
  "site-check-items": FIX,
  "web-accessibility-check": FIX,
};

// 공지사항 게시판은 살아 있다(4e2a5e5 복구). 공지 아래(app/(classic)/notice)에는 파일을 만들지 않는다
// 11-12 /pricing 은 비용 페이지로 다시 씀. 옛 /classic/pricing 만 그쪽으로 넘긴다
const map = { "/classic/pricing": "/pricing" };
for (const [k, v] of Object.entries(tools)) {
  // 11-04 자료실(/tools)을 되살려 옛 /classic/tools 주소만 새 주소로 넘긴다
  map[k ? `/classic/tools/${k}` : "/classic/tools"] = k ? `/tools/${k}` : "/tools";
}
for (const [k, v] of Object.entries(guides)) {
  map[k ? `/guide/${k}` : "/guide"] = v;
  map[k ? `/classic/guide/${k}` : "/classic/guide"] = v;
}

const page = (to) => `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>곰파트너</title>
<link rel="canonical" href="${SITE}${to}">
<meta http-equiv="refresh" content="0; url=${to}">
<script>location.replace(${JSON.stringify(to)}+location.hash);</script>
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0F1B3D;color:#fff;font:16px/1.6 -apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Noto Sans KR",sans-serif;text-align:center;padding:0 16px}a{color:#fff}</style>
</head>
<body>
<p>이 페이지는 옮겨졌어요.<br><a href="${to}">새 페이지로 가기</a></p>
</body>
</html>
`;

const root = new URL("../public", import.meta.url).pathname;
for (const [from, to] of Object.entries(map)) {
  const dir = join(root, from);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), page(to));
}
console.log(`${Object.keys(map).length}개 주소`);
