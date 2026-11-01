// 데모 사용법 가이드. 프라이빗 짐 데모(HomepageDemo)의 스포트라이트 가이드와 같은 방식으로
// 화면의 해당 영역을 비추며 몇 단계로 안내한다. 첫 영역이 보일 때 한 번 자동으로 열고 물음표 버튼으로 다시 연다.
// target은 CSS 선택자. 제목(h2 등)을 가리키면 그 제목이 속한 section을 비춘다. 화면에 없으면 그 단계는 건너뛴다.
// 데모 첫 화면에 있는 요소만 가리킨다. 프라이빗 짐 데모는 예약 영역에 자체 가이드도 있지만, 다른 데모와 같게 아래 물음표로도 연다.
export interface TourStep {
  target: string;
  title: string;
  desc: string;
}

export const tours: Record<string, TourStep[]> = {
  "online-store": [
    { target: "#best", title: "많이 찾는 상품", desc: "상품을 누르면 상세 화면에서 유약, 크기, 각인 문구를 고를 수 있습니다." },
  ],
  "shop-admin": [
    { target: "#opt-title", title: "옵션관리", desc: "옵션 값을 더하거나 빼세요." },
    { target: "#combo-title", title: "품목 목록", desc: "품목을 여러 개 골라 재고를 같이 넣으세요." },
    { target: "#orders-title", title: "주문관리", desc: "주문을 골라 상태를 바꾸세요." },
  ],
  pension: [
    { target: "#rooms", title: "객실안내", desc: "객실 사진을 보고 자세히 보기를 누르세요." },
    { target: "#booking", title: "실시간예약", desc: "입실일 칸을 누르고 마지막 밤 칸을 누르세요." },
  ],
  company: [
    { target: "#co-quick", title: "바로가기", desc: "가공 사양과 견적문의로 이동합니다." },
    { target: "#co-lang", title: "한영 전환", desc: "영문 화면으로 바꿀 수 있습니다." },
  ],
  "cert-lab": [
    { target: "#cl-tools", title: "바로가기", desc: "성적서 진위확인, 신청서 양식, 견적문의로 이동합니다." },
    { target: "#cl-boards", title: "새소식과 자료실", desc: "공지와 신청서 양식을 내려받을 수 있습니다." },
  ],
  "dental-homepage": [
    { target: "#shortcut", title: "진료과목", desc: "진료과목별 안내로 이동합니다." },
    { target: "#symptoms", title: "증상별 안내", desc: "증상을 누르면 해당 진료 안내로 이동합니다." },
    { target: "#hours-box", title: "진료시간", desc: "요일별 진료시간과 야간진료를 확인하세요." },
  ],
  "clinic-homepage": [
    { target: "#two-ways", title: "진료 안내", desc: "피부질환 진료와 피부미용 시술 안내로 이동합니다." },
    { target: "#today-hours", title: "진료시간", desc: "요일별 진료시간을 확인하세요." },
  ],
  pharmacy: [
    { target: "#hours", title: "운영시간", desc: "요일별 운영시간을 확인하세요." },
    { target: "#items", title: "취급 품목", desc: "취급 품목을 확인하세요." },
    { target: "#location", title: "오시는 길", desc: "주소와 전화번호를 확인하세요." },
  ],
  "clinic-report": [
    { target: '[aria-label="진행 단계"]', title: "결과지 작성", desc: "고객 선택, 측정값 입력, 인쇄 순서로 진행합니다." },
  ],
  "law-firm": [
    { target: "#practice", title: "업무분야", desc: "분야를 누르면 사건별 절차와 준비 서류가 나옵니다." },
    { target: "#go-cases", title: "성공사례", desc: "분야별 성공사례 게시판으로 이동합니다." },
    { target: "#go-booking", title: "상담신청", desc: "상담 방식과 희망 시간대를 골라 신청합니다." },
  ],
  "tax-office": [
    { target: "#tax-schedule", title: "신고일정", desc: "이번 달 신고, 납부 기한입니다. 기한을 누르면 준비 서류가 나옵니다." },
    { target: "#tax-fee", title: "기장료", desc: "매출 구간별 월 기장료 표입니다." },
  ],
  "real-estate": [
    { target: "#realty-search", title: "매물검색", desc: "조건을 고르고 매물검색을 누르세요." },
    { target: "#realty-list", title: "매물 목록", desc: "매물을 누르면 아래에 상세 정보가 나옵니다." },
    { target: "#realty-fee", title: "중개보수", desc: "거래 금액에 맞춰 상한 보수를 계산합니다." },
  ],
  "private-gym": [
    { target: "#map", title: "지점 선택", desc: "지점 카드의 예약하기를 누르세요." },
    { target: "#booking-date", title: "날짜 선택", desc: "원하는 날짜를 누르세요. 빨간 요일은 주말 요금입니다." },
    { target: "#booking-time", title: "시간 선택", desc: "초록 테두리 칸이 예약 가능한 시간입니다. 이어서 여러 시간을 고를 수 있습니다." },
    { target: "#booking-summary", title: "예약 확인, 결제", desc: "총 금액을 확인하고 예약하기를 누른 뒤 결제 방법을 고르세요. 입장 QR이 발급됩니다." },
  ],
  "korean-restaurant": [
    { target: "#menu", title: "전체 메뉴", desc: "메뉴와 가격을 확인하세요." },
    { target: "#hours", title: "영업시간", desc: "요일별 영업시간과 브레이크타임을 확인하세요." },
  ],
  interior: [
    { target: "#it-latest", title: "시공사례", desc: "사진을 누르면 공사 전후와 기간이 나옵니다." },
    { target: "#it-quote-cta", title: "견적문의", desc: "평형, 공사 종류, 사진을 남기는 신청서입니다." },
    { target: "#it-admin-link", title: "관리자", desc: "사장님이 시공사례와 공지를 직접 올립니다." },
  ],
  academy: [
    { target: "#classes", title: "반 안내", desc: "학년을 골라 반과 시간표를 보세요." },
    { target: "#leveltest", title: "레벨테스트 예약", desc: "날짜와 시간을 고르세요." },
    { target: "#shuttle", title: "차량 운행", desc: "호차별 정류장 시간을 확인하세요." },
  ],
  "pilates-studio": [
    { target: "#schedule", title: "그룹 시간표", desc: "요일별 수업과 강사를 확인하고 체험레슨을 신청하세요." },
    { target: "#program", title: "프로그램 안내", desc: "개인, 듀엣, 그룹 레슨의 정원과 금액을 비교하세요." },
  ],
  "hanok-cafe": [
    { target: "#space", title: "공간 안내", desc: "방마다 사진과 인원을 보고 예약하세요." },
    { target: "#menu", title: "메뉴", desc: "분류별 메뉴와 가격을 확인하세요." },
    { target: "#location", title: "오시는 길", desc: "주소와 지도 앱 바로가기를 확인하세요." },
  ],
  "landing-water-rental": [
    { target: "#wr-compare-title", title: "제품 비교", desc: "제품별 월 렌탈료를 확인하세요." },
    { target: "#wr-apply", title: "상담 신청", desc: "연락처를 남기고 상담을 신청하세요." },
  ],
  "landing-move-clean": [
    { target: "#mc-py", title: "견적 계산", desc: "평수를 정하고 더할 작업을 고르세요." },
    { target: "#mc-apply", title: "예약 신청", desc: "날짜와 연락처를 넣고 예약을 신청하세요." },
  ],
  "landing-popup-store": [
    { target: "#rc-reserve", title: "사전 예약", desc: "날짜와 회차를 골라 예약하세요." },
    { target: "#rc-onsite", title: "현장 안내", desc: "현장 대기와 혜택 안내를 확인하세요." },
    { target: "#rc-faq", title: "자주 묻는 질문", desc: "운영 시간과 입장 방법을 확인하세요." },
  ],
  "landing-stamp-tour": [
    { target: "#ib-course", title: "코스 지도", desc: "전체 코스와 짧은 코스를 바꾸고 장소 번호를 누르세요." },
    { target: "#ib-stamp", title: "도장판", desc: "장소마다 QR 찍기를 누르면 도장이 찍힙니다." },
    { target: "#ib-guide", title: "해설사 동행", desc: "날짜와 시간을 고르세요. 남은 자리가 보입니다." },
    { target: "#ib-gift", title: "기념품 신청", desc: "도장을 다 모으면 신청 칸이 열립니다." },
  ],
  "landing-zine-fair": [
    { target: "#zf-entry", title: "사전 등록", desc: "날짜와 인원을 넣고 등록하세요." },
    { target: "#zf-sellers", title: "참가 셀러", desc: "셀러 이름을 검색하세요." },
    { target: "#zf-map", title: "부스 지도", desc: "부스를 누르면 그 셀러가 열립니다." },
    { target: "#zf-wish", title: "관심 부스", desc: "하트로 담은 부스를 도는 순서대로 정리합니다." },
  ],
  "landing-leather-class": [
    { target: "#lc-works", title: "수강생 완성작", desc: "완성작 사진을 확인하세요." },
    { target: "#lc-apply", title: "수업 신청", desc: "회차를 골라 신청하세요." },
  ],
  "landing-coding-camp": [
    { target: "#curriculum", title: "커리큘럼", desc: "주차별 수업 내용을 확인하세요." },
    { target: "#apply", title: "신청", desc: "학년을 고르고 특강을 신청하세요." },
  ],
  "bakery-cafe": [
    { target: "#oven", title: "빵 나오는 시간", desc: "빵별 나오는 시간을 확인하세요." },
    { target: "#menu", title: "메뉴", desc: "빵을 담고 픽업 예약을 누르세요." },
  ],
  "excel-automation": [
    { target: '[aria-label="주문 파일 올리기"]', title: "엑셀 업로드", desc: "거래처 주문 엑셀을 올리세요." },
  ],
  lms: [
    { target: "#lms-courses", title: "인기 과정", desc: "과정을 고르세요." },
    { target: "#lms-gnb-my", title: "나의 강의실", desc: "나의 강의실을 누르고 데모 계정으로 로그인하세요." },
    { target: "#lms-admin", title: "관리자", desc: "관리자를 누르세요." },
  ],
  "job-portal": [
    { target: "#job-search", title: "검색", desc: "검색어를 넣고 검색을 누르세요." },
    { target: '[aria-label="많이 찾은 검색어"]', title: "많이 찾은 검색어", desc: "검색어를 누르면 바로 검색됩니다." },
    { target: "#detail-search-toggle", title: "상세검색", desc: "지역, 직종, 경력, 임금을 고르세요." },
  ],
  "maintenance-dashboard": [
    { target: '[aria-label="수정 요청 목록"]', title: "유지보수 요청", desc: "요청을 눌러 처리하세요." },
  ],
  "maintenance-urgent-fix": [
    { target: "#uf-intake", title: "긴급 수리 접수", desc: "증상을 고르고 화면 캡처를 붙여 접수하세요." },
    { target: "#uf-timeline", title: "진행 상황", desc: "접수하면 단계가 하나씩 넘어갑니다. 금액에 동의해야 수리가 시작됩니다." },
    { target: "#uf-compare", title: "고치기 전과 뒤", desc: "두 화면에서 예약하기를 눌러 보세요." },
    { target: "#uf-report", title: "수리 보고서", desc: "원인과 고친 내용이 단계마다 채워집니다." },
  ],
  "district-portal": [
    { target: "#staff-search", title: "담당자 찾기", desc: "업무나 부서 이름으로 찾으세요." },
    { target: '[aria-label="자동 넘김 정지"]', title: "알림판", desc: "자동 넘김을 멈출 수 있습니다." },
  ],
  "program-application": [
    { target: '[aria-label="화면 선택"]', title: "신청자와 담당자", desc: "화면을 바꿔 가며 확인하세요." },
  ],
  "community-map": [
    { target: "#place-panel", title: "시설 목록", desc: "시설을 누르면 지도가 그 위치로 이동합니다." },
    { target: '[aria-label="지도 확대"]', title: "지도", desc: "확대하거나 축소할 수 있습니다." },
  ],
  "flower-expo": [
    { target: "#fee", title: "관람요금", desc: "요금 계산을 누르고 인원을 넣으세요." },
    { target: "#quick", title: "바로가기", desc: "추천 코스에서 관람 동선을 볼 수 있습니다." },
  ],
  "accessibility-review": [
    { target: '[aria-label="비교 화면 선택"]', title: "개선 전후", desc: "개선 전과 개선 후를 번갈아 보세요." },
  ],
  "retirement-calculator": [
    { target: "#input-title", title: "내 정보", desc: "나이, 저축액, 생활비를 바꾸세요." },
    { target: '[aria-label="투자 성향"]', title: "투자 성향", desc: "성향을 바꾸면 부족, 여유 금액이 다시 계산됩니다." },
  ],
  "roastery": [
    { target: "#rs-notes", title: "로스팅 포인트", desc: "로스팅 정도별 맛을 확인하세요." },
    { target: "#rs-beans", title: "원두", desc: "원두를 고르고 분쇄 방식을 선택하세요." },
    { target: "#rs-subscribe", title: "정기 구독", desc: "구독 주기별 가격을 확인하세요." },
  ],
  "hair-salon": [
    { target: "#hs-designers", title: "디자이너", desc: "디자이너를 확인하세요." },
    { target: "#hs-menu", title: "시술 메뉴", desc: "직급별 가격을 확인하세요." },
    { target: "#hs-reserve", title: "예약", desc: "날짜와 시간을 골라 예약을 신청하세요." },
    { target: "#hs-stylebook", title: "스타일북", desc: "스타일 사진을 확인하세요." },
  ],
  "optical": [
    { target: "#op-frame", title: "안경테", desc: "테 사진과 소재를 확인하세요." },
    { target: "#op-lens", title: "렌즈", desc: "렌즈 종류와 가격을 확인하세요." },
    { target: "#op-book", title: "시력검사 예약", desc: "날짜와 시간을 골라 예약하세요." },
  ],
  "furniture-workshop": [
    { target: "#fw-order", title: "주문 제작", desc: "가구별 치수와 가격, 제작 사례를 확인하세요." },
    { target: "#fw-quote", title: "견적 문의", desc: "원하는 가구와 치수를 적어 문의하세요." },
    { target: "#fw-process", title: "작업 과정", desc: "제작 순서를 확인하세요." },
  ],
  "coworking": [
    { target: "#cw-price", title: "멤버십 요금", desc: "좌석 유형별 월 요금과 계약 기간 할인을 확인하세요." },
    { target: "#cw-rooms", title: "회의실", desc: "회의실 인원과 설비, 이용 요금을 확인하세요." },
    { target: "#cw-tour", title: "투어 신청", desc: "평일 날짜와 시간을 고르고 신청하세요." },
  ],
  "campsite": [
    { target: "#cp-map", title: "사이트 배치도", desc: "사이트를 눌러 크기와 전기, 그늘, 화장실 거리를 보세요." },
    { target: "#cp-calendar", title: "날짜 고르기", desc: "입실일 칸을 누르고 퇴실일 칸을 누르세요." },
    { target: "#cp-rent", title: "장비 대여", desc: "수량을 더하면 1박 단위로 합계에 더해집니다." },
    { target: "#cp-book", title: "예약 신청", desc: "이름과 휴대폰을 넣고 예약 신청을 누르세요." },
  ],
  "photo-studio": [
    { target: "#ps-gallery", title: "갤러리", desc: "컨셉을 눌러 촬영 사진을 보세요." },
    { target: "#ps-price", title: "상품 안내", desc: "촬영 상품과 추가 옵션 금액을 확인하세요." },
    { target: "#ps-book", title: "촬영 예약", desc: "날짜와 시간대를 골라 예약하세요." },
  ],
  "nail-shop": [
    { target: "#ns-price", title: "시술 메뉴와 가격", desc: "시술과 아트 가격, 회원권을 확인하세요." },
    { target: "#ns-reserve", title: "예약하기", desc: "날짜, 시간, 담당을 골라 예약하세요." },
  ],
  "car-detailing": [
    { target: "#cd-menu", title: "시공 메뉴", desc: "차종별 시공 가격을 확인하세요." },
    { target: "#cd-cases", title: "시공 사례", desc: "시공 전후 사진을 확인하세요." },
    { target: "#cd-book", title: "예약하기", desc: "입고 날짜와 시간을 골라 예약하세요." },
  ],
  "lighting-shop": [
    { target: "#ls-products", title: "제품", desc: "제품 사진과 가격을 확인하세요." },
    { target: "#ls-guide", title: "색온도 안내", desc: "공간별 추천 색온도를 확인하세요." },
    { target: "#ls-quote", title: "견적과 시공 상담", desc: "시공 상담을 신청하세요." },
  ],
  "liquor-shop": [
    { target: "#ls-grid", title: "전체 상품", desc: "주종 탭을 눌러 상품을 보세요." },
    { target: "#ls-gift", title: "선물세트", desc: "선물세트 구성과 가격을 확인하세요." },
    { target: "#ls-tasting", title: "주말 시음회", desc: "회차를 골라 예약하세요." },
  ],
  "small-wedding": [
    { target: "#sw-date", title: "예약 현황", desc: "토요일이나 일요일을 누르고 시간대를 고르세요." },
    { target: "#sw-layout", title: "홀과 수용 인원", desc: "공간별 수용 인원과 좌석을 확인하세요." },
    { target: "#sw-package", title: "패키지와 비용", desc: "대관, 식사, 꽃장식 요금을 확인하세요." },
  ],
  "korean-medicine": [
    { target: "#km-body", title: "진료 과목", desc: "진료 과목을 확인하세요." },
    { target: "#km-car", title: "교통사고 진료", desc: "진료 절차와 준비물을 확인하세요." },
    { target: "#km-hours", title: "진료 시간", desc: "요일별 진료 시간을 확인하세요." },
    { target: "#km-reserve", title: "온라인 예약", desc: "날짜와 시간을 골라 예약하세요." },
  ],
  "orthopedics": [
    { target: "#os-parts", title: "진료과목", desc: "부위별 진료과목을 확인하세요." },
    { target: "#os-fees", title: "비급여 진료비", desc: "항목별 진료비를 확인하세요." },
    { target: "#os-reserve", title: "진료 예약", desc: "날짜와 시간을 골라 예약하세요." },
  ],
  "pediatrics": [
    { target: "#pd-reception", title: "진료 접수", desc: "접수 방법을 확인하세요." },
    { target: "#pd-vaccine", title: "예방접종 일정", desc: "개월 수별 접종 일정을 확인하세요." },
    { target: "#pd-checkup", title: "영유아 건강검진", desc: "검진 시기와 내용을 확인하세요." },
  ],
  "eye-clinic": [
    { target: "#ec-compare", title: "수술 비교", desc: "라식, 라섹, 스마일라식을 비교해 보세요." },
    { target: "#ec-exam", title: "정밀검사", desc: "검사 단계와 걸리는 시간을 확인하세요." },
    { target: "#ec-cataract", title: "백내장", desc: "인공수정체 종류를 확인하세요." },
    { target: "#ec-book", title: "상담 예약", desc: "날짜와 시간을 골라 예약하세요." },
  ],
  "animal-hospital": [
    { target: "#ah-er", title: "응급 진료", desc: "야간과 휴일 응급 진료 안내를 확인하세요." },
    { target: "#ah-dept", title: "진료과목", desc: "과목을 누르면 증상과 검사가 나옵니다." },
    { target: "#ah-checkup", title: "건강검진", desc: "패키지별 검사 항목을 확인하세요." },
    { target: "#ah-reserve", title: "진료 예약", desc: "날짜와 시간을 골라 예약을 신청하세요." },
  ],
  "nursing-hospital": [
    { target: "#nh-room", title: "병실 안내", desc: "병실 종류와 1일 비용을 확인하세요." },
    { target: "#nh-visit", title: "면회 예약", desc: "날짜와 시간 칸을 골라 면회를 예약하세요." },
    { target: "#nh-meal", title: "주간 식단표", desc: "요일별 식단을 확인하세요." },
    { target: "#nh-consult", title: "입원 상담", desc: "상담을 신청하세요." },
  ],
  "labor-firm": [
    { target: "#lf-deadline", title: "부당해고 구제신청", desc: "신청 기한과 진행 절차입니다." },
    { target: "#lf-wage", title: "임금체불, 퇴직금", desc: "지급 기한과 진정 절차입니다." },
    { target: "#lf-advisory", title: "노무 자문", desc: "직원 수 구간별 월 자문료 표입니다." },
    { target: "#lf-consult", title: "상담신청", desc: "분야와 희망일을 골라 신청해 보세요." },
  ],
  "scrivener": [
    { target: "#js-cost", title: "등기 비용", desc: "취득세율과 매매가 구간별 법무사 보수 표입니다." },
    { target: "#js-docs", title: "준비 서류", desc: "잔금일에 매수인과 매도인이 챙길 서류입니다." },
    { target: "#js-rehab", title: "개인회생", desc: "신청 자격과 단계별 기간입니다." },
    { target: "#js-apply", title: "상담신청", desc: "분야와 연락처를 넣고 접수해 보세요." },
  ],
  "patent-office": [
    { target: "#po-trademark", title: "상표 출원", desc: "선행 조사부터 등록까지 단계와 기간입니다." },
    { target: "#po-fee", title: "비용 안내", desc: "관납료와 수수료를 나눠 적은 표입니다." },
    { target: "#po-steps", title: "특허 절차", desc: "일반심사와 우선심사 기간을 함께 적었습니다." },
    { target: "#po-consult", title: "상담신청", desc: "분야와 연락처를 남기고 접수 번호를 받아 보세요." },
  ],
  "family-law": [
    { target: "#fl-areas", title: "업무분야", desc: "분야를 누르면 절차와 기간, 준비 서류가 바뀝니다." },
    { target: "#fl-booking", title: "상담신청", desc: "상담 방식과 희망 시간대를 골라 신청합니다." },
    { target: "#fl-faq", title: "자주 묻는 질문", desc: "질문을 눌러 답을 펼칩니다." },
  ],
  "visa-agent": [
    { target: "#va-types", title: "체류자격 안내", desc: "자격별 대상, 취업 범위, 체류기간입니다." },
    { target: "#va-docs", title: "필요 서류", desc: "자격을 고르면 연장 서류 목록이 바뀝니다." },
    { target: "#va-lang", title: "영문 전환", desc: "English 를 눌러 화면 전체가 바뀌는 걸 보세요." },
  ],
  "architect-office": [
    { target: "#ar-works", title: "작업 목록", desc: "용도를 눌러 작업을 골라 보세요." },
    { target: "#ar-process", title: "설계 과정", desc: "단계별 하는 일과 받는 도면, 기간입니다." },
    { target: "#ar-contact", title: "상담 안내", desc: "전화, 카카오톡 창구와 상담 전에 준비할 자료입니다." },
  ],
  "presale": [
    { target: "#pv-types", title: "세대안내", desc: "타입을 누르고 평면도와 면적을 보세요." },
    { target: "#pv-price", title: "분양가", desc: "주택형과 층별 분양가, 납부조건 표입니다." },
    { target: "#pv-visit", title: "방문예약", desc: "날짜와 시간을 골라 견본주택 방문을 예약하세요." },
    { target: "#pv-map", title: "입지환경", desc: "약도 번호와 시설별 거리 목록입니다." },
  ],
  "saas-startup": [
    { target: "#ss-plans", title: "요금제", desc: "월 결제와 연 결제를 바꿔 금액을 보세요." },
    { target: "#ss-compare", title: "기능 비교", desc: "요금제별 기능을 한 표에서 보세요." },
    { target: "#ss-stores", title: "매장 수별 요금", desc: "매장 수에 따른 월 요금을 확인하세요." },
    { target: "#ss-contact", title: "도입 문의", desc: "매장 수를 넣고 문의를 접수해 보세요." },
  ],
  "logistics": [
    { target: "#lg-schedule", title: "출고 일정", desc: "오후 2시 이전 주문은 당일 출고합니다." },
    { target: "#lg-quote", title: "이용 요금", desc: "입고, 보관, 출고, 택배 요금을 확인하세요." },
    { target: "#lg-center", title: "센터 안내", desc: "센터별 주소와 입고 시간을 확인하세요." },
    { target: "#lg-contact", title: "도입 상담", desc: "판매 채널을 고르고 상담을 신청해 보세요." },
  ],
  "food-oem": [
    { target: "#fo-items", title: "제조 품목", desc: "포장 형태를 골라 품목과 최소 수량을 보세요." },
    { target: "#fo-moq", title: "포장 안내", desc: "포장별 최소 주문 수량을 확인하세요." },
    { target: "#fo-process", title: "생산 공정", desc: "원료 입고부터 출고까지 공정을 확인하세요." },
    { target: "#fo-sample", title: "샘플 의뢰", desc: "품목과 연락처를 넣어 샘플을 의뢰하세요." },
  ],
  "piano-academy": [
    { target: "#pa-course", title: "교육 과정", desc: "과정별 진도와 교재를 확인하세요." },
    { target: "#pa-timetable", title: "수업시간표", desc: "과정별 요일과 시간을 확인하세요." },
    { target: "#pa-trial", title: "체험 레슨", desc: "이름과 연락처를 넣고 체험 레슨을 신청해 보세요." },
    { target: "#pa-concert", title: "연주회 소식", desc: "연주회 날짜와 참가 방법을 확인하세요." },
  ],
  "taekwondo": [
    { target: "#tk-bus", title: "차량 운행", desc: "호차별 정류장과 등원 시간을 확인하세요." },
    { target: "#tk-time", title: "부별 시간표", desc: "요일별 수련 내용과 수련비를 확인하세요." },
    { target: "#tk-belt", title: "승급 심사", desc: "띠별 심사 내용과 일정을 확인하세요." },
    { target: "#tk-consult", title: "상담 신청", desc: "체험 수업 날짜를 골라 신청해 보세요." },
  ],
  "art-academy": [
    { target: "#aa-classes", title: "반 안내", desc: "반별 대상, 과목, 수업 시간을 확인하세요." },
    { target: "#aa-gallery", title: "수업 작품", desc: "그림을 눌러 크게 보세요." },
    { target: "#aa-consult", title: "상담 신청", desc: "학년과 방문 시간을 골라 신청해 보세요." },
  ],
  "english-talk": [
    { target: "#et-test", title: "레벨테스트", desc: "희망 날짜와 시간을 골라 레벨테스트를 예약하세요." },
    { target: "#et-schedule", title: "반 시간표", desc: "시간대별 반 시간표를 확인하세요." },
    { target: "#et-fee", title: "월 수강료", desc: "주 횟수별 월 교습비를 확인하세요." },
    { target: "#et-trial", title: "무료 체험", desc: "체험 날짜를 고르고 신청해 보세요." },
  ],
  "driving-school": [
    { target: "#dr-course", title: "교육과정", desc: "면허별 교육 시간과 수강료를 확인하세요." },
    { target: "#dr-shuttle", title: "셔틀 노선", desc: "노선별 첫차와 막차 시간을 확인하세요." },
    { target: "#dr-exam", title: "시험 일정", desc: "검정 요일과 회차를 확인하세요." },
    { target: "#dr-reserve", title: "등록 예약", desc: "면허와 날짜를 골라 예약해 보세요." },
  ],
  "reading-academy": [
    { target: "#ra-books", title: "이달의 도서", desc: "학년을 골라 이번 달 책을 보세요." },
    { target: "#ra-course", title: "수업 과정", desc: "읽기, 토론, 쓰기 순서로 진행합니다." },
    { target: "#ra-correct", title: "첨삭 수업", desc: "첨삭 방식과 첨삭본 받는 방법을 확인하세요." },
    { target: "#ra-consult", title: "상담 신청", desc: "학년과 희망일을 골라 신청해 보세요." },
  ],
};
