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
    parts: ["무엇을 만들어 주나요 4문항", "다 만든 뒤 누구 것인가요 4문항", "열고 난 뒤 드는 돈 4문항", "업체 3곳 견적 비교표"],
  },
  {
    id: "checklist",
    title: "우리 홈페이지 점검표 10가지",
    when: "운영 중인 홈페이지",
    parts: ["주소와 명의 4항목", "손님 화면 4항목", "찾아오는 길 2항목", "안 되는 항목 해결 방법"],
  },
  {
    id: "ai-prompts",
    title: "사장님 AI 부탁 문장 12가지",
    when: "가게 운영",
    parts: ["손님 응대 3개", "홍보 3개", "가게 운영 3개, 숫자와 서류 3개", "AI 채팅창에 넣지 말 것"],
  },
  {
    id: "gnuboard-handover",
    title: "그누보드 넘겨받은 날 기록표",
    when: "사이트를 넘겨받은 날",
    parts: ["적어 둘 다섯 가지와 보는 곳", "만들어 준 분께 물을 한 문장", "비밀번호를 적지 말아야 하는 이유"],
    pages: 1,
  },
  {
    id: "gnuboard-monthly",
    title: "그누보드 매달 30분 점검표",
    when: "운영 중인 그누보드",
    parts: ["체크 항목 8줄", "이상하면 볼 강의 편", "반년, 1년에 한 번 할 일", "다섯 달 치 기록 칸"],
    pages: 1,
  },
  {
    id: "wordpress-handover",
    title: "워드프레스 넘겨받은 날 기록표",
    when: "사이트를 넘겨받은 날",
    parts: ["적어 둘 여섯 가지와 보는 곳", "넘겨준 쪽에 보낼 한 문장", "비밀번호를 적지 말아야 하는 이유"],
    pages: 1,
  },
  {
    id: "wordpress-monthly",
    title: "워드프레스 매달 30분 점검표",
    when: "운영 중인 워드프레스",
    parts: ["체크 항목 8줄", "이상하면 볼 강의 편", "반년, 1년에 한 번 할 일", "다섯 달 치 기록 칸"],
    pages: 1,
  },
];

export const pdfFor = (id: string) => `/files/jaryo/gompartner-${id}.pdf`;
