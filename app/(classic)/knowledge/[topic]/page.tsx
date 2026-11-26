import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArchiveShell } from "@/components/classic/archive/ArchiveShell";
import { TopicList, type TopicRow } from "@/components/classic/archive/TopicList";
import { docUpdated, kindOf, kinds, topics } from "@/data/classic/archive";
import { pageMeta } from "@/lib/seo";

// 위키 주제 페이지(부모 페이지). 11-22 묶음 제목 대신 종류 태그와 태그 필터
export function generateStaticParams() {
  return topics().map((t) => ({ topic: t.id }));
}

// 검색, 공유 설명에만 쓰는 주제 소개(화면의 주제 소개는 data/classic/archive.ts 의 desc 그대로). 지금 그 주제에 있는 문서 묶음을 적는다
const META_DESC: Record<string, string> = { design: "화면 부품 용어, 디자인 용어, 페이지 종류별 화면 예시, 웹 디자인 흐름" };

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }): Promise<Metadata> {
  const id = (await params).topic;
  const t = topics().find((x) => x.id === id);
  if (!t) return {};
  return pageMeta({ title: `${t.label} | 위키`, description: `곰파트너 위키의 ${t.label} 문서 모음입니다. ${META_DESC[t.id] ?? t.desc}.`, path: `/knowledge/${t.id}` });
}

export default async function TopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const id = (await params).topic;
  const t = topics().find((x) => x.id === id);
  if (!t) notFound();
  const seen = new Set<string>();
  // 묶음 제목이 종류 이름(문서, 도구)이면 태그로 충분하고, 주제 안 소분류(보안 경보, 관리 비용)면 두 번째 태그로 붙인다
  const plain = new Set(["문서", "도구", "개발 도구", "운영 노트", "자료"]);
  const rows: TopicRow[] = t.groups
    .flatMap((g) => g.items.map((n) => ({ n, group: plain.has(g.title) ? undefined : g.title })))
    .filter(({ n }) => (n.href ? !seen.has(n.href) && !!seen.add(n.href) : true))
    .map(({ n, group }) => ({ label: n.label, href: n.href, kind: kindOf(n.href), group, ver: n.href ? docUpdated(n.href) : undefined, children: n.children?.map((c) => ({ label: c.label, href: c.href! })) }))
    .sort((a, b) => kinds.indexOf(a.kind as never) - kinds.indexOf(b.kind as never));
  return (
    <ArchiveShell section={t.id} active={`/knowledge/${t.id}`} crumbs={[{ href: `/knowledge/${t.id}`, label: t.label }]} head={{ title: t.label, lead: t.desc }}>
      <TopicList rows={rows} kinds={[...kinds]} />
    </ArchiveShell>
  );
}
