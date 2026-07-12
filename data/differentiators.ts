import {
  Bot,
  Gauge,
  RefreshCcw,
  ShieldCheck,
  Zap,
  type LucideIcon,
} from "lucide-react";

export interface Differentiator {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const differentiators: Differentiator[] = [
  {
    icon: Zap,
    title: "빠른 제작",
    description:
      "AI 활용 워크플로로 반복 작업을 줄여 제작 일정을 앞당깁니다. 속도를 위해 품질을 포기하지 않습니다.",
  },
  {
    icon: ShieldCheck,
    title: "검증된 완성도",
    description:
      "AI가 만든 결과물도 15년 운영 경험의 기준으로 직접 검토하고 다듬은 뒤에 내보냅니다.",
  },
  {
    icon: Bot,
    title: "AI 업무 자동화",
    description:
      "문의 정리, 알림 발송, 데이터 입력 같은 반복 업무를 API와 AI로 자동화해 운영 시간을 돌려드립니다.",
  },
  {
    icon: Gauge,
    title: "SEO와 성능은 기본값",
    description:
      "검색 노출과 빠른 로딩은 옵션이 아닙니다. 사이트 구조를 잡는 단계부터 기본으로 챙깁니다.",
  },
  {
    icon: RefreshCcw,
    title: "운영까지 함께",
    description:
      "만들고 끝나는 외주가 아니라, 오픈 이후의 수정·개선·유지보수까지 함께하는 파트너입니다.",
  },
];
