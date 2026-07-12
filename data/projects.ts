import type { Project } from "@/lib/types";

export const projects: Project[] = [
  {
    id: "small-business-homepage",
    title: "소상공인 브랜드 홈페이지",
    description:
      "처음 홈페이지를 만드는 사업자를 위한 반응형 소개 사이트 데모입니다. 업종 소개, 서비스 안내, 문의 전환 흐름을 단순하게 구성했습니다.",
    longDescription:
      "소규모 매장, 병원, 학원, 공방, 카페처럼 빠르게 신뢰를 전달해야 하는 사업자를 가정한 데모입니다. 모바일 중심 레이아웃, 핵심 서비스 카드, 위치/문의 CTA, 기본 SEO 구조를 포함해 운영 부담을 줄이는 방향으로 설계했습니다.",
    imageUrl: "/images/projects/small-business-homepage.svg",
    techStack: ["Next.js", "TypeScript", "TailwindCSS", "SEO", "Responsive UI"],
    demoUrl: "/demo/small-business-homepage",
    achievements: [
      "모바일, 태블릿, PC 반응형 구조 적용",
      "문의 전환을 위한 CTA와 섹션 흐름 설계",
      "검색 노출을 고려한 기본 메타데이터 구성",
    ],
    responsibilities: [
      "업종별 소개/서비스/문의 섹션 구조 설계",
      "반응형 UI 컴포넌트 제작",
      "운영자가 수정하기 쉬운 데이터 기반 콘텐츠 구성",
      "기본 SEO와 접근성 고려",
    ],
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
      "마케팅 이벤트나 프로모션을 빠르게 열어야 하는 상황을 가정한 데모입니다. 혜택 요약, 참여 방법, 일정, FAQ, 신청 버튼을 한 흐름으로 배치해 방문자가 망설이지 않고 행동할 수 있도록 설계했습니다.",
    imageUrl: "/images/projects/event-landing.svg",
    techStack: ["Next.js", "TypeScript", "TailwindCSS", "CTA", "Analytics Ready"],
    demoUrl: "/demo/event-promotion-landing",
    achievements: [
      "광고 유입 후 신청까지 이어지는 단일 흐름 구성",
      "이벤트 일정, 혜택, FAQ를 한 페이지에서 확인",
      "캠페인별 빠른 복제와 문구 교체가 가능한 구조",
    ],
    responsibilities: [
      "프로모션 목적에 맞는 정보 우선순위 설계",
      "신청/문의 전환 CTA 배치",
      "모바일 광고 유입을 고려한 화면 최적화",
      "운영 중 문구와 일정 변경이 쉬운 구조 설계",
    ],
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
      "병원, 학원, 상담 서비스, 클래스 운영처럼 예약과 문의가 반복되는 사업을 가정한 데모입니다. 고객 입력 폼, 상태 관리, 알림 연동, 관리자 확인 흐름까지 이어지는 구조를 보여줍니다.",
    imageUrl: "/images/projects/reservation-system.svg",
    techStack: ["Next.js", "TypeScript", "Form", "Email", "Admin Flow"],
    demoUrl: "/demo/reservation-inquiry-system",
    achievements: [
      "상담 신청과 예약 접수를 하나의 흐름으로 통합",
      "접수 상태와 담당자 확인 흐름을 관리자 화면으로 연결",
      "문자·이메일 알림 연동을 고려한 확장 구조",
    ],
    responsibilities: [
      "예약/문의 입력 항목과 상태값 설계",
      "운영자가 확인하기 쉬운 접수 목록 UI 구성",
      "알림 연동과 개인정보 입력 흐름 고려",
      "반복 문의 대응을 위한 FAQ/가이드 섹션 구성",
    ],
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
    techStack: ["Next.js", "TypeScript", "Dashboard UI", "Excel", "File Upload"],
    demoUrl: "/demo/operations-admin-dashboard",
    achievements: [
      "반복 운영 업무를 줄이는 관리자 메뉴 구조 설계",
      "신청/회원/게시글 상태를 한 화면에서 확인",
      "엑셀 다운로드와 파일 관리 확장 가능",
    ],
    responsibilities: [
      "운영자 역할에 맞춘 메뉴와 권한 흐름 설계",
      "목록/검색/필터/상태 변경 UI 구성",
      "엑셀 다운로드와 파일 업로드 기능 구조 설계",
      "운영 공수를 줄이는 관리자 UX 개선",
    ],
    period: "샘플 데모",
    featured: true,
    category: "admin",
  },
  {
    id: "api-automation-hub",
    title: "API 연동 자동화 데모",
    description:
      "문자, 이메일, 결제, 외부 시스템 연동으로 수작업을 줄이는 자동화 데모입니다. 작은 서비스도 필요한 만큼 자동화할 수 있습니다.",
    longDescription:
      "상담 신청 후 알림 발송, 결제 완료 후 상태 변경, 외부 시스템으로 데이터 전달처럼 반복되는 업무를 자동화하는 구성을 보여줍니다. 처음부터 과하게 만들기보다 사업 흐름에 필요한 연동부터 단계적으로 확장하는 방향입니다.",
    imageUrl: "/images/projects/api-automation.svg",
    techStack: ["Node.js", "TypeScript", "REST API", "Webhook", "Email/SMS"],
    demoUrl: "/demo/api-automation-hub",
    achievements: [
      "반복 안내와 상태 변경 업무 자동화",
      "외부 서비스 연동을 고려한 API 구조 설계",
      "추후 결제, 알림, CRM 연동으로 확장 가능",
    ],
    responsibilities: [
      "업무 흐름에 맞춘 API 연동 범위 정의",
      "Webhook 기반 상태 변경 흐름 설계",
      "문자·이메일 발송과 실패 대응 흐름 고려",
      "운영자가 확인할 수 있는 연동 로그 화면 구성",
    ],
    period: "샘플 데모",
    category: "operation",
  },
  {
    id: "saas-product-landing",
    title: "SaaS 제품 랜딩페이지",
    description:
      "예약·노쇼 관리 SaaS '노쇼가드'를 가정한 제품 소개 랜딩페이지 데모입니다. 기능 소개, 요금제, 도입 효과 계산기까지 실제 서비스 수준의 구성을 담았습니다.",
    longDescription:
      "소상공인 대상 SaaS 제품을 출시하는 상황을 가정한 데모입니다. 히어로, 문제 제기, 핵심 기능, 고객 후기, 요금제, FAQ로 이어지는 전환 흐름을 설계했고, 방문자가 직접 조작하는 노쇼 손실 계산기로 도입 효과를 수치로 체감하게 했습니다.",
    imageUrl: "/images/projects/saas-product-landing.svg",
    techStack: ["Next.js", "TypeScript", "TailwindCSS", "Framer Motion", "Pricing UI"],
    demoUrl: "/demo/saas-product-landing",
    achievements: [
      "제품 이해부터 요금제 선택까지 이어지는 단일 전환 흐름 구성",
      "노쇼 손실 계산기로 도입 효과를 수치로 체감하도록 설계",
      "요금제·FAQ·후기 등 SaaS 마케팅 페이지 표준 구성 적용",
    ],
    responsibilities: [
      "SaaS 제품 메시지와 섹션 우선순위 설계",
      "요금제 비교와 CTA 배치 설계",
      "인터랙티브 계산기 UI 구현",
      "모바일 우선 반응형 레이아웃 구성",
    ],
    period: "샘플 데모",
    category: "landing",
  },
];
