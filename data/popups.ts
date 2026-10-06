// 데모 첫 화면에 뜨는 공지 팝업. 국내 사이트처럼 글자를 박아 넣은 포스터형으로 그린다.
// 실제로 팝업을 흔히 쓰는 업종만 넣는다. 상호, 전화, 날짜는 각 데모 화면의 설정과 맞춘다.
// 프라이빗 짐(small-business-homepage)은 자체 튜토리얼이 있어 넣지 않는다.

export interface PopupDay {
  date: string;
  dow: string;
  text: string;
  off?: boolean;
}

export interface DemoPopupItem {
  /** "오늘 하루 보지 않음" 저장 키에 쓰인다. 내용을 바꾸면 id도 바꾼다 */
  id: string;
  /** 화면 읽기 프로그램용 공지 제목 */
  label: string;
  kind: "notice" | "photo" | "warning";
  tag: string;
  lines: string[];
  sub?: string;
  days?: PopupDay[];
  rows?: [string, string][];
  body?: string;
  org: string;
  tel?: string;
  photo?: string;
  pos?: string;
  color: { bg: string; fg: string; accent: string; soft: string };
}

export const popups: Record<string, DemoPopupItem[]> = {
  "dental-homepage": [
    {
      id: "hangeul-2026",
      label: "10월 9일(금) 한글날 휴진 안내",
      kind: "notice",
      tag: "휴진 안내",
      lines: ["10월 9일(금)", "한글날 휴진"],
      days: [
        { date: "10.8", dow: "목", text: "09:30 ~ 21:00" },
        { date: "10.9", dow: "금", text: "휴진", off: true },
        { date: "10.10", dow: "토", text: "09:30 ~ 14:00" },
      ],
      org: "○○치과의원",
      tel: "02-000-0000",
      color: { bg: "#0b6664", fg: "#ffffff", accent: "#ffd84d", soft: "#cfe6e3" },
    },
    {
      id: "night-1016",
      label: "10월 15일(목) 야간진료 단축 안내",
      kind: "notice",
      tag: "진료시간 변경",
      lines: ["10월 15일(목)", "야간진료 단축"],
      sub: "대표원장 학회 참석",
      rows: [
        ["변경 전", "09:30 ~ 21:00"],
        ["변경 후", "09:30 ~ 18:30"],
      ],
      body: "진료에 참고하시기 바랍니다.",
      org: "○○치과의원",
      tel: "02-000-0000",
      color: { bg: "#f3f8f7", fg: "#10302f", accent: "#0b6664", soft: "#4f6261" },
    },
  ],
  "clinic-homepage": [
    {
      id: "conference-1021",
      label: "10월 21일(수) 오후 휴진 안내",
      kind: "notice",
      tag: "휴진 안내",
      lines: ["10월 21일(수)", "오후 휴진"],
      sub: "대표원장 학회 참석",
      days: [
        { date: "10.20", dow: "화", text: "09:30 ~ 19:00" },
        { date: "10.21", dow: "수", text: "09:30 ~ 13:00", off: true },
        { date: "10.22", dow: "목", text: "09:30 ~ 19:00" },
      ],
      body: "진료에 참고하시기 바랍니다.",
      org: "○○피부과의원",
      tel: "02-000-0000",
      color: { bg: "#2f5469", fg: "#ffffff", accent: "#f2d1c4", soft: "#cddbe2" },
    },
  ],
  pension: [
    {
      id: "winter-bbq-2026",
      label: "동절기 공용 바비큐장 운영시간 변경 안내",
      kind: "photo",
      tag: "동절기 운영 안내",
      lines: ["공용 바비큐장", "운영시간 변경"],
      rows: [
        ["기간", "2026. 11. 1.(일) ~ 2027. 2. 28.(일)"],
        ["운영", "17:00 ~ 21:00"],
      ],
      body: "객실 앞 개별 바비큐는 지금처럼 밤 10시까지 쓰실 수 있어요.",
      org: "○○ 바다 펜션",
      tel: "033-000-0000",
      photo: "/images/demo-pension/hero.jpg",
      pos: "center 60%",
      color: { bg: "#12324a", fg: "#ffffff", accent: "#f5c26b", soft: "#c9d6e0" },
    },
  ],
  "district-portal": [
    {
      id: "lantern-2026",
      label: "제7회 △△천 가을 등불 축제",
      kind: "notice",
      tag: "○○구 문화행사",
      lines: ["제7회 △△천", "가을 등불 축제"],
      sub: "개막 공연 10. 10.(토) 18:30 △△천 수변무대",
      rows: [
        ["기간", "2026. 10. 10.(토) ~ 10. 19.(월)"],
        ["장소", "△△천 산책로 일대"],
        ["문의", "문화체육과 02-000-2101"],
      ],
      org: "○○구",
      color: { bg: "#1d2150", fg: "#ffffff", accent: "#ffc65c", soft: "#d9dcf5" },
    },
    {
      id: "impersonation-2026",
      label: "○○구 공무원 사칭 주의 안내",
      kind: "warning",
      tag: "주의",
      lines: ["공무원 사칭", "전화·문자 주의"],
      body: "○○구는 전화나 문자로 송금을 요구하지 않습니다.",
      rows: [["확인", "○○구청 대표전화 02-000-0000"]],
      org: "○○구",
      color: { bg: "#ffd400", fg: "#111111", accent: "#d7261e", soft: "#3a3a3a" },
    },
  ],
  "flower-expo": [
    {
      id: "presale-2027",
      label: "2027 ○○ 꽃박람회 사전예매권 판매 안내",
      kind: "photo",
      tag: "사전예매",
      lines: ["사전예매권", "12월 1일 판매 시작"],
      rows: [
        ["판매", "2026. 12. 1.(화) ~ 2027. 4. 22.(목)"],
        ["할인", "일반권 기준 2,000원 할인"],
        ["관람", "2027. 4. 23.(금) ~ 5. 9.(일)"],
      ],
      org: "2027 ○○ 꽃박람회",
      tel: "000-000-0000",
      photo: "/images/demo-flower/tulip.jpg",
      pos: "center 55%",
      color: { bg: "#1f4d3a", fg: "#ffffff", accent: "#ffd1dc", soft: "#e4efe6" },
    },
    {
      id: "volunteer-2027",
      label: "꽃박람회 자원봉사자 모집",
      kind: "notice",
      tag: "모집",
      lines: ["꽃박람회", "자원봉사자 모집"],
      rows: [
        ["인원", "120명"],
        ["접수", "2026. 10. 31.(토)까지"],
        ["신청", "누리집 시민참여 메뉴"],
      ],
      org: "2027 ○○ 꽃박람회",
      tel: "000-000-0000",
      color: { bg: "#e8577a", fg: "#ffffff", accent: "#fff3a8", soft: "#ffe3ea" },
    },
  ],
  "cert-lab": [
    {
      id: "fee-202611",
      label: "전자파 시험수수료 조정 안내",
      kind: "notice",
      tag: "수수료 조정",
      lines: ["전자파 시험수수료", "조정 안내"],
      rows: [
        ["시행", "2026. 11. 1. 접수분부터"],
        ["조정", "항목별 4~7%"],
      ],
      body: "10월 31일까지 받은 견적은 기존 수수료를 적용합니다.",
      org: "(주)○○시험인증원",
      tel: "02-000-0000",
      color: { bg: "#23307a", fg: "#ffffff", accent: "#7fd1ff", soft: "#d5daf3" },
    },
    {
      id: "hangeul-2026",
      label: "한글날 시료 접수 휴무 안내",
      kind: "notice",
      tag: "휴무 안내",
      lines: ["한글날", "시료 접수 휴무"],
      rows: [
        ["휴무", "10. 9.(금) ~ 10. 11.(일)"],
        ["접수 재개", "10. 12.(월) 09:00"],
      ],
      org: "(주)○○시험인증원",
      tel: "02-000-0000",
      color: { bg: "#f4f5f9", fg: "#151b3d", accent: "#23307a", soft: "#4b5272" },
    },
  ],
  "online-store": [
    {
      id: "autumn-kiln-2026",
      label: "가을 가마 신상품 입고 안내",
      kind: "photo",
      tag: "신상품",
      lines: ["가을 가마", "신상품 입고"],
      sub: "10월 16일(금) 오전 10시 공개",
      body: "흑유, 분청 그릇이 새로 나와요.",
      org: "○○ 도자기 공방",
      photo: "/images/demo-store/hero.jpg",
      pos: "center 50%",
      color: { bg: "#b5562f", fg: "#ffffff", accent: "#ffe2b8", soft: "#f6dccd" },
    },
  ],
  company: [
    {
      id: "hangeul-2026",
      label: "한글날 휴무 및 출하 일정 안내",
      kind: "notice",
      tag: "휴무 안내",
      lines: ["한글날 휴무", "출하 일정 안내"],
      rows: [
        ["휴무", "2026. 10. 9.(금)"],
        ["출하 마감", "10. 8.(목) 15:00"],
        ["업무 재개", "10. 12.(월) 08:30"],
      ],
      org: "(주)○○정밀",
      tel: "031-000-0000",
      color: { bg: "#1e2329", fg: "#ffffff", accent: "#ff8a1f", soft: "#c3c9d1" },
    },
  ],
  "bakery-cafe": [
    {
      id: "hangeul-2026",
      label: "10월 9일(금) 한글날 정상 영업 안내",
      kind: "photo",
      tag: "영업 안내",
      lines: ["10월 9일(금)", "한글날 정상 영업"],
      sub: "08:00 ~ 20:00",
      body: "월요일은 쉬어요.",
      org: "○○ 베이커리",
      tel: "02-000-0000",
      photo: "/images/demo-bakery/display.jpg",
      pos: "center 50%",
      color: { bg: "#9a4f1c", fg: "#ffffff", accent: "#ffe0a3", soft: "#f3e9da" },
    },
  ],
  "job-portal": [
    {
      id: "maintenance-1010",
      label: "시스템 정기 점검 안내",
      kind: "notice",
      tag: "서비스 점검",
      lines: ["시스템 정기 점검", "안내"],
      rows: [
        ["일시", "2026. 10. 10.(토) 02:00 ~ 06:00"],
        ["중단", "이력서 등록, 입사지원"],
      ],
      org: "○○일자리",
      tel: "1588-0000",
      color: { bg: "#1b2a4a", fg: "#ffffff", accent: "#ffd23f", soft: "#c9d1e3" },
    },
  ],
};
