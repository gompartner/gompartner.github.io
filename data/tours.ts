// 업무 프로그램 데모의 사용법 가이드. 프라이빗 짐 데모(HomepageDemo)의 스포트라이트 가이드와 같은 방식으로
// 화면의 해당 영역을 비추며 몇 단계로 안내한다. 물음표 버튼을 눌렀을 때만 연다.
// 손님이 쓰는 홈페이지 데모에는 넣지 않는다. 설명 없이 못 쓰는 사이트처럼 보이기 때문이다.
// target은 CSS 선택자. 제목(h2 등)을 가리키면 그 제목이 속한 section을 비춘다. 화면에 없으면 그 단계는 건너뛴다.
// 프라이빗 짐 데모는 자체 가이드가 있어서 여기 넣지 않는다.
export interface TourStep {
  target: string;
  title: string;
  desc: string;
}

export const tours: Record<string, TourStep[]> = {
  "shop-admin": [
    { target: "#opt-title", title: "옵션 입력", desc: "옵션 값을 더하거나 빼 보세요." },
    { target: "#combo-title", title: "조합별 재고", desc: "조합 여러 개를 골라 재고를 한 번에 넣어 보세요." },
    { target: "#orders-title", title: "주문 처리", desc: "주문을 골라 상태를 한꺼번에 바꿔 보세요." },
  ],
  "clinic-report": [
    { target: '[aria-label="진행 단계"]', title: "결과지 만들기", desc: "고객 선택, 측정값 입력, 인쇄 순서로 진행합니다." },
  ],
  "excel-automation": [
    { target: '[aria-label="주문 파일 올리기"]', title: "파일 올리기", desc: "거래처 주문 엑셀을 올려 보세요." },
  ],
  lms: [
    { target: '[aria-label="강의 보기"]', title: "강의 듣기", desc: "영상을 건너뛰어 보세요. 진도가 오르지 않습니다." },
    { target: '[aria-label="화면 선택"]', title: "관리자 화면", desc: "관리자로 바꿔 보세요." },
  ],
  "maintenance-dashboard": [
    { target: '[aria-label="수정 요청 목록"]', title: "수정 요청", desc: "요청을 눌러 처리해 보세요." },
  ],
  "program-application": [
    { target: '[aria-label="화면 선택"]', title: "신청자와 담당자", desc: "화면을 바꿔 가며 보세요." },
  ],
};
