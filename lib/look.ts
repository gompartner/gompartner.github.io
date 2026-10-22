// 클래식 보기(기본, 첫 화면 / 와 /classic 아래 페이지)와 웹툰 보기(곰파트너 이야기, /story와 기존 주소) 사이의 주소 짝.
// 클래식은 내용과 데이터(data/classic)를 따로 관리한다. 같은 주소 짝이 있는 페이지만 서로 옮겨 다닌다.
// 10-22부터 클래식이 기본이다. 웹툰을 고른 사람만 localStorage "look"="webtoon"으로 기억한다.

export const storyPath = "/story";

export const classicPaths = ["/works", "/sample", "/pricing", "/maintenance", "/faq", "/tools", "/privacy", "/landing"];

// 웹툰 주소로 바로 들어오면 클래식 주소로 옮기는 페이지. 검색으로 들어오는 가이드, 자료실과 광고 랜딩은 그대로 둔다.
export const redirectPaths = ["/works", "/sample", "/pricing", "/maintenance", "/faq", "/privacy"];

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

/** 루트 레이아웃 head 스크립트. 웹툰을 고른 사람은 첫 화면에서 이야기로, 나머지는 웹툰 주소에서 같은 클래식 주소로 그리기 전에 옮긴다. */
export const lookRedirectScript = `try{var p=location.pathname.replace(/\\/$/,"")||"/";var w=false;try{w=localStorage.getItem("look")==="webtoon"}catch(e){}if(w){if(p==="/")location.replace("${storyPath}"+location.search+location.hash)}else if(${JSON.stringify(redirectPaths)}.some(function(x){return p===x||p.indexOf(x+"/")===0}))location.replace("/classic"+p+location.search+location.hash)}catch(e){}`;
