import type { Field } from "./workFilters";

// 업종별 제작 사례 페이지(/works/[slug]). 검색에 걸리도록 사장님들이 찾는 말을 제목과 설명에 쓴다.
// 업종마다 데모가 2개 이상일 때만 추가한다.
export interface Industry {
  slug: string;
  field: Field;
  label: string;
  title: string;
  description: string;
  needs: string[];
  image: string;
  imageAlt: string;
}

export const industries: Industry[] = [
  {
    slug: "hospital",
    field: "병원",
    label: "병원·약국",
    title: "병원·약국 홈페이지 제작",
    description:
      "피부과, 치과, 약국 홈페이지와 진료 결과지 프로그램 제작 사례. 진료시간 안내, 상담예약, 비급여 진료비, 처방전 전송을 데모로 볼 수 있습니다.",
    needs: ["오늘 진료시간과 휴진일 안내", "비급여 진료비 공개", "온라인 예약 신청", "처방전 미리 보내기, 복약 안내"],
    image: "/images/demo-dental/lobby.jpg",
    imageAlt: "민트색 벽과 흰 접수대가 있는 밝은 병원 대기실",
  },
  {
    slug: "store",
    field: "가게·매장",
    label: "카페·가게",
    title: "카페·가게 홈페이지 제작",
    description:
      "카페, 빵집, 필라테스, 헬스장 홈페이지와 쇼핑몰 관리자, 주문 엑셀 자동화 제작 사례. 메뉴판, 좌석 예약, 픽업 예약, 수업 시간표가 있습니다.",
    needs: ["메뉴와 가격, 영업시간 안내", "자리·수업 예약", "미리 주문하고 찾아가는 픽업", "주문 정리와 재고 관리"],
    image: "/images/demo-bakery/display.jpg",
    imageAlt: "크루아상과 깜파뉴, 크림빵이 놓인 빵집 진열대",
  },
  {
    slug: "professional",
    field: "전문직·부동산",
    label: "법률·세무·부동산",
    title: "법률사무소·세무사·부동산 홈페이지 제작",
    description:
      "법률사무소, 세무회계 사무소, 공인중개사사무소 홈페이지 제작 사례. 사건별 절차, 세무일정, 매물검색, 상담신청.",
    needs: ["분야별 업무와 비용 안내", "상담 예약과 접수", "상황별 절차·일정 안내", "매물·사례 목록과 검색"],
    image: "/images/demo-law/hero.jpg",
    imageAlt: "책장과 긴 회의 탁자가 있는 조용한 상담실",
  },
  {
    slug: "company",
    field: "기업",
    label: "기업·제조",
    title: "기업·제조업 홈페이지 제작",
    description:
      "제조업 회사 홈페이지와 자사 쇼핑몰, 주문 관리자, 엑셀 자동화, 사내 교육 시스템 제작 사례입니다. 설비현황과 견적문의, 한영 전환 화면을 데모로 볼 수 있습니다.",
    needs: ["회사 소개와 연혁, 인증", "설비·제품 사양 안내", "도면 첨부 견적 문의", "한국어·영어 전환"],
    image: "/images/demo-company/hero.jpg",
    imageAlt: "CNC 가공 설비가 줄지어 놓인 밝은 공장 안",
  },
];
