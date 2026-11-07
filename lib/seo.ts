import { siteUrl } from "@/lib/site";

// 검색 결과 설명은 80자 안쪽으로 맞춘다(네이버·구글 모두 그 뒤는 잘린다).
// 문장 단위로 앞에서부터 담고, 첫 문장부터 넘치면 쉼표나 띄어쓰기에서 끊는다.
export const DESCRIPTION_MAX = 80;

// 공유 미리보기 이미지. 루트 레이아웃과 페이지별 메타가 같이 쓴다.
export const OG_IMAGE = { url: "/og-image.png?v=20261102", width: 1200, height: 630, alt: "곰파트너" };

// 하위 페이지가 openGraph를 따로 정하지 않으면 홈 제목과 설명이 그대로 공유된다.
// 페이지 제목과 설명으로 openGraph, twitter를 같이 채운다.
export function pageMeta(opts: { title: string; description: string; path: string; image?: { src: string; alt: string; width?: number; height?: number }; article?: boolean; noindex?: boolean }) {
  const description = fitDescription(opts.description);
  const title = `${opts.title} | 곰파트너`;
  const url = opts.path;
  const image = opts.image ? { url: opts.image.src, width: opts.image.width ?? 1200, height: opts.image.height ?? 675, alt: opts.image.alt } : OG_IMAGE;
  return {
    title: opts.title,
    description,
    alternates: { canonical: url },
    ...(opts.noindex ? { robots: { index: false, follow: true } } : {}),
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

// 구조화 데이터(JSON-LD) 공용 헬퍼. 전역 회사 개체는 components/seo/JsonLd.tsx 의 SiteJsonLd 가 낸다.
// 페이지별 Service, BreadcrumbList는 아래 함수로 만들고 <LdScript data={...} /> 로 넣는다.
export const ORG_ID = `${siteUrl}/#org`;
export const WEBSITE_ID = `${siteUrl}/#website`;

/** 회사 개체 참조. Service의 provider 등에 쓴다. */
export const orgRef = { "@id": ORG_ID } as const;

const abs = (path: string) => (/^https?:\/\//.test(path) ? path : `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`);

/** 이동 경로. 첫 항목이 "/"가 아니면 "홈"을 앞에 붙인다. */
export function breadcrumbLd(items: { name: string; path: string }[]) {
  const list = items[0]?.path === "/" ? items : [{ name: "홈", path: "/" }, ...items];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: list.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: abs(it.path) })),
  };
}

/** 서비스 페이지 한 쪽. provider는 회사 개체(@id) 참조. serviceType을 따로 주지 않으면 name을 쓴다. */
export function serviceLd(name: string, description: string, path: string, serviceType?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    serviceType: serviceType ?? name,
    areaServed: "KR",
    url: abs(path),
    provider: orgRef,
  };
}
