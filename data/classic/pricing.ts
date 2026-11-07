// 홈페이지 제작 패키지. 크몽 서비스(#796239)의 가격, 작업 기간과 같게 맞춘다. 10-30에 숨겼다가 11-03 홈페이지, 랜딩 가격표에 금액과 기간을 다시 싣는다.
// 업무 프로그램(결과지, 관리자, 자동화, LMS 등)은 패키지 없이 별도 견적이다.
import { hiddenIds } from "@/data/projects";

export type PlanId = "basic" | "standard" | "premium";
/** 한 쪽짜리 랜딩페이지. 크몽 랜딩페이지 서비스와 같게 맞춘다. */
export type LandingPlanId = "landing-basic" | "landing-standard" | "landing-premium";
/** 11-03 앱, 키오스크 화면 패키지. 크몽 시세(웹앱 55만~, 하이브리드 앱 평균 150만, 키오스크 100만~, 주문형 300~450만)를 보고 정했다. */
export type ExtraPlanId = "app-basic" | "app-standard" | "app-premium" | "kiosk-basic" | "kiosk-standard" | "kiosk-premium" | "3d-viewer" | "3d-brand" | "3d-config";

export interface Plan {
  id: PlanId | LandingPlanId | ExtraPlanId;
  name: string;
  /** 크몽 패키지 제목과 같게 맞춘다. */
  title: string;
  price: number;
  days: number;
  /** 작업 중 수정 횟수. 크몽 패키지와 같게 맞춘다. 0이면 표에서 행을 뺀다(3D). */
  revisions: number;
  /** 작업 기간 표기를 일 대신 따로 쓸 때(예: "3주") */
  period?: string;
  summary: string;
  includes: string[];
}

export const plans: Plan[] = [
  {
    id: "basic",
    name: "소개 홈페이지",
    title: "소개 홈페이지",
    price: 299_000,
    days: 6,
    revisions: 2,
    summary: "매장, 병원 등 사업장 소개 중심",
    includes: ["기본 5쪽 구성", "반응형 화면(PC, 모바일)", "전화, 지도, 영업시간 안내", "네이버, 구글 검색엔진 등록"],
  },
  {
    id: "standard",
    name: "문의, 예약 홈페이지",
    title: "문의, 예약 홈페이지",
    price: 490_000,
    days: 9,
    revisions: 3,
    summary: "문의, 예약 접수와 게시물 직접 관리",
    includes: ["기본 10쪽 구성", "소개 홈페이지 구성 전부", "문의, 예약 신청 폼", "관리자 페이지(공지, 사진 게시)"],
  },
  {
    id: "premium",
    name: "맞춤 기능 홈페이지",
    title: "맞춤 기능 홈페이지",
    price: 990_000,
    days: 12,
    revisions: 4,
    summary: "예약, 주문 등 업종 맞춤 기능 개발",
    includes: ["기본 10쪽 구성", "문의, 예약 홈페이지 구성 전부", "업종 맞춤 기능 개발", "업종 맞춤 메인 화면 디자인"],
  },
];

export const landingPlans: Plan[] = [
  {
    id: "landing-basic",
    name: "신청 접수",
    title: "신청 접수",
    price: 99_000,
    days: 4,
    revisions: 2,
    summary: "신청 접수와 즉시 알림",
    includes: ["기본 5개 섹션 구성", "반응형 화면(PC, 모바일)", "신청 폼과 개인정보 수집 동의", "접수 메일 알림", "구글 시트 자동 저장"],
  },
  {
    id: "landing-standard",
    name: "상담 관리",
    title: "상담 관리",
    price: 149_000,
    days: 5,
    revisions: 2,
    summary: "상담 진행 상태 관리",
    includes: ["기본 7개 섹션 구성", "신청 접수 구성 전부", "문자, 알림톡 알림", "시트 상담 상태 관리", "중복 신청 자동 표시"],
  },
  {
    id: "landing-premium",
    name: "광고 성과 정리",
    title: "광고 성과 정리",
    price: 249_000,
    days: 7,
    revisions: 3,
    summary: "광고 채널별 성과 집계",
    includes: ["기본 10개 섹션 구성", "상담 관리 구성 전부", "30분 미처리 신청 재알림", "광고 채널별 신청, 계약 주간 리포트", "네이버, 메타, 구글 광고별 유입 기록", "견적 계산 등 맞춤 기능 개발"],
  },
];

