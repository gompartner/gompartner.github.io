// 서버, 클라이언트 어디서나 읽는 시안 목록(11-22 분리: 카탈로그 카드가 서버에서 시안 이름을 쓴다).
// 사례마다 시안을 두 개 이상 두고 맨 위 줄에서 바꿔 본다(11-21). 주소의 ?v=a 로 고정해 링크로 보낼 수 있다.
export const VARIANTS: Record<string, { id: string; label: string }[]> = {
  company: [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  "law-firm": [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  "tax-office": [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  "dental-homepage": [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  academy: [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  interior: [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  "korean-restaurant": [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  "pilates-studio": [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  "real-estate": [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  "hair-salon": [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  "nail-shop": [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  roastery: [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  orthopedics: [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  pediatrics: [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  "korean-medicine": [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  "eye-clinic": [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  "animal-hospital": [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  "labor-firm": [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  scrivener: [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  "architect-office": [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  "photo-studio": [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  "patent-office": [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  "family-law": [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  "visa-agent": [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  "nursing-hospital": [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  optical: [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  "car-detailing": [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  "piano-academy": [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  taekwondo: [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  "art-academy": [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  "english-talk": [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  "driving-school": [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  "reading-academy": [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  pharmacy: [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  pension: [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  "bakery-cafe": [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  "hanok-cafe": [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  "furniture-workshop": [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  coworking: [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  campsite: [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  "lighting-shop": [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  "liquor-shop": [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  "small-wedding": [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  "cert-lab": [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  "saas-startup": [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  logistics: [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  "food-oem": [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  "online-store": [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  presale: [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  "flower-expo": [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  "landing-water-rental": [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  "landing-coding-camp": [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  "landing-move-clean": [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  "landing-popup-store": [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  "landing-zine-fair": [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  "landing-leather-class": [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
  "clinic-homepage": [
    { id: "a", label: "시안 A" },
    { id: "b", label: "시안 B" },
  ],
};
