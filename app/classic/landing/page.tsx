import type { Metadata } from "next";
import { ClassicLandingPage } from "@/components/classic/landing/ClassicLandingPage";
import { fitDescription } from "@/lib/seo";

// 클래식 보기의 광고 랜딩페이지 상품 소개와 실제 상담 신청 폼. metadata는 /landing과 같다(검색 제외는 레이아웃이 한다).
export const metadata: Metadata = {
  title: { absolute: "광고 신청 접수 랜딩페이지 제작 | 곰파트너" },
  description: fitDescription("광고를 보고 온 사람의 상담 신청을 받는 랜딩페이지를 만듭니다. 신청이 들어오면 바로 알리고, 구글 시트에 통화했는지 계약했는지까지 적고, 광고별 신청과 계약 수를 묶어 보여 드립니다."),
  alternates: { canonical: "/landing" },
  openGraph: {
    title: "광고 신청 접수 랜딩페이지 제작",
    url: "/landing",
    images: [{ url: "/og/landing-water-rental.png", width: 1200, height: 630, alt: "광고 신청 접수 랜딩페이지 카탈로그" }],
  },
};

export default function Page() {
  return <ClassicLandingPage />;
}
