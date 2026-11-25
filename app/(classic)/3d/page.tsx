import type { Metadata } from "next";
import { ThreeBoard } from "@/components/classic/three/ThreeBoard";
import { LdScript } from "@/components/seo/JsonLd";
import { threeMeta as s } from "@/data/classic/three";
import { breadcrumbLd, pageMeta, serviceLd } from "@/lib/seo";

const path = "/3d";

export const metadata: Metadata = pageMeta({
  title: s.metaTitle,
  description: s.metaDescription,
  path,
  image: { src: "/3d/assets/og.jpg", alt: "곰파트너 3D 웹 제작 마을", width: 1200, height: 630 },
});

// 11-26 3D 웹 한 판(components/classic/three/ThreeBoard.tsx). 제작, 유지보수, 카탈로그 판과 같은 틀(BoardShell)을 쓴다.
// 옛 구성(3D 마을 첫 화면 아래 가격표 위주의 문서)은 사용자 "가격만 나와서, 무엇을 할 수 있는지랑 왜 필요한지"로 바꿨다.
export default function Page() {
  return (
    <>
      <LdScript data={[serviceLd(s.title, s.metaDescription, path), breadcrumbLd([{ name: "제작", path: "/make" }, { name: s.title, path }])]} />
      <ThreeBoard />
    </>
  );
}
