import type { Metadata } from "next";
import { TrendNav } from "@/components/classic/archive/TrendNav";
import { ArchiveShell, DocHead, docH2 } from "@/components/classic/archive/ArchiveShell";
import { notFound } from "next/navigation";
import Image from "next/image";
import { JaryoButtons, JaryoList, JaryoPreview } from "@/components/classic/JaryoParts";
import { jaryo } from "@/data/classic/jaryo";
import { pageMeta } from "@/lib/seo";

// 자료 한 장. 인스타 댓글 단어(견적, 점검, AI)로 DM을 받은 사람이 /go/jaryo/<id>/ 를 거쳐 들어온다. 검색에서 뺀다
// 자료 본문은 1쪽, 2쪽 그림으로 이 페이지에서 바로 보여 준다(11-03 노션 쓰지 않기로)
export function generateStaticParams() {
  return jaryo.map((j) => ({ id: j.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const it = jaryo.find((j) => j.id === id);
  if (!it) return {};
  return {
    ...pageMeta({
      title: it.title,
      description: `${it.title}. ${it.parts.join(", ")}. 휴대폰으로 열람하고 PDF로 내려받을 수 있습니다.`,
      path: `/jaryo/${it.id}`,
      image: { src: "/og/jaryo.jpg", alt: "곰파트너 무료 자료" },
    }),
    robots: { index: false, follow: false },
  };
}

export default async function ClassicJaryoItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const it = jaryo.find((j) => j.id === id);
  if (!it) notFound();

  return (
    <ArchiveShell
      section="checklists"
      active={`/jaryo/${it.id}`}
      crumbs={[
        { href: "/knowledge", label: "웹 지식" },
        { href: "/knowledge/checklists", label: "점검표와 도구" },
        { href: `/jaryo/${it.id}`, label: it.title },
      ]}
      toc={[{ id: "inside", label: "들어 있는 것" }, { id: "view", label: "자료 보기" }, { id: "rel", label: "관련 문서" }]}
    >
      <DocHead title={it.title} meta={[["쓰는 때", it.when], ["분량", `PDF ${it.pages ?? 2}쪽`]]} />

      <div id="inside" className="mt-8 grid scroll-mt-24 overflow-hidden rounded-lg border border-[#d9dee5] bg-white xl:grid-cols-[1fr_1fr]">
        <div className="border-b border-[#d9dee5] xl:border-b-0 xl:border-r">
          <JaryoPreview it={it} size="lg" priority />
        </div>
        <div className="flex flex-col p-6 md:p-8">
          <h2 className={docH2 + " !mt-0"}>들어 있는 것</h2>
          <div className="mt-5">
            <JaryoList it={it} />
          </div>
          <div className="mt-8">
            <JaryoButtons it={it} view={false} />
          </div>
        </div>
      </div>

      <h2 id="view" className={docH2}>자료 보기</h2>
      <ol className="mt-5 grid gap-6 md:grid-cols-2" role="list">
        {Array.from({ length: it.pages ?? 2 }, (_, i) => i + 1).map((n) => (
          <li key={n}>
            <p className="mb-2 text-[15px] font-bold text-[#5b6370]">{n}쪽</p>
            <Image
              src={`/images/jaryo/${it.id}-${n}-full.jpg`}
              alt={`${it.title} ${n}쪽`}
              width={1240}
              height={1754}
              className="block h-auto w-full rounded-md border border-[#d9dee5] bg-white shadow-[0_6px_20px_rgba(15,27,61,0.08)]"
            />
          </li>
        ))}
      </ol>

      <TrendNav current={`/jaryo/${it.id}`} />
    </ArchiveShell>
  );
}
