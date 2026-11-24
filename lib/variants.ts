// 서버, 클라이언트 어디서나 읽는 시안 목록(11-22 분리: 카탈로그 카드가 서버에서 시안 이름을 쓴다).
// 사례마다 시안을 두 개 이상 두고 맨 위 줄에서 바꿔 본다(11-21). 주소의 ?v=a 로 고정해 링크로 보낼 수 있다.
export const VARIANTS: Record<string, { id: string; label: string }[]> = {
  company: [
    { id: "a", label: "시안 A 가공 사양" },
    { id: "b", label: "시안 B 기업 소개" },
  ],
  "law-firm": [
    { id: "a", label: "시안 A 프리미엄" },
    { id: "b", label: "시안 B 상담형" },
  ],
  "tax-office": [
    { id: "a", label: "시안 A 법인형" },
    { id: "b", label: "시안 B 사장님형" },
  ],
  "dental-homepage": [
    { id: "a", label: "시안 A 모던형" },
    { id: "b", label: "시안 B 가족형" },
  ],
  academy: [
    { id: "a", label: "시안 A 입시형" },
    { id: "b", label: "시안 B 초중등형" },
  ],
  interior: [
    { id: "a", label: "시안 A 갤러리형" },
    { id: "b", label: "시안 B 비용 안심형" },
  ],
  "korean-restaurant": [
    { id: "a", label: "시안 A 노포 브랜드형" },
    { id: "b", label: "시안 B 동네 밥집형" },
  ],
  "pilates-studio": [
    { id: "a", label: "시안 A 프리미엄" },
    { id: "b", label: "시안 B 체험 상담형" },
  ],
  "real-estate": [
    { id: "a", label: "시안 A 단지 전문형" },
    { id: "b", label: "시안 B 매물 상담형" },
  ],
  "hair-salon": [
    { id: "a", label: "시안 A 프리미엄" },
    { id: "b", label: "시안 B 가격표형" },
  ],
  "nail-shop": [
    { id: "a", label: "시안 A 컬러형" },
    { id: "b", label: "시안 B 1인 샵형" },
  ],
  roastery: [
    { id: "a", label: "시안 A 원두 브랜드" },
    { id: "b", label: "시안 B 카페 매장" },
  ],
  orthopedics: [
    { id: "a", label: "시안 A 척추관절형" },
    { id: "b", label: "시안 B 동네 의원형" },
  ],
  pediatrics: [
    { id: "a", label: "시안 A 진료시간형" },
    { id: "b", label: "시안 B 검진 접종형" },
  ],
  "korean-medicine": [
    { id: "a", label: "시안 A 전통 브랜드" },
    { id: "b", label: "시안 B 증상 상담형" },
  ],
  "eye-clinic": [
    { id: "a", label: "시안 A 수술센터형" },
    { id: "b", label: "시안 B 동네 안과형" },
  ],
  "animal-hospital": [
    { id: "a", label: "시안 A 24시 진료" },
    { id: "b", label: "시안 B 주치의형" },
  ],
  "labor-firm": [
    { id: "a", label: "시안 A 기업 자문형" },
    { id: "b", label: "시안 B 근로자 상담형" },
  ],
  scrivener: [
    { id: "a", label: "시안 A 등기 전문형" },
    { id: "b", label: "시안 B 회생 상담형" },
  ],
  "architect-office": [
    { id: "a", label: "시안 A 작품 갤러리" },
    { id: "b", label: "시안 B 주택 건축주형" },
  ],
  "photo-studio": [
    { id: "a", label: "시안 A 증명 프로필" },
    { id: "b", label: "시안 B 가족 기념" },
  ],
  "patent-office": [
    { id: "a", label: "시안 A 기술 특허형" },
    { id: "b", label: "시안 B 상표 출원형" },
  ],
  "family-law": [
    { id: "a", label: "시안 A 이혼 절차형" },
    { id: "b", label: "시안 B 재산 양육형" },
  ],
  "visa-agent": [
    { id: "a", label: "시안 A 기업 고용형" },
    { id: "b", label: "시안 B 개인 체류형" },
  ],
  "nursing-hospital": [
    { id: "a", label: "시안 A 재활 진료형" },
    { id: "b", label: "시안 B 생활 안내형" },
  ],
  optical: [
    { id: "a", label: "시안 A 누진 검안형" },
    { id: "b", label: "시안 B 셀렉트숍형" },
  ],
  "car-detailing": [
    { id: "a", label: "시안 A PPF 스튜디오" },
    { id: "b", label: "시안 B 동네 세차형" },
  ],
  "piano-academy": [
    { id: "a", label: "시안 A 어린이 피아노" },
    { id: "b", label: "시안 B 성인 취미" },
  ],
  taekwondo: [
    { id: "a", label: "시안 A 유초등부" },
    { id: "b", label: "시안 B 품새 심사" },
  ],
  "art-academy": [
    { id: "a", label: "시안 A 입시 미술" },
    { id: "b", label: "시안 B 어린이 미술" },
  ],
  "english-talk": [
    { id: "a", label: "시안 A 성인 회화" },
    { id: "b", label: "시안 B 어린이 영어" },
  ],
  "driving-school": [
    { id: "a", label: "시안 A 면허 취득" },
    { id: "b", label: "시안 B 도로 연수" },
  ],
  "reading-academy": [
    { id: "a", label: "시안 A 초등 독서" },
    { id: "b", label: "시안 B 중고등 국어" },
  ],
  pharmacy: [
    { id: "a", label: "시안 A 동네 약국" },
    { id: "b", label: "시안 B 복약 상담" },
  ],
  pension: [
    { id: "a", label: "시안 A 바다 전망" },
    { id: "b", label: "시안 B 숲속 독채" },
  ],
  "bakery-cafe": [
    { id: "a", label: "시안 A 동네 빵집" },
    { id: "b", label: "시안 B 베이커리 카페" },
  ],
  "hanok-cafe": [
    { id: "a", label: "시안 A 전통 찻집" },
    { id: "b", label: "시안 B 한옥 커피" },
  ],
  "furniture-workshop": [
    { id: "a", label: "시안 A 맞춤 제작" },
    { id: "b", label: "시안 B 쇼룸 컬렉션" },
  ],
  coworking: [
    { id: "a", label: "시안 A 코워킹" },
    { id: "b", label: "시안 B 비상주 사무실" },
  ],
  campsite: [
    { id: "a", label: "시안 A 오토캠핑" },
    { id: "b", label: "시안 B 글램핑" },
  ],
  "lighting-shop": [
    { id: "a", label: "시안 A 조명 쇼룸" },
    { id: "b", label: "시안 B 조명 교체" },
  ],
  "liquor-shop": [
    { id: "a", label: "시안 A 와인 보틀샵" },
    { id: "b", label: "시안 B 전통주" },
  ],
  "small-wedding": [
    { id: "a", label: "시안 A 가든 하우스" },
    { id: "b", label: "시안 B 레스토랑 예식" },
  ],
  "cert-lab": [
    { id: "a", label: "시안 A 인증 안내" },
    { id: "b", label: "시안 B 시험분석" },
  ],
  "saas-startup": [
    { id: "a", label: "시안 A 제품 화면" },
    { id: "b", label: "시안 B 업종별 도입" },
  ],
  logistics: [
    { id: "a", label: "시안 A 풀필먼트" },
    { id: "b", label: "시안 B 기업 3PL" },
  ],
  "food-oem": [
    { id: "a", label: "시안 A 소스 OEM" },
    { id: "b", label: "시안 B 건강식품" },
  ],
  "online-store": [
    { id: "a", label: "시안 A 상품 진열" },
    { id: "b", label: "시안 B 공방 이야기" },
  ],
  presale: [
    { id: "a", label: "시안 A 분양 정보" },
    { id: "b", label: "시안 B 프리미엄" },
  ],
  "flower-expo": [
    { id: "a", label: "시안 A 축제 안내" },
    { id: "b", label: "시안 B 개화 현황" },
  ],
  "landing-water-rental": [
    { id: "a", label: "시안 A 상담 신청형" },
    { id: "b", label: "시안 B 요금표형" },
  ],
  "landing-coding-camp": [
    { id: "a", label: "시안 A 모집 안내형" },
    { id: "b", label: "시안 B 안내문형" },
  ],
  "landing-move-clean": [
    { id: "a", label: "시안 A 견적 계산형" },
    { id: "b", label: "시안 B 가격표형" },
  ],
  "landing-popup-store": [
    { id: "a", label: "시안 A 회차 예약형" },
    { id: "b", label: "시안 B 포스터형" },
  ],
  "landing-zine-fair": [
    { id: "a", label: "시안 A 부스 지도형" },
    { id: "b", label: "시안 B 행사 안내형" },
  ],
  "landing-leather-class": [
    { id: "a", label: "시안 A 회차 결제형" },
    { id: "b", label: "시안 B 도구 사진형" },
  ],
  "clinic-homepage": [
    { id: "a", label: "시안 A 미니멀" },
    { id: "b", label: "시안 B 진료 안내형" },
  ],
};
