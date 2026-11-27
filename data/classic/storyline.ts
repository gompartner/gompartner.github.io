// 회사소개(/story) 내용. 개인 이력이 아니라 회사가 하는 일과 일하는 방식을 적는다(11-26 사용자 "경력팔이 그만").
// 11-27 사이트 변천사(단계 여덟 장)를 내렸다. 날짜와 숫자는 변경 기록(git log)에서 확인한 것만 쓴다(변경 950회: git rev-list --count HEAD, 11-26 기준 954).
// 페이지 그림(public/images/history/08-board-*)은 지금 화면이라 그 페이지를 고치면 다시 찍는다
const shot = (name: string) => `/images/history/${name}.jpg`;

export const storyLead = "홈페이지와 앱을 만들고, 운영하고, 관리합니다. 이 사이트부터 그렇게 운영합니다.";

// 지금의 페이지. 그림을 누르면 그 페이지로 간다
export const boards = [
  { name: "제작", en: "BUILD", href: "/make", line: "종류를 고르면 만든 화면과 금액, 기간이 나옵니다.", img: shot("08-board-make"), alt: "제작 종류 여섯 가지와 금액이 놓인 제작 페이지" },
  { name: "유지보수", en: "CARE", href: "/maintenance", line: "상황을 고르면 해 드리는 일과 금액이 나옵니다.", img: shot("08-board-care"), alt: "여섯 가지 상황을 고르는 유지보수 페이지" },
  { name: "작업 사례", en: "WORKS", href: "/works", line: "직접 만들어 운영하는 작업을 실제 화면으로 봅니다.", img: shot("08-board-catalog"), alt: "만든 화면을 종류별로 진열한 카탈로그 페이지" },
];

// 하는 일. 메인 첫 문장(Build, Run, Care)과 같은 순서
export const works = [
  { en: "BUILD", name: "만듭니다", body: "홈페이지와 앱부터 키오스크, 3D 웹까지 제작합니다.", links: [{ href: "/make", label: "제작" }] },
  {
    en: "RUN",
    name: "운영합니다",
    body: "웹사이트 모니터링 서비스 사이트 지킴이와 거래명세서를 링크로 보내고 수령 확인을 받는 거래장부를 직접 만들어 운영합니다.",
    links: [
      { href: "https://jikimi.gompartner.co.kr/", label: "사이트 지킴이" },
      { href: "https://jangbu.gompartner.co.kr/", label: "거래장부" },
    ],
  },
  { en: "CARE", name: "관리합니다", body: "수정 한 건부터 유지보수 업체 변경까지 맡습니다.", links: [{ href: "/maintenance", label: "유지보수" }] },
];

// 결론(사용자 "팔리는 상품을 잘 이야기하고 진열을 잘하는 것이 중요하다")과, 고객 홈페이지에 똑같이 대는 기준
export const conclusion = {
  lead: "사이트를 고쳐 오며 확인한 것",
  text: "팔리는 상품을 잘 이야기하고, 진열을 잘하는 것이 중요합니다.",
  note: "고객의 홈페이지도 같은 기준으로 만듭니다.",
  checks: [
    { title: "무엇을 파는지 한 문장으로 말하는가", body: "첫 화면에서 상품이 한 문장으로 읽혀야 합니다. 이 사이트의 첫 문장은 Build, Run, Care 입니다." },
    { title: "찾는 순서대로 진열했는가", body: "제작은 종류로, 유지보수는 상황으로 나눴습니다. 방문자가 찾는 말로 진열합니다." },
    { title: "오픈한 뒤에도 고치는가", body: "이 사이트는 오픈 후 950회 넘게 고쳤습니다. 고객 사이트도 수정 한 건부터 이어서 맡습니다." },
  ],
};

// 일하는 방식. 어느 제작사나 하는 일(반응형, 소스 제공, 계약서, 하자보수)은 적지 않는다
export const ways = [
  { title: "업종별 법정 고지 검토", body: "비급여 진료비나 교습비처럼 업종별로 게시해야 하는 항목을 제작 전에 확인해 반영합니다." },
  { title: "점검 결과와 인계 문서 납품", body: "화면과 웹 접근성 점검 결과, 계정 목록과 수정 방법 문서를 함께 드립니다." },
  { title: "보안서약과 비밀 유지", body: "보안서약 후 재위탁 없이 작업하고, 결과물은 동의 없이 포트폴리오에 쓰지 않습니다." },
];
