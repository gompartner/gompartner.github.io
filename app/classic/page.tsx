import type { Metadata } from "next";
import { ClassicHome } from "@/components/classic/ClassicHome";

// 예전 클래식 첫 화면 주소. 첫 화면(/)과 같은 내용이라 검색 대표 주소는 / 로 둔다.
export const metadata: Metadata = {
  title: { absolute: "곰파트너 | 홈페이지 제작" },
  alternates: { canonical: "/" },
  robots: { index: false, follow: true },
};

export default function ClassicHomePage() {
  return <ClassicHome />;
}
