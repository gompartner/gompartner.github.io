import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { CatalogBoard, type CatalogItem } from "@/components/classic/catalog/CatalogBoard";
import { demoProjects, isLanding, isMaintenance, isProgram, thumbOf, threeProjects } from "@/components/classic/works/samples";
import { pageMeta } from "@/lib/seo";

// 11-26 카탈로그 한 판으로 바꿈. 화면을 그림으로 진열하고, 누르면 그 자리에서 크게 본다.
// 데모, 샘플 주소(/demo, /sample, /work, /works/업종)는 내렸다(사용자 "이제 안 씀, 검색 오류 나도 됨").
export const metadata: Metadata = pageMeta({
  title: "카탈로그",
  description: "홈페이지, 랜딩페이지, 업무 시스템, 앱, 키오스크, 3D 웹으로 만든 화면을 종류별로 볼 수 있습니다.",
  path: "/works",
});

const CATS = ["홈페이지", "랜딩페이지", "업무 시스템", "앱", "키오스크", "3D 웹"];
const exists = (src: string) => fs.existsSync(path.join(process.cwd(), "public", src.split("?")[0]));

function catOf(p: (typeof demoProjects)[number]) {
  if (p.category === "앱") return "앱";
  if (p.category === "키오스크") return "키오스크";
  if (isLanding(p)) return "랜딩페이지";
  if (isProgram(p)) return "업무 시스템";
  return "홈페이지";
}

export default function WorksPage() {
  const items: CatalogItem[] = [
    ...demoProjects
      .filter((p) => !isMaintenance(p))
      .map((p) => {
        const thumb = thumbOf(p);
        return { id: p.id, cat: catOf(p), title: p.title, desc: p.description, features: p.features, thumb, big: exists(p.imageUrl) ? p.imageUrl : thumb };
      }),
    ...threeProjects.map((p) => ({ id: p.id, cat: "3D 웹", title: p.title, desc: p.description, features: p.features, thumb: p.imageUrl, big: p.imageUrl })),
  ].filter((i) => exists(i.thumb));
  // 종류 순서대로 모아 보여 준다
  items.sort((a, b) => CATS.indexOf(a.cat) - CATS.indexOf(b.cat));
  return <CatalogBoard items={items} cats={CATS.filter((c) => items.some((i) => i.cat === c))} />;
}
