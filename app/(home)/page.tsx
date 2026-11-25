import type { Metadata } from "next";
import { ClassicHome } from "@/components/classic/ClassicHome";
import { homeDescription, homeTitle } from "@/data/seo";
import { fitDescription } from "@/lib/seo";

// 첫 화면. 10-22부터 클래식 보기가 기본이다(웹툰은 /story).
export const metadata: Metadata = {
  // 루트 템플릿(`%s | 곰파트너`)이 브랜드를 또 붙이지 않도록 absolute 사용
  title: { absolute: homeTitle },
  description: fitDescription(homeDescription),
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return <ClassicHome />;
}
