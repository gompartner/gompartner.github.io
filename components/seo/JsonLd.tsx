import { profile } from "@/data/profile";
import { siteUrl } from "@/lib/site";

export function PersonJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    alternateName: profile.nameEn,
    jobTitle: profile.title,
    description: profile.bio,
    url: siteUrl,
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
