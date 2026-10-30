// 공지사항(/classic/notice). 최신 글이 위로 오게 날짜 내림차순으로 넣는다. 사실만 적는다.
export interface Notice {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  title: string;
  body: string[];
}

export const notices: Notice[] = [
  {
    id: "2026-10-renewal",
    date: "2026-10-30",
    title: "홈페이지 개편 안내",
    body: [
      "메뉴를 회사소개, 서비스, 카탈로그, 고객지원으로 정리했습니다.",
      "제작과 유지보수 금액은 사이트에 게시하지 않고, 상담 신청 내용을 검토한 뒤 견적서로 안내합니다.",
      "상담은 상단의 상담 신청으로 받습니다. 접수 뒤 24시간 이내에 회신합니다.",
    ],
  },
];
