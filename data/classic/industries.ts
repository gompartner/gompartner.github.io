import type { Field } from "./workFilters";

// 업종별 샘플 페이지(/works/[slug]). 검색에 걸리도록 고객이 찾는 말을 제목과 설명에 쓴다.
// 업종마다 데모가 2개 이상일 때만 추가한다.
export interface Industry {
  slug: string;
  field: Field;
  label: string;
  title: string;
  description: string;
  keywords: string[];
  needs: string[];
  image: string;
  imageAlt: string;
}

export const industries: Industry[] = [
  {
    slug: "hospital",
    field: "병원",
    label: "병원, 약국",
    title: "병원, 약국 홈페이지 제작",
    description:
      "치과, 피부과, 한의원, 정형외과, 소아과, 안과, 동물병원, 요양병원, 약국 홈페이지 시안 카탈로그. 진료과마다 시안 두 가지를 비교하고 눌러서 바로 체험할 수 있습니다.",
    keywords: ["치과 홈페이지 제작", "피부과 홈페이지 제작", "약국 홈페이지 제작", "병원 홈페이지 제작", "진료 예약 홈페이지", "비급여 진료비 안내"],
    needs: ["진료시간, 휴진 안내", "비급여 진료비 고지", "진료 과목, 의료진 안내", "복약 안내, 휴일 운영 안내"],
    image: "/images/industry/hospital.jpg",
    imageAlt: "흰 벽과 파란 의자가 있는 밝은 병원 대기실",
  },
  {
    slug: "store",
    field: "매장",
    label: "카페, 매장",
    title: "카페, 매장 홈페이지 제작",
    description:
      "카페, 빵집, 한식당, 미용실, 네일샵, 안경원, 공방, 보틀숍 홈페이지 시안 카탈로그. 가게마다 시안 두 가지를 비교하고 눌러서 바로 체험할 수 있습니다.",
    keywords: ["카페 홈페이지 제작", "빵집 홈페이지 제작", "미용실 홈페이지 제작", "필라테스 홈페이지 제작", "식당 홈페이지 제작", "소상공인 홈페이지 제작"],
    needs: ["메뉴, 가격, 영업시간 안내", "대표 상품, 시술 사진", "수업 시간표", "오시는 길, 주차"],
    image: "/images/industry/store.jpg",
    imageAlt: "큰 화분과 창가 테이블이 있는 카페 안",
  },
  {
    slug: "stay",
    field: "숙박과 공간",
    label: "숙박, 공간",
    title: "펜션, 캠핑장, 웨딩, 공유오피스 홈페이지 제작",
    description:
      "펜션, 캠핑장, 스몰웨딩, 공유오피스 홈페이지 시안 카탈로그. 공간마다 시안 두 가지를 비교하고 눌러서 바로 체험할 수 있습니다.",
    keywords: ["펜션 홈페이지 제작", "캠핑장 홈페이지 제작", "글램핑 홈페이지 제작", "스몰웨딩 홈페이지 제작", "공유오피스 홈페이지 제작", "숙박 홈페이지 제작"],
    needs: ["객실, 공간 사진 안내", "이용 요금, 수용 인원", "입실, 이용 수칙", "오시는 길, 주차"],
    image: "/images/industry/stay.jpg",
    imageAlt: "숲 속 키 큰 소나무 사이 삼각 지붕 목조 독채",
  },
  {
    slug: "professional",
    field: "전문직과 부동산",
    label: "법률, 세무, 부동산",
    title: "법률사무소, 세무사, 부동산 홈페이지 제작",
    description:
      "법률사무소, 세무회계, 노무, 법무사, 특허, 행정사, 건축사, 공인중개사, 분양 홈페이지 시안 카탈로그. 사무소마다 시안 두 가지를 비교하고 눌러서 바로 체험할 수 있습니다.",
    keywords: ["법률사무소 홈페이지 제작", "변호사 홈페이지 제작", "세무사 홈페이지 제작", "세무회계사무소 홈페이지 제작", "공인중개사 홈페이지 제작", "부동산 홈페이지 제작"],
    needs: ["업무분야, 비용 안내", "상담 접수", "절차, 일정 안내", "준비 서류 안내"],
    image: "/images/industry/professional.jpg",
    imageAlt: "긴 회의 탁자와 창이 있는 조용한 회의실",
  },
  {
    slug: "company",
    field: "기업",
    label: "기업, 제조",
    title: "기업, 제조업 홈페이지 제작",
    description:
      "정밀가공, 시험인증, 식품 OEM, 물류, IT 서비스 회사 홈페이지 시안 카탈로그. 회사마다 시안 두 가지를 비교하고 눌러서 바로 체험할 수 있습니다.",
    keywords: ["회사 홈페이지 제작", "제조업 홈페이지 제작", "기업 홈페이지 제작", "시험인증기관 홈페이지 제작", "영문 홈페이지 제작", "제품 소개 홈페이지 제작"],
    needs: ["회사 소개, 연혁, 인증", "설비, 제품 사양 안내", "도면 첨부 견적 문의", "국문, 영문 전환"],
    image: "/images/industry/company.jpg",
    imageAlt: "CNC 밀링 공구가 금속 부품을 가공하는 모습",
  },
  {
    slug: "academy",
    field: "학원과 교육",
    label: "학원, 교육",
    title: "학원 홈페이지 제작",
    description:
      "보습학원, 영어회화, 피아노, 태권도, 미술, 독서논술, 운전학원 홈페이지 시안 카탈로그. 학원마다 시안 두 가지를 비교하고 눌러서 바로 체험할 수 있습니다.",
    keywords: ["학원 홈페이지 제작", "보습학원 홈페이지 제작", "수학학원 홈페이지", "영어학원 홈페이지", "레벨테스트 예약", "교습비 게시 홈페이지"],
    needs: ["반 편성, 시간표 안내", "레벨테스트, 상담 안내", "교습비 게시", "차량 운행 노선"],
    image: "/images/demo-academy/hero.jpg",
    imageAlt: "저녁 불이 켜진 학원 교실, 책상 위에 펼친 문제집과 연필",
  },
];
