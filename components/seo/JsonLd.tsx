import { profile } from "@/data/profile";
import { plans } from "@/data/pricing";
import { siteUrl } from "@/lib/site";

// 같은 이름의 다른 회사와 구분되도록 외부 프로필을 묶는다.
const sameAs = ["https://kmong.com/gig/796239", "https://gompartner.tistory.com", "https://blog.naver.com/gompartner", "https://www.instagram.com/gompartner.co.kr", "https://www.youtube.com/@gompartner", "https://clip.naver.com/@gompartner"];

export function PersonJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    alternateName: profile.nameEn,
    jobTitle: profile.title,
    description: profile.bio,
    url: siteUrl,
    sameAs,
    address: {
      "@type": "PostalAddress",
      addressLocality: "서울",
      addressCountry: "KR",
    },
    email: profile.email,
    knowsAbout: [
      "홈페이지 구축",
      "홈페이지 유지보수",
      "공공기관 홈페이지 개편",
      "웹접근성 개선",
      "레거시 시스템 고도화",
      "Java Spring",
      "PHP 마이그레이션",
      "AWS 이전",
      "워드프레스 이관",
      "업무 프로그램 개발",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ProfessionalServiceJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: profile.name,
    description: profile.bio,
    url: siteUrl,
    email: profile.email,
    areaServed: "KR",
    sameAs,
    priceRange: `₩${plans[0].price.toLocaleString("ko-KR")}~₩${plans[plans.length - 1].price.toLocaleString("ko-KR")}`,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "홈페이지 제작 패키지",
      itemListElement: plans.map((p) => ({
        "@type": "Offer",
        name: p.title,
        description: `${p.summary}. ${p.includes.join(", ")}. 작업 ${p.days}일.`,
        price: p.price,
        priceCurrency: "KRW",
        url: `${siteUrl}/pricing`,
      })),
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "서울",
      addressCountry: "KR",
    },
    founder: {
      "@type": "Person",
      name: profile.name,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebSiteJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: siteUrl,
    name: profile.name,
    description: profile.bio,
    author: {
      "@type": "Person",
      name: profile.name,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
