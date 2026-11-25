// 카탈로그 표지의 디자인 컨셉(11-01). 키워드 2~3개, 실제 데모 코드에서 쓴 색 3개(메인, 보조, 바탕), 글꼴.
// 11-22 시안 A, B가 있는 업종은 키워드에 두 시안 이름, 색에 두 시안의 대표색과 흰 바탕을 쓴다.
// 색은 데모 코드에서 많이 쓴 색을 뽑되 카카오톡 노랑처럼 외부 서비스 색은 넣지 않는다. 데모 색을 바꾸면 여기도 고친다.
export interface DesignConcept {
  keywords: string[];
  colors: { role: string; name: string; hex: string }[];
  font: string;
}

export const designConcepts: Record<string, DesignConcept> = {
  "dental-homepage": {
    keywords: ["미니멀", "카드형"],
    colors: [
      { role: "시안 A", name: "틸", hex: "#2A7F86" },
      { role: "시안 B", name: "블랙", hex: "#15171C" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "online-store": {
    keywords: ["모노톤", "미니멀"],
    colors: [
      { role: "시안 A", name: "오렌지", hex: "#A0623A" },
      { role: "시안 B", name: "브라운", hex: "#9A5A33" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "pension": {
    keywords: ["다크 풀스크린", "에디토리얼"],
    colors: [
      { role: "시안 A", name: "네이비", hex: "#173A63" },
      { role: "시안 B", name: "딥 그린", hex: "#2F5A3C" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "company": {
    keywords: ["다크 풀스크린", "에디토리얼"],
    colors: [
      { role: "시안 A", name: "블랙", hex: "#10141C" },
      { role: "시안 B", name: "네이비", hex: "#1B2F5E" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "cert-lab": {
    keywords: ["미니멀", "카드형"],
    colors: [
      { role: "시안 A", name: "네이비", hex: "#16325C" },
      { role: "시안 B", name: "블루", hex: "#4B3AA8" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "clinic-homepage": {
    keywords: ["미니멀", "파스텔"],
    colors: [
      { role: "시안 A", name: "그레이", hex: "#7D8F7A" },
      { role: "시안 B", name: "레드", hex: "#D14D6A" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "pharmacy": {
    keywords: ["미니멀", "에디토리얼"],
    colors: [
      { role: "시안 A", name: "딥 틸", hex: "#1D7A4E" },
      { role: "시안 B", name: "딥 틸", hex: "#0F6E6A" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "law-firm": {
    keywords: ["다크 풀스크린", "카드형"],
    colors: [
      { role: "시안 A", name: "블랙", hex: "#151A21" },
      { role: "시안 B", name: "블루", hex: "#1F4FD8" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "tax-office": {
    keywords: ["다크 풀스크린", "에디토리얼"],
    colors: [
      { role: "시안 A", name: "네이비", hex: "#0B1F3A" },
      { role: "시안 B", name: "틸", hex: "#0E9F6E" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "real-estate": {
    keywords: ["미니멀", "볼드 컬러"],
    colors: [
      { role: "시안 A", name: "네이비", hex: "#1D3557" },
      { role: "시안 B", name: "블루", hex: "#2563EB" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "small-business-homepage": {
    keywords: ["지점 선택", "시간 단위 예약", "입장 QR"],
    colors: [
      { role: "메인", name: "그린", hex: "#16A34A" },
      { role: "보조", name: "딥 그린", hex: "#15803D" },
      { role: "바탕", name: "라이트 그레이", hex: "#F4F4F4" },
    ],
    font: "Pretendard",
  },
  "korean-restaurant": {
    keywords: ["다크 풀스크린", "카드형"],
    colors: [
      { role: "시안 A", name: "레드", hex: "#A4271C" },
      { role: "시안 B", name: "레드", hex: "#D8321F" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "interior": {
    keywords: ["풀스크린 비주얼", "에디토리얼"],
    colors: [
      { role: "시안 A", name: "블랙", hex: "#141414" },
      { role: "시안 B", name: "오렌지", hex: "#A5743F" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "academy": {
    keywords: ["볼드 컬러", "카드형"],
    colors: [
      { role: "시안 A", name: "블루", hex: "#1638D8" },
      { role: "시안 B", name: "틸", hex: "#13A06F" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "pilates-studio": {
    keywords: ["다크 풀스크린", "카드형"],
    colors: [
      { role: "시안 A", name: "블랙", hex: "#141312" },
      { role: "시안 B", name: "그린", hex: "#4F7A64" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "hanok-cafe": {
    keywords: ["다크 풀스크린", "에디토리얼"],
    colors: [
      { role: "시안 A", name: "브라운", hex: "#9A6A2F" },
      { role: "시안 B", name: "브라운", hex: "#7A4A26" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "bakery-cafe": {
    keywords: ["미니멀", "에디토리얼"],
    colors: [
      { role: "시안 A", name: "브라운", hex: "#8A4B22" },
      { role: "시안 B", name: "오렌지", hex: "#A77A3A" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "roastery": {
    keywords: ["다크 풀스크린", "카드형"],
    colors: [
      { role: "시안 A", name: "브라운", hex: "#7A4A2A" },
      { role: "시안 B", name: "브라운", hex: "#5B3A24" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "hair-salon": {
    keywords: ["다크 풀스크린", "카드형"],
    colors: [
      { role: "시안 A", name: "딥 틸", hex: "#1F3A32" },
      { role: "시안 B", name: "오렌지", hex: "#C2603E" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "optical": {
    keywords: ["미니멀", "다크 풀스크린"],
    colors: [
      { role: "시안 A", name: "네이비", hex: "#1D3366" },
      { role: "시안 B", name: "오렌지", hex: "#B4782F" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "furniture-workshop": {
    keywords: ["미니멀", "내추럴"],
    colors: [
      { role: "시안 A", name: "브라운", hex: "#6B4428" },
      { role: "시안 B", name: "그린", hex: "#5D6B3A" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "coworking": {
    keywords: ["에디토리얼", "미니멀"],
    colors: [
      { role: "시안 A", name: "딥 틸", hex: "#1F6B47" },
      { role: "시안 B", name: "네이비", hex: "#1F3A6E" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "campsite": {
    keywords: ["풀스크린 비주얼", "에디토리얼"],
    colors: [
      { role: "시안 A", name: "딥 그린", hex: "#2C5A36" },
      { role: "시안 B", name: "브라운", hex: "#9A6B3C" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "photo-studio": {
    keywords: ["에디토리얼", "풀스크린 비주얼"],
    colors: [
      { role: "시안 A", name: "블랙", hex: "#111" },
      { role: "시안 B", name: "브라운", hex: "#8B5E3C" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "nail-shop": {
    keywords: ["미니멀", "파스텔"],
    colors: [
      { role: "시안 A", name: "블랙", hex: "#1A1718" },
      { role: "시안 B", name: "레드", hex: "#C94F6D" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "car-detailing": {
    keywords: ["다크 풀스크린", "카드형"],
    colors: [
      { role: "시안 A", name: "레드", hex: "#D6322B" },
      { role: "시안 B", name: "블루", hex: "#0F6FD6" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "lighting-shop": {
    keywords: ["에디토리얼", "미니멀"],
    colors: [
      { role: "시안 A", name: "오렌지", hex: "#C27A1A" },
      { role: "시안 B", name: "골드", hex: "#F2B705" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "liquor-shop": {
    keywords: ["다크 풀스크린", "미니멀"],
    colors: [
      { role: "시안 A", name: "딥 레드", hex: "#7A1F2B" },
      { role: "시안 B", name: "틸", hex: "#3F7D73" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "small-wedding": {
    keywords: ["풀스크린 비주얼", "미니멀"],
    colors: [
      { role: "시안 A", name: "딥 그린", hex: "#59663A" },
      { role: "시안 B", name: "레드", hex: "#B4606C" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "korean-medicine": {
    keywords: ["다크 풀스크린", "카드형"],
    colors: [
      { role: "시안 A", name: "브라운", hex: "#4A3020" },
      { role: "시안 B", name: "그린", hex: "#4E6B3A" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "orthopedics": {
    keywords: ["다크 풀스크린", "카드형"],
    colors: [
      { role: "시안 A", name: "네이비", hex: "#13294B" },
      { role: "시안 B", name: "블루", hex: "#1F6FE5" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "pediatrics": {
    keywords: ["파스텔", "카드형"],
    colors: [
      { role: "시안 A", name: "블루", hex: "#1B8FD6" },
      { role: "시안 B", name: "틸", hex: "#1F9D62" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "eye-clinic": {
    keywords: ["다크 풀스크린", "카드형"],
    colors: [
      { role: "시안 A", name: "네이비", hex: "#0D4A57" },
      { role: "시안 B", name: "블루", hex: "#1677C9" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "animal-hospital": {
    keywords: ["풀스크린 비주얼", "파스텔"],
    colors: [
      { role: "시안 A", name: "오렌지", hex: "#EC6B2D" },
      { role: "시안 B", name: "그린", hex: "#2E8B57" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "nursing-hospital": {
    keywords: ["풀스크린 비주얼", "미니멀"],
    colors: [
      { role: "시안 A", name: "딥 틸", hex: "#1F5E45" },
      { role: "시안 B", name: "오렌지", hex: "#C8682C" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "labor-firm": {
    keywords: ["다크 풀스크린", "카드형"],
    colors: [
      { role: "시안 A", name: "네이비", hex: "#0F2A5C" },
      { role: "시안 B", name: "딥 틸", hex: "#1D5C4A" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "scrivener": {
    keywords: ["그리드형", "카드형"],
    colors: [
      { role: "시안 A", name: "네이비", hex: "#1C2F5A" },
      { role: "시안 B", name: "블루", hex: "#34488C" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "patent-office": {
    keywords: ["미니멀", "파스텔"],
    colors: [
      { role: "시안 A", name: "네이비", hex: "#14407A" },
      { role: "시안 B", name: "오렌지", hex: "#D9541E" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "family-law": {
    keywords: ["다크 풀스크린", "파스텔"],
    colors: [
      { role: "시안 A", name: "네이비", hex: "#24304F" },
      { role: "시안 B", name: "버건디", hex: "#6B2F4A" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "visa-agent": {
    keywords: ["풀스크린 비주얼", "미니멀"],
    colors: [
      { role: "시안 A", name: "네이비", hex: "#13265A" },
      { role: "시안 B", name: "딥 틸", hex: "#13795B" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "architect-office": {
    keywords: ["풀스크린 비주얼", "미니멀"],
    colors: [
      { role: "시안 A", name: "블랙", hex: "#111" },
      { role: "시안 B", name: "브라운", hex: "#8A5A3C" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "presale": {
    keywords: ["풀스크린 비주얼", "다크 풀스크린"],
    colors: [
      { role: "시안 A", name: "네이비", hex: "#173A6B" },
      { role: "시안 B", name: "오렌지", hex: "#A8874A" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "saas-startup": {
    keywords: ["카드형", "에디토리얼"],
    colors: [
      { role: "시안 A", name: "블루", hex: "#1E3A8A" },
      { role: "시안 B", name: "오렌지", hex: "#EA580C" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "logistics": {
    keywords: ["다크 풀스크린", "에디토리얼"],
    colors: [
      { role: "시안 A", name: "네이비", hex: "#12345E" },
      { role: "시안 B", name: "골드", hex: "#F5B301" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "food-oem": {
    keywords: ["에디토리얼", "미니멀"],
    colors: [
      { role: "시안 A", name: "딥 그린", hex: "#1F6F46" },
      { role: "시안 B", name: "블루", hex: "#4C3BB4" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "piano-academy": {
    keywords: ["파스텔", "다크 풀스크린"],
    colors: [
      { role: "시안 A", name: "딥 틸", hex: "#147A72" },
      { role: "시안 B", name: "오렌지", hex: "#A8823E" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "taekwondo": {
    keywords: ["미니멀", "풀스크린 비주얼"],
    colors: [
      { role: "시안 A", name: "블루", hex: "#1747A6" },
      { role: "시안 B", name: "레드", hex: "#D92B2B" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "art-academy": {
    keywords: ["에디토리얼", "미니멀"],
    colors: [
      { role: "시안 A", name: "오렌지", hex: "#E8571E" },
      { role: "시안 B", name: "퍼플", hex: "#6A3FC8" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "english-talk": {
    keywords: ["에디토리얼", "미니멀"],
    colors: [
      { role: "시안 A", name: "레드", hex: "#E23B2E" },
      { role: "시안 B", name: "그린", hex: "#1F8A4C" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "driving-school": {
    keywords: ["풀스크린 비주얼", "다크 풀스크린"],
    colors: [
      { role: "시안 A", name: "네이비", hex: "#142A5C" },
      { role: "시안 B", name: "블루", hex: "#1D5BD8" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "reading-academy": {
    keywords: ["미니멀", "에디토리얼"],
    colors: [
      { role: "시안 A", name: "틸", hex: "#2A7A5C" },
      { role: "시안 B", name: "네이비", hex: "#233A7A" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
  "landing-water-rental": {
    keywords: ["월 렌탈료 비교", "방문 관리", "통화 시간 예약"],
    colors: [
      { role: "메인", name: "딥 시 블루", hex: "#005F6B" },
      { role: "보조", name: "썬 옐로", hex: "#FFD447" },
      { role: "바탕", name: "미스트", hex: "#E6F3F3" },
    ],
    font: "Pretendard",
  },
  "landing-coding-camp": {
    keywords: ["방학 특강", "반별 남은 자리", "주차별 수업"],
    colors: [
      { role: "메인", name: "마커 옐로", hex: "#FFC83D" },
      { role: "보조", name: "코발트 블루", hex: "#2F62FF" },
      { role: "바탕", name: "모눈 아이보리", hex: "#F6F3EA" },
    ],
    font: "Pretendard",
  },
  "landing-move-clean": {
    keywords: ["견적 계산기", "평형별 가격", "청소 전후 사진"],
    colors: [
      { role: "메인", name: "코발트", hex: "#1D47D1" },
      { role: "보조", name: "레몬", hex: "#FFDF3D" },
      { role: "바탕", name: "웜 화이트", hex: "#F6F5F0" },
    ],
    font: "Pretendard",
  },
  "landing-popup-store": {
    keywords: ["회차 예약", "영수증 화면", "현장 입장"],
    colors: [
      { role: "메인", name: "붕어빵 레드", hex: "#D92B1A" },
      { role: "보조", name: "테이블 차콜", hex: "#262422" },
      { role: "바탕", name: "영수증 아이보리", hex: "#FBFAF6" },
    ],
    font: "Gasoek One, 나눔고딕코딩, Pretendard",
  },
  "landing-zine-fair": {
    keywords: ["리소 포스터", "부스 지도", "관심 부스 동선"],
    colors: [
      { role: "메인", name: "리소 블루", hex: "#2F6BFF" },
      { role: "보조", name: "리소 핑크", hex: "#FF4FA3" },
      { role: "바탕", name: "종이 크림", hex: "#FFF8E8" },
    ],
    font: "Gasoek One, Pretendard",
  },
  "landing-leather-class": {
    keywords: ["원데이 클래스", "회차별 남은 자리", "각인 이니셜"],
    colors: [
      { role: "메인", name: "가죽 브라운", hex: "#7A4A2E" },
      { role: "보조", name: "연한 가죽", hex: "#F3EDE7" },
      { role: "바탕", name: "웜 그레이", hex: "#F7F7F5" },
    ],
    font: "Pretendard",
  },
  "flower-expo": {
    keywords: ["풀스크린 비주얼", "미니멀"],
    colors: [
      { role: "시안 A", name: "핑크", hex: "#D6336C" },
      { role: "시안 B", name: "레드", hex: "#D9412F" },
      { role: "바탕", name: "화이트", hex: "#FFFFFF" },
    ],
    font: "Pretendard",
  },
};
