import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { ArchiveShell, DocHead, docH2 } from "@/components/classic/archive/ArchiveShell";
import { groupBySlug, shortTitle, takeover, termHref, termSlugs } from "@/data/classic/archive";
import { termGroups, termLabels } from "@/data/classic/glossary";
import { termImages } from "@/data/classic/glossaryImages";
import { pageMeta } from "@/lib/seo";

// 용어 묶음 문서 한 장. 내용은 data/classic/glossary.ts(웹 용어 사전과 같은 원본), 이어받을 때 볼 것은 data/classic/archive.ts
const CHECKED = "2026-11-21";

export function generateStaticParams() {
  return termGroups.map((g) => ({ slug: termSlugs[g.id] }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const g = groupBySlug((await params).slug);
  if (!g) return {};
  return pageMeta({
    title: `${g.title} | 아카이브`,
    description: `${g.terms.map((t) => t.name).join(", ")}. 형태와 적용 사례, 와이어프레임, 업체와 AI에 요청하는 문장.`,
    path: termHref(g),
    ...(termImages[g.terms[0].id] ? { image: { src: `/images/glossary/${g.terms[0].id}.webp`, alt: `${g.title} 와이어프레임`, width: termImages[g.terms[0].id][0], height: termImages[g.terms[0].id][1] } } : {}),
  });
}

export default async function TermDoc({ params }: { params: Promise<{ slug: string }> }) {
  const g = groupBySlug((await params).slug);
  if (!g) notFound();
  const i = termGroups.indexOf(g);
  const prev = termGroups[i - 1];
  const next = termGroups[i + 1];
  const take = takeover[g.id];
  const labels = termLabels[g.sec];
  const imgCount = g.terms.filter((t) => termImages[t.id]).length;
  const toc = [{ id: "cmp", label: "한눈에 비교" }, { id: "terms", label: "용어별로 보기" }, ...(take ? [{ id: "take", label: "이어받을 때 볼 것" }] : [])];

  return (
    <ArchiveShell
      section="terms"
      active={termHref(g)}
      crumbs={[{ href: "/archive", label: "아카이브" }, { href: "/archive/terms", label: "용어" }, { href: termHref(g), label: shortTitle(g) }]}
      toc={toc}
    >
      <DocHead
        title={g.title}
        meta={[["분류", `${g.sec}, ${g.cat}`], ["용어", `${g.terms.length}개`], ...(imgCount ? ([["와이어프레임", `${imgCount}장`]] as [string, string][]) : []), ["확인일", CHECKED]]}
      />

      <h2 id="cmp" className={docH2}>한눈에 비교</h2>
      <div className="mt-4">
        <table className="w-full border-collapse text-[14px] md:text-[15px]">
          <thead>
            <tr className="border-t-2 border-[#15171c] bg-[#f4f6f9] text-left">
              <th scope="col" className="px-3 py-2.5 font-[800]">이름</th>
              <th scope="col" className="px-3 py-2.5 font-[800]">{labels[0]}</th>
              <th scope="col" className="px-3 py-2.5 font-[800]">{labels[1]}</th>
            </tr>
          </thead>
          <tbody>
            {g.terms.map((t) => (
              <tr key={t.id} className="border-b border-[#e6e9ee] align-top">
                <th scope="row" className="px-2 py-2.5 text-left font-bold md:whitespace-nowrap md:px-3">
                  <a href={`#${t.id}`} className="hover:text-[#256ef4]">{t.name}</a>
                </th>
                <td className="px-2 py-2.5 leading-[1.55] md:px-3">{t.look}</td>
                <td className="px-2 py-2.5 leading-[1.55] md:px-3">{t.use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 id="terms" className={docH2}>용어별로 보기</h2>
      <div className="mt-2">
        {g.terms.map((t) => (
          <article key={t.id} id={t.id} className="grid scroll-mt-24 gap-5 border-b border-[#e6e9ee] py-7 md:grid-cols-[minmax(0,340px)_minmax(0,1fr)] md:gap-7">
            {termImages[t.id] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`/images/glossary/${t.id}.webp`} alt={`${t.name} 와이어프레임`} width={termImages[t.id][0]} height={termImages[t.id][1]} loading="lazy" decoding="async" className="block h-auto w-full rounded-lg border border-[#e1e5eb] bg-[#f5f7fa]" />
            ) : null}
            <div className={termImages[t.id] ? "" : "md:col-span-2"}>
              <h3 className="text-[20px] font-[800] tracking-[-0.03em]">{t.name}</h3>
              <p className="mt-1 text-[14px] text-[#5b6370]">{t.alt}</p>
              <dl className="mt-3 grid grid-cols-[5.2em_minmax(0,1fr)] gap-x-2 gap-y-1.5 text-[15.5px] leading-[1.6]">
                <dt className="text-[#5b6370]">{labels[0]}</dt>
                <dd>{t.look}</dd>
                <dt className="text-[#5b6370]">{labels[1]}</dt>
                <dd>{t.use}</dd>
              </dl>
              {t.say ? (
                <p className="mt-4 rounded-md bg-[#eef3ff] px-3.5 py-3 text-[15px] leading-[1.6]">
                  <span className="mb-0.5 block text-[12px] font-bold text-[#256ef4]">이렇게 요청하세요</span>&quot;{t.say}&quot;
                </p>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      {take ? (
        <section id="take" aria-labelledby="take-h" className="mt-14 scroll-mt-24 overflow-hidden rounded-[10px] border-2 border-[#15171c]">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 bg-[#15171c] px-5 py-3.5 text-white">
            <h2 id="take-h" className="text-[18px] font-[800] tracking-[-0.03em]">이어받을 때 볼 것</h2>
            <span className="text-[13px] text-[#aebbd6]">남이 만든 사이트의 {shortTitle(g)}를 넘겨받았다면</span>
          </div>
          <ol className="px-5 py-1">
            {take.map((x, k) => (
              <li key={x.b} className="grid grid-cols-[28px_minmax(0,1fr)] gap-1.5 border-b border-[#e6e9ee] py-3.5 last:border-b-0">
                <span aria-hidden className="mt-0.5 grid h-[22px] w-[22px] place-items-center rounded-full bg-[#256ef4] text-[12px] font-[800] text-white">{k + 1}</span>
                <div>
                  <p className="text-[15.5px] font-bold">{x.b}</p>
                  <p className="mt-0.5 text-[14.5px] leading-[1.6] text-[#5b6370]">{x.t}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {g.post ? (
        <p className="mt-8 text-[14.5px]">
          <a href={g.post} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-bold text-[#256ef4] hover:underline underline-offset-4">
            같은 내용을 글로 읽기(기술 블로그) <ArrowUpRight size={15} aria-hidden />
          </a>
        </p>
      ) : null}

      <nav aria-label="이전, 다음 문서" className="mt-10 grid gap-3 sm:grid-cols-2">
        {prev ? (
          <Link href={termHref(prev)} className="rounded-lg border border-[#d9dee5] px-4 py-3.5 hover:border-[#256ef4]">
            <span className="block text-[13px] text-[#5b6370]">이전</span>
            <span className="text-[15.5px] font-bold">{shortTitle(prev)}</span>
          </Link>
        ) : <span />}
        {next ? (
          <Link href={termHref(next)} className="rounded-lg border border-[#d9dee5] px-4 py-3.5 text-right hover:border-[#256ef4]">
            <span className="block text-[13px] text-[#5b6370]">다음</span>
            <span className="text-[15.5px] font-bold">{shortTitle(next)}</span>
          </Link>
        ) : null}
      </nav>
    </ArchiveShell>
  );
}
