// 클래식 보기(기본, 첫 화면 / 와 /classic 아래 페이지)와 웹툰 보기(곰파트너 이야기, /story와 기존 주소) 사이의 주소 짝.
// 클래식은 내용과 데이터(data/classic)를 따로 관리한다. 같은 주소 짝이 있는 페이지만 서로 옮겨 다닌다.
// 10-22부터 클래식이 기본이다. 웹툰을 고른 사람만 localStorage "look"="webtoon"으로 기억한다.

export const storyPath = "/story";

export const classicPaths = ["/works", "/sample", "/maintenance", "/faq", "/privacy", "/landing"];

// 웹툰 주소로 바로 들어오면 클래식 주소로 옮기는 페이지. 검색으로 들어오는 가이드, 자료실과 광고 랜딩은 그대로 둔다.
export const redirectPaths = ["/works", "/sample", "/maintenance", "/faq", "/privacy"];

// 11-01 내린 페이지(공지, 가이드, 자료실, 가격). 파일이 없어 404로 응답하고, 사람은 첫 화면으로 옮긴다
export const removedPaths = ["/classic/notice/design-3", "/classic/guide", "/guide", "/tools", "/pricing"];

// 클래식에만 있는 페이지가 웹툰으로 돌아갈 때 갈 곳
const webtoonOnly: Record<string, string> = { "/program": "/works", "/contact": "/landing" };

export function isClassicPath(path: string): boolean {
  return path === "/" || path === "/classic" || path.startsWith("/classic/");
}

export function classicPathFor(path: string): string | null {
  if (path === "" || path === "/" || path === storyPath) return "/";
  return classicPaths.some((p) => path === p || path.startsWith(p + "/")) ? `/classic${path}` : null;
}

export function webtoonPathFor(path: string): string {
  const rest = path.replace(/^\/classic/, "");
  return rest === "" || rest === "/" ? storyPath : (webtoonOnly[rest] ?? rest);
}

/** 루트 레이아웃 head 스크립트. 11-03 웹툰(/story)을 내렸다. 예전 웹툰 기억은 지우고, /story는 클래식 회사소개로, 웹툰 주소는 같은 클래식 주소로 그리기 전에 옮긴다. */
export const lookRedirectScript = `try{var p=location.pathname.replace(/\\/$/,"")||"/";try{localStorage.removeItem("look")}catch(e){}if(p==="${storyPath}"||p.indexOf("${storyPath}/")===0)location.replace("/classic/story"+location.search+location.hash);else if(${JSON.stringify(redirectPaths)}.some(function(x){return p===x||p.indexOf(x+"/")===0}))location.replace("/classic"+p+location.search+location.hash);if(${JSON.stringify(removedPaths)}.some(function(x){return p===x||p.indexOf(x+"/")===0}))location.replace("/")}catch(e){}`;
