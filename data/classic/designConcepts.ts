// 카탈로그 표지의 디자인 컨셉(11-01). 키워드 2~3개, 실제 데모 코드에서 쓴 색 3개(메인, 보조, 바탕), 글꼴.
// 색은 데모 코드에서 많이 쓴 색을 뽑되 카카오톡 노랑처럼 외부 서비스 색은 넣지 않는다. 데모 색을 바꾸면 여기도 고친다.
export interface DesignConcept {
  keywords: string[];
  colors: { role: string; name: string; hex: string }[];
  font: string;
}

export const designConcepts: Record<string, DesignConcept> = {
  "dental-homepage": {
    keywords: ["신뢰", "야간진료", "차분한 진료 안내"],
    colors: [
      { role: "메인", name: "딥 틸", hex: "#0B6664" },
      { role: "보조", name: "다크 그린", hex: "#10302F" },
      { role: "바탕", name: "민트 화이트", hex: "#F3F8F7" },
    ],
    font: "Pretendard",
  },
  "online-store": {
    keywords: ["도자기 공방", "유약 옵션", "각인 주문"],
    colors: [
      { role: "메인", name: "테라코타", hex: "#B5562F" },
      { role: "보조", name: "클레이 베이지", hex: "#D9C7B4" },
      { role: "바탕", name: "웜 아이보리", hex: "#F7F4EF" },
    ],
    font: "Pretendard",
  },
  "pension": {
    keywords: ["바닷가 객실", "빈 객실 확인", "숙박 요금 계산"],
    colors: [
      { role: "메인", name: "딥 네이비", hex: "#12324A" },
      { role: "보조", name: "코랄 브라운", hex: "#B4513A" },
      { role: "바탕", name: "샌드", hex: "#F8F4EC" },
    ],
    font: "Pretendard",
  },
  "company": {
    keywords: ["정밀가공", "설비 사양", "도면 견적"],
    colors: [
      { role: "메인", name: "시그널 오렌지", hex: "#F26A1B" },
      { role: "보조", name: "스틸 차콜", hex: "#1E2329" },
      { role: "바탕", name: "라이트 그레이", hex: "#F2F3F5" },
    ],
    font: "Pretendard",
  },
  "cert-lab": {
    keywords: ["시험인증", "성적서 진위확인", "업무별 문의 창구"],
    colors: [
      { role: "메인", name: "인디고", hex: "#23307A" },
      { role: "보조", name: "시안", hex: "#0AA2C0" },
      { role: "바탕", name: "블루 화이트", hex: "#F4F7FB" },
    ],
    font: "Pretendard",
  },
  "clinic-homepage": {
    keywords: ["진료와 시술 구분", "요일별 진료시간", "시술 비용표"],
    colors: [
      { role: "메인", name: "청회색", hex: "#2F5469" },
      { role: "보조", name: "모브", hex: "#7A4B56" },
      { role: "바탕", name: "로즈 화이트", hex: "#FBF9F8" },
    ],
    font: "Pretendard",
  },
  "pharmacy": {
    keywords: ["동네 약국", "휴일지킴이약국", "운영시간"],
    colors: [
      { role: "메인", name: "민트 그린", hex: "#0B7A5F" },
      { role: "보조", name: "딥 그린", hex: "#075A46" },
      { role: "바탕", name: "민트 화이트", hex: "#F4F8F6" },
    ],
    font: "Pretendard",
  },
  "law-firm": {
    keywords: ["사건별 절차", "준비 서류", "상담신청"],
    colors: [
      { role: "메인", name: "네이비", hex: "#14213D" },
      { role: "보조", name: "골드", hex: "#B08D57" },
      { role: "바탕", name: "아이보리", hex: "#F6F3EC" },
    ],
    font: "Pretendard",
  },
  "tax-office": {
    keywords: ["신고일정", "기장료 요금표", "세무 달력"],
    colors: [
      { role: "메인", name: "장부 그린", hex: "#1F5C45" },
      { role: "보조", name: "연한 세이지", hex: "#E5EEE9" },
      { role: "바탕", name: "장부 아이보리", hex: "#FBFAF6" },
    ],
    font: "Pretendard",
  },
  "real-estate": {
    keywords: ["매물검색", "중개보수 계산", "방문상담"],
    colors: [
      { role: "메인", name: "코발트 블루", hex: "#1E5BB8" },
      { role: "보조", name: "연한 블루", hex: "#EAF1FB" },
      { role: "바탕", name: "라이트 그레이", hex: "#F4F5F6" },
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
    keywords: ["대표메뉴", "원산지 표시", "영업시간 표"],
    colors: [
      { role: "메인", name: "국물 빛 다홍", hex: "#A32A1D" },
      { role: "보조", name: "연한 다홍", hex: "#F3E6E3" },
      { role: "바탕", name: "한지 아이보리", hex: "#F8F5EE" },
    ],
    font: "Pretendard",
  },
  "interior": {
    keywords: ["아파트 리모델링", "전후 사진", "시공 과정"],
    colors: [
      { role: "메인", name: "포레스트 그린", hex: "#24433B" },
      { role: "보조", name: "우드 브라운", hex: "#8A5A2B" },
      { role: "바탕", name: "웜 아이보리", hex: "#F7F4EF" },
    ],
    font: "Pretendard",
  },
  "academy": {
    keywords: ["반 편성", "레벨테스트", "차량 노선"],
    colors: [
      { role: "메인", name: "칠판 초록", hex: "#1E3B31" },
      { role: "보조", name: "분필 노랑", hex: "#FFE15C" },
      { role: "바탕", name: "웜 화이트", hex: "#F6F5F0" },
    ],
    font: "Pretendard",
  },
  "pilates-studio": {
    keywords: ["그룹 시간표", "레슨 비교", "체험레슨"],
    colors: [
      { role: "메인", name: "인디고", hex: "#24365A" },
      { role: "보조", name: "클레이 브라운", hex: "#8A5A3F" },
      { role: "바탕", name: "샌드", hex: "#F5F2EC" },
    ],
    font: "Pretendard",
  },
  "hanok-cafe": {
    keywords: ["한옥 공간", "전통차 메뉴판", "방 예약"],
    colors: [
      { role: "메인", name: "낙관 주홍", hex: "#A8432A" },
      { role: "보조", name: "먹색", hex: "#1F1B16" },
      { role: "바탕", name: "한지색", hex: "#F3EDE2" },
    ],
    font: "Pretendard",
  },
  "bakery-cafe": {
    keywords: ["빵 나오는 시간", "픽업 예약", "단체주문"],
    colors: [
      { role: "메인", name: "크러스트 브라운", hex: "#9A4F1C" },
      { role: "보조", name: "크래프트", hex: "#EFE3CB" },
      { role: "바탕", name: "크림", hex: "#FBF6EC" },
    ],
    font: "Pretendard",
  },
  "roastery": {
    keywords: ["이번 주 원두", "로스팅 포인트", "정기 구독"],
    colors: [
      { role: "메인", name: "로스트 브라운", hex: "#7A4A2A" },
      { role: "보조", name: "라이트 로스트", hex: "#C08A4E" },
      { role: "바탕", name: "웜 그레이", hex: "#F7F7F5" },
    ],
    font: "Pretendard",
  },
  "hair-salon": {
    keywords: ["디자이너 지정", "직급별 가격", "스타일북"],
    colors: [
      { role: "메인", name: "인디고 네이비", hex: "#2B3A67" },
      { role: "보조", name: "스톤 그레이", hex: "#EFEFEC" },
      { role: "바탕", name: "웜 그레이", hex: "#F7F7F5" },
    ],
    font: "Pretendard",
  },
  "optical": {
    keywords: ["안경테 사진", "렌즈 가격", "시력검사 예약"],
    colors: [
      { role: "메인", name: "네이비", hex: "#24365A" },
      { role: "보조", name: "블루 그레이", hex: "#DFE3E8" },
      { role: "바탕", name: "웜 그레이", hex: "#F7F7F5" },
    ],
    font: "Pretendard",
  },
  "furniture-workshop": {
    keywords: ["원목 수종", "제작 치수", "주문 제작"],
    colors: [
      { role: "메인", name: "월넛", hex: "#6B4A2E" },
      { role: "보조", name: "오크", hex: "#C9A46B" },
      { role: "바탕", name: "웜 그레이", hex: "#F7F7F5" },
    ],
    font: "Pretendard",
  },
  "coworking": {
    keywords: ["좌석 유형", "월 요금표", "투어 신청"],
    colors: [
      { role: "메인", name: "슬레이트 틸", hex: "#2C4F58" },
      { role: "보조", name: "페일 블루그레이", hex: "#EAEFF0" },
      { role: "바탕", name: "웜 그레이", hex: "#F7F7F5" },
    ],
    font: "Pretendard",
  },
  "campsite": {
    keywords: ["구역별 사이트", "배치도", "예약 달력"],
    colors: [
      { role: "메인", name: "모닥불 주황", hex: "#A45A2A" },
      { role: "보조", name: "밤하늘 먹색", hex: "#141414" },
      { role: "바탕", name: "웜 그레이", hex: "#F7F7F5" },
    ],
    font: "Pretendard",
  },
  "photo-studio": {
    keywords: ["촬영 상품", "컨셉 갤러리", "30분 단위 예약"],
    colors: [
      { role: "메인", name: "샴페인 골드", hex: "#B8956A" },
      { role: "보조", name: "다크 패널", hex: "#1B1B1B" },
      { role: "바탕", name: "차콜", hex: "#141414" },
    ],
    font: "Pretendard",
  },
  "nail-shop": {
    keywords: ["이달의 아트", "시술 가격표", "담당별 예약"],
    colors: [
      { role: "메인", name: "로즈 브라운", hex: "#9A5B6A" },
      { role: "보조", name: "연한 로즈", hex: "#F4EEF0" },
      { role: "바탕", name: "웜 그레이", hex: "#F7F7F5" },
    ],
    font: "Pretendard",
  },
  "car-detailing": {
    keywords: ["차종별 가격", "전후 시공 사례", "입고 예약"],
    colors: [
      { role: "메인", name: "세이지 틸", hex: "#6FA8A2" },
      { role: "보조", name: "다크 패널", hex: "#1B1B1B" },
      { role: "바탕", name: "차콜", hex: "#141414" },
    ],
    font: "Pretendard",
  },
  "lighting-shop": {
    keywords: ["형태별 조명", "색온도", "시공 상담"],
    colors: [
      { role: "메인", name: "앰버", hex: "#C8A165" },
      { role: "보조", name: "다크 패널", hex: "#1B1B1B" },
      { role: "바탕", name: "차콜", hex: "#141414" },
    ],
    font: "Pretendard",
  },
  "liquor-shop": {
    keywords: ["전통주", "주종별 목록", "시음회 예약"],
    colors: [
      { role: "메인", name: "와인 브라운", hex: "#8A3A2E" },
      { role: "보조", name: "라이트 스톤", hex: "#EBEBE9" },
      { role: "바탕", name: "웜 그레이", hex: "#F7F7F5" },
    ],
    font: "Pretendard",
  },
  "small-wedding": {
    keywords: ["예식일 달력", "공간별 수용 인원", "패키지 요금"],
    colors: [
      { role: "메인", name: "올리브", hex: "#3F5A36" },
      { role: "보조", name: "세이지", hex: "#9AA38F" },
      { role: "바탕", name: "아이보리", hex: "#F7F7F5" },
    ],
    font: "Pretendard",
  },
  "korean-medicine": {
    keywords: ["교통사고 진료", "야간 진료", "원장 약력"],
    colors: [
      { role: "메인", name: "대추색", hex: "#8F3B2B" },
      { role: "보조", name: "먹색", hex: "#141414" },
      { role: "바탕", name: "웜 그레이", hex: "#F7F7F5" },
    ],
    font: "Pretendard",
  },
  "orthopedics": {
    keywords: ["부위별 진료", "비급여 진료비", "토요일 진료"],
    colors: [
      { role: "메인", name: "남색", hex: "#2B4170" },
      { role: "보조", name: "스카이 그레이", hex: "#EEF0F4" },
      { role: "바탕", name: "웜 그레이", hex: "#F7F7F5" },
    ],
    font: "Pretendard",
  },
  "pediatrics": {
    keywords: ["야간진료", "예방접종 일정", "영유아검진"],
    colors: [
      { role: "메인", name: "숲 초록", hex: "#2F5E46" },
      { role: "보조", name: "연한 초록", hex: "#EDF2EE" },
      { role: "바탕", name: "웜 그레이", hex: "#F7F7F5" },
    ],
    font: "Pretendard",
  },
  "eye-clinic": {
    keywords: ["시력교정 수술 비교", "정밀검사 순서", "백내장 렌즈"],
    colors: [
      { role: "메인", name: "딥 틸", hex: "#2C5F5B" },
      { role: "보조", name: "연한 틸", hex: "#EDF2F1" },
      { role: "바탕", name: "웜 그레이", hex: "#F7F7F5" },
    ],
    font: "Pretendard",
  },
  "animal-hospital": {
    keywords: ["24시 응급", "건강검진 패키지", "입원 면회"],
    colors: [
      { role: "메인", name: "청록", hex: "#2F5B57" },
      { role: "보조", name: "연한 청록", hex: "#EEF3F2" },
      { role: "바탕", name: "웜 그레이", hex: "#F7F7F5" },
    ],
    font: "Pretendard",
  },
  "nursing-hospital": {
    keywords: ["입원상담", "병실별 비용", "면회 예약"],
    colors: [
      { role: "메인", name: "짙은 초록", hex: "#2C4632" },
      { role: "보조", name: "세이지", hex: "#C9D3C6" },
      { role: "바탕", name: "웜 그레이", hex: "#F7F7F5" },
    ],
    font: "Pretendard",
  },
  "labor-firm": {
    keywords: ["사업주와 근로자", "부당해고 구제", "자문료 표"],
    colors: [
      { role: "메인", name: "황토", hex: "#7A6223" },
      { role: "보조", name: "먹색", hex: "#222222" },
      { role: "바탕", name: "웜 그레이", hex: "#F7F7F5" },
    ],
    font: "Pretendard",
  },
  "scrivener": {
    keywords: ["등기 비용", "준비 서류", "처리 기간"],
    colors: [
      { role: "메인", name: "네이비", hex: "#1F2B47" },
      { role: "보조", name: "라이트 스톤", hex: "#ECECEA" },
      { role: "바탕", name: "웜 그레이", hex: "#F7F7F5" },
    ],
    font: "Pretendard",
  },
  "patent-office": {
    keywords: ["상표 출원", "관납료와 수수료", "등록까지 기간"],
    colors: [
      { role: "메인", name: "버건디 레드", hex: "#9B2C2C" },
      { role: "보조", name: "연한 로즈", hex: "#F5E9E9" },
      { role: "바탕", name: "웜 그레이", hex: "#F7F7F5" },
    ],
    font: "Pretendard",
  },
  "family-law": {
    keywords: ["이혼 절차", "양육비", "변호사 상담"],
    colors: [
      { role: "메인", name: "버건디", hex: "#5E2A35" },
      { role: "보조", name: "연한 모브", hex: "#EADDE0" },
      { role: "바탕", name: "웜 그레이", hex: "#F7F7F5" },
    ],
    font: "Pretendard",
  },
  "visa-agent": {
    keywords: ["체류자격", "연장 서류", "영문 전환"],
    colors: [
      { role: "메인", name: "와인 레드", hex: "#8C2F39" },
      { role: "보조", name: "연한 로즈", hex: "#EAD6D8" },
      { role: "바탕", name: "웜 그레이", hex: "#F7F7F5" },
    ],
    font: "Pretendard",
  },
  "architect-office": {
    keywords: ["작업 사진", "설계 단계", "상담 준비 자료"],
    colors: [
      { role: "메인", name: "벽돌 갈색", hex: "#8A4A26" },
      { role: "보조", name: "라이트 그레이", hex: "#E8E8E8" },
      { role: "바탕", name: "웜 그레이", hex: "#F7F7F5" },
    ],
    font: "Pretendard",
  },
  "presale": {
    keywords: ["분양 일정", "타입별 평면도", "견본주택 예약"],
    colors: [
      { role: "메인", name: "숲색", hex: "#1F3D33" },
      { role: "보조", name: "연한 세이지", hex: "#DCE3D8" },
      { role: "바탕", name: "웜 그레이", hex: "#F7F7F5" },
    ],
    font: "Pretendard",
  },
  "saas-startup": {
    keywords: ["식당 재고 관리", "요금제 비교", "도입 문의"],
    colors: [
      { role: "메인", name: "그린", hex: "#2F5D4A" },
      { role: "보조", name: "라이트 그레이", hex: "#E5E5E5" },
      { role: "바탕", name: "웜 그레이", hex: "#F7F7F5" },
    ],
    font: "Pretendard",
  },
  "logistics": {
    keywords: ["당일 출고", "항목별 요금", "물류센터"],
    colors: [
      { role: "메인", name: "짙은 황토", hex: "#7A5A10" },
      { role: "보조", name: "라이트 스톤", hex: "#D9D9D6" },
      { role: "바탕", name: "웜 그레이", hex: "#F7F7F5" },
    ],
    font: "Pretendard",
  },
  "food-oem": {
    keywords: ["HACCP 제조", "최소 주문 수량", "샘플 의뢰"],
    colors: [
      { role: "메인", name: "토마토 레드", hex: "#9A3324" },
      { role: "보조", name: "딥 토마토", hex: "#7F2A1D" },
      { role: "바탕", name: "웜 그레이", hex: "#F7F7F5" },
    ],
    font: "Pretendard",
  },
  "piano-academy": {
    keywords: ["과정별 진도", "체험 레슨", "정기 연주회"],
    colors: [
      { role: "메인", name: "적갈색", hex: "#8A3A2C" },
      { role: "보조", name: "연한 적갈", hex: "#F1E7E4" },
      { role: "바탕", name: "웜 그레이", hex: "#F7F7F5" },
    ],
    font: "Pretendard",
  },
  "taekwondo": {
    keywords: ["차량 운행 노선", "승급 심사", "부별 시간표"],
    colors: [
      { role: "메인", name: "버건디 레드", hex: "#9B2C2C" },
      { role: "보조", name: "먹색", hex: "#141414" },
      { role: "바탕", name: "웜 그레이", hex: "#F7F7F5" },
    ],
    font: "Pretendard",
  },
  "art-academy": {
    keywords: ["입시반", "수업 작품", "실기 시간표"],
    colors: [
      { role: "메인", name: "연필 주황", hex: "#9A4A1C" },
      { role: "보조", name: "연필 회색", hex: "#C8C8C8" },
      { role: "바탕", name: "웜 그레이", hex: "#F7F7F5" },
    ],
    font: "Pretendard",
  },
  "english-talk": {
    keywords: ["성인 회화", "레벨테스트", "새벽반과 주말반"],
    colors: [
      { role: "메인", name: "버건디 레드", hex: "#9B2C2C" },
      { role: "보조", name: "딥 버건디", hex: "#7F2323" },
      { role: "바탕", name: "웜 그레이", hex: "#F7F7F5" },
    ],
    font: "Pretendard",
  },
  "driving-school": {
    keywords: ["면허별 수강료", "셔틀 노선", "시험 일정"],
    colors: [
      { role: "메인", name: "짙은 황토", hex: "#7A5C12" },
      { role: "보조", name: "먹색", hex: "#1C1C1C" },
      { role: "바탕", name: "웜 그레이", hex: "#F7F7F5" },
    ],
    font: "Pretendard",
  },
  "reading-academy": {
    keywords: ["이달의 도서", "토론과 쓰기", "첨삭 수업"],
    colors: [
      { role: "메인", name: "올리브 그린", hex: "#3D5A2E" },
      { role: "보조", name: "연한 올리브", hex: "#EEF1EA" },
      { role: "바탕", name: "웜 그레이", hex: "#F7F7F5" },
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
};
