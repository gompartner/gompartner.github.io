// 11-25 대표: "샘플에서 위쪽 카테고리를 누르면 이전 화면이 아니라 처음부터 다시 검색하게 돼서 불편".
// 사이트 안에서 지나온 주소를 세션에 쌓아 두고, 누른 링크가 바로 앞 화면이면 새로 열지 않고 뒤로 간다(보던 자리, 검색어 그대로).

const KEY = "gp-nav";
const norm = (u: string) => {
  const [p, q = ""] = u.split("?");
  const path = p.length > 1 ? p.replace(/\/+$/, "") : p;
  return q ? `${path}?${q}` : path;
};
const pathOf = (u: string) => norm(u).split("?")[0];

function read(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}
function write(s: string[]) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(s.slice(-30)));
  } catch {}
}

/** 화면이 바뀔 때마다 부른다. 바로 앞 화면으로 돌아온 것이면 쌓지 않고 하나 뺀다 */
export function recordNav(url: string) {
  const u = norm(url);
  const s = read();
  if (s[s.length - 1] === u) return;
  if (s.length >= 2 && s[s.length - 2] === u) s.pop();
  else s.push(u);
  write(s);
}

/** 바로 앞 화면 주소(없으면 null) */
export function prevNav(): string | null {
  const s = read();
  return s.length >= 2 ? s[s.length - 2] : null;
}

/** href가 바로 앞 화면과 같은 곳이면 뒤로 가기로 바꾼다. 바꿨으면 true */
export function backIfPrev(e: { preventDefault: () => void }, href: string, match: (prev: string) => boolean = (p) => pathOf(p) === pathOf(href)) {
  try {
    const prev = prevNav();
    if (prev && match(prev) && window.history.length > 1) {
      e.preventDefault();
      window.history.back();
      return true;
    }
  } catch {}
  return false;
}
