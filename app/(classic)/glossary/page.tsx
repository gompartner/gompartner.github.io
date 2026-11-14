import type { Metadata } from "next";
import { PageHead, wrap } from "@/components/classic/ui";
import { TermsBrowser } from "@/components/classic/glossary/TermsBrowser";
import { LdScript } from "@/components/seo/JsonLd";
import { breadcrumbLd, pageMeta } from "@/lib/seo";
import { termGroups } from "@/data/classic/glossary";
import { siteUrl } from "@/lib/site";

const count = termGroups.reduce((a, g) => a + g.terms.length, 0);

export const metadata: Metadata = pageMeta({
  title: "웹 용어 사전",
  description: `홈페이지를 맡기고 관리할 때 나오는 말 ${count}개. 화면 부품, 디자인 용어, 운영과 유지보수 용어의 뜻과 다른 이름, 업체에 말할 때 쓰는 문장을 정리했습니다.`,
  path: "/glossary",
});

// 용어 하나하나를 DefinedTermSet으로 알린다(검색, AI 답변이 뜻을 인용하기 쉽게)
const termSetLd = {
  "@context": "https://schema.org",
  "@type": "DefinedTermSet",
  name: "곰파트너 웹 용어 사전",
  url: `${siteUrl}/glossary`,
  hasDefinedTerm: termGroups.flatMap((g) => g.terms.map((t) => ({ "@type": "DefinedTerm", name: t.name, alternateName: t.alt, description: t.look, url: `${siteUrl}/glossary#${t.id}`, inDefinedTermSet: `${siteUrl}/glossary` }))),
};

export default function ClassicTermsPage() {
  return (
    <>
      <LdScript data={breadcrumbLd([{ name: "웹 용어 사전", path: "/glossary" }])} />
      <LdScript data={termSetLd} />
      <PageHead title="웹 용어 사전" trail={[{ href: "/glossary", label: "웹 용어 사전" }]} />
      <div className={`${wrap} pb-16 pt-10 md:pb-24 md:pt-14`}>
        <p className="mb-8 max-w-[62ch] text-[17px] leading-[1.7] text-[#3d4450]">
          홈페이지를 맡기고 관리할 때 나오는 말 {count}개를 모았습니다. 이름을 알면 업체에도, AI에게도 한 번에 전할 수 있습니다.
        </p>
        <TermsBrowser />
      </div>
    </>
  );
}
