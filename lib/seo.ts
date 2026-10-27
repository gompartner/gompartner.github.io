import { redirectPaths } from "@/lib/look";

// 검색 결과 설명은 80자 안쪽으로 맞춘다(네이버·구글 모두 그 뒤는 잘린다).
// 문장 단위로 앞에서부터 담고, 첫 문장부터 넘치면 쉼표나 띄어쓰기에서 끊는다.
export const DESCRIPTION_MAX = 80;

// 공유 미리보기 이미지. 루트 레이아웃과 페이지별 메타가 같이 쓴다.
export const OG_IMAGE = { url: "/og-image.png?v=20261014", width: 1200, height: 630, alt: "곰파트너" };

// 하위 페이지가 openGraph를 따로 정하지 않으면 홈 제목과 설명이 그대로 공유된다.
// 페이지 제목과 설명으로 openGraph, twitter를 같이 채운다.
// 클래식과 짝이 있는 웹툰 주소는 검색 대표 주소를 클래식 쪽으로 둔다(10-22부터 클래식이 기본).
export function pageMeta(opts: { title: string; description: string; path: string; image?: { src: string; alt: string }; article?: boolean }) {
  const description = fitDescription(opts.description);
  const title = `${opts.title} | 곰파트너`;
  const url = canonicalFor(opts.path);
  const image = opts.image ? { url: opts.image.src, width: 1200, height: 675, alt: opts.image.alt } : OG_IMAGE;
  return {
    title: opts.title,
    description,
    alternates: { canonical: url },
    openGraph: { type: opts.article ? ("article" as const) : ("website" as const), locale: "ko_KR", siteName: "곰파트너", url, title, description, images: [image] },
    twitter: { card: "summary_large_image" as const, title, description, images: [image.url] },
  };
}

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

export function canonicalFor(path: string): string {
  return redirectPaths.some((p) => path === p || path.startsWith(p + "/")) ? `/classic${path}` : path;
}
