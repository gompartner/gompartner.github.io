import { appPlans, landingPlans, plans, type Plan } from "@/data/classic/pricing";

// 제작 판(MakeBoard)의 탭과 판 아래 안내(MakeGuide)가 함께 읽는 제작 종류. 11-26 판 아래 안내를 서버에서 그리려고 MakeBoard에서 옮겼다.
// 11-26 사용자 "첫 번째는 우리 것이 나와야, 모바일에서는 우리가 먼저 보이게": 종류마다 첫 그림은 곰파트너가 직접 만들어 운영하는 것(ours)을 둔다.
// 홈페이지는 곰파트너의 회사 홈페이지형(2026.10.22 판. 지금의 Build, Run, Care 메인이 아니라 회사 홈페이지 구성이던 때: 사용자 "빌드런 말고 2026.10.22 회사 홈페이지형"),
// 11-26 사용자: 가상 업종 그림(제조업 회사, 시험인증기관, 입주 청소, 정수기 렌탈, 필라테스, 학원) 제거, 키오스크 종류 제거. 실제로 만든 것만 남긴다.
// 11-26 사용자 "홈페이지는 격자 있던 스타일 어디 갔나", "랜딩페이지에 거래장부 썸네일 추가": 홈페이지는 우리 사이트의 지난 판 둘(유지보수 페이지, 지금 첫 화면)을 더한다. 거래장부는 업무 시스템 칸에 있어 랜딩에는 넣지 않는다(사용자 "랜딩에 거래장부 빼줘")
// 랜딩페이지는 사이트 지킴이, 업무 시스템은 거래장부. ours는 그림 아래 이름표(운영 중, 직접 제작). 앱은 가장 최근에 만든 화면부터. 11-27 3D 웹은 금액 없이 /3d 소개 페이지에서만 보여 준다. href가 있으면 그 서비스를 새 창으로 연다.
export type Shot = { img: string; name: string; ours?: string; href?: string };
export type Kind = { id: string; name: string; en: string; line: string; who: string[]; plans: Plan[]; href: string; c: string; shots: Shot[] };
export const kinds: Kind[] = [
  { id: "homepage", name: "홈페이지", en: "Website", line: "병원과 매장, 기업의 얼굴이 되는 사이트", who: ["처음 홈페이지를 만드는 사업장", "오래된 사이트를 새로 바꾸려는 곳", "문의와 예약을 홈페이지로 받고 싶은 곳"], plans, href: "/homepage", c: "#7aa7ff", shots: [{ img: "/images/history/sm/04-classic.jpg", name: "곰파트너 회사 홈페이지", ours: "직접 제작" }, { img: "/images/history/sm/06-care.jpg", name: "곰파트너 유지보수 페이지", ours: "직접 제작" }, { img: "/images/history/sm/08-main.jpg", name: "곰파트너 현재 홈페이지", ours: "직접 제작" }] },
  { id: "landing", name: "랜딩페이지", en: "Landing", line: "광고로 들어온 손님을 신청으로 잇는 한 장", who: ["광고를 돌리는데 신청이 적은 곳", "행사, 모집, 분양처럼 기간이 정해진 일", "신청 내역을 한곳에 모으고 싶은 곳"], plans: landingPlans, href: "/landing-page", c: "#ffd84d", shots: [{ img: "/images/products/jikimi.jpg", name: "사이트 지킴이", ours: "운영 중", href: "https://jikimi.gompartner.co.kr/" }] },
  { id: "program", name: "업무 시스템", en: "System", line: "엑셀로 하던 정산과 재고, 견적을 웹 화면 하나로", who: ["엑셀 파일이 사람마다 다른 곳", "같은 내용을 여러 번 옮겨 적는 곳", "담당자가 바뀌면 일이 멈추는 곳"], plans: [], href: "/program", c: "#ffffff", shots: [{ img: "/images/products/jangbu-1126.jpg", name: "거래장부(거래명세서 보내기와 수령 확인)", ours: "운영 중", href: "https://jangbu.gompartner.co.kr/" }] },
  { id: "app", name: "앱", en: "App", line: "예약과 주문, 현장 보고까지 손안에서", who: ["단골이 자주 쓰는 예약, 주문이 있는 곳", "현장에서 바로 기록해야 하는 일", "스토어에 내 앱을 올리고 싶은 곳"], plans: appPlans, href: "/app", c: "#7aa7ff", shots: [] },
];
