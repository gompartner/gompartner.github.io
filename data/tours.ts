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
    { target: "#best", title: "많이 찾는 상품", desc: "상품을 누르면 상세 화면에서 유약 색과 각인을 고를 수 있습니다." },
  ],
  "shop-admin": [
    { target: "#opt-title", title: "옵션관리", desc: "옵션 값을 더하거나 빼세요." },
    { target: "#combo-title", title: "품목 목록", desc: "품목을 여러 개 골라 재고를 같이 넣으세요." },
    { target: "#orders-title", title: "주문관리", desc: "주문을 골라 상태를 바꾸세요." },
  ],
  pension: [
    { target: "#rooms", title: "객실 배치도", desc: "방을 누르세요." },
    { target: "#booking", title: "실시간예약", desc: "입실일 칸을 누르고 마지막 밤 칸을 누르세요." },
  ],
  company: [
    { target: "#co-quick", title: "바로가기", desc: "가공 가능 범위와 견적문의로 이동합니다." },
    { target: "#co-lang", title: "한영 전환", desc: "영문 화면으로 바꿀 수 있습니다." },
  ],
  "cert-lab": [
    { target: "#cl-track-quick", title: "시험진행현황 조회", desc: "접수번호를 넣고 조회를 누르세요." },
    { target: "#cl-tools", title: "조회 도구", desc: "인증 대상 조회, 성적서 진위확인으로 이동합니다." },
  ],
  "dental-homepage": [
    { target: "#selfcheck", title: "증상 자가체크", desc: "불편한 이를 누르세요." },
    { target: "#shortcut", title: "진료과목", desc: "진료과목별 안내로 이동합니다." },
  ],
  "clinic-homepage": [
    { target: "#two-ways", title: "진료 안내", desc: "피부질환 진료와 피부미용 시술 중 고르세요." },
    { target: "#today-hours", title: "진료시간", desc: "오늘 요일이 진하게 표시됩니다." },
  ],
  pharmacy: [
    { target: "#rx", title: "처방전 전송", desc: "처방전 사진을 올리세요." },
    { target: "#pillbox", title: "복약 달력", desc: "약과 시간을 넣고 인쇄하세요." },
    { target: "#font-toggle", title: "글자 크게", desc: "글자를 크게 볼 수 있습니다." },
  ],
  "clinic-report": [
    { target: '[aria-label="진행 단계"]', title: "결과지 작성", desc: "고객 선택, 측정값 입력, 인쇄 순서로 진행합니다." },
  ],
  "law-firm": [
    { target: "#practice", title: "업무분야", desc: "분야를 누르면 사건별 절차와 준비 서류가 나옵니다." },
    { target: "#go-cases", title: "성공사례", desc: "분야별 성공사례 게시판으로 이동합니다." },
    { target: "#go-booking", title: "상담신청", desc: "상담 방식을 먼저 고르세요." },
  ],
  "tax-office": [
    { target: "#tax-schedule", title: "신고일정", desc: "사업자 유형을 고르세요." },
    { target: "#tax-fee", title: "기장료", desc: "매출 구간과 직원 수를 고르세요." },
  ],
  "real-estate": [
    { target: "#realty-search", title: "매물검색", desc: "조건을 고르고 매물검색을 누르세요." },
    { target: "#realty-map", title: "지도검색", desc: "핀을 누르면 매물 상세가 나옵니다." },
    { target: "#realty-fee", title: "중개보수", desc: "거래 금액에 맞춰 상한 보수를 계산합니다." },
  ],
  "private-gym": [
    { target: "#map", title: "지점 선택", desc: "지도의 핀이나 지점 카드에서 지점을 고르세요." },
    { target: "#booking-date", title: "날짜 선택", desc: "원하는 날짜를 누르세요. 빨간 요일은 주말 요금입니다." },
    { target: "#booking-time", title: "시간 선택", desc: "초록 테두리 칸이 예약 가능한 시간입니다. 이어서 여러 시간을 고를 수 있습니다." },
    { target: "#booking-summary", title: "예약 확인, 결제", desc: "총 금액을 확인하고 예약하기와 결제를 누르세요. 입장 QR이 바로 발급됩니다." },
  ],
  "korean-restaurant": [
    { target: "#menu", title: "전체 메뉴", desc: "메뉴와 가격을 확인하세요." },
    { target: "#hours", title: "영업시간", desc: "요일별 브레이크타임을 확인하세요." },
  ],
  interior: [
    { target: "#it-latest", title: "시공사례", desc: "사진을 누르면 공사 전후와 기간이 나옵니다." },
    { target: "#it-quote-cta", title: "견적문의", desc: "평형, 공사 종류, 사진을 남기는 신청서입니다." },
    { target: "#it-admin-link", title: "관리자", desc: "사장님이 시공사례와 공지를 직접 올립니다." },
  ],
  academy: [
    { target: "#classes", title: "반 찾기", desc: "밑줄 친 학년과 점수를 바꾸세요." },
    { target: "#leveltest", title: "레벨테스트 예약", desc: "날짜와 시간을 고르세요." },
    { target: "#shuttle", title: "차량 운행", desc: "우리 집 정류장을 누르세요." },
  ],
  "pilates-studio": [
    { target: "#schedule", title: "그룹 시간표", desc: "잔여 자리가 있는 수업을 누르세요." },
    { target: "#lesson-finder", title: "레슨 찾기", desc: "질문 세 개에 답하세요." },
  ],
  "hanok-cafe": [
    { target: "#space", title: "좌석 예약", desc: "평면도에서 방을 누르세요." },
    { target: "#menu-picker", title: "메뉴", desc: "밑줄 친 말을 바꾸세요." },
    { target: "#way", title: "오시는 길", desc: "단계를 누르면 경로가 표시됩니다." },
  ],
  "landing-water-rental": [
    { target: "#wr-compare-title", title: "제품 비교", desc: "사용 기간을 바꾸면 월 렌탈료가 바뀝니다." },
    { target: "#wr-apply", title: "상담 신청", desc: "신청하면 사장님 쪽에 무엇이 오는지 보입니다." },
  ],
  "landing-move-clean": [
    { target: "#mc-py", title: "견적 계산", desc: "평수를 움직이고 더할 작업을 고르세요." },
    { target: "#mc-apply", title: "예약 신청", desc: "계산한 조건이 그대로 들어갑니다." },
  ],
  "landing-popup-store": [
    { target: "#rc-reserve", title: "회차 발권", desc: "날짜와 회차를 고르고 발권하세요. 입장권이 인쇄돼 나옵니다." },
    { target: "#rc-wait", title: "현장 번호표", desc: "번호표를 뽑으면 앞 팀 수가 줄어듭니다." },
    { target: "#rc-roulette", title: "돌림판", desc: "돌리기를 누르세요. 결과는 쿠폰으로 나옵니다." },
    { target: "#rc-perks", title: "구디백과 SNS 인증", desc: "남은 구디백 수를 보고, 세 가지를 체크하세요." },
  ],
  "landing-stamp-tour": [
    { target: "#ib-course", title: "코스 지도", desc: "전체 코스와 짧은 코스를 바꾸고 장소 번호를 누르세요." },
    { target: "#ib-stamp", title: "도장판", desc: "장소마다 QR 찍기를 누르면 도장이 찍힙니다." },
    { target: "#ib-guide", title: "해설사 동행", desc: "날짜와 시간을 고르세요. 남은 자리가 보입니다." },
    { target: "#ib-gift", title: "기념품 신청", desc: "도장을 다 모으면 신청 칸이 열립니다." },
  ],
  "landing-zine-fair": [
    { target: "#zf-entry", title: "사전 입장 등록", desc: "날짜와 들어오는 시간을 고르세요. 등록하면 입장 QR이 나옵니다." },
    { target: "#zf-sellers", title: "셀러 찾기", desc: "장르 태그를 누르면 맞는 셀러만 남고 지도에 칠해집니다." },
    { target: "#zf-map", title: "부스 지도", desc: "부스를 누르면 그 셀러가 열립니다." },
    { target: "#zf-wish", title: "미리 담기", desc: "하트로 담은 진을 도는 순서대로 정리합니다." },
  ],
  "landing-leather-class": [
    { target: "#lc-apply", title: "수업 신청", desc: "회차를 고르세요. 남은 자리가 0이면 대기 신청으로 바뀝니다." },
    { target: "#lc-change", title: "예약 확인·변경", desc: "예약 번호로 찾아 날짜를 바꾸거나 취소해 보세요. 환불 금액이 같이 나옵니다." },
    { target: "#lc-owner", title: "사장님 화면", desc: "회차를 누르면 신청자와 결제 상태, 변경 이력이 보입니다." },
  ],
  "landing-coding-camp": [
    { target: "#curriculum", title: "커리큘럼", desc: "주차를 누르면 그 주에 쌓을 블록이 보입니다." },
    { target: "#apply", title: "신청", desc: "학년을 고르면 맞는 반만 남습니다." },
  ],
  "bakery-cafe": [
    { target: "#oven", title: "빵 나오는 시간", desc: "시계를 움직이세요." },
    { target: "#menu", title: "메뉴", desc: "빵을 담고 예약하기를 누르세요." },
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
    { target: '[aria-label="투자 성향"]', title: "투자 성향", desc: "성향을 바꾸면 부족·여유 금액이 다시 계산됩니다." },
  ],
  "roastery": [
    { target: "#rs-roast", title: "로스팅 장면", desc: "스크롤을 내리며 원두 색과 온도가 바뀌는 걸 보세요." },
    { target: "#rs-notes", title: "로스팅 포인트", desc: "단계를 누르면 맛 노트와 추천 원두가 바뀝니다." },
    { target: "#rs-grind", title: "분쇄 선택", desc: "용도를 누르면 입자 굵기가 바뀝니다." },
    { target: "#rs-subscribe", title: "구독 계산", desc: "주기와 용량, 봉수를 골라 회당 금액을 보세요." },
  ],
  "hair-salon": [
    { target: "#hs-designers", title: "디자이너 선택", desc: "디자이너를 고르세요. 화면 색과 단가가 바뀝니다." },
    { target: "#hs-menu", title: "시술 담기", desc: "시술을 여러 개 담으면 시간과 금액이 합산됩니다." },
    { target: "#hs-reserve", title: "예약 시간표", desc: "빈 칸을 누르면 소요시간만큼 잡힙니다." },
    { target: "#hs-stylebook", title: "스타일북", desc: "스타일 이름을 누르면 어울리는 시술 조합이 나옵니다." },
  ],
  "optical": [
    { target: "#op-stage", title: "3D 안경", desc: "마우스를 움직여 테를 이리저리 돌려 보세요." },
    { target: "#op-frame", title: "테 고르기", desc: "모양과 소재를 눌러 가운데 안경을 바꿔 보세요." },
    { target: "#op-lens", title: "렌즈 옵션", desc: "굴절률과 기능을 켜고 합계가 바뀌는 걸 보세요." },
    { target: "#op-book", title: "검사 예약", desc: "날짜와 시간을 고르고 예약해 보세요." },
  ],
  "furniture-workshop": [
    { target: "#fw-kind", title: "제작 가구", desc: "가구를 고르면 도면이 다시 그려져요." },
    { target: "#fw-size", title: "치수 조절", desc: "폭, 깊이, 높이를 밀어 보세요." },
    { target: "#fw-wood", title: "목재와 마감", desc: "목재를 고르면 도면 색과 견적이 바뀌어요." },
    { target: "#fw-quote", title: "견적과 문의", desc: "이름과 휴대폰을 넣고 도면과 함께 보내세요." },
  ],
  "coworking": [
    { target: "#cw-plan", title: "좌석 평면도", desc: "자리나 유형을 눌러 보세요. 빈 자리 숫자가 굴러가요." },
    { target: "#cw-price", title: "요금 계산", desc: "기간과 인원, 옵션을 고르세요." },
    { target: "#cw-rooms", title: "회의실 현황", desc: "빈 시간을 누르세요." },
    { target: "#cw-tour", title: "투어 신청", desc: "평일 날짜와 시간을 고르고 신청하세요." },
  ],
  "campsite": [
    { target: "#cp-map", title: "사이트 배치도", desc: "사이트를 눌러 크기와 전기, 그늘, 화장실 거리를 보세요." },
    { target: "#cp-calendar", title: "날짜 고르기", desc: "입실일 칸을 누르고 퇴실일 칸을 누르세요." },
    { target: "#cp-rent", title: "장비 대여", desc: "수량을 더하면 1박 단위로 합계에 더해집니다." },
    { target: "#cp-book", title: "예약 신청", desc: "이름과 휴대폰을 넣고 예약 신청을 누르세요." },
  ],
  "photo-studio": [
    { target: "#ps-gallery", title: "가로 갤러리", desc: "아래로 스크롤해 사진을 옆으로 넘겨 보세요." },
    { target: "#ps-backdrop", title: "배경지 색", desc: "배경지를 골라 첫 카드와 옷 색 안내를 확인하세요." },
    { target: "#ps-price", title: "패키지 비교", desc: "패키지와 추가 옵션을 골라 금액을 확인하세요." },
    { target: "#ps-book", title: "촬영 예약", desc: "날짜와 시간대를 골라 예약을 접수하세요." },
  ],
  "nail-shop": [
    { target: "#ns-chips", title: "컬러칩", desc: "칩을 누르면 손톱에 색이 붙어요. 손톱을 먼저 누르면 하나씩 칠해요." },
    { target: "#ns-art", title: "아트 고르기", desc: "프렌치, 글리터, 마그네틱을 손톱 위에 올려 보세요." },
    { target: "#ns-menu", title: "시술 금액", desc: "베이스와 아트 개수로 시간과 금액이 바로 바뀌어요." },
    { target: "#ns-reserve", title: "예약하기", desc: "날짜, 시간, 담당을 고르고 저장한 디자인을 첨부하세요." },
  ],
  "car-detailing": [
    { target: "#cd-size", title: "차종 고르기", desc: "차종을 누르면 차 윤곽과 요금 기준이 바뀌어요." },
    { target: "#cd-menu", title: "시공 메뉴", desc: "메뉴를 여러 개 골라 합계와 소요 시간을 보세요." },
    { target: "#cd-compare", title: "비포 애프터", desc: "가운데 손잡이를 좌우로 밀어 보세요." },
    { target: "#cd-book", title: "예약하기", desc: "입고 날짜와 시간을 고르고 예약 접수를 누르세요." },
  ],
  "lighting-shop": [
    { target: "#ls-room", title: "조명 켜기", desc: "방 그림의 스위치를 눌러 조명을 켜 보세요." },
    { target: "#ls-control", title: "색온도 조절", desc: "슬라이더를 움직여 빛 색과 밝기를 바꿔 보세요." },
    { target: "#ls-products", title: "방에 걸어 보기", desc: "제품 카드에서 방에 걸어 보기를 눌러 보세요." },
    { target: "#ls-quote", title: "견적과 상담", desc: "담은 제품 합계를 보고 시공 상담을 신청해 보세요." },
  ],
  "liquor-shop": [
    { target: "#ls-filter", title: "술 고르기", desc: "도수 슬라이더나 종류 칩을 움직여 보세요." },
    { target: "#ls-grid", title: "병 재배열", desc: "조건에 맞는 병만 남고 자리를 바꿔요. 병을 누르면 맛 그래프가 열려요." },
    { target: "#ls-gift", title: "선물 세트", desc: "담기를 누르면 병이 상자 안으로 들어가요." },
    { target: "#ls-tasting", title: "시음회 예약", desc: "토요일 회차를 골라 예약해 보세요." },
  ],
  "small-wedding": [
    { target: "#sw-dday", title: "D-day", desc: "예식일을 고르면 숫자가 굴러가며 바뀝니다." },
    { target: "#sw-date", title: "예약 현황", desc: "토요일이나 일요일을 누르고 시간대를 고르세요." },
    { target: "#sw-layout", title: "홀 배치", desc: "하객 수를 밀면 테이블이 늘고 줄어요." },
  ],
  "korean-medicine": [
    { target: "#km-body", title: "아픈 부위", desc: "부위를 눌러 주로 받는 진료를 확인하세요." },
    { target: "#km-car", title: "교통사고 진료", desc: "접수번호를 넣고 본인 부담 금액을 확인하세요." },
    { target: "#km-hours", title: "진료 시간", desc: "주홍 막대로 야간 진료 요일을 확인하세요." },
    { target: "#km-reserve", title: "온라인 예약", desc: "날짜와 시간을 골라 예약해 보세요." },
  ],
  "orthopedics": [
    { target: "#os-parts", title: "부위별 증상", desc: "아픈 부위와 증상을 눌러 검사와 치료를 보세요." },
    { target: "#os-wait", title: "실시간 대기", desc: "진료실마다 지금 대기 인원을 확인하세요." },
    { target: "#os-fees", title: "비급여 진료비", desc: "항목 이름을 넣어 진료비를 찾아보세요." },
    { target: "#os-reserve", title: "진료 예약", desc: "날짜와 시간을 골라 예약을 남기세요." },
  ],
  "pediatrics": [
    { target: "#pd-queue", title: "실시간 대기", desc: "대기 인원을 보고 진료 접수를 눌러 보세요." },
    { target: "#pd-vaccine", title: "접종 일정", desc: "아이 생년월일을 넣고 다음 접종 날짜를 보세요." },
    { target: "#pd-checkup", title: "영유아검진", desc: "차수를 눌러 검진 기간과 내용을 보세요." },
  ],
  "eye-clinic": [
    { target: "#ec-compare", title: "수술 비교", desc: "라식, 라섹, 스마일라식을 눌러 각막 그림을 비교해 보세요." },
    { target: "#ec-exam", title: "정밀검사", desc: "검사 단계를 눌러 걸리는 시간을 확인하세요." },
    { target: "#ec-cataract", title: "백내장", desc: "렌즈 종류를 바꿔 거리별로 보이는 모습을 보세요." },
    { target: "#ec-book", title: "상담 예약", desc: "날짜와 시간을 골라 예약해 보세요." },
  ],
  "animal-hospital": [
    { target: "#ah-er", title: "응급 진료", desc: "지금 시각과 야간 진료 여부를 확인하세요." },
    { target: "#ah-dept", title: "진료과목", desc: "과목을 누르면 증상과 검사가 바뀌어요." },
    { target: "#ah-checkup", title: "건강검진", desc: "나이를 고르면 맞는 패키지를 알려 드려요." },
    { target: "#ah-reserve", title: "진료 예약", desc: "날짜와 시간을 골라 예약을 신청하세요." },
  ],
  "nursing-hospital": [
    { target: "#nh-room", title: "병실 안내", desc: "병실을 고르면 배치도와 월 예상 비용이 바뀝니다." },
    { target: "#nh-visit", title: "면회 예약", desc: "날짜와 시간 칸을 골라 면회를 예약하세요." },
    { target: "#nh-meal", title: "주간 식단표", desc: "요일을 누르고 일반식과 죽식을 바꿔 보세요." },
    { target: "#nh-consult", title: "입원상담", desc: "환자 상태를 고르고 상담을 신청하세요." },
  ],
  "labor-firm": [
    { target: "#lf-deadline", title: "구제신청 기한", desc: "해고일을 넣고 마감일과 남은 날을 보세요." },
    { target: "#lf-wage", title: "체불 계산", desc: "월급과 밀린 달을 넣고 받을 돈을 보세요." },
    { target: "#lf-advisory", title: "자문 요금", desc: "직원 수를 움직여 월 자문료를 보세요." },
    { target: "#lf-consult", title: "상담신청", desc: "분야와 희망일을 골라 신청해 보세요." },
  ],
  "scrivener": [
    { target: "#js-cost", title: "등기 비용", desc: "매매가와 주택 수를 넣고 견적서 금액을 보세요." },
    { target: "#js-docs", title: "준비 서류", desc: "챙긴 서류를 눌러 남은 개수를 확인하세요." },
    { target: "#js-rehab", title: "개인회생 단계", desc: "단계를 눌러 기간과 할 일을 보세요." },
    { target: "#js-apply", title: "상담신청", desc: "분야와 연락처를 넣고 접수해 보세요." },
  ],
  "patent-office": [
    { target: "#po-search", title: "상표 검색", desc: "상표 이름을 넣고 비슷한 상표를 확인하세요." },
    { target: "#po-fee", title: "비용 계산", desc: "상품류 개수를 바꿔 출원 비용 개략을 보세요." },
    { target: "#po-steps", title: "특허 절차", desc: "일반심사와 우선심사를 바꿔 기간을 비교하세요." },
    { target: "#po-consult", title: "상담신청", desc: "분야와 연락처를 남기고 접수 번호를 받아 보세요." },
  ],
  "family-law": [
    { target: "#fl-areas", title: "상담 분야", desc: "분야를 누르면 절차와 기간, 준비 서류가 바뀝니다." },
    { target: "#fl-support", title: "양육비 계산", desc: "두 부모 소득과 자녀 나이를 바꿔 월 금액을 보세요." },
    { target: "#fl-booking", title: "비공개 예약", desc: "방문과 전화를 바꿔 열리는 시간이 달라지는 걸 보세요." },
    { target: "#fl-faq", title: "자주 묻는 질문", desc: "질문을 눌러 답을 펼쳐 보세요." },
  ],
  "visa-agent": [
    { target: "#va-finder", title: "체류자격 찾기", desc: "질문 세 개에 답하고 맞는 체류자격을 확인하세요." },
    { target: "#va-extend", title: "연장 신청일", desc: "만료일을 바꿔 신청 시작일과 남은 날을 보세요." },
    { target: "#va-docs", title: "필요 서류", desc: "자격을 고르고 챙긴 서류에 체크해 보세요." },
    { target: "#va-lang", title: "영문 전환", desc: "English 를 눌러 화면 전체가 바뀌는 걸 보세요." },
  ],
  "architect-office": [
    { target: "#ar-calc", title: "규모 검토", desc: "대지 면적과 용도지역을 바꿔 층수를 보세요." },
    { target: "#ar-works", title: "작업 목록", desc: "용도를 눌러 작업을 골라 보세요." },
    { target: "#ar-process", title: "설계 기간", desc: "단계를 누르면 하는 일과 기간이 바뀌니 확인하세요." },
    { target: "#ar-contact", title: "상담신청", desc: "검토 결과를 붙여 상담을 신청하세요." },
  ],
  "presale": [
    { target: "#pv-types", title: "세대안내", desc: "타입을 누르고 평면도와 면적을 보세요." },
    { target: "#pv-price", title: "분양가 계산", desc: "층과 발코니 확장을 골라 납부 일정을 보세요." },
    { target: "#pv-visit", title: "방문예약", desc: "날짜와 시간을 골라 견본주택 방문을 예약하세요." },
    { target: "#pv-map", title: "입지환경", desc: "분류를 눌러 주변 시설까지 거리를 보세요." },
  ],
  "saas-startup": [
    { target: "#ss-plans", title: "요금제", desc: "월 결제와 연 결제를 바꿔 금액을 보세요." },
    { target: "#ss-compare", title: "기능 비교", desc: "다른 점만 보기를 눌러 요금제 차이만 보세요." },
    { target: "#ss-calc", title: "요금 계산", desc: "매장 수를 바꿔 월 합계를 보세요." },
    { target: "#ss-contact", title: "도입 문의", desc: "매장 수를 넣고 문의를 접수해 보세요." },
  ],
  "logistics": [
    { target: "#lg-cutoff", title: "출고 마감", desc: "오늘 오후 2시 마감까지 남은 시간을 보세요." },
    { target: "#lg-quote", title: "견적 계산", desc: "출고 건수와 팔레트 수를 움직여 월 비용을 보세요." },
    { target: "#lg-center", title: "센터 안내", desc: "센터를 고르면 지도와 입고 시간이 바뀝니다." },
    { target: "#lg-contact", title: "도입 상담", desc: "판매 채널을 고르고 상담을 신청해 보세요." },
  ],
  "food-oem": [
    { target: "#fo-items", title: "제조 품목", desc: "포장 형태를 골라 품목과 최소 수량을 보세요." },
    { target: "#fo-calc", title: "단가 계산", desc: "포장과 수량을 바꿔 개당 단가를 확인하세요." },
    { target: "#fo-process", title: "생산 공정", desc: "공정 칸을 눌러 관리 기준을 보세요." },
    { target: "#fo-sample", title: "샘플 의뢰", desc: "품목과 연락처를 넣어 샘플을 의뢰하세요." },
  ],
  "piano-academy": [
    { target: "#pa-course", title: "과정 고르기", desc: "건반을 눌러 과정별 진도와 교습비를 보세요." },
    { target: "#pa-timetable", title: "수업시간표", desc: "남은 자리가 있는 칸을 눌러 체험 시간을 고르세요." },
    { target: "#pa-trial", title: "체험 레슨", desc: "이름과 연락처를 넣고 체험 레슨을 신청해 보세요." },
    { target: "#pa-concert", title: "연주회 소식", desc: "공지를 눌러 연주회 날짜와 준비물을 확인하세요." },
  ],
  "taekwondo": [
    { target: "#tk-bus", title: "차량 운행", desc: "호차와 부를 고르고 정류장을 눌러 탑승 시간을 보세요." },
    { target: "#tk-time", title: "부별 시간표", desc: "부를 골라 요일별 수련 내용과 수련비를 보세요." },
    { target: "#tk-belt", title: "승급 심사", desc: "지금 띠를 고르고 다음 심사일을 확인하세요." },
    { target: "#tk-consult", title: "상담 신청", desc: "체험 수업 날짜를 골라 신청해 보세요." },
  ],
  "art-academy": [
    { target: "#aa-classes", title: "반 안내", desc: "반과 수업 횟수를 골라 월 교습비를 보세요." },
    { target: "#aa-gallery", title: "수업 작품", desc: "그림을 눌러 크게 보세요." },
    { target: "#aa-consult", title: "상담 신청", desc: "학년과 방문 시간을 골라 신청해 보세요." },
  ],
  "english-talk": [
    { target: "#et-test", title: "레벨테스트", desc: "다섯 문제를 풀고 내 레벨을 확인하세요." },
    { target: "#et-schedule", title: "반 시간표", desc: "시간대를 바꿔 남은 자리가 있는 반을 고르세요." },
    { target: "#et-fee", title: "월 수강료", desc: "등록 개월을 바꿔 교습비 합계를 보세요." },
    { target: "#et-trial", title: "무료 체험", desc: "체험 날짜를 고르고 신청해 보세요." },
  ],
  "driving-school": [
    { target: "#dr-course", title: "교육비 개략", desc: "면허 종류를 골라 교육 시간과 비용을 보세요." },
    { target: "#dr-shuttle", title: "셔틀 노선", desc: "정류장을 눌러 다음 차 시간을 보세요." },
    { target: "#dr-exam", title: "시험 일정", desc: "날짜를 눌러 회차와 남은 자리를 보세요." },
    { target: "#dr-reserve", title: "등록 예약", desc: "면허와 날짜를 골라 예약해 보세요." },
  ],
  "reading-academy": [
    { target: "#ra-books", title: "이달의 도서", desc: "학년을 골라 이번 달 책을 보세요." },
    { target: "#ra-course", title: "수업 과정", desc: "읽기, 토론, 쓰기를 눌러 보세요." },
    { target: "#ra-correct", title: "첨삭 예시", desc: "고친 곳을 눌러 표시를 보세요." },
    { target: "#ra-consult", title: "상담 신청", desc: "학년과 희망일을 골라 신청해 보세요." },
  ],
};
