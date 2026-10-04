import { history } from "@/data/projects";
import { sideProjects } from "@/data/sideProjects";

// 작업 이력 화면에 넘길 값을 서버에서만 계산한다.
// 연도가 들어 있는 원본 데이터가 브라우저 번들에 실리지 않도록 클라이언트 컴포넌트에서는 가져오지 않는다.
// 경력 이력의 업종을 분야 카드에 합친다
const sectorField: Record<string, string> = {
  병원: "의료·헬스케어",
  교육: "에듀테크·LMS",
  대학교: "에듀테크·LMS",
  구청: "공공·스마트시티",
  지자체: "공공·스마트시티",
  공공기관: "공공·스마트시티",
  중앙행정기관: "공공·스마트시티",
  광역의회: "공공·스마트시티",
  금융: "금융·핀테크",
  보험: "금융·핀테크",
  부동산: "모빌리티·물류·O2O",
  대기업: "이커머스·리테일",
  보안: "인프라·DevOps",
  IoT: "인프라·DevOps",
  기업: "업무 협업 SaaS",
};

export const historyFields = sideProjects.map((f) => ({
  field: f.field,
  examples: f.examples,
  count: f.count + history.filter((h) => sectorField[h.sector] === f.field).length,
}));
export const historyTotal = historyFields.reduce((sum, f) => sum + f.count, 0);


export type HistoryField = (typeof historyFields)[number];
