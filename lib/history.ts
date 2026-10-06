import { history, projects } from "@/data/projects";

// 작업 이력 화면에 넘길 값을 서버에서만 계산한다.
// 연도로 소속을 짐작할 수 있어 연도는 빼고 발주처 유형별로 묶는다.
// 연도가 들어 있는 원본 데이터가 브라우저 번들에 실리지 않도록 클라이언트 컴포넌트에서는 가져오지 않는다.
const groupBySector: Record<string, string> = {
  구청: "공공기관·지자체",
  지자체: "공공기관·지자체",
  공공기관: "공공기관·지자체",
  중앙행정기관: "공공기관·지자체",
  광역의회: "공공기관·지자체",
  교육: "교육·대학",
  대학교: "교육·대학",
  금융: "금융·보험",
  보험: "금융·보험",
};
const groupOrder = ["공공기관·지자체", "교육·대학", "금융·보험", "기업·병원"];

export const historyGroups = groupOrder.map((group) => ({
  group,
  items: history
    .filter((h) => (groupBySector[h.sector] ?? "기업·병원") === group)
    .map((h) => {
      const demo = projects.find((p) => p.id === h.demo);
      return { work: h.work, kind: h.kind, demoUrl: demo?.demoUrl, demoTitle: demo?.title };
    }),
}));

export type HistoryGroup = (typeof historyGroups)[number];
