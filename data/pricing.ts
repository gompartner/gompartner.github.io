// 홈페이지 제작 패키지. 크몽 서비스(#796239)의 가격, 작업 기간과 같게 맞춘다.
// 업무 프로그램(결과지, 관리자, 자동화, LMS 등)은 패키지 없이 별도 견적이다.

export type PlanId = "basic" | "standard" | "premium";

export interface Plan {
  id: PlanId;
  name: string;
  /** 크몽 패키지 제목과 같게 맞춘다. */
  title: string;
  price: number;
  days: number;
  summary: string;
  includes: string[];
}

export const plans: Plan[] = [
  {
    id: "basic",
    name: "기본",
    title: "소개 홈페이지",
    price: 299_000,
    days: 6,
    summary: "가게나 병원을 소개하는 홈페이지",
    includes: ["5쪽 이내", "PC·모바일 화면", "전화·지도·영업시간 안내", "네이버·구글 검색 등록"],
  },
  {
    id: "standard",
    name: "표준",
    title: "문의·예약 홈페이지",
    price: 490_000,
    days: 9,
    summary: "문의와 예약 신청을 받는 홈페이지",
    includes: ["10쪽 이내", "기본 패키지 전부", "문의·예약 신청 폼", "공지·사진 직접 올리기"],
  },
  {
    id: "premium",
    name: "고급",
    title: "맞춤 기능 홈페이지",
    price: 990_000,
    days: 12,
    summary: "자리 예약, 픽업 주문 같은 맞춤 기능이 들어간 홈페이지",
    includes: ["10쪽 이내", "표준 패키지 전부", "맞춤 기능 1개", "업종에 맞춘 첫 화면 디자인"],
  },
];

export const planCommon = ["원본 소스 제공", "완료 후 1개월 무상 유지보수"];

/** 데모별로 비슷하게 만들 때 맞는 패키지. 없으면 별도 견적이다. */
export const planByProject: Record<string, PlanId> = {
  "clinic-homepage": "basic",
  "dental-homepage": "premium",
  "hanok-cafe": "premium",
  "pilates-studio": "premium",
  "flower-expo": "premium",
  "bakery-cafe": "premium",
  pharmacy: "premium",
  "private-gym": "standard",
  pension: "premium",
  company: "premium",
  "cert-lab": "premium",
  "law-firm": "premium",
  "tax-office": "premium",
  "real-estate": "premium",
};

export const formatWon = (n: number) => `${n.toLocaleString("ko-KR")}원`;
