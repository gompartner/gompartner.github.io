// 공지사항(/classic/notice). 최신 글이 위로 오게 넣는다. 사실만 적는다.
// 11-01 일반 회사 게시판처럼 고객에게 알릴 내용만 짧게. 내부 작업 기록(배경, 목표, 캐릭터 공개)은 뺐다. 날짜는 바꾸지 않는다.
// date는 그 내용이 실제로 적용된 날이다(커밋 기록 기준). 제목은 "N차 리뉴얼" 대신 그때 새로 더한 것을 쓴다(10-30 사용자: 자주 바꾼 느낌이 안 들게).
export interface NoticeSection {
  h: string;
  p?: string[];
  list?: string[];
}

export interface Notice {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  title: string;
  /** 목록과 검색 설명에 쓰는 한 줄 요약 */
  summary: string;
  sections: NoticeSection[];
  /** 그때 첫 화면 전체를 한 장으로 찍은 캡처. w, h는 원본 픽셀 크기 */
  image?: { src: string; alt: string; note?: string; w: number; h: number };
}

export const notices: Notice[] = [
  {
    id: "maintenance-2026-11",
    date: "2026-11-01",
    title: "유지보수 서비스 안내 개편",
    summary: "유지보수 안내를 오류 수정, 업체 이관, 보안 업데이트, 월 관리 네 가지로 나눴습니다.",
    sections: [
      {
        h: "",
        p: ["유지보수 안내를 네 가지 서비스로 나눠 각각의 페이지에서 확인하실 수 있습니다."],
        list: ["오류 수정: 접속 불가, 화면 깨짐, 문의 메일 미수신", "업체 이관: 기존 업체 연락 두절 시 인수", "보안 업데이트: 워드프레스, 그누보드, PHP", "월 관리: 문구, 사진, 공지 수정과 정기 점검"],
      },
    ],
  },
  {
    id: "renewal-2026-10",
    date: "2026-10-31",
    title: "견적서 안내 방식 변경",
    summary: "제작과 유지보수 금액은 상담 신청 후 견적서로 안내합니다.",
    sections: [
      {
        h: "",
        p: ["홈페이지 제작과 유지보수 금액은 상담 신청 내용을 확인한 뒤 견적서로 안내합니다.", "견적서에는 작업 범위, 일정, 금액이 들어갑니다."],
      },
    ],
  },
  {
    id: "design-4",
    date: "2026-10-22",
    title: "서비스별 상세 안내 페이지 오픈",
    summary: "서비스마다 작업 범위와 진행 절차를 안내하는 페이지를 열었습니다.",
    sections: [
      {
        h: "",
        p: ["서비스마다 작업 범위, 진행 절차, 납품물을 따로 안내하는 페이지를 열었습니다."],
      },
    ],
  },
  {
    id: "design-2",
    date: "2026-09-30",
    title: "업종별 카탈로그 공개",
    summary: "병원, 매장, 전문직, 기업, 학원 업종별 홈페이지 카탈로그를 열었습니다.",
    sections: [
      {
        h: "",
        p: ["병원, 매장, 전문직, 기업, 학원 업종별 홈페이지 카탈로그를 열었습니다.", "카탈로그에서 실제로 동작하는 화면을 직접 눌러 보실 수 있습니다."],
      },
    ],
  },
  {
    id: "design-1",
    date: "2026-07-13",
    title: "곰파트너 홈페이지 오픈",
    summary: "곰파트너 홈페이지를 열었습니다.",
    sections: [
      {
        h: "",
        p: ["곰파트너 홈페이지를 열었습니다.", "홈페이지 제작과 유지보수 상담은 상담 신청 페이지에서 받습니다."],
      },
    ],
  },
];

export const noticeById = (id: string) => notices.find((n) => n.id === id);
