import { insights, readMinutes } from "@/data/classic/insights";
import type { Metadata } from "next";
import { ClassicHome } from "@/components/classic/ClassicHome";
import { homeDescription, homeTitle } from "@/data/seo";
import { fitDescription } from "@/lib/seo";

// 첫 화면. 10-22부터 클래식 보기가 기본이다(웹툰은 /story).
export const metadata: Metadata = {
  // 루트 템플릿(`%s | 곰파트너`)이 브랜드를 또 붙이지 않도록 absolute 사용
  title: { absolute: homeTitle },
  description: fitDescription(homeDescription),
  alternates: { canonical: "/", languages: { ko: "/", en: "/en" } },
};

export default function HomePage() {
  // 11-12 메인 "운영 이야기": 인사이트 최신 3편
  const stories = [...insights]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3)
    .map((n) => ({ slug: n.slug, date: n.date, title: n.title, image: n.image.src, minutes: readMinutes(n) }));
  return <ClassicHome stories={stories} />;
}
