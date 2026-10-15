// 웹툰 보기(기본 주소)와 클래식 보기(/classic 아래 별도 페이지) 사이의 주소 짝.
// 클래식은 내용과 데이터(data/classic)를 따로 관리한다. 같은 주소 짝이 있는 페이지만 서로 옮겨 다닌다.

export const classicPaths = ["/works", "/sample", "/pricing", "/maintenance", "/faq", "/tools", "/privacy"];

export function classicPathFor(path: string): string | null {
  if (path === "/" || path === "") return "/classic";
  return classicPaths.some((p) => path === p || path.startsWith(p + "/")) ? `/classic${path}` : null;
}

export function webtoonPathFor(path: string): string {
  const rest = path.replace(/^\/classic/, "");
  return rest === "" ? "/" : rest;
}

/** 클래식을 고른 사람이 웹툰 주소로 들어오면 그리기 전에 클래식 주소로 옮긴다(루트 레이아웃 head 스크립트). */
export const lookRedirectScript = `try{if(localStorage.getItem("look")==="classic"){var p=location.pathname.replace(/\\/$/,"")||"/";var ok=p==="/"||${JSON.stringify(classicPaths)}.some(function(x){return p===x||p.indexOf(x+"/")===0});if(ok)location.replace("/classic"+(p==="/"?"":p)+location.search+location.hash)}}catch(e){}`;
