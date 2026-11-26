import { existsSync } from "node:fs";
import { join } from "node:path";
import { siteUrl } from "@/lib/site";

// 검색 결과 설명은 80자 안쪽으로 맞춘다(네이버·구글 모두 그 뒤는 잘린다).
// 문장 단위로 앞에서부터 담고, 첫 문장부터 넘치면 쉼표나 띄어쓰기에서 끊는다.
export const DESCRIPTION_MAX = 80;

// 공유 미리보기 이미지. 루트 레이아웃과 페이지별 메타가 같이 쓴다.
// 11-26 모든 카드를 1200x630 JPG로 맞췄다(카카오톡, 페이스북, X 공통). 그림을 다시 만들면 OG_VERSION 날짜를 올린다:
// 공유 서비스는 이미지 주소로 그림을 기억해 두기 때문에 주소(?v=)가 바뀌어야 새 그림을 가져간다.
// 값은 날짜 8자리 + 그날 몇 번째인지 2자리. public/3d 와 public/go/jaryo 의 정적 head 에 적힌 ?v= 도 같은 값으로 맞춘다.
export const OG_VERSION = "2026112602";
export const OG_SIZE = { width: 1200, height: 630 } as const;
/** 사이트 안 이미지 주소에 버전 값을 붙인다(이미 ?가 있거나 바깥 주소면 그대로) */
export const ogSrc = (src: string) => (src.startsWith("/") && !src.includes("?") ? `${src}?v=${OG_VERSION}` : src);
export const OG_IMAGE = { url: ogSrc("/og-image.png"), ...OG_SIZE, alt: "곰파트너 홈페이지, 앱 제작과 유지보수" };

// 하위 페이지가 openGraph를 따로 정하지 않으면 홈 제목과 설명이 그대로 공유된다.
// 페이지 제목과 설명으로 openGraph, twitter를 같이 채운다.
// 11-22 페이지 대표 이미지: 따로 정하지 않은 페이지는 scripts/page-cards.mjs 가 만든 public/og/page/<주소>.jpg 를 쓴다
export const ogKey = (path: string) => path.replace(/^\/|\/$/g, "").replaceAll("/", "--") || "home";
const pageCardFile = (path: string) => {
  const file = `/og/page/${ogKey(path)}.jpg`;
  return existsSync(join(process.cwd(), "public", file)) ? file : undefined;
};
/** 만든 페이지 카드 주소(없으면 undefined). 구조화 데이터 image에 쓴다 */
export function pageCardUrl(path: string) {
  const file = pageCardFile(path);
  return file ? ogSrc(file) : undefined;
}

/**
 * 페이지 메타 한 벌(title, description, canonical, openGraph, twitter).
 * alt는 대표 이미지 설명(안 주면 "페이지 이름 | 곰파트너"). image를 주면 그 그림을, 안 주면 페이지 카드를, 카드도 없으면 공통 이미지를 쓴다.
 * noindex는 검색에서만 뺀다(공유 미리보기는 그대로 나온다).
 */
export function pageMeta(opts: { title: string; description: string; path: string; image?: { src: string; alt: string; width?: number; height?: number }; alt?: string; article?: boolean; noindex?: boolean }) {
  const description = fitDescription(opts.description);
  const title = `${opts.title} | 곰파트너`;
  const url = opts.path;
  const card = pageCardFile(opts.path);
  const image = opts.image
    ? { url: ogSrc(opts.image.src), width: opts.image.width ?? OG_SIZE.width, height: opts.image.height ?? OG_SIZE.height, alt: opts.image.alt }
    : card
      ? { url: ogSrc(card), ...OG_SIZE, alt: opts.alt ?? title }
      : { ...OG_IMAGE, alt: opts.alt ?? title };
  return {
    title: opts.title,
    description,
    alternates: { canonical: url },
    ...(opts.noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: { type: opts.article ? ("article" as const) : ("website" as const), locale: "ko_KR", siteName: "곰파트너", url, title, description, images: [image] },
    twitter: { card: "summary_large_image" as const, title, description, images: [{ url: image.url, alt: image.alt }] },
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
  // 온전한 문장으로 40자(scripts/check-pages.mjs 의 최소 길이)를 채우면 거기서 끝낸다. 11-26 전에는 50자여서 41~49자 문장 뒤가 쉼표에서 잘려 나갔다
  if (out.length >= 40) return out;
  // 첫 문장이 짧은 이름표뿐이면 이어지는 나열을 쉼표에서 끊는다.
  const cut = s.slice(0, max);
  const comma = cut.lastIndexOf(", ");
  // 쉼표가 너무 앞(50자 전)이면 쉼표 대신 마지막 띄어쓰기에서 끊는다(11-22 설명 22자로 잘린 일)
  const at = comma >= 50 ? comma : cut.lastIndexOf(" ");
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
