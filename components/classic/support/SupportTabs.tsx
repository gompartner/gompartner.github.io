import { SubTabs } from "@/components/classic/ui";

// 고객지원 묶음의 하위 탭. 상담 신청은 별도 페이지(/landing)라 탭에 넣지 않는다.
const items = [
  { href: "/classic/faq", label: "자주 묻는 질문" },
  { href: "/classic/tools", label: "자료실" },
];

export function SupportTabs({ current }: { current: string }) {
  return <SubTabs items={items} current={current} />;
}
