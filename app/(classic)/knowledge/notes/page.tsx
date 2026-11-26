import type { Metadata } from "next";
import Link from "next/link";
import { ArchiveShell, docH2 } from "@/components/classic/archive/ArchiveShell";
import { insights } from "@/data/classic/insights";
import { pageMeta } from "@/lib/seo";

// 운영 노트 = 인사이트 글(주소 /insight/<slug>는 그대로). 묶음별 목록만 아카이브 틀로 보여 준다.
export const metadata: Metadata = pageMeta({
  title: "운영 노트 | 위키",
  description: "홈페이지 인수, 운영 관리, 보안 경보, 관리 비용을 실제로 해 온 순서대로 정리한 글입니다.",
  path: "/knowledge/notes",
});

const series = [...new Set(insights.map((n) => n.series))].map((s) => ({ name: s, list: insights.filter((n) => n.series === s).sort((a, b) => b.date.localeCompare(a.date) || a.no - b.no) }));

export default function ArchiveNotes() {
  return (
    <ArchiveShell section="notes" active="/knowledge/notes" crumbs={[{ href: "/knowledge", label: "위키" }, { href: "/knowledge/notes", label: "운영 노트" }]} toc={series.map((s) => ({ id: encodeURIComponent(s.name), label: s.name }))} head={{ title: "운영 노트", meta: [["주제", `${series.length}개`], ["글", `${insights.length}개`]], lead: "홈페이지를 넘겨받고 운영하며 겪는 일을 주제별로 정리했습니다. 글마다 따로 읽어도 되게 썼습니다." }} related={false}>
      {series.map((s) => (
        <section key={s.name} aria-labelledby={encodeURIComponent(s.name)}>
          <h2 id={encodeURIComponent(s.name)} className={docH2}>
            {s.name} <span className="text-[15px] font-bold text-[#5b6370]">글 {s.list.length}개</span>
          </h2>
          <ol className="mt-3">
            {s.list.map((n) => (
              <li key={n.slug} className="border-b border-[#e6e9ee]">
                <Link href={`/insight/${n.slug}`} className="group grid grid-cols-[minmax(0,1fr)] gap-x-2 py-3.5 md:grid-cols-[minmax(0,1fr)_100px]">
                  <span>
                    <span className="block text-[16px] font-bold leading-[1.45] group-hover:text-[#256ef4] group-hover:underline underline-offset-4">{n.title}</span>
                    <span className="mt-1 block text-[14px] leading-[1.55] text-[#5b6370]">{n.summary}</span>
                  </span>
                  <time dateTime={n.date} className="hidden text-right text-[13px] tabular-nums text-[#5b6370] md:block">{n.date}</time>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </ArchiveShell>
  );
}
