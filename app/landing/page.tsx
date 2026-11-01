import type { Metadata } from "next";
import { LandingPage } from "@/components/landing-page/LandingPage";
import { Black_Han_Sans } from "@/lib/local-fonts";
import { fitDescription } from "@/lib/seo";

// 11-01 크몽 상품 연결용으로만 남긴다. 검색에서 빼고(noindex, follow) 대표 주소는 두지 않는다.
// 곰파트너가 파는 '광고 신청 접수 랜딩'을 같은 방식으로 만든 실제 랜딩. 사이트 머리글·메뉴 없이 신청 하나만 받는다.
export const metadata: Metadata = {
  title: { absolute: "광고 신청 접수 랜딩페이지 제작 | 곰파트너" },
  description: fitDescription("광고를 보고 온 사람의 상담 신청을 받는 랜딩페이지를 만듭니다. 신청이 들어오면 바로 알리고, 구글 시트에 통화했는지 계약했는지까지 적고, 광고별 신청과 계약 수를 묶어 보여 드립니다."),
  robots: { index: false, follow: true },
  openGraph: {
    title: "광고 신청 접수 랜딩페이지 제작",
    url: "/landing",
    images: [{ url: "/og/landing-water-rental.png", width: 1200, height: 630, alt: "광고 신청 접수 랜딩페이지 샘플" }],
  },
};

export default function Page() {
  // 제목 글꼴(Black Han Sans)은 이 페이지에서만 불러온다
  return (
    <div className={Black_Han_Sans.variable}>
      <LandingPage />
    </div>
  );
}
