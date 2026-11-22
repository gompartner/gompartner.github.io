import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArchiveShell, DocHead } from "@/components/classic/archive/ArchiveShell";
import { TopicList, type TopicRow } from "@/components/classic/archive/TopicList";
import { kindOf, kinds, topics } from "@/data/classic/archive";
import { pageMeta } from "@/lib/seo";

// 웹 지식 주제 페이지(부모 페이지). 11-22 묶음 제목 대신 종류 태그와 태그 필터
export function generateStaticParams() {
  return topics().map((t) => ({ topic: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }): Promise<Metadata> {
  const id = (await params).topic;
  const t = topics().find((x) => x.id === id);
  if (!t) return {};
  return pageMeta({ title: `${t.label} | 웹 지식`, description: `${t.desc}. 곰파트너 웹 지식의 ${t.label} 문서 모음입니다.`, path: `/knowledge/${t.id}` });
}

export default async function TopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const id = (await params).topic;
  const t = topics().find((x) => x.id === id);
  if (!t) notFound();
  const seen = new Set<string>();
  const rows: TopicRow[] = t.groups
    .flatMap((g) => g.items)
    .filter((n) => (n.href ? !seen.has(n.href) && !!seen.add(n.href) : true))
    .map((n) => ({ label: n.label, href: n.href, kind: kindOf(n.href), children: n.children?.map((c) => ({ label: c.label, href: c.href! })) }))
    .sort((a, b) => kinds.indexOf(a.kind as never) - kinds.indexOf(b.kind as never));
  return (
    <ArchiveShell section={t.id} active={`/knowledge/${t.id}`} crumbs={[{ href: `/knowledge/${t.id}`, label: t.label }]}>
      <DocHead title={t.label} leadLabel="이 주제는" lead={t.desc} />
      <TopicList rows={rows} kinds={[...kinds]} />
    </ArchiveShell>
  );
}
