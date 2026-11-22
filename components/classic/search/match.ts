// 검색 공용: 띄어쓰기, 쉼표, 대소문자를 무시하고, 검색어를 띄어 쓴 낱말이 모두 들어 있으면 맞는 것으로 본다.
export const norm = (s: string) => s.toLowerCase().replace(/[\s,.()/]+/g, "");

// 11-22 같은 뜻의 말(영문 약어와 우리말). 하나로 검색해도 나머지가 들어 있는 글을 찾는다
const SYN: string[][] = [
  ["seo", "검색엔진최적화", "검색최적화", "검색노출", "검색엔진등록", "메타태그"],
  ["geo", "aeo", "ai검색", "ai인용", "ai브리핑", "ai개요"],
  ["접근성", "accessibility", "kwcag", "wcag"],
  ["ssl", "https", "인증서", "tls"],
  ["오픈그래프", "og:image", "공유이미지"],
  ["cms", "만드는도구", "워드프레스", "아임웹", "카페24", "그누보드"],
  ["eol", "지원종료"],
  ["유지보수", "유지관리", "운영관리"],
  ["ux", "사용자경험"],
  ["ui", "화면디자인"],
];
const synOf = (w: string) => SYN.find((g) => g.includes(w)) ?? [w];

export function matches(hay: string, q: string) {
  const words = q.split(/\s+/).map(norm).filter(Boolean);
  if (words.length === 0) return false;
  const h = norm(hay);
  return words.every((w) => synOf(w).some((s) => h.includes(s)));
}
