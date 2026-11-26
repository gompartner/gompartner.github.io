import type { Metadata } from "next";
import { MakeBoard } from "@/components/classic/make/MakeBoard";
import { MakeGuide } from "@/components/classic/make/MakeGuide";
import { kinds } from "@/components/classic/make/kinds";
import { LdScript } from "@/components/seo/JsonLd";
import { breadcrumbLd, boardServiceLd, pageMeta } from "@/lib/seo";

const path = "/make";
// 11-26 검색어 그대로("홈페이지 제작"). 예전 제목 "홈페이지, 랜딩페이지, 앱 제작"은 구글 "홈페이지 제작" 검색에 잡히지 않았다
const description = "홈페이지 제작 비용과 기간을 종류별로 공개합니다. 소개 홈페이지 29.9만 원(6일)부터이며 랜딩페이지와 앱, 3D 웹도 제작합니다.";

export const metadata: Metadata = pageMeta({
  title: "홈페이지 제작",
  description,
  alt: "곰파트너 홈페이지 제작. 종류별 화면과 패키지 금액",
  path,
});

// Service: 공개한 패키지 금액만(부가세 별도). 업무 시스템은 견적이라 이름만 catalog에
const ld = [
  boardServiceLd({
    name: "홈페이지 제작",
    description,
    path,
    offers: kinds.flatMap((k) => k.plans.map((p) => ({ name: p.name.includes(k.name) ? p.name : `${k.name} ${p.name}`, price: p.price, description: `제작 기간 ${p.period ?? `${p.days}일`}. ${p.summary}` }))),
    catalog: kinds.map((k) => ({ name: `${k.name} 제작` })),
  }),
  breadcrumbLd([{ name: "홈페이지 제작", path }]),
];

export default function MakePage() {
  return (
    <>
      <LdScript data={ld} />
      <MakeBoard>
        <MakeGuide />
      </MakeBoard>
    </>
  );
}
