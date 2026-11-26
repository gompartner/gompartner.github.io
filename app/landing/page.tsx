import type { Metadata } from "next";
import { LandingPage } from "@/components/landing-page/LandingPage";
import { Black_Han_Sans } from "@/lib/local-fonts";
import { OG_SIZE, fitDescription, ogSrc } from "@/lib/seo";

// 11-01 크몽 상품 연결용으로만 남긴다. 검색에서 빼고(noindex, follow) 대표 주소는 두지 않는다.
// 곰파트너가 파는 '광고 신청 접수 랜딩'을 같은 방식으로 만든 실제 랜딩. 사이트 머리글·메뉴 없이 신청 하나만 받는다.
const LANDING_DESCRIPTION = fitDescription("광고를 보고 온 사람의 상담 신청을 받는 랜딩페이지를 만듭니다. 신청 알림, 구글 시트 상담 기록, 광고별 신청과 계약 수 집계를 제공합니다.");
export const metadata: Metadata = {
  title: { absolute: "광고 신청 접수 랜딩페이지 제작 | 곰파트너" },
  description: LANDING_DESCRIPTION,
  robots: { index: false, follow: true },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "곰파트너",
    title: "광고 신청 접수 랜딩페이지 제작 | 곰파트너",
    description: LANDING_DESCRIPTION,
    url: "/landing",
    images: [{ url: ogSrc("/og/landing-water-rental.jpg"), ...OG_SIZE, alt: "광고 신청 접수 랜딩페이지 화면" }],
  },
  twitter: { card: "summary_large_image", title: "광고 신청 접수 랜딩페이지 제작 | 곰파트너", description: LANDING_DESCRIPTION, images: [{ url: ogSrc("/og/landing-water-rental.jpg"), alt: "광고 신청 접수 랜딩페이지 화면" }] },
};

export default function Page() {
  // 제목 글꼴(Black Han Sans)은 이 페이지에서만 불러온다
  return (
    <div className={Black_Han_Sans.variable}>
      <LandingPage />
    </div>
  );
}
