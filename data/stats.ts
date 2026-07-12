export interface Stat {
  value: number;
  suffix?: string;
  label: string;
}

// 근거: data/career.ts — 2009-10 경력 시작(15년+), 재직 기업 8곳,
// 경력 기술 프로젝트 18개 + 데모 6개(20+), careerSupplements 수상 2회(장관상 포함)
export const stats: Stat[] = [
  { value: 15, suffix: "+", label: "년의 웹 개발·운영 경험" },
  { value: 8, label: "곳의 기업 실무 경험" },
  { value: 40, suffix: "+", label: "개 프로젝트 구축·운영" },
  { value: 2, label: "회 수상 · 장관상 포함" },
];

export const statsCaption =
  "2009년부터 공공기관, 기업, 플랫폼 서비스를 만들고 운영해 왔습니다.";
