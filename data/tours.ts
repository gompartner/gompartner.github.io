// 데모 사용법 가이드. 프라이빗 짐 데모(HomepageDemo)의 스포트라이트 가이드와 같은 방식으로,
// 화면의 해당 영역을 비추며 몇 단계로 안내한다. 사용법은 글로 길게 풀지 않고 여기서만 안내한다.
// target은 CSS 선택자. 제목(h2 등)을 가리키면 그 제목이 속한 section을 비춘다. 화면에 없으면 그 단계는 건너뛴다.
// 프라이빗 짐 데모는 자체 가이드가 있어서 여기 넣지 않는다.
export interface TourStep {
  target: string;
  title: string;
  desc: string;
}

export const tours: Record<string, TourStep[]> = {
  "online-store": [
    { target: "#shop", title: "그릇 고르기", desc: "그릇을 눌러 유약 색과 각인을 고르세요." },
    { target: "#delivery", title: "도착일", desc: "받을 지역을 바꾸세요." },
  ],
  "shop-admin": [
    { target: "#opt-title", title: "옵션 입력", desc: "옵션 값을 더하거나 빼세요." },
    { target: "#combo-title", title: "조합별 재고", desc: "조합 여러 개를 골라 재고를 한 번에 넣으세요." },
    { target: "#orders-title", title: "주문 처리", desc: "주문을 골라 상태를 한꺼번에 바꾸세요." },
  ],
  pension: [
    { target: "#rooms", title: "방 고르기", desc: "배치도에서 방을 누르세요." },
    { target: "#booking", title: "날짜 고르기", desc: "입실일, 퇴실일 순서로 누르세요." },
  ],
  company: [
    { target: "#check", title: "가공 가능 여부", desc: "재질과 크기를 넣으세요." },
    { target: "#quote", title: "견적 문의", desc: "도면 파일을 붙일 수 있습니다." },
  ],
  "cert-lab": [
    { target: "#finder", title: "인증 찾기", desc: "전원 방식, 무선 기능, 판매 국가를 고르세요." },
    { target: "#track", title: "진행 조회", desc: "접수번호로 시험 단계를 확인합니다." },
  ],
  "dental-homepage": [
    { target: "#map", title: "불편한 이", desc: "아픈 이를 누르세요." },
    { target: "#reserve", title: "예약", desc: "진료 항목, 날짜, 시간 순서로 고르세요." },
  ],
  pharmacy: [
    { target: "#rx-title", title: "처방전 미리 보내기", desc: "처방전 사진을 올리세요." },
    { target: "#pillbox", title: "복약 시간표", desc: "만든 시간표는 인쇄할 수 있습니다." },
    { target: "#stock", title: "상비약", desc: "증상으로 찾으세요." },
  ],
  "clinic-report": [
    { target: '[aria-label="진행 단계"]', title: "결과지 만들기", desc: "고객 선택, 측정값 입력, 인쇄 순서로 진행합니다." },
  ],
  "law-firm": [
    { target: "#guide", title: "내 상황 고르기", desc: "지금 겪는 일을 고르세요." },
    { target: "#booking", title: "상담 예약", desc: "상담 방식을 먼저 고르세요." },
  ],
  "tax-office": [
    { target: "#calendar", title: "신고 달력", desc: "사업자 유형을 고르세요." },
    { target: "#fee", title: "기장료", desc: "매출 구간과 직원 수를 바꾸세요." },
  ],
  "real-estate": [
    { target: "#map", title: "매물 찾기", desc: "지도에서 매물을 누르세요." },
    { target: "#compare", title: "비용 비교", desc: "전세와 월세 조건을 바꾸세요." },
    { target: "#visit", title: "보러 가기", desc: "담아 둔 매물을 한 번에 신청합니다." },
  ],
  "pilates-studio": [
    { target: "#find", title: "수업 추천", desc: "질문 세 개에 답하세요." },
    { target: "#schedule", title: "시간표", desc: "남은 자리가 있는 수업을 누르세요." },
  ],
  "hanok-cafe": [
    { target: "#reserve", title: "자리 예약", desc: "평면도에서 방을 누르세요." },
  ],
  "bakery-cafe": [
    { target: "#oven", title: "빵 나오는 시간", desc: "시계를 움직이세요." },
    { target: "#order", title: "픽업 주문", desc: "빵을 담고 찾으러 올 시간을 고르세요." },
  ],
  "excel-automation": [
    { target: '[aria-label="주문 파일 올리기"]', title: "파일 올리기", desc: "거래처 주문 엑셀을 올리세요." },
  ],
  lms: [
    { target: '[aria-label="강의 보기"]', title: "강의 듣기", desc: "영상을 건너뛰세요. 진도가 오르지 않습니다." },
    { target: '[aria-label="화면 선택"]', title: "관리자 화면", desc: "관리자로 바꾸세요." },
  ],
  "job-portal": [
    { target: '[aria-label="상세 조건"]', title: "조건 검색", desc: "지역, 직종, 경력, 급여를 고르세요." },
  ],
  "maintenance-dashboard": [
    { target: '[aria-label="수정 요청 목록"]', title: "수정 요청", desc: "요청을 눌러 처리하세요." },
  ],
  "district-portal": [
    { target: "#phone", title: "부서 전화번호", desc: "부서 이름이나 하는 일로 찾으세요." },
  ],
  "program-application": [
    { target: '[aria-label="화면 선택"]', title: "신청자와 담당자", desc: "화면을 바꿔 가며 확인하세요." },
  ],
  "flower-expo": [
    { target: "#course", title: "관람 동선", desc: "밑줄 친 말을 바꾸세요." },
    { target: "#ticket", title: "입장료", desc: "인원을 넣으세요." },
  ],
  "accessibility-review": [
    { target: '[aria-label="비교 화면 선택"]', title: "개선 전후", desc: "개선 전과 후를 바꾸세요." },
  ],
  "retirement-calculator": [
    { target: "#input-title", title: "내 정보", desc: "나이, 저축액, 생활비를 바꾸세요." },
    { target: '[aria-label="투자 성향"]', title: "투자 성향", desc: "성향을 바꾸면 그래프가 다시 그려집니다." },
  ],
};
