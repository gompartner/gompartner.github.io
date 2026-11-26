// 무료 자료. /jaryo(목록)와 /jaryo/<id>(자료 한 장)가 같이 쓴다.
// 인스타 insta-dm Workers가 댓글 단어(견적, 점검, AI, 자료)에 따라 /go/jaryo/<id>/ 를 보낸다. id를 바꾸면 그쪽 MATERIALS도 고친다.
// 미리보기 public/images/jaryo/<id>-1.jpg, -2.jpg(목록), <id>-1-full.jpg, -2-full.jpg(한 장 페이지), PDF public/files/jaryo/gompartner-<id>.pdf
// 원본은 01_Active/곰파트너-마케팅/무료자료 의 HTML, PDF, PNG. 자료를 고치면 그림과 PDF를 다시 뽑는다

export type Jaryo = { id: string; title: string; when: string; parts: string[]; pages?: number };

export const jaryo: Jaryo[] = [
  {
    id: "estimate",
    title: "홈페이지 견적 질문지",
    when: "견적 받기 전",
    parts: ["제작 범위 4문항", "납품 후 소유권 4문항", "오픈 후 운영 비용 4문항", "업체 3곳 견적 비교표"],
  },
  {
    id: "checklist",
    title: "우리 홈페이지 점검표 10가지",
    when: "운영 중인 홈페이지",
    parts: ["주소와 명의 4항목", "방문 고객 화면 4항목", "찾아오는 길 2항목", "미흡 항목 조치 방법"],
  },
  {
    id: "ai-prompts",
    title: "사장님 AI 부탁 문장 12가지",
    when: "매장 운영",
    parts: ["고객 응대 3개", "홍보 3개", "매장 운영 3개, 매출과 서류 3개", "AI 채팅창에 넣지 말 것"],
  },
  {
    id: "gnuboard-handover",
    title: "그누보드 넘겨받은 날 기록표",
    when: "사이트 인수 당일",
    parts: ["기록할 다섯 가지와 확인 위치", "제작자에게 보낼 확인 문장", "비밀번호를 기록하지 않는 이유"],
    pages: 1,
  },
  {
    id: "gnuboard-monthly",
    title: "그누보드 매달 30분 점검표",
    when: "운영 중인 그누보드",
    parts: ["체크 항목 8줄", "이상 발견 시 참고할 강의", "반기와 연 1회 점검 항목", "5개월 기록란"],
    pages: 1,
  },
  {
    id: "wordpress-handover",
    title: "워드프레스 넘겨받은 날 기록표",
    when: "사이트 인수 당일",
    parts: ["기록할 여섯 가지와 확인 위치", "인계자에게 보낼 확인 문장", "비밀번호를 기록하지 않는 이유"],
    pages: 1,
  },
  {
    id: "wordpress-monthly",
    title: "워드프레스 매달 30분 점검표",
    when: "운영 중인 워드프레스",
    parts: ["체크 항목 8줄", "이상 발견 시 참고할 강의", "반기와 연 1회 점검 항목", "5개월 기록란"],
    pages: 1,
  },
  {
    id: "ai-handover",
    title: "AI 사이트 넘겨받은 날 기록표",
    when: "AI로 만든 사이트 인수 당일",
    parts: ["기록할 다섯 가지와 함께 확인할 두 가지", "제작자에게 보낼 확인 문장", "키 값을 기록하지 않는 이유"],
    pages: 1,
  },
  {
    id: "ai-monthly",
    title: "AI 사이트 매달 30분 점검표",
    when: "운영 중인 AI로 만든 사이트",
    parts: ["체크 항목 8줄", "이상 발견 시 참고할 강의", "반기와 연 1회 점검 항목", "5개월 기록란"],
    pages: 1,
  },
];

export const pdfFor = (id: string) => `/files/jaryo/gompartner-${id}.pdf`;