export const appPlans: Plan[] = [
  {
    id: "app-basic",
    name: "설치형 웹앱",
    title: "설치형 웹앱",
    price: 990_000,
    days: 10,
    revisions: 2,
    summary: "스토어 심사 없이 휴대폰 홈 화면에 설치",
    includes: ["기본 5개 화면 구성", "아이폰, 안드로이드 홈 화면 설치", "문의, 예약 신청 접수", "관리자 웹(공지, 접수 내역)"],
  },
  {
    id: "app-standard",
    name: "스토어 출시 앱",
    title: "스토어 출시 앱",
    price: 1_990_000,
    days: 20,
    revisions: 3,
    summary: "앱스토어, 플레이스토어에 출시하는 앱",
    includes: ["기본 10개 화면 구성", "설치형 웹앱 구성 전부", "회원가입, 로그인", "푸시 알림", "스토어 등록 자료와 심사 제출"],
  },
  {
    id: "app-premium",
    name: "예약, 주문, 결제 앱",
    title: "예약, 주문, 결제 앱",
    price: 3_900_000,
    days: 30,
    revisions: 4,
    summary: "예약, 주문, 결제와 적립까지 운영하는 앱",
    includes: ["기본 15개 화면 구성", "스토어 출시 앱 구성 전부", "예약, 주문 접수", "온라인 결제 연동", "적립, 쿠폰", "관리자 웹(회원, 주문, 통계)"],
  },
];

export const kioskPlans: Plan[] = [
  {
    id: "kiosk-basic",
    name: "안내 화면",
    title: "안내 화면",
    price: 990_000,
    days: 10,
    revisions: 2,
    summary: "시설, 매장 이용 안내 터치 화면",
    includes: ["기본 5개 화면 구성", "큰 글씨, 높은 대비 화면", "관리자 웹(문구, 운영시간 변경)", "전체 화면 고정 모드"],
  },
  {
    id: "kiosk-standard",
    name: "접수, 출결",
    title: "접수, 출결",
    price: 1_990_000,
    days: 15,
    revisions: 3,
    summary: "병원 접수, 학원 출결, 체크인",
    includes: ["기본 10개 화면 구성", "안내 화면 구성 전부", "대기번호 발급, 번호표 출력", "바코드, QR 스캔", "접수, 출결 내역과 통계"],
  },
  {
    id: "kiosk-premium",
    name: "결제, 연동",
    title: "결제, 연동",
    price: 3_900_000,
    days: 25,
    revisions: 4,
    summary: "결제 단말과 외부 시스템 연동",
    includes: ["기본 15개 화면 구성", "접수, 출결 구성 전부", "카드 결제 단말 연동", "외부 시스템 연동(예약, 회원)", "원격 업데이트, 자동 재시작"],
  },
];

export const appCommon = ["원본 소스 제공", "점검 결과표, 인계 문서", "출시 후 1개월 무상 관리"];
export const kioskCommon = ["원본 소스 제공", "현장 장비 설치와 연결 설정", "점검 결과표, 인계 문서", "설치 후 1개월 무상 관리"];

export const planCommon = ["업종별 법정 고지 검토", "원본 소스 제공", "점검 결과표, 인계 문서", "오픈 후 1개월 무상 관리"];

/** 패키지 금액 밖에서 드는 돈. 숫자는 /tools/hosting-cost(data/hostingPrices.ts) 조사값에서 나온 범위다. */
export const runningCostNote =
  "도메인과 호스팅은 고객 명의로 계약하고 관리 권한만 공유받습니다. 비용을 전달해 주시면 대리 구매도 가능합니다. 저렴한 웹호스팅이면 1년 3~4만 원, 아임웹 같은 구독형이면 1년 18~21만 원쯤 듭니다. 표시한 금액 외에 별도로 받는 비용은 없고, 기능을 더할 때만 추가 비용이 발생합니다.";

/** 이 패키지를 바탕으로 만든 샘플(견적 기준). 가격표 카드에 예시로 붙인다. */
export function samplesForPlan(planId: PlanId | LandingPlanId | ExtraPlanId) {
  return Object.entries(estimateSource)
    .filter(([id, src]) => src.plan === planId && !hiddenIds.has(id))
    .map(([id]) => ({ id, total: estimateFor(id)!.total }))
    .sort((a, b) => a.total - b.total);
}

/** 패키지에 없는 기능을 더할 때의 단가. 맞춤 기능 홈페이지의 맞춤 기능 1개는 따로 받지 않는다. */
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
  { id: "tool", name: "조회, 계산 도구", price: 100_000, unit: "개", days: 1 },
  { id: "print", name: "인쇄용 출력 화면", price: 100_000, unit: "개", days: 1 },
  { id: "lang", name: "영문 화면", price: 200_000, unit: "식", days: 2 },
  { id: "member", name: "회원가입, 로그인", price: 200_000, unit: "식", days: 2 },
  { id: "live", name: "실시간 예약 현황", price: 300_000, unit: "식", days: 3 },
  { id: "map", name: "지도 검색", price: 300_000, unit: "식", days: 3 },
  { id: "pay", name: "온라인 결제 연동", price: 300_000, unit: "식", days: 2 },
  { id: "cart", name: "상품, 장바구니, 주문", price: 500_000, unit: "식", days: 4 },
];

