// 금액은 게시하지 않는다 — 구성과 범위로 안내하고 견적은 상담에서 확정
export interface PricingTier {
  id: string;
  title: string;
  bestFor: string;
  includes: string[];
}

export const pricingTiers: PricingTier[] = [
  {
    id: "landing",
    title: "랜딩페이지",
    bestFor: "하나의 상품·이벤트를 알리고 신청을 받고 싶을 때",
    includes: ["한 페이지 구성", "문의·신청 접수", "광고 연결에 맞춘 구성", "빠른 제작"],
  },
  {
    id: "homepage",
    title: "기업·브랜드 홈페이지",
    bestFor: "회사를 소개하고 신뢰를 주는 홈페이지가 필요할 때",
    includes: [
      "회사·서비스 소개 여러 페이지",
      "모바일 화면 기본",
      "검색 노출 기본 설정",
      "문의 접수",
    ],
  },
  {
    id: "custom",
    title: "맞춤 제작",
    bestFor: "예약, 회원, 관리자 화면 등 기능이 필요할 때",
    includes: ["예약·접수 기능", "관리자 화면", "외부 서비스 연동", "상담으로 범위 확정"],
  },
  {
    id: "maintenance",
    title: "유지보수 (월 단위)",
    bestFor: "만든 뒤에도 꾸준히 관리해 줄 사람이 필요할 때",
    includes: ["문구·이미지 수정", "장애·오류 대응", "정기 점검", "개선 제안"],
  },
];

export const pricingDisclaimer =
  "실제 견적은 요구사항에 따라 달라질 수 있습니다. 확정된 견적 이후에는 임의로 비용이 늘지 않습니다.";
