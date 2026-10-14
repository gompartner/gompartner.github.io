// 홈페이지 제작 패키지. 크몽 서비스(#796239)의 가격, 작업 기간과 같게 맞춘다.
// 업무 프로그램(결과지, 관리자, 자동화, LMS 등)은 패키지 없이 별도 견적이다.

export type PlanId = "basic" | "standard" | "premium";
/** 한 쪽짜리 랜딩페이지. 크몽 랜딩페이지 서비스와 같게 맞춘다. */
export type LandingPlanId = "landing-basic" | "landing-standard" | "landing-premium";

export interface Plan {
  id: PlanId | LandingPlanId;
  name: string;
  /** 크몽 패키지 제목과 같게 맞춘다. */
  title: string;
  price: number;
  days: number;
  /** 작업 중 수정 횟수. 크몽 패키지와 같게 맞춘다. */
  revisions: number;
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
    revisions: 2,
    summary: "가게나 병원을 소개하는 홈페이지",
    includes: ["5쪽 이내", "PC·모바일 화면", "전화·지도·영업시간 안내", "네이버·구글 검색 등록"],
  },
  {
    id: "standard",
    name: "표준",
    title: "문의·예약 홈페이지",
    price: 490_000,
    days: 9,
    revisions: 3,
    summary: "문의와 예약 신청을 받는 홈페이지",
    includes: ["10쪽 이내", "기본 패키지 전부", "문의·예약 신청 폼", "공지·사진 직접 올리기"],
  },
  {
    id: "premium",
    name: "고급",
    title: "맞춤 기능 홈페이지",
    price: 990_000,
    days: 12,
    revisions: 4,
    summary: "예약·주문 같은 맞춤 기능을 넣은 홈페이지",
    includes: ["10쪽 이내", "표준 패키지 전부", "맞춤 기능 1개", "업종에 맞춘 첫 화면 디자인"],
  },
];

export const landingPlans: Plan[] = [
  {
    id: "landing-basic",
    name: "기본",
    title: "기본",
    price: 99_000,
    days: 4,
    revisions: 2,
    summary: "상담 신청 접수 페이지",
    includes: ["섹션 5개 이내", "PC·모바일 화면", "신청 폼과 개인정보 수집 동의", "접수 메일 알림", "구글 시트 자동 저장"],
  },
  {
    id: "landing-standard",
    name: "표준",
    title: "표준",
    price: 149_000,
    days: 5,
    revisions: 2,
    summary: "상담 상태 관리 포함",
    includes: ["섹션 7개 이내", "기본 구성 전부", "문자·카톡 알림(발송 비용 별도)", "시트에 상담 상태 칸", "같은 번호 중복 표시"],
  },
  {
    id: "landing-premium",
    name: "고급",
    title: "고급",
    price: 249_000,
    days: 7,
    revisions: 3,
    summary: "광고별 신청·계약 정리 포함",
    includes: ["섹션 10개 이내", "표준 구성 전부", "30분 넘게 연락 안 한 신청 다시 알림", "광고별 신청·계약 주간 요약", "네이버·메타·구글 광고별 신청 기록", "견적 계산 같은 맞춤 기능 1개"],
  },
];

export const planCommon = ["원본 소스 제공", "완료 후 1개월 무상 오류 수정"];

/** 결제 전에 보내는 미리보기. 고른 샘플에 상호와 색만 입힌 첫 화면 한 장이다. */
export const previewPromise = "결제 전에 첫 화면 미리 보기";
export const previewDetail = "샘플을 고르시면 상호와 색을 입힌 첫 화면을 결제 전에 보내 드립니다. 보시고 진행할지 정하시면 됩니다.";

/** 패키지 금액 밖에서 드는 돈. 숫자는 /tools/hosting-cost(data/hostingPrices.ts) 조사값에서 나온 범위다. */
export const runningCostNote =
  "도메인과 호스팅은 고객 명의로 직접 구매한 뒤 계정을 공유하거나 권한을 주시면 됩니다. 비용을 전달해 주시면 대리 구매도 가능합니다. 저렴한 웹호스팅이면 1년 3~4만 원, 아임웹 같은 구독형이면 1년 18~21만 원쯤 듭니다. 표시한 금액 외에 별도로 받는 비용은 없고, 기능을 더할 때만 추가 비용이 발생합니다.";

