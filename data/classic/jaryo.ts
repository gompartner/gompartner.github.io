// 무료 자료 3종. /classic/jaryo(목록)와 /classic/jaryo/<id>(자료 한 장)가 같이 쓴다.
// 인스타 insta-dm Workers가 댓글 단어(견적, 점검, AI, 자료)에 따라 /go/jaryo/<id>/ 를 보낸다. id를 바꾸면 그쪽 MATERIALS도 고친다.
// 미리보기 public/images/jaryo/<id>-1.jpg, -2.jpg, PDF public/files/jaryo/gompartner-<id>.pdf

const NOTION = "https://gompartner.notion.site";

export type Jaryo = { id: string; title: string; when: string; notion: string; parts: string[] };

export const jaryo: Jaryo[] = [
  {
    id: "estimate",
    title: "홈페이지 견적 질문지",
    when: "견적 받기 전",
    notion: `${NOTION}/40cb66b1a946814b851ae4702f64bfe3`,
    parts: ["무엇을 만들어 주나요 4문항", "다 만든 뒤 누구 것인가요 4문항", "열고 난 뒤 드는 돈 4문항", "업체 3곳 견적 비교표"],
  },
  {
    id: "checklist",
    title: "우리 홈페이지 점검표 10가지",
    when: "운영 중인 홈페이지",
    notion: `${NOTION}/40cb66b1a94681fd854be53f6f75ddb0`,
    parts: ["주소와 명의 4항목", "손님 화면 4항목", "찾아오는 길 2항목", "안 되는 항목 해결 방법"],
  },
  {
    id: "ai-prompts",
    title: "사장님 AI 부탁 문장 12가지",
    when: "가게 운영",
    notion: `${NOTION}/40cb66b1a94681b19366f8ad01354bfe`,
    parts: ["손님 응대 3개", "홍보 3개", "가게 운영 3개, 숫자와 서류 3개", "AI 채팅창에 넣지 말 것"],
  },
];

export const pdfFor = (id: string) => `/files/jaryo/gompartner-${id}.pdf`;
