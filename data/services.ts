import {
  Globe2,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  Workflow,
  Wrench,
  type LucideIcon,
} from "lucide-react";

// preview: Services 카드에 보여줄 화면 미리보기 종류 (DemoPreview와 공유)
export type ServicePreview =
  | "homepage"
  | "landing"
  | "system"
  | "admin"
  | "operation"
  | "maintenance";

export interface ServiceItem {
  icon: LucideIcon;
  title: string;
  description: string;
  preview: ServicePreview;
}

export const services: ServiceItem[] = [
  {
    icon: Globe2,
    title: "홈페이지 제작",
    description:
      "검색에 잡히고, 신뢰를 주고, 문의로 이어지는 홈페이지를 만듭니다. 모바일부터 PC까지 자연스럽게 동작합니다.",
    preview: "homepage",
  },
  {
    icon: Megaphone,
    title: "랜딩페이지 제작",
    description:
      "광고비가 아깝지 않도록, 방문자가 신청까지 도달하는 흐름을 설계해 빠르게 제작합니다.",
    preview: "landing",
  },
  {
    icon: MessageSquare,
    title: "예약·문의 시스템",
    description:
      "전화를 놓쳐도 예약과 문의가 쌓입니다. 접수부터 알림 발송까지 자동으로 연결합니다.",
    preview: "system",
  },
  {
    icon: LayoutDashboard,
    title: "관리자 시스템",
    description:
      "엑셀로 하던 일을 화면 하나로. 게시판, 회원, 예약, 신청 관리를 운영자 눈높이에 맞춰 만듭니다.",
    preview: "admin",
  },
  {
    icon: Workflow,
    title: "업무 자동화·외부 서비스 연동",
    description:
      "문자·메일 발송, 결제, 카카오·네이버 연동까지. 반복되는 일은 시스템에 맡기세요.",
    preview: "operation",
  },
  {
    icon: Wrench,
    title: "유지보수·운영",
    description:
      "오픈 후가 진짜 시작입니다. 수정, 개선, 장애 대응까지 담당 개발자처럼 함께합니다.",
    preview: "maintenance",
  },
];

export const capabilityChips = [
  "예약 시스템",
  "결제 연동",
  "회원·게시판",
  "엑셀 업로드/다운로드",
  "문자·이메일 발송",
  "카카오·네이버 연동",
  "웹사이트 리뉴얼",
  "검색 노출 기본 적용",
  "모바일 최적화",
  "관리자 페이지",
];
