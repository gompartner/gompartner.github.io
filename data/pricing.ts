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
    summary: "예약·주문 같은 맞춤 기능을 넣은 홈페이지",
    includes: ["10쪽 이내", "표준 패키지 전부", "맞춤 기능 1개", "업종에 맞춘 첫 화면 디자인"],
  },
];

export const planCommon = ["원본 소스 제공", "완료 후 1개월 무상 오류 수정"];

/** 패키지에 없는 기능을 더할 때의 단가. 고급 패키지의 맞춤 기능 1개는 따로 받지 않는다. */
export type AddonId = "page" | "board" | "tool" | "print" | "lang" | "live" | "map" | "pay" | "member" | "cart";

export interface Addon {
  id: AddonId;
  name: string;
  price: number;
  unit: string;
  /** 1단위당 늘어나는 작업일 */
  days: number;
}

export const addons: Addon[] = [
  { id: "page", name: "추가 페이지", price: 30_000, unit: "쪽", days: 0.2 },
  { id: "board", name: "게시판 추가", price: 100_000, unit: "개", days: 1 },
  { id: "tool", name: "조회·계산 도구", price: 100_000, unit: "개", days: 1 },
  { id: "print", name: "인쇄용 출력 화면", price: 100_000, unit: "개", days: 1 },
  { id: "lang", name: "영문 화면", price: 200_000, unit: "식", days: 2 },
  { id: "member", name: "회원가입·로그인", price: 200_000, unit: "식", days: 2 },
  { id: "live", name: "실시간 예약 현황", price: 300_000, unit: "식", days: 3 },
  { id: "map", name: "지도 검색", price: 300_000, unit: "식", days: 3 },
  { id: "pay", name: "온라인 결제 연동", price: 300_000, unit: "식", days: 2 },
  { id: "cart", name: "상품·장바구니·주문", price: 500_000, unit: "식", days: 4 },
];

type Extra = [AddonId, number?];

/** 데모 수준으로 만들 때의 패키지와 추가 기능. 없으면 별도 견적이다. 괄호 안은 패키지에 든 맞춤 기능. */
const estimateSource: Record<string, { plan: PlanId; extras: Extra[] }> = {
  "clinic-homepage": { plan: "standard", extras: [["page", 5]] },
  "dental-homepage": { plan: "premium", extras: [["page", 5]] }, // 증상 자가체크
  pharmacy: { plan: "premium", extras: [["print"]] }, // 처방전 미리 보내기
  "law-firm": { plan: "premium", extras: [["board"]] }, // 사건별 절차 안내
  "tax-office": { plan: "premium", extras: [["board", 2]] }, // 신고일정
  "real-estate": { plan: "premium", extras: [["map"], ["tool"]] }, // 매물검색
  pension: { plan: "premium", extras: [["page", 3]] }, // 실시간예약
  "private-gym": { plan: "premium", extras: [["map"], ["pay"]] }, // 지점·시간 예약
  "pilates-studio": { plan: "premium", extras: [["tool"]] }, // 시간표 예약
  "hanok-cafe": { plan: "premium", extras: [["tool"]] }, // 좌석 예약
  "bakery-cafe": { plan: "premium", extras: [["tool"]] }, // 픽업 주문
  company: { plan: "standard", extras: [["lang"], ["page", 5]] },
  "cert-lab": { plan: "premium", extras: [["tool", 2], ["board"], ["page", 10]] }, // 시험진행현황 조회
  "flower-expo": { plan: "premium", extras: [["page", 10]] }, // 관람요금 계산
  "online-store": { plan: "premium", extras: [["cart"], ["pay"], ["member"]] }, // 유약 색·각인 미리보기
};

export interface Estimate {
  plan: Plan;
  lines: { name: string; amount: number }[];
  total: number;
  days: number;
}

export function estimateFor(projectId: string): Estimate | null {
  const src = estimateSource[projectId];
  const plan = src && plans.find((p) => p.id === src.plan);
  if (!src || !plan) return null;
  let total = plan.price;
  let days = plan.days;
  const lines = src.extras.map(([id, qty = 1]) => {
    const a = addons.find((x) => x.id === id)!;
    total += a.price * qty;
    days += a.days * qty;
    return { name: qty > 1 ? `${a.name} ${qty}${a.unit}` : a.name, amount: a.price * qty };
  });
  return { plan, lines, total, days: Math.ceil(days) };
}

export const manwon = (n: number) => `${(n / 10_000).toLocaleString("ko-KR", { maximumFractionDigits: 1 })}만 원`;
export const formatWon = (n: number) => `${n.toLocaleString("ko-KR")}원`;
