// 데모 사용법 가이드. 프라이빗 짐 데모(HomepageDemo)의 스포트라이트 가이드와 같은 방식으로
// 화면의 해당 영역을 비추며 몇 단계로 안내한다. 첫 영역이 보일 때 한 번 자동으로 열고 물음표 버튼으로 다시 연다.
// target은 CSS 선택자. 제목(h2 등)을 가리키면 그 제목이 속한 section을 비춘다. 화면에 없으면 그 단계는 건너뛴다.
// 데모 첫 화면에 있는 요소만 가리킨다. 프라이빗 짐 데모는 자체 가이드가 있어서 여기 넣지 않는다.
export interface TourStep {
  target: string;
  title: string;
  desc: string;
}

export const tours: Record<string, TourStep[]> = {
  "online-store": [
    { target: "#best", title: "BEST", desc: "상품을 누르면 상세 화면에서 유약 색과 각인을 고를 수 있습니다." },
  ],
  "shop-admin": [
    { target: "#opt-title", title: "옵션관리", desc: "옵션 값을 더하거나 빼세요." },
    { target: "#combo-title", title: "품목 목록", desc: "품목 여러 개를 골라 재고를 한 번에 넣으세요." },
    { target: "#orders-title", title: "주문관리", desc: "주문을 골라 상태를 한꺼번에 바꾸세요." },
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
  "pilates-studio": [
    { target: "#schedule", title: "그룹 시간표", desc: "잔여 자리가 있는 수업을 누르세요." },
    { target: "#lesson-finder", title: "레슨 찾기", desc: "질문 세 개에 답하세요." },
  ],
  "hanok-cafe": [
    { target: "#space", title: "좌석 예약", desc: "평면도에서 방을 누르세요." },
    { target: "#menu-picker", title: "메뉴", desc: "밑줄 친 말을 바꾸세요." },
    { target: "#way", title: "오시는 길", desc: "단계를 누르면 경로가 표시됩니다." },
  ],
  "bakery-cafe": [
    { target: "#oven", title: "빵 나오는 시간", desc: "시계를 움직이세요." },
    { target: "#menu", title: "메뉴", desc: "빵을 담고 예약하기를 누르세요." },
  ],
  "excel-automation": [
    { target: '[aria-label="주문 파일 올리기"]', title: "엑셀 업로드", desc: "거래처 주문 엑셀을 올리세요." },
  ],
  lms: [
    { target: '[aria-label="강의 보기"]', title: "학습하기", desc: "영상을 건너뛰면 진도율이 오르지 않습니다." },
    { target: '[aria-label="화면 선택"]', title: "관리자 화면", desc: "관리자로 바꾸세요." },
  ],
  "job-portal": [
    { target: "#job-search", title: "검색", desc: "검색어를 넣고 검색을 누르세요." },
    { target: '[aria-label="많이 찾은 검색어"]', title: "많이 찾은 검색어", desc: "검색어를 누르면 바로 검색됩니다." },
    { target: "#detail-search-toggle", title: "상세검색", desc: "지역, 직종, 경력, 임금을 고르세요." },
  ],
  "maintenance-dashboard": [
    { target: '[aria-label="수정 요청 목록"]', title: "유지보수 요청", desc: "요청을 눌러 처리하세요." },
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
    { target: '[aria-label="비교 화면 선택"]', title: "개선 전후", desc: "개선 전과 후를 바꾸세요." },
  ],
  "retirement-calculator": [
    { target: "#input-title", title: "내 정보", desc: "나이, 저축액, 생활비를 바꾸세요." },
    { target: '[aria-label="투자 성향"]', title: "투자 성향", desc: "성향을 바꾸면 그래프가 다시 그려집니다." },
  ],
};
