// 회사소개(/story) 주요 경력과 수상. 11-05 사용자 결정: 부업은 실명, 본업은 회사 이름 없이, 현 직장은 넣지 않는다.
// 근거: 02_Personal/03_Resource/메모/경력-자료. 설명은 담백하게 한 줄(11-05 사용자 "너무 디테일해").
// 연도를 보이면 2022년부터 비어 현 직장 시기가 드러나고 활동이 끊긴 것처럼 보여 화면에는 연도를 넣지 않고 분야별로 묶는다(11-05).
// period는 기록 확인용으로만 남긴다. 화면에 쓰지 않는다.
export type CareerItem = { period: string; client: string; work: string };

export const careerIntro = "공공기관, 대학, 기업의 홈페이지와 앱을 제작하고 운영해 왔습니다.";

export const careerGroups: { group: string; items: CareerItem[] }[] = [
  {
    group: "공공기관",
    items: [
      { period: "2010", client: "통일부", work: "대표 홈페이지 개편 참여, 콘텐츠 유지보수" },
      { period: "2010~2011", client: "교육과학기술부", work: "홈페이지 개편 참여" },
      { period: "2011~2012", client: "환경부", work: "웹사이트 운영관리, 물사랑 홈페이지 개편 참여" },
      { period: "2011", client: "국립중앙도서관", work: "홈페이지 제작 참여" },
      { period: "2012", client: "한국무역보험공사", work: "K-Sure 홈페이지 개편 참여" },
      { period: "2010~2011", client: "성북구청", work: "홈페이지 콘텐츠 개선과 유지보수" },
      { period: "2016", client: "한국소공인진흥협회", work: "숙련기술인 종합정보시스템 제작 참여" },
      { period: "2017~2018", client: "건설근로자공제회", work: "스마트 앱 제작, 모바일 공인인증서 연동" },
      { period: "2020", client: "지자체 사랑방 공유공간", work: "지도 안내 서비스 제작 참여" },
      { period: "2021", client: "구로구 교육통합포털", work: "유지보수, 웹접근성 인증마크 갱신" },
      { period: "2017", client: "친환경농업 의무자조금", work: "홈페이지와 인증 관리 시스템 유지보수" },
    ],
  },
  {
    group: "대학, 문화",
    items: [
      { period: "2020", client: "한국체육대학교", work: "홈페이지 유지보수" },
      { period: "2017", client: "강동아트센터", work: "홈페이지와 앱 유지보수" },
    ],
  },
  {
    group: "기업, 서비스",
    items: [
      { period: "2011", client: "두산", work: "GTMS 고도화" },
      { period: "2016", client: "핀마트", work: "중계 서버 제작 참여" },
      { period: "2016", client: "곤지암 이엔지", work: "기업 홈페이지 제작" },
      { period: "2017~2019", client: "하나투어클럽", work: "멤버십 앱 제작" },
      { period: "2018~2019", client: "에닥", work: "에어컨 설치 서비스 앱 제작" },
      { period: "2019", client: "벼룩시장 부동산", work: "iOS 앱 추가 개발, 유지보수" },
      { period: "2019~2022", client: "pancryp", work: "안드로이드, iOS 앱 제작과 유지보수" },
      { period: "2016~2018", client: "모바일 상품권 중계 서비스", work: "제작, 편의점, 카드사, 오픈마켓 연동" },
      { period: "2017~2018", client: "중소기업 기술혁신개발사업", work: "원격 접근제어, 다중 인증 보안 앱 제작, TTA 시험인증" },
      { period: "2017", client: "영어 스피킹 트레이닝 서비스", work: "학습 앱 제작" },
      { period: "2019~2020", client: "사이클 컴퓨터, 스마트 헬멧", work: "센서 연동 앱 제작" },
    ],
  },
];

export const awards = [
  { year: "2015", prize: "미래창조과학부 장관상", name: "글로벌 이노베이터 페스타 해커톤", note: "개인" },
  { year: "2016", prize: "대구디지털산업진흥원장상", name: "글로벌 이노베이터 페스타 메이커톤", note: "팀" },
];
