import type { Metadata } from "next";
import { ClassicLandingPage } from "@/components/classic/landing/ClassicLandingPage";
import { fitDescription } from "@/lib/seo";

// 클래식 보기의 광고 랜딩페이지 상품 소개와 실제 상담 신청 폼. metadata는 /landing과 같다(검색 제외는 레이아웃이 한다).
export const metadata: Metadata = {
  title: { absolute: "광고 신청 접수 랜딩페이지 제작 | 곰파트너" },
  description: fitDescription("광고 유입 고객의 상담 신청을 접수하는 랜딩페이지 제작. 접수 즉시 알림, 구글 시트 기록, 광고 채널별 성과 집계를 제공합니다."),
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
