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
    title: "기획",
    description:
      "화면 흐름과 기능 범위를 확정하고 명확한 견적을 드립니다. 확정 후 임의로 비용이 늘지 않습니다.",
  },
  {
    step: 3,
    title: "디자인",
    description:
      "업종과 목적에 맞는 화면 구성을 제안하고, 확인을 받은 뒤 다음 단계로 넘어갑니다.",
  },
  {
    step: 4,
    title: "개발",
    description:
      "중간 확인 링크로 진행 상황을 공유합니다. 실제 화면을 보며 의견을 주시면 바로 반영합니다.",
  },
  {
    step: 5,
    title: "검수",
    description:
      "PC와 스마트폰 실제 기기에서 함께 확인하며 꼼꼼히 점검합니다.",
  },
  {
    step: 6,
    title: "오픈",
    description:
      "사이트를 공개하고 네이버·구글 검색 등록까지 마무리합니다.",
  },
  {
    step: 7,
    title: "운영",
    description:
      "오픈 후 수정과 개선을 지원합니다. 필요하면 월 유지보수로 안정적으로 관리합니다.",
  },
];
