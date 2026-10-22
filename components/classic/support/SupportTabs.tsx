import { SubTabs } from "@/components/classic/ui";

// 고객지원 묶음의 하위 탭.
const items = [
  { href: "/classic/faq", label: "자주 묻는 질문" },
  { href: "/classic/guide", label: "가이드" },
  { href: "/classic/tools", label: "자료실" },
  { href: "/classic/contact", label: "상담 신청" },
];

export function SupportTabs({ current }: { current: string }) {
  return <SubTabs items={items} current={current} />;
}
