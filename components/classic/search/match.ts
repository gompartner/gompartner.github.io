// 검색 공용: 띄어쓰기, 쉼표, 대소문자를 무시하고, 검색어를 띄어 쓴 낱말이 모두 들어 있으면 맞는 것으로 본다.
export const norm = (s: string) => s.toLowerCase().replace(/[\s,.()/]+/g, "");

export function matches(hay: string, q: string) {
  const words = q.split(/\s+/).map(norm).filter(Boolean);
  if (words.length === 0) return false;
  const h = norm(hay);
  return words.every((w) => h.includes(w));
}
