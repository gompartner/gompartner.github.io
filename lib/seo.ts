// 검색 결과 설명은 80자 안쪽으로 맞춘다(네이버·구글 모두 그 뒤는 잘린다).
// 문장 단위로 앞에서부터 담고, 첫 문장부터 넘치면 쉼표나 띄어쓰기에서 끊는다.
export const DESCRIPTION_MAX = 80;

export function fitDescription(text: string, max = DESCRIPTION_MAX): string {
  const s = text.replace(/\s+/g, " ").trim();
  if (s.length <= max) return s;
  let out = "";
  for (const sentence of s.split(/(?<=\.)\s+/)) {
    const next = (out + " " + sentence.trim()).trim();
    if (next.length > max) break;
    out = next;
  }
  if (out.length >= 30) return out;
  // 첫 문장이 짧은 이름표뿐이면 이어지는 나열을 쉼표에서 끊는다.
  const cut = s.slice(0, max);
  const comma = cut.lastIndexOf(", ");
  const at = comma > 0 ? comma : cut.lastIndexOf(" ");
  return cut.slice(0, at > 0 ? at : max).replace(/[,·.]$/, "") + ".";
}
