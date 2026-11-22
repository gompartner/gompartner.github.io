import { EnShell } from "@/components/en/EnShell";
import { LdScript } from "@/components/seo/JsonLd";
import { ORG_ID, WEBSITE_ID } from "@/lib/seo";

// 11-04 영문 페이지 공용 틀(머리글, 바닥글)
// 11-22 영문 페이지도 회사 개체와 연결한 구조화 데이터를 낸다(기본 점검 scripts/check-pages.mjs)
export default function EnLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <EnShell>
      <LdScript data={{ "@context": "https://schema.org", "@type": "WebPage", inLanguage: "en", isPartOf: { "@id": WEBSITE_ID }, about: { "@id": ORG_ID }, publisher: { "@id": ORG_ID } }} />
      {children}
    </EnShell>
  );
}
