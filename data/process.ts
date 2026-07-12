export interface ProcessStep {
  step: number;
  title: string;
  description: string;
}

export const processSteps: ProcessStep[] = [
  {
    step: 1,
    title: "상담",
    description:
      "목적, 예산, 일정을 듣고 현실적인 방향을 제안합니다. 상담은 무료입니다.",
  },
  {
    step: 2,
    title: "설계·견적",
    description:
      "화면 흐름과 기능 범위를 확정하고 명확한 견적을 드립니다. 확정 후 임의로 비용이 늘지 않습니다.",
  },
  {
    step: 3,
    title: "제작",
    description:
      "중간 확인 링크로 진행 상황을 공유합니다. 실제 화면을 보며 의견을 주시면 바로 반영합니다.",
  },
  {
    step: 4,
    title: "검수·오픈",
    description:
      "실제 기기에서 함께 확인한 뒤 배포합니다. 검색 등록과 기본 SEO 설정까지 마무리합니다.",
  },
  {
    step: 5,
    title: "운영",
    description:
      "오픈 후 수정과 개선을 지원합니다. 필요하면 월 유지보수로 안정적으로 관리합니다.",
  },
];
