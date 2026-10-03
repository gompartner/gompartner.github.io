// 제작 사례를 "○○에서 쓰는 ○○ 기능" 문장으로 고르기 위한 분류.
// 새 제작 사례를 추가하면 fieldsById에 업종을 적는다. 기능은 기능 태그·제목·설명에서 keywords로 찾는다.

export const fields = ["병원", "공공기관·학교", "가게·매장", "금융", "기업"] as const;
export type Field = (typeof fields)[number];

export const fieldsById: Record<string, Field[]> = {
  "clinic-report": ["병원"],
  "clinic-homepage": ["병원"],
  "dental-homepage": ["병원"],
  "hanok-cafe": ["가게·매장"],
  "pilates-studio": ["가게·매장"],
  "bakery-cafe": ["가게·매장"],
  pharmacy: ["병원", "가게·매장"],
  "flower-expo": ["공공기관·학교"],
  "community-map": ["공공기관·학교"],
  "program-application": ["공공기관·학교"],
  "private-gym": ["가게·매장"],
  "shop-admin": ["가게·매장", "기업"],
  "excel-automation": ["기업", "가게·매장"],
  lms: ["공공기관·학교", "기업"],
  "maintenance-dashboard": ["공공기관·학교", "기업"],
  "district-portal": ["공공기관·학교"],
  "job-portal": ["기업", "공공기관·학교"],
  "retirement-calculator": ["금융"],
  "accessibility-review": ["공공기관·학교"],
};

// keywords 중 하나라도 들어간 기능 태그에 형광펜을 긋는다
export const capabilities = [
  { name: "예약", keywords: ["예약"] },
  { name: "결제", keywords: ["결제"] },
  { name: "지도", keywords: ["지도"] },
  { name: "신청·심사", keywords: ["신청", "심사"] },
  { name: "검색", keywords: ["검색", "찾기", "필터"] },
  { name: "통계·그래프", keywords: ["통계", "그래프", "차트", "비교"] },
  { name: "인쇄·내려받기", keywords: ["인쇄", "PDF", "출력", "엑셀", "다운로드"] },
  { name: "관리자", keywords: ["관리", "심사", "점검표"] },
  { name: "웹접근성", keywords: ["접근성", "점검 항목", "멈춤"] },
  { name: "모바일", keywords: ["모바일"] },
] as const;
export type Capability = (typeof capabilities)[number]["name"];
