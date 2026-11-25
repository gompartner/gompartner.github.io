import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { CatalogBoard, type CatalogItem, type CatalogStoryView, type Shot } from "@/components/classic/catalog/CatalogBoard";
import { demoProjects, isLanding, isMaintenance, isProgram, mobileShotOf, thumbOf, threeProjects } from "@/components/classic/works/samples";
import { catalogStories, catalogTrends } from "@/data/classic/catalogStories";
import { pageMeta } from "@/lib/seo";
import catalogLong from "@/data/classic/catalogLong.json";

type Long = { src: string; w: number; h: number };

// 11-26 카탈로그 한 판. 위에는 이야기와 함께 올린 화면 11개(data/classic/catalogStories), 아래에는 나머지 화면을 작은 그림으로 둔다.
// 데모, 샘플 주소(/demo, /sample, /work, /works/업종)는 내렸다(사용자 "이제 안 씀, 검색 오류 나도 됨"). 화면은 누르면 그 자리에서 크게 본다.
export const metadata: Metadata = pageMeta({
  title: "카탈로그",
  description: "업종마다 방문자가 찾는 것을 조사하고 그 답이 먼저 보이게 만든 홈페이지, 랜딩페이지, 업무 시스템, 앱, 키오스크, 3D 웹 화면입니다.",
  path: "/works",
});

const CATS = ["홈페이지", "랜딩페이지", "업무 시스템", "앱", "키오스크", "3D 웹"];
const exists = (src: string) => fs.existsSync(path.join(process.cwd(), "public", src.split("?")[0]));
// 화면에 쓰지 않는 말이 든 설명 줄은 뺀다
const banned = /시안|샘플|데모|가상/;

type P = (typeof demoProjects)[number];
const LONGS = catalogLong as Record<string, { pc?: Long; m?: Long }>;

function catOf(p: P) {
  if (p.category === "3D") return "3D 웹";
  if (p.category === "앱") return "앱";
  if (p.category === "키오스크") return "키오스크";
  if (isLanding(p)) return "랜딩페이지";
  if (isProgram(p)) return "업무 시스템";
  return "홈페이지";
}

function itemOf(p: P): CatalogItem | null {
  const cat = catOf(p);
  const is3d = cat === "3D 웹";
  const device = cat === "앱" || cat === "키오스크";
  const thumb = is3d ? p.imageUrl : thumbOf(p);
  if (!exists(thumb)) return null;
  const main: Shot = { src: exists(p.imageUrl) ? p.imageUrl : thumb, frame: device ? "scene" : "browser", ratio: "16/10", alt: `${p.title} PC 화면` };
  // 앱, 키오스크 그림은 기기 여러 대를 한 장에 담은 것이라 휴대폰 화면을 따로 붙이지 않는다
  const m = is3d ? `/images/shelf/${p.id}.jpg` : device ? null : mobileShotOf(p);
  const side: Shot | undefined = m && exists(m) ? { src: m, frame: "phone", ratio: is3d ? "390/802" : "780/1472", alt: `${p.title} 휴대폰 화면` } : undefined;
  // 페이지 전체 캡처가 있으면 붙인다(data/classic/catalogLong.json). 대표 화면은 창 안에서 저절로 내려가고, 나머지는 크게 보기에서 통째로 펴진다
  const lg = LONGS[p.id];
  if (lg?.pc && main.frame === "browser" && exists(lg.pc.src)) main.long = lg.pc;
  if (lg?.m && side?.frame === "phone" && exists(lg.m.src)) side.long = lg.m;
  return { id: p.id, cat, title: p.title, thumb, main, side, features: p.features.filter((f) => !banned.test(f)) };
}

export default function WorksPage() {
  const all = [...demoProjects.filter((p) => !isMaintenance(p)), ...threeProjects].map(itemOf).filter((i): i is CatalogItem => i !== null);
  // 종류 순서대로 모아 보여 준다
  all.sort((a, b) => CATS.indexOf(a.cat) - CATS.indexOf(b.cat));

  const stories: CatalogStoryView[] = [];
  for (const s of catalogStories) {
    const base = all.find((i) => i.id === s.id);
    if (!base) continue;
    const main: Shot = s.main && exists(s.main.src) ? { ...base.main, ...s.main } : base.main;
    const side: Shot | undefined = s.side && exists(s.side.src) ? { ...s.side, alt: `${base.title} ${s.side.frame === "screen" ? "키오스크" : "휴대폰"} 화면` } : base.side;
    // 페이지 전체 캡처가 있으면 붙인다(data/classic/catalogLong.json, 11-26)
    const lg = LONGS[s.id];
    if (lg?.pc && main.frame === "browser" && exists(lg.pc.src)) main.long = lg.pc;
    if (lg?.m && side?.frame === "phone" && exists(lg.m.src)) side.long = lg.m;
    stories.push({ ...base, main, side, headline: s.headline, wantLabel: s.wantLabel, want: s.want, think: s.think, made: s.made });
  }
  stories.sort((a, b) => CATS.indexOf(a.cat) - CATS.indexOf(b.cat));

  // 그 해의 연출 기법으로 만든 화면(data/classic/catalogStories 의 catalogTrends). 바탕이 된 화면과 따로 한 장씩 센다
  const trends: CatalogStoryView[] = [];
  for (const t of catalogTrends) {
    const base = all.find((i) => i.id === t.of);
    const lg = LONGS[t.id];
    const pc = `/images/demos/var/${t.id}.jpg`;
    const m = `/images/catalog/${t.id}-m.jpg`;
    if (!base || !exists(pc)) continue;
    const main: Shot = { src: pc, frame: "browser", ratio: "16/10", alt: `${base.title} ${t.tag} PC 화면`, ...(lg?.pc && exists(lg.pc.src) ? { long: lg.pc } : {}) };
    const side: Shot | undefined = exists(m) ? { src: m, frame: "phone", ratio: "780/1472", alt: `${base.title} ${t.tag} 휴대폰 화면`, ...(lg?.m && exists(lg.m.src) ? { long: lg.m } : {}) } : undefined;
    trends.push({ id: t.id, cat: base.cat, title: base.title, tag: t.tag, thumb: pc, main, side, features: [], headline: t.headline, wantLabel: "잡은 방향", want: t.want, think: t.think, made: t.made });
  }

  const told = new Set(stories.map((s) => s.id));
  const rest = all.filter((i) => !told.has(i.id));
  const shown = [...all, ...trends];
  const cats = CATS.filter((c) => shown.some((i) => i.cat === c)).map((c) => ({ name: c, count: shown.filter((i) => i.cat === c).length }));
  return <CatalogBoard stories={stories} trends={trends} rest={rest} cats={cats} total={shown.length} />;
}
