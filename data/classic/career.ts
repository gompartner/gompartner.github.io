// 회사소개(/story) 주요 경력과 수상. 11-05 사용자 결정: 부업은 실명, 본업은 회사 이름 없이, 현 직장은 넣지 않는다.
// 근거: 02_Personal/03_Resource/메모/경력-자료. 설명은 담백하게 한 줄(11-05 사용자 "너무 디테일해").
export type CareerItem = { period: string; client: string; work: string };

export const careerItems: CareerItem[] = [
  { period: "2009~2016", client: "강동구청", work: "포털사이트 유지관리" },
  { period: "2010~2012", client: "통일부, 교육과학기술부, 환경부, 국립중앙도서관, 한국무역보험공사", work: "홈페이지 개편 참여" },
  { period: "2021", client: "구로구 교육통합포털", work: "유지보수, 웹접근성 인증마크 갱신" },
  { period: "2020", client: "한국체육대학교", work: "홈페이지 유지보수" },
  { period: "2017", client: "강동아트센터", work: "홈페이지 구축" },
  { period: "2017", client: "친환경농업 의무자조금", work: "홈페이지와 인증 관리 시스템 구축" },
  { period: "2016", client: "곤지암 이엔지", work: "기업 홈페이지 구축" },
  { period: "2017~2019", client: "하나투어클럽", work: "멤버십 앱 개발" },
  { period: "2018~2022", client: "에닥, 벼룩시장 부동산, pancryp", work: "앱 개발과 유지보수" },
  { period: "2016~2018", client: "모바일 상품권", work: "편의점, 카드사, 오픈마켓 연동 시스템 운영" },
  { period: "2017~2018", client: "중소기업 기술혁신개발사업", work: "원격 접근제어, 다중 인증 시스템 앱 개발, TTA 시험인증" },
];

export const awards = [
  { year: "2015", prize: "미래창조과학부 장관상", name: "글로벌 이노베이터 페스타 해커톤", note: "개인" },
  { year: "2016", prize: "대구디지털산업진흥원장상", name: "글로벌 이노베이터 페스타 메이커톤", note: "팀" },
];
