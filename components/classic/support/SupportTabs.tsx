import { SubTabs } from "@/components/classic/ui";

// 곰파트너 묶음의 하위 탭(바닥글 "곰파트너" 묶음과 같은 순서). 11-22 웹 지식은 큰 메뉴로 빠짐. 11-26 색은 판과 같은 어두운 띠(SubTabs), 연혁은 회사소개로 합쳐져 뺌
const items = [
  { href: "/story", label: "회사소개" },
  { href: "/notice", label: "공지사항" },
  { href: "/faq", label: "자주 묻는 질문" },
  { href: "/contact", label: "상담 신청" },
];

export function SupportTabs({ current }: { current: string }) {
  return <SubTabs items={items} current={current} />;
}