/** 이 패키지를 바탕으로 만든 샘플(견적 기준). 가격표 카드에 예시로 붙인다. */
export function samplesForPlan(planId: PlanId | LandingPlanId) {
  return Object.entries(estimateSource)
    .filter(([, src]) => src.plan === planId)
    .map(([id]) => ({ id, total: estimateFor(id)!.total }))
    .sort((a, b) => a.total - b.total);
}

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
const estimateSource: Record<string, { plan: PlanId | LandingPlanId; extras: Extra[] }> = {
  "landing-water-rental": { plan: "landing-basic", extras: [] },
  "landing-coding-camp": { plan: "landing-standard", extras: [] },
  "landing-move-clean": { plan: "landing-premium", extras: [] }, // 견적 계산기
  "landing-popup-store": { plan: "landing-premium", extras: [["tool", 2]] }, // 회차 발권, 더해서 현장 웨이팅·돌림판 쿠폰
  "landing-stamp-tour": { plan: "landing-premium", extras: [["tool", 2]] }, // 스탬프 투어, 더해서 해설사 회차 예약·코스 선택 지도
  "landing-zine-fair": { plan: "landing-premium", extras: [["tool", 2]] }, // 입장 회차 등록, 더해서 셀러 필터·부스 지도, 미리 담기
  "clinic-homepage": { plan: "standard", extras: [["page", 5]] },
  "dental-homepage": { plan: "standard", extras: [["tool"], ["page", 5]] }, // 증상 자가체크
  pharmacy: { plan: "standard", extras: [["print"]] }, // 처방전 미리 보내기는 문의 폼으로
  "law-firm": { plan: "standard", extras: [["board"]] }, // 사건별 절차 안내
  "tax-office": { plan: "standard", extras: [["board", 2]] }, // 신고일정
  "real-estate": { plan: "premium", extras: [["map"], ["tool"]] }, // 매물검색
  pension: { plan: "premium", extras: [["page", 3]] }, // 실시간예약
  "private-gym": { plan: "premium", extras: [["map"], ["pay"]] }, // 지점·시간 예약
  "korean-restaurant": { plan: "basic", extras: [] }, // 기본 패키지 범위 그대로
  interior: { plan: "standard", extras: [] }, // 표준 패키지 범위 그대로(시공사례·공지 직접 올리기)
  academy: { plan: "standard", extras: [["tool"], ["board"]] }, // 반 찾기·시간표
  "pilates-studio": { plan: "standard", extras: [["tool"]] }, // 시간표·레슨 추천
  "hanok-cafe": { plan: "standard", extras: [["tool"]] }, // 메뉴 찾기·공간 예약
  "bakery-cafe": { plan: "standard", extras: [["tool", 2]] }, // 빵 나오는 시간·픽업 예약
  company: { plan: "standard", extras: [["lang"], ["page", 5], ["tool"]] }, // 가공 가능 범위
  "cert-lab": { plan: "premium", extras: [] }, // 시험진행현황 조회
  "flower-expo": { plan: "basic", extras: [["tool"]] }, // 한 페이지 안내+관람요금 계산
  "online-store": { plan: "premium", extras: [["cart"], ["pay"], ["member"]] }, // 유약 색·각인 미리보기
};

/** 오픈 할인: 샘플에 이미 있는 기능은 다시 쓰므로 추가 기능 금액을 절반만 받는다. */
export const sampleReuseRate = 0.5;

export interface Estimate {
  plan: Plan;
  lines: { name: string; amount: number }[];
  /** 패키지+추가 기능 정가 합계 */
  list: number;
  /** 오픈 할인 금액 */
  discount: number;
  /** 실제 제공가(정가에서 할인을 뺀 값) */
  total: number;
  days: number;
}

export function estimateFor(projectId: string): Estimate | null {
  const src = estimateSource[projectId];
  const plan = src && [...plans, ...landingPlans].find((p) => p.id === src.plan);
  if (!src || !plan) return null;
  let list = plan.price;
  let days = plan.days;
  const lines = src.extras.map(([id, qty = 1]) => {
    const a = addons.find((x) => x.id === id)!;
    list += a.price * qty;
    days += a.days * qty;
    return { name: qty > 1 ? `${a.name} ${qty}${a.unit}` : a.name, amount: a.price * qty };
  });
  const discount = Math.round(lines.reduce((s, l) => s + l.amount, 0) * sampleReuseRate);
  return { plan, lines, list, discount, total: list - discount, days: Math.ceil(days) };
}

export const manwon = (n: number) => `${(n / 10_000).toLocaleString("ko-KR", { maximumFractionDigits: 1 })}만 원`;
export const formatWon = (n: number) => `${n.toLocaleString("ko-KR")}원`;