type Extra = [AddonId, number?];

/** 데모 수준으로 만들 때의 패키지와 추가 기능. 없으면 별도 견적이다. 괄호 안은 패키지에 든 맞춤 기능.
    11-08 화면 대조 기준: tool은 입력을 받아 계산하거나 조회하는 도구(계산기, 검색, 날짜와 시각 칸을 고르는 예약 접수)만 센다.
    단순 표, 고르는 안내(탭, 분류 전환), 정적 지도 그림, 상담 폼(날짜만 받거나 오전, 오후 같은 희망 시간대)은 기본에 포함이다.
    page는 이번 대조에서 바꾸지 않았다. */
const estimateSource: Record<string, { plan: PlanId | LandingPlanId; extras: Extra[] }> = {
  "landing-water-rental": { plan: "landing-basic", extras: [] },
  "landing-coding-camp": { plan: "landing-standard", extras: [] },
  "landing-move-clean": { plan: "landing-premium", extras: [] }, // (견적 계산기), 예약 날짜 칸은 신청 폼에 포함
  "landing-popup-store": { plan: "landing-premium", extras: [] }, // (회차 예약), 현장 웨이팅과 경품은 안내 문구만
  "landing-stamp-tour": { plan: "landing-premium", extras: [["tool"]] }, // (스탬프 투어와 코스 지도), 더해서 해설사 회차 예약
  "landing-zine-fair": { plan: "landing-premium", extras: [["tool"]] }, // (부스 지도와 관심 부스 동선), 더해서 셀러 검색. 사전 등록은 신청 폼
  "landing-leather-class": { plan: "landing-premium", extras: [["pay"]] }, // (회차 신청, 자동 마감), 더해서 결제 단계
  "clinic-homepage": { plan: "standard", extras: [["page", 5]] },
  "dental-homepage": { plan: "standard", extras: [["page", 5]] }, // 증상 안내는 고르는 안내, 예약은 오전, 오후 시간대라 기본
  pharmacy: { plan: "standard", extras: [] }, // 운영시간 표, 휴일지킴이 달력, 오시는 길. 인쇄 화면 없음
  "law-firm": { plan: "standard", extras: [["board"]] }, // 성공사례 게시판(분야, 결과 거르기). 사건별 절차는 고르는 안내
  "tax-office": { plan: "standard", extras: [["board", 2]] }, // 세무자료실 세무소식, 칼럼 게시판(검색 포함). 신고일정 달력은 기본
  "real-estate": { plan: "premium", extras: [["tool"]] }, // (매물 조건 검색), 더해서 중개보수 계산
  pension: { plan: "premium", extras: [["page", 3]] }, // (실시간 예약 현황표)
  "private-gym": { plan: "premium", extras: [["pay"]] }, // (지점, 시간 칸 예약), 더해서 결제 단계. 지점은 카드 목록
  "korean-restaurant": { plan: "basic", extras: [] }, // 기본 패키지 범위 그대로
  interior: { plan: "standard", extras: [] }, // 표준 패키지 범위 그대로(시공사례, 공지 직접 올리기)
  academy: { plan: "standard", extras: [["tool"]] }, // 레벨테스트 날짜, 시간 칸 예약. 학년별 시간표는 고르는 안내
  "pilates-studio": { plan: "standard", extras: [] }, // 시간표와 수강료는 표, 체험 신청은 상담 후 시간 확정 폼
  "hanok-cafe": { plan: "standard", extras: [] }, // 메뉴판, 좌석 예약은 네이버 예약 연결
  "bakery-cafe": { plan: "standard", extras: [["tool"], ["cart"]] }, // 빵 담기와 픽업 주문이 cart, 굽는 시간 뒤로만 여는 픽업 시간 칸이 tool. 빵 나오는 시간은 표
  company: { plan: "standard", extras: [["lang"], ["page", 5]] }, // 한국어, English 전환. 가공 사양은 표
  "cert-lab": { plan: "premium", extras: [] }, // (성적서 진위확인 조회)
  "flower-expo": { plan: "basic", extras: [["tool"]] }, // 관람요금 계산. 추천 코스는 고르는 안내
  "online-store": { plan: "premium", extras: [["cart"], ["pay"]] }, // (유약, 크기, 각인 옵션), 회원 기능 없음
  "roastery": { plan: "standard", extras: [["cart"]] }, // 원두 담기와 주문 접수. 구독은 요금표
  "hair-salon": { plan: "standard", extras: [["tool"]] }, // 디자이너, 시술, 날짜, 시각을 고르는 예약 접수
  "optical": { plan: "standard", extras: [["tool"]] }, // 시력검사 날짜, 시간 칸 예약. 테와 렌즈 가격은 표, 오시는 길은 그림
  "furniture-workshop": { plan: "standard", extras: [] }, // 목재별 시작가 안내와 제작 문의 폼
  "coworking": { plan: "standard", extras: [["tool"]] }, // 투어 날짜, 시간 칸 예약. 요금과 회의실은 표
  "campsite": { plan: "premium", extras: [["tool", 2]] }, // (사이트 배치도와 마감 표시), 더해서 사이트별 예약 달력, 장비 대여와 인원 추가 요금 합산
  "photo-studio": { plan: "standard", extras: [["tool", 2]] }, // 패키지 옵션 합산, 30분 칸 예약 접수
  "nail-shop": { plan: "standard", extras: [["tool"]] }, // 날짜, 담당, 시각 칸 예약 접수와 금액
  "car-detailing": { plan: "standard", extras: [["tool"]] }, // 입고 날짜, 시간 칸 예약과 픽업 접수. 차종별 가격은 표
  "lighting-shop": { plan: "standard", extras: [["tool"]] }, // 견적 담기와 수량별 합계. 색온도는 안내 표
  "liquor-shop": { plan: "standard", extras: [["tool"]] }, // 시음회 회차 예약(남은 자리, 인원별 금액)
  "small-wedding": { plan: "standard", extras: [["tool"]] }, // 날짜, 시간대별 예약 가능 달력. 배치와 패키지는 표, 상담 폼은 기본
  "korean-medicine": { plan: "standard", extras: [["tool"]] }, // 30분 칸 진료 예약(교통사고 접수번호는 예약에 포함)
  "orthopedics": { plan: "standard", extras: [["tool"]] }, // 진료 시간 칸 예약. 부위별 안내와 비급여는 표
  "pediatrics": { plan: "standard", extras: [] }, // 접수 안내, 예방접종과 검진 시기는 표
  "eye-clinic": { plan: "standard", extras: [["tool"]] }, // 상담 예약(날짜, 시간 칸 접수)이 tool. 수술 비교와 검사 단계는 고르는 안내라 세지 않음
  "animal-hospital": { plan: "standard", extras: [["tool"]] }, // 진료 시간 칸 예약. 검진 추천과 면회 시간은 표
  "nursing-hospital": { plan: "standard", extras: [["tool"]] }, // 면회 시간 칸 예약. 병실 비용은 표
  "labor-firm": { plan: "standard", extras: [] }, // 구제신청, 임금체불, 자문 안내는 표와 상담 폼
  "scrivener": { plan: "standard", extras: [] }, // 등기 비용과 준비 서류는 안내, 상담 폼
  "patent-office": { plan: "standard", extras: [] }, // 상표, 출원 비용, 심사 단계는 안내, 상담 폼
  "family-law": { plan: "standard", extras: [] }, // 분야 안내와 희망 시간대 상담 예약 폼
  "visa-agent": { plan: "standard", extras: [["lang"]] }, // 한국어와 English 전환. 체류자격과 연장 안내는 표
  "architect-office": { plan: "standard", extras: [] }, // 작업 목록 필터와 설계 과정 안내, 상담은 전화와 카카오톡
  "presale": { plan: "standard", extras: [["tool"]] }, // 견본주택 방문 시간 칸 예약. 분양가는 표, 입지는 그림
  "saas-startup": { plan: "standard", extras: [] }, // 월간, 연간 요금표와 기능 비교표, 도입 상담 폼
  "logistics": { plan: "standard", extras: [] }, // 출고 일정과 요금은 표, 센터 안내, 도입 상담 폼
  "food-oem": { plan: "standard", extras: [] }, // 포장별 품목과 최소 주문 수량은 표, 샘플 의뢰 폼
  "piano-academy": { plan: "standard", extras: [["tool"]] }, // 과정과 요일별 시간 칸 체험 레슨 신청. 시간표는 표
  "taekwondo": { plan: "standard", extras: [] }, // 차량 노선과 승급 심사는 표, 상담 폼
  "art-academy": { plan: "standard", extras: [["tool"]] }, // 방문 상담 예약(날짜, 시간 칸). 교습비는 표
  "english-talk": { plan: "standard", extras: [["tool", 2]] }, // 레벨테스트 날짜, 시각 예약, 반 수업일에 맞춘 체험 신청
  "driving-school": { plan: "standard", extras: [] }, // 면허별 비용, 셔틀, 시험 안내는 표, 희망 시간대 등록 상담 폼
  "reading-academy": { plan: "standard", extras: [["tool"]] }, // 날짜, 시각 칸 상담 예약. 학년별 책은 고르는 안내
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
