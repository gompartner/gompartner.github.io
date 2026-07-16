import type { Project } from "@/lib/types";

export const projects: Project[] = [
  {
    id: "small-business-homepage",
    title: "소상공인 브랜드 홈페이지",
    description:
      "처음 홈페이지를 만드는 사업자를 위한 반응형 소개 사이트 데모입니다. 업종 소개, 서비스 안내, 문의 전환 흐름을 단순하게 구성했습니다.",
    longDescription:
      "소규모 매장, 병원, 학원, 공방, 카페처럼 빠르게 신뢰를 전달해야 하는 사업자를 가정한 데모입니다. 모바일 중심 레이아웃, 핵심 서비스 카드, 위치/문의 안내를 포함해 운영 부담을 줄이는 방향으로 설계했습니다.",
    imageUrl: "/images/projects/small-business-homepage.svg",
    purpose:
      "작은 사업장이 갖추면 좋은 홈페이지의 기본 구성을 보여드리기 위해 만든 샘플입니다.",
    problemSolved:
      "홈페이지가 없거나 오래되어 손님에게 신뢰를 주지 못하는 상황을 다룹니다.",
    features: [
      "가게·서비스 소개 페이지",
      "모바일·PC 화면 자동 맞춤",
      "오시는 길·연락처 안내",
      "문의로 이어지는 버튼 배치",
      "검색 노출 기본 설정",
    ],
    operationEffect: [
      "검색에서 찾아온 손님이 믿고 문의할 수 있습니다",
      "영업시간·위치 안내 전화가 줄어드는 효과를 기대할 수 있습니다",
    ],
    recommendedFor: [
      "처음 홈페이지를 만드는 매장·공방·카페",
      "명함 대신 보여줄 소개 페이지가 필요한 사업자",
      "네이버·구글 검색에서 가게가 나오길 원하는 분",
    ],
    buildTime: "약 2~4주",
    demoUrl: "/demo/small-business-homepage",
    period: "샘플 데모",
    featured: true,
    category: "homepage",
  },
  {
    id: "event-promotion-landing",
    title: "이벤트·프로모션 랜딩페이지",
    description:
      "광고, 이벤트, 신제품 출시, 모집 페이지에 맞춘 고전환 랜딩페이지 데모입니다. 짧은 기간 안에 핵심 메시지를 전달하도록 구성했습니다.",
    longDescription:
      "마케팅 이벤트나 프로모션을 빠르게 열어야 하는 상황을 가정한 데모입니다. 혜택 요약, 참여 방법, 일정, 자주 묻는 질문, 신청 버튼을 한 흐름으로 배치해 방문자가 망설이지 않고 행동할 수 있도록 설계했습니다.",
    imageUrl: "/images/projects/event-landing.svg",
    purpose:
      "광고를 눌러 들어온 방문자가 신청까지 하도록 이끄는 한 페이지 구성의 샘플입니다.",
    problemSolved:
      "광고비를 쓰는데 신청으로 이어지지 않는 상황을 다룹니다.",
    features: [
      "혜택·일정 한눈에 정리",
      "남은 시간 카운트다운",
      "사전등록·신청 접수",
      "자주 묻는 질문 정리",
      "광고 유입 모바일 화면 최적화",
    ],
    operationEffect: [
      "같은 광고비로 더 많은 신청을 기대할 수 있습니다",
      "이벤트마다 빠르게 페이지를 새로 열 수 있습니다",
    ],
    recommendedFor: [
      "오픈 이벤트·할인 행사를 준비하는 매장",
      "광고를 돌릴 신청 페이지가 필요한 분",
      "행사마다 문구만 바꿔 재사용하고 싶은 분",
    ],
    buildTime: "약 1주부터",
    demoUrl: "/demo/event-promotion-landing",
    period: "샘플 데모",
    featured: true,
    category: "landing",
  },
  {
    id: "reservation-inquiry-system",
    title: "예약·문의 접수 시스템",
    description:
      "상담 신청, 예약 접수, 문의 관리를 한 번에 처리하는 데모입니다. 고객 접점과 운영 흐름을 함께 고려했습니다.",
    longDescription:
      "병원, 학원, 상담 서비스, 클래스 운영처럼 예약과 문의가 반복되는 사업을 가정한 데모입니다. 고객이 남긴 예약이 관리 화면까지 이어지는 흐름을 보여줍니다.",
    imageUrl: "/images/projects/reservation-system.svg",
    purpose:
      "전화 없이도 예약과 문의를 받을 수 있는 화면 구성의 샘플입니다.",
    problemSolved:
      "영업 중에 예약 전화를 받기 어렵고, 놓친 전화가 곧 놓친 손님이 되는 상황을 다룹니다.",
    features: [
      "예약·상담 신청 접수",
      "접수 내역 확인 화면",
      "문자·이메일 알림 발송",
      "자주 묻는 질문 안내",
    ],
    operationEffect: [
      "영업시간 밖에도 예약을 받을 수 있습니다",
      "예약 내역이 기록으로 남아 관리가 쉬워집니다",
    ],
    recommendedFor: [
      "전화 예약을 놓치는 병원·학원·샵",
      "상담 신청을 정리할 곳이 필요한 분",
      "예약 확인 연락을 자동으로 보내고 싶은 분",
    ],
    buildTime: "약 4주부터",
    demoUrl: "/demo/reservation-inquiry-system",
    period: "샘플 데모",
    featured: true,
    category: "system",
  },
  {
    id: "operations-admin-dashboard",
    title: "운영 관리자 페이지",
    description:
      "게시판, 회원, 신청 내역, 파일 업로드, 엑셀 다운로드 등 운영에 필요한 관리자 기능을 모은 데모입니다.",
    longDescription:
      "홈페이지를 만든 뒤 실제 운영에서 자주 필요한 관리자 기능을 가정한 데모입니다. 공지사항, 신청 데이터, 회원 상태, 파일 관리, 엑셀 다운로드처럼 반복 업무를 줄이는 기능을 중심으로 구성했습니다.",
    imageUrl: "/images/projects/admin-dashboard.svg",
    purpose:
      "사장님이 직접 내용을 바꾸고 접수를 확인하는 관리자 화면의 샘플입니다.",
    problemSolved:
      "문구 하나 바꾸려 해도 업체에 요청하고 기다려야 하는 상황을 다룹니다.",
    features: [
      "신청·회원 현황 한 화면 확인",
      "공지사항·게시글 관리",
      "엑셀 다운로드",
      "파일 업로드·관리",
      "검색·필터로 빠른 찾기",
    ],
    operationEffect: [
      "수정을 기다리지 않고 직접 바로 반영할 수 있습니다",
      "접수와 현황을 한 화면에서 파악할 수 있습니다",
    ],
    recommendedFor: [
      "신청 내역을 엑셀로 정리하고 싶은 분",
      "직원 누구나 쓸 수 있는 관리 화면이 필요한 분",
      "운영 업무에 쓰는 시간을 줄이고 싶은 분",
    ],
    buildTime: "약 4주부터",
    demoUrl: "/demo/operations-admin-dashboard",
    period: "샘플 데모",
    featured: true,
    category: "admin",
  },
  {
    id: "api-automation-hub",
    title: "업무 자동화 데모",
    description:
      "문자 발송, 시트 기록, 상태 변경처럼 반복되는 수작업을 자동으로 처리하는 데모입니다. 작은 서비스도 필요한 만큼 자동화할 수 있습니다.",
    longDescription:
      "상담 신청이 들어오면 알림톡을 보내고, 결제가 완료되면 주문 상태를 바꾸고, 신청 내역을 구글 시트에 기록하는 것처럼 반복되는 업무를 자동으로 처리하는 구성을 보여줍니다. 처음부터 과하게 만들기보다 사업 흐름에 필요한 것부터 단계적으로 늘리는 방향입니다.",
    imageUrl: "/images/projects/api-automation.svg",
    purpose:
      "문의 접수, 알림 발송처럼 매번 손으로 하던 일을 자동으로 처리하는 흐름의 샘플입니다.",
    problemSolved:
      "반복 업무에 시간을 빼앗겨 정작 본업에 집중하기 어려운 상황을 다룹니다.",
    features: [
      "문자·알림톡 자동 발송",
      "구글 시트 자동 기록",
      "결제·주문 상태 자동 변경",
      "처리 내역 확인 화면",
    ],
    operationEffect: [
      "반복 업무 시간이 줄어드는 효과를 기대할 수 있습니다",
      "놓치는 문의와 알림이 줄어듭니다",
    ],
    recommendedFor: [
      "신청 올 때마다 수동으로 안내 문자를 보내는 분",
      "접수 내역을 매번 엑셀에 옮겨 적는 분",
      "혼자 운영해서 반복 업무를 줄여야 하는 분",
    ],
    buildTime: "약 2주부터",
    demoUrl: "/demo/api-automation-hub",
    period: "샘플 데모",
    category: "operation",
  },
  {
    id: "saas-product-landing",
    title: "SaaS 제품 랜딩페이지",
    description:
      "예약·노쇼 관리 서비스 '노쇼가드'를 가정한 제품 소개 랜딩페이지 데모입니다. 기능 소개, 요금제, 도입 효과 계산기까지 실제 서비스 수준의 구성을 담았습니다.",
    longDescription:
      "소상공인 대상 온라인 서비스를 출시하는 상황을 가정한 데모입니다. 제품 소개, 문제 제기, 핵심 기능, 고객 후기, 요금제, 자주 묻는 질문으로 이어지는 흐름을 설계했고, 방문자가 직접 조작하는 노쇼 손실 계산기로 도입 효과를 수치로 체감하게 했습니다.",
    imageUrl: "/images/projects/saas-product-landing.svg",
    purpose:
      "서비스·제품을 소개하고 가입으로 연결하는 소개 페이지의 샘플입니다.",
    problemSolved:
      "제품은 있는데 소개할 페이지가 없어 설명을 매번 반복해야 하는 상황을 다룹니다.",
    features: [
      "제품 소개·기능 안내",
      "요금제 비교표",
      "손실 절감 계산기 (직접 조작)",
      "고객 후기·자주 묻는 질문",
    ],
    operationEffect: [
      "링크 하나로 제품을 설명할 수 있습니다",
      "방문자가 가입·문의까지 이어지는 흐름을 기대할 수 있습니다",
    ],
    recommendedFor: [
      "온라인 서비스·구독 상품을 출시하는 분",
      "요금제가 있는 제품 소개 페이지가 필요한 분",
      "도입 효과를 숫자로 보여주고 싶은 분",
    ],
    buildTime: "약 2~4주",
    demoUrl: "/demo/saas-product-landing",
    period: "샘플 데모",
    category: "landing",
  },
];
