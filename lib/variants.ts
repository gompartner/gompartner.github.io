// 서버, 클라이언트 어디서나 읽는 시안 목록(11-22 분리: 카탈로그 카드가 서버에서 시안 이름을 쓴다).
// 사례마다 시안을 두 개 이상 두고 맨 위 줄에서 바꿔 본다(11-21). 주소의 ?v=a 로 고정해 링크로 보낼 수 있다.
export const VARIANTS: Record<string, { id: string; label: string }[]> = {
  company: [
    { id: "a", label: "시안 A 다크 풀스크린" },
    { id: "b", label: "시안 B 에디토리얼" },
  ],
  "law-firm": [
    { id: "a", label: "시안 A 다크 풀스크린" },
    { id: "b", label: "시안 B 카드형" },
  ],
  "tax-office": [
    { id: "a", label: "시안 A 다크 풀스크린" },
    { id: "b", label: "시안 B 에디토리얼" },
  ],
  "dental-homepage": [
    { id: "a", label: "시안 A 미니멀" },
    { id: "b", label: "시안 B 카드형" },
    { id: "2026", label: "시안 C 2026 인터랙티브 3D" },
    { id: "2027-window", label: "시안 D 2027 키네틱 타이포" },
    { id: "2027-stage", label: "시안 E 2027 페이퍼 디오라마" },
  ],
  academy: [
    { id: "a", label: "시안 A 볼드 컬러" },
    { id: "b", label: "시안 B 카드형" },
  ],
  interior: [
    { id: "a", label: "시안 A 풀스크린 비주얼" },
    { id: "b", label: "시안 B 에디토리얼" },
  ],
  "korean-restaurant": [
    { id: "a", label: "시안 A 다크 풀스크린" },
    { id: "b", label: "시안 B 카드형" },
  ],
  "pilates-studio": [
    { id: "a", label: "시안 A 다크 풀스크린" },
    { id: "b", label: "시안 B 카드형" },
  ],
  "real-estate": [
    { id: "a", label: "시안 A 미니멀" },
    { id: "b", label: "시안 B 볼드 컬러" },
  ],
  "hair-salon": [
    { id: "a", label: "시안 A 다크 풀스크린" },
    { id: "b", label: "시안 B 카드형" },
  ],
  "nail-shop": [
    { id: "a", label: "시안 A 미니멀" },
    { id: "b", label: "시안 B 파스텔" },
  ],
  roastery: [
    { id: "a", label: "시안 A 다크 풀스크린" },
    { id: "b", label: "시안 B 카드형" },
  ],
  orthopedics: [
    { id: "a", label: "시안 A 다크 풀스크린" },
    { id: "b", label: "시안 B 카드형" },
  ],
  pediatrics: [
    { id: "a", label: "시안 A 파스텔" },
    { id: "b", label: "시안 B 카드형" },
  ],
  "korean-medicine": [
    { id: "a", label: "시안 A 다크 풀스크린" },
    { id: "b", label: "시안 B 카드형" },
  ],
  "eye-clinic": [
    { id: "a", label: "시안 A 다크 풀스크린" },
    { id: "b", label: "시안 B 카드형" },
  ],
  "animal-hospital": [
    { id: "a", label: "시안 A 풀스크린 비주얼" },
    { id: "b", label: "시안 B 파스텔" },
  ],
  "labor-firm": [
    { id: "a", label: "시안 A 다크 풀스크린" },
    { id: "b", label: "시안 B 카드형" },
  ],
  scrivener: [
    { id: "a", label: "시안 A 그리드형" },
    { id: "b", label: "시안 B 카드형" },
  ],
  "architect-office": [
    { id: "a", label: "시안 A 풀스크린 비주얼" },
    { id: "b", label: "시안 B 미니멀" },
  ],
  "photo-studio": [
    { id: "a", label: "시안 A 에디토리얼" },
    { id: "b", label: "시안 B 풀스크린 비주얼" },
  ],
  "patent-office": [
    { id: "a", label: "시안 A 미니멀" },
    { id: "b", label: "시안 B 파스텔" },
  ],
  "family-law": [
    { id: "a", label: "시안 A 다크 풀스크린" },
    { id: "b", label: "시안 B 파스텔" },
  ],
  "visa-agent": [
    { id: "a", label: "시안 A 풀스크린 비주얼" },
    { id: "b", label: "시안 B 미니멀" },
  ],
  "nursing-hospital": [
    { id: "a", label: "시안 A 풀스크린 비주얼" },
    { id: "b", label: "시안 B 미니멀" },
  ],
  optical: [
    { id: "a", label: "시안 A 미니멀" },
    { id: "b", label: "시안 B 다크 풀스크린" },
  ],
  "car-detailing": [
    { id: "a", label: "시안 A 다크 풀스크린" },
    { id: "b", label: "시안 B 카드형" },
  ],
  "piano-academy": [
    { id: "a", label: "시안 A 파스텔" },
    { id: "b", label: "시안 B 다크 풀스크린" },
  ],
  taekwondo: [
    { id: "a", label: "시안 A 미니멀" },
    { id: "b", label: "시안 B 풀스크린 비주얼" },
  ],
  "art-academy": [
    { id: "a", label: "시안 A 에디토리얼" },
    { id: "b", label: "시안 B 미니멀" },
  ],
  "english-talk": [
    { id: "a", label: "시안 A 에디토리얼" },
    { id: "b", label: "시안 B 미니멀" },
  ],
  "driving-school": [
    { id: "a", label: "시안 A 풀스크린 비주얼" },
    { id: "b", label: "시안 B 다크 풀스크린" },
  ],
  "reading-academy": [
    { id: "a", label: "시안 A 미니멀" },
    { id: "b", label: "시안 B 에디토리얼" },
  ],
  pharmacy: [
    { id: "a", label: "시안 A 미니멀" },
    { id: "b", label: "시안 B 에디토리얼" },
  ],
  pension: [
    { id: "a", label: "시안 A 다크 풀스크린" },
    { id: "b", label: "시안 B 에디토리얼" },
  ],
  "bakery-cafe": [
    { id: "a", label: "시안 A 미니멀" },
    { id: "b", label: "시안 B 에디토리얼" },
  ],
  "hanok-cafe": [
    { id: "a", label: "시안 A 다크 풀스크린" },
    { id: "b", label: "시안 B 에디토리얼" },
  ],
  "furniture-workshop": [
    { id: "a", label: "시안 A 미니멀" },
    { id: "b", label: "시안 B 내추럴" },
  ],
  coworking: [
    { id: "a", label: "시안 A 에디토리얼" },
    { id: "b", label: "시안 B 미니멀" },
  ],
  campsite: [
    { id: "a", label: "시안 A 풀스크린 비주얼" },
    { id: "b", label: "시안 B 에디토리얼" },
  ],
  "lighting-shop": [
    { id: "a", label: "시안 A 에디토리얼" },
    { id: "b", label: "시안 B 미니멀" },
  ],
  "liquor-shop": [
    { id: "a", label: "시안 A 다크 풀스크린" },
    { id: "b", label: "시안 B 미니멀" },
  ],
  "small-wedding": [
    { id: "a", label: "시안 A 풀스크린 비주얼" },
    { id: "b", label: "시안 B 미니멀" },
  ],
  "cert-lab": [
    { id: "a", label: "시안 A 미니멀" },
    { id: "b", label: "시안 B 카드형" },
  ],
  "saas-startup": [
    { id: "a", label: "시안 A 카드형" },
    { id: "b", label: "시안 B 에디토리얼" },
  ],
  logistics: [
    { id: "a", label: "시안 A 다크 풀스크린" },
    { id: "b", label: "시안 B 에디토리얼" },
  ],
  "food-oem": [
    { id: "a", label: "시안 A 에디토리얼" },
    { id: "b", label: "시안 B 미니멀" },
  ],
  "online-store": [
    { id: "a", label: "시안 A 모노톤" },
    { id: "b", label: "시안 B 미니멀" },
  ],
  presale: [
    { id: "a", label: "시안 A 풀스크린 비주얼" },
    { id: "b", label: "시안 B 다크 풀스크린" },
  ],
  "flower-expo": [
    { id: "a", label: "시안 A 풀스크린 비주얼" },
    { id: "b", label: "시안 B 미니멀" },
  ],
  "landing-water-rental": [
    { id: "a", label: "시안 A 볼드 컬러" },
    { id: "b", label: "시안 B 미니멀" },
  ],
  "landing-coding-camp": [
    { id: "a", label: "시안 A 파스텔" },
    { id: "b", label: "시안 B 미니멀" },
  ],
  "landing-move-clean": [
    { id: "a", label: "시안 A 볼드 컬러" },
    { id: "b", label: "시안 B 풀스크린 비주얼" },
  ],
  "landing-popup-store": [
    { id: "a", label: "시안 A 콜라주" },
    { id: "b", label: "시안 B 볼드 타이포" },
  ],
  "landing-zine-fair": [
    { id: "a", label: "시안 A 볼드 타이포" },
    { id: "b", label: "시안 B 미니멀" },
  ],
  "landing-leather-class": [
    { id: "a", label: "시안 A 다크 풀스크린" },
    { id: "b", label: "시안 B 미니멀" },
  ],
  "clinic-homepage": [
    { id: "a", label: "시안 A 미니멀" },
    { id: "b", label: "시안 B 파스텔" },
  ],
};

// 예전 주소를 새 시안으로 잇는다(11-25 치과 2027형을 2027 글자 창문으로 바꿈). 키는 "프로젝트:옛 id"
export const VARIANT_ALIAS: Record<string, string> = {
  "dental-homepage:2027": "2027-window",
};
