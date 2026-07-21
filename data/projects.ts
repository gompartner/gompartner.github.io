import type { Project } from "@/lib/types";

export const projects: Project[] = [
  {
    id: "small-business-homepage",
    title: "프라이빗 짐 브랜드 홈페이지",
    description:
      "스튜디오 안으로 걸어 들어가는 영상으로 시작하는 프라이빗 헬스장 예약 서비스 데모입니다. 지도에서 지점을 고르고 날짜·시간을 선택해 결제까지 이어지는 예약 흐름을 담았습니다.",
    longDescription:
      "한 번에 한 팀만 이용하는 프라이빗 짐 공간 대여 서비스를 가정한 데모입니다. 직접 그린 서울 일러스트 지도에서 지점을 고르면 지점 카드와 연동되고, 날짜·시간 선택, 예약 확인, 결제, 입장 QR 발급까지 실제 예약 서비스처럼 진행됩니다. 예약 진행 단계는 상단 고정 검색바의 스테퍼로 항상 보입니다.",
    imageUrl: "/images/projects/small-business-homepage.svg",
    purpose:
      "공간 대여형 사업이 갖추면 좋은 홈페이지 구성을 보여드리기 위해 만든 샘플입니다.",
    problemSolved:
      "홈페이지가 없거나 오래되어 공간의 분위기를 손님에게 전달하지 못하는 상황을 다룹니다.",
    features: [
      "공간 안으로 들어가는 영상 첫 화면",
      "지도에서 지점 선택 (직접 그린 서울 지도)",
      "날짜·시간 선택 → 결제 → QR 발급 예약 흐름",
      "예약 내역 저장 (재방문 시 유지)",
      "후기·요금·자주 묻는 질문 안내",
    ],
    operationEffect: [
      "전화 없이 예약과 결제를 받을 수 있습니다",
      "예약 가능 시간 문의 전화가 줄어드는 효과를 기대할 수 있습니다",
    ],
    recommendedFor: [
      "프라이빗 짐·PT숍처럼 시간제로 공간을 빌려주는 업종",
      "파티룸·스터디룸·연습실 등 공간 대여 사업자",
      "지점이 여러 곳이라 지도로 안내하고 싶은 분",
    ],
    buildTime: "약 2~4주",
    demoUrl: "/demo/small-business-homepage",
    period: "샘플 데모",
    featured: true,
    category: "homepage",
  },
];
