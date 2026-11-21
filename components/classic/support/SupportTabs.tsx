import { SubTabs } from "@/components/classic/ui";

// 고객지원 묶음의 하위 탭.
const items = [
  { href: "/notice", label: "공지사항" },
  { href: "/jaryo", label: "자료" },
  { href: "/faq", label: "자주 묻는 질문" },
  { href: "/contact", label: "상담 신청" },
];

// 자료 허브에 딸린 페이지(도구, 인사이트)에서는 "자료" 탭을 켠다
const underJaryo = ["/tools", "/insight", "/glossary"];

export function SupportTabs({ current }: { current: string }) {
  return <SubTabs items={items} current={underJaryo.some((p) => current.startsWith(p)) ? "/jaryo" : current} />;
}
