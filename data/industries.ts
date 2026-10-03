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
}

export const industries: Industry[] = [
  {
    slug: "hospital",
    field: "병원",
    label: "병원·약국",
    title: "병원·약국 홈페이지 제작",
    description:
      "피부과, 치과, 약국 홈페이지와 진료 결과지 프로그램 제작 사례입니다. 진료시간 안내, 온라인 예약, 처방전 미리 보내기를 데모에서 직접 눌러 볼 수 있습니다.",
    needs: ["오늘 진료시간과 휴진일 안내", "비급여 진료비 공개", "온라인 예약 신청", "처방전 미리 보내기, 복약 안내"],
  },
  {
    slug: "store",
    field: "가게·매장",
    label: "카페·가게",
    title: "카페·가게 홈페이지 제작",
    description:
      "카페, 빵집, 필라테스, 헬스장 홈페이지와 쇼핑몰 관리자, 주문 엑셀 자동화 제작 사례입니다. 메뉴 안내, 자리 예약, 픽업 주문을 데모에서 직접 눌러 볼 수 있습니다.",
    needs: ["메뉴와 가격, 영업시간 안내", "자리·수업 예약", "미리 주문하고 찾아가는 픽업", "주문 정리와 재고 관리"],
  },
];
