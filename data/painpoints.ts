import {
  CalendarClock,
  SearchX,
  Smartphone,
  UserX,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export interface PainPoint {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const painPoints: PainPoint[] = [
  {
    icon: CalendarClock,
    title: "홈페이지가 오래되었습니다",
    description: "몇 년 전 만든 뒤 그대로라 지금 사업 모습과 다릅니다.",
  },
  {
    icon: UserX,
    title: "수정할 사람이 없습니다",
    description: "만들어 준 업체와 연락이 끊겨 문구 하나 바꾸기도 어렵습니다.",
  },
  {
    icon: SearchX,
    title: "검색이 잘되지 않습니다",
    description: "상호를 검색해도 우리 홈페이지가 잘 나오지 않습니다.",
  },
  {
    icon: Smartphone,
    title: "모바일에서 사용하기 어렵습니다",
    description: "스마트폰에서 글자가 작거나 버튼이 눌리지 않습니다.",
  },
  {
    icon: Wrench,
    title: "유지보수가 불편합니다",
    description: "작은 수정에도 비용과 시간이 얼마나 들지 알 수 없습니다.",
  },
];
