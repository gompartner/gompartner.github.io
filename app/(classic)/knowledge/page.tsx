import type { Metadata } from "next";
import { WikiBoard, type WikiDoc } from "@/components/classic/wiki/WikiBoard";
import { docUpdated, kindOf, kinds, topics, type TreeNode } from "@/data/classic/archive";
import { pageMeta } from "@/lib/seo";

// 11-26 위키 첫 화면을 찾기 판으로 바꿈(예전에는 주제별 나무 목록과 안내 글). 문서 주소와 문서 화면은 그대로.
// 여기서 만드는 목록 한 장(docs)이 위키의 색인이다. 문서가 수백 개를 넘어 이 화면이 무거워지면 이 표를 DB로 옮기고 검색만 서버로 보낸다.
export const metadata: Metadata = pageMeta({
  title: "위키",
  description: "홈페이지 기획부터 운영까지 필요한 문서 모음입니다. 웹 변천사와 화면 용어, 보안 경보, 점검표를 다룹니다.",
  alt: "곰파트너 위키. 홈페이지 기획, 제작, 운영 문서 목록",
  path: "/knowledge",
});

const flat = (items: TreeNode[]): TreeNode[] => items.flatMap((n) => [...(n.href ? [n] : []), ...(n.children ? flat(n.children) : [])]);

export default function KnowledgeHome() {
  const ts = topics();
  const seen = new Set<string>();
  const docs: WikiDoc[] = [];
  for (const t of ts)
    for (const g of t.groups)
      for (const n of flat(g.items)) {
        const k = `${t.label}|${g.title}|${n.href}`;
        if (!n.href || seen.has(k)) continue;
        seen.add(k);
        docs.push({ title: n.label, href: n.href, topic: t.label, group: g.title, kind: kindOf(n.href), updated: docUpdated(n.href) });
      }
  // 최근에 고친 문서가 위로
  docs.sort((a, b) => (b.updated ?? "").localeCompare(a.updated ?? ""));
  const tps = ts.map((t) => ({ label: t.label, groups: t.groups.map((g) => g.title).filter((g) => docs.some((d) => d.topic === t.label && d.group === g)) })).filter((t) => t.groups.length > 0);
  return <WikiBoard docs={docs} topics={tps} kinds={kinds.filter((k) => docs.some((d) => d.kind === k))} />;
}
