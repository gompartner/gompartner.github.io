import { SubTabs } from "@/components/classic/ui";

// 곰파트너 묶음의 하위 탭(바닥글 "곰파트너" 묶음과 같은 순서). 11-22 위키은 큰 메뉴로 빠짐. 11-26 색은 판과 같은 어두운 띠(SubTabs), 연혁은 회사소개로 합쳐져 뺌. 11-28 공지사항 내림(대표 "공지는 다 내림")
const items = [
  { href: "/story", label: "회사소개" },
  { href: "/contact", label: "상담 신청" },
];

export function SupportTabs({ current }: { current: string }) {
  return <SubTabs items={items} current={current} />;
}
