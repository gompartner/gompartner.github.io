import type { Metadata } from "next";
import { CareBoard } from "@/components/classic/care/CareBoard";
import { LdScript } from "@/components/seo/JsonLd";
import { maintenanceServices } from "@/data/classic/maintenance";
import { breadcrumbLd, boardServiceLd, pageMeta } from "@/lib/seo";

const path = "/maintenance";
const description = "홈페이지 유지보수는 건별 30,000원부터, 월 유지관리는 월 60만 원부터(1년 계약)입니다. 오류 수정과 업체 변경, 보안 업데이트를 맡습니다.";

// 11-26 유지보수 한 판으로 바꿈(예전 긴 문서 페이지와 하위 페이지 6종은 내림, 옛 주소는 이 판으로 넘긴다). 11-27 판 아래 안내(CareGuide)도 내려 판 하나만 둔다
export const metadata: Metadata = pageMeta({
  title: "홈페이지 유지보수",
  description,
  alt: "곰파트너 홈페이지 유지보수. 상황별 작업 내용과 금액",
  path,
});

// Service: 공개 금액은 건별 30,000원부터 하나(부가세 별도). 나머지 서비스는 견적이라 이름과 한 줄만 catalog에
const ld = [
  boardServiceLd({
    name: "홈페이지 유지보수",
    description,
    path,
    offers: [{ name: "홈페이지 유지보수 건별 수정", minPrice: 30_000, description: "문구 수정과 이미지 교체 건별 30,000원부터. 월 계약 없음." }],
    catalog: maintenanceServices.map((s) => ({ name: s.h1, description: s.term })),
  }),
  breadcrumbLd([{ name: "홈페이지 유지보수", path }]),
];

export default function MaintenancePage() {
  return (
    <>
      <LdScript data={ld} />
      <CareBoard />
    </>
  );
}
