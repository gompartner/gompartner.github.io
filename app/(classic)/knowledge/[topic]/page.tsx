import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArchiveShell, DocHead, docH2 } from "@/components/classic/archive/ArchiveShell";
import { topics, type TreeNode } from "@/data/classic/archive";
import { pageMeta } from "@/lib/seo";

// 웹 지식 주제 페이지(부모 페이지). 묶음마다 문서 목록(컨플루언스의 하위 페이지 목록)
export function generateStaticParams() {
  return topics().map((t) => ({ topic: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }): Promise<Metadata> {
  const id = (await params).topic;
  const t = topics().find((x) => x.id === id);
  if (!t) return {};
  return pageMeta({ title: `${t.label} | 웹 지식`, description: `${t.desc}. 곰파트너 웹 지식의 ${t.label} 문서 모음입니다.`, path: `/knowledge/${t.id}` });
}

function Items({ items }: { items: TreeNode[] }) {
  return (
    <ul role="list" className="mt-2">
      {items.map((n) => (
        <li key={n.label + (n.href ?? "")} className="border-b border-[#eef0f3] last:border-b-0">
          {n.href ? (
            <Link href={n.href} className="block py-2.5 text-[15.5px] font-bold text-[#15171c] hover:text-[#256ef4] hover:underline underline-offset-4">{n.label}</Link>
          ) : (
            <div className="py-2.5">
              <p className="text-[15.5px] font-[800]">{n.label}</p>
              {n.children ? (
                <ul role="list" className="mt-1 flex flex-wrap gap-1.5">
                  {n.children.map((c) => (
                    <li key={c.href}>
                      <Link href={c.href!} className="inline-flex rounded-md border border-[#d9dee5] bg-white px-2.5 py-1 text-[13.5px] text-[#3d4450] hover:border-[#256ef4] hover:text-[#256ef4]">{c.label}</Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

export default async function TopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const id = (await params).topic;
  const t = topics().find((x) => x.id === id);
  if (!t) notFound();
  return (
    <ArchiveShell section={t.id} active={`/knowledge/${t.id}`} crumbs={[{ href: `/knowledge/${t.id}`, label: t.label }]} toc={t.groups.map((g, i) => ({ id: `g${i}`, label: g.title }))}>
      <DocHead title={t.label} leadLabel="이 주제는" lead={t.desc} />
      {t.groups.map((g, i) => (
        <section key={g.title} aria-labelledby={`g${i}`}>
          <h2 id={`g${i}`} className={docH2}>{g.title}</h2>
          <Items items={g.items} />
        </section>
      ))}
    </ArchiveShell>
  );
}
