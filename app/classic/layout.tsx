import type { Metadata, Viewport } from "next";
import { ClassicShell } from "@/components/classic/ClassicShell";

// 클래식 보기(웹 에이전시형 회사 홈페이지). 10-22부터 기본 보기라 검색에 내보낸다.
export const metadata: Metadata = {
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#ffffff" };

export default function ClassicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <ClassicShell>{children}</ClassicShell>;
}
