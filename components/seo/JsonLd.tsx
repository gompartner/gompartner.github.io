import { maintenanceServices } from "@/data/classic/maintenance";
import { profile } from "@/data/classic/profile";
import { homeDescription } from "@/data/seo";
import { ORG_ID, WEBSITE_ID } from "@/lib/seo";
import { siteUrl } from "@/lib/site";

// 같은 이름의 다른 회사와 구분되도록 회사가 운영하는 채널을 묶는다.
const sameAs = ["https://blog.naver.com/gompartner", "https://www.instagram.com/gompartner.co.kr", "https://www.youtube.com/@gompartner", "https://clip.naver.com/@gompartner"];

/** JSON-LD 한 덩어리(객체 또는 배열)를 script 태그로 넣는다. */
export function LdScript({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

const offers = [
  { name: "홈페이지 제작", path: "/classic/homepage" },
  { name: "랜딩페이지 제작", path: "/classic/landing" },
  { name: "업무 프로그램 제작", path: "/classic/program" },
  { name: "앱 제작", path: "/classic/app" },
  { name: "키오스크 화면 제작", path: "/classic/kiosk" },
  ...maintenanceServices.map((s) => ({ name: s.h1, path: `/classic/maintenance/${s.id}` })),
];

// 전역 구조화 데이터. 회사 개체 하나(@id .../#org)와 사이트 개체. 첫 화면(/)과 /classic 레이아웃이 넣는다.
// 구글 AI 개요가 "곰파트너"를 곰앤컴퍼니의 곰랩 파트너스로 설명한 적이 있어 구분 문구를 둔다.
export function SiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": ORG_ID,
        name: profile.name,
        legalName: profile.name,
        alternateName: [profile.nameEn, "gompartner"],
        url: `${siteUrl}/`,
        logo: `${siteUrl}/apple-icon.png`,
        image: `${siteUrl}/apple-icon.png`,
        description: homeDescription,
        disambiguatingDescription: "홈페이지 제작과 유지보수 업체. 곰앤컴퍼니의 곰랩 파트너스와 관계없음.",
        email: profile.email,
        telephone: profile.phone,
        faxNumber: profile.fax,
        taxID: profile.bizNo,
        areaServed: "KR",
        address: { "@type": "PostalAddress", addressLocality: "서울", addressCountry: "KR" },
        sameAs,
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "홈페이지 제작과 유지보수",
          itemListElement: offers.map((o) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: o.name, url: `${siteUrl}${o.path}` },
          })),
        },
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: `${siteUrl}/`,
        name: profile.name,
        description: homeDescription,
        inLanguage: "ko-KR",
        publisher: { "@id": ORG_ID },
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${siteUrl}/classic/search?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
  return <LdScript data={data} />;
}
