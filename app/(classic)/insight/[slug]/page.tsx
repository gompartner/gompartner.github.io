import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHead, btnLine, btnPrimary, wrap } from "@/components/classic/ui";
import { insightBySlug, insights } from "@/data/classic/insights";
import { LdScript } from "@/components/seo/JsonLd";
import { ORG_ID, breadcrumbLd, pageMeta } from "@/lib/seo";
import { siteUrl } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return insights.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const n = insightBySlug(slug);
  if (!n) return {};
  return pageMeta({
    title: n.title,
    description: n.summary,
    path: `/insight/${slug}`,
    image: n.image,
    article: true,
  });
}

// 인사이트 글. 본문 폭은 읽기 좋게 760px로 좁히고, xl부터 오른쪽 빈자리에 따라오는 목차를 둔다.
// 대표 이미지(scripts/insight-cards.mjs로 만든 제목 카드)는 공유 미리보기, 디스커버, 구조화 데이터에만 쓰고 본문에는 넣지 않는다. 끝에 다음 편 예고와 맞는 유지보수 메뉴 한 줄.
export default async function ClassicInsightDetailPage({ params }: Props) {
  const { slug } = await params;
  const n = insightBySlug(slug);
  if (!n) notFound();
  const same = insights
    .filter((x) => x.series === n.series)
    .sort((a, b) => a.no - b.no);
  const nextOne = same.find((x) => x.no === n.no + 1);
  const toc = n.blocks
    .map((b, bi) => ({ h: b.h, id: `s${bi}` }))
    .filter((t): t is { h: string; id: string } => !!t.h);

  return (
    <>
      <LdScript
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: n.title,
          description: n.summary,
          image: [`${siteUrl}${n.image.src}`],
          datePublished: `${n.date}T09:00:00+09:00`,
          dateModified: `${n.date}T09:00:00+09:00`,
          author: { "@id": ORG_ID },
          publisher: { "@id": ORG_ID },
          mainEntityOfPage: `/insight/${slug}`,
        }}
      />
      <LdScript
        data={breadcrumbLd([
          { name: "인사이트", path: "/insight" },
          { name: n.title, path: `/insight/${slug}` },
        ])}
      />
      <PageHead
        title={n.title}
        trail={[
          { href: "/notice", label: "고객지원" },
          { href: "/insight", label: "인사이트" },
          { href: `/insight/${slug}`, label: n.title },
        ]}
      />
      <article className={`${wrap} pb-16 pt-10 md:pb-24 md:pt-14`}>
        <div className="mx-auto max-w-[760px] xl:grid xl:max-w-none xl:grid-cols-[minmax(0,760px)_220px] xl:justify-center xl:gap-16">
          <div className="min-w-0">
            <header className="flex flex-wrap items-center gap-x-3 gap-y-1 border-y-2 border-[#15171c] border-b-[#e6e9ee] py-4 text-[15px] md:border-b">
              <span className="font-bold text-[#256ef4]">
                {n.series} {n.no}편
              </span>
            </header>
            <div className="space-y-9 py-8 md:py-10">
              {n.blocks.map((b, bi) => (
                <section key={bi} className="space-y-4">
                  {b.h && (
                    <h2
                      id={`s${bi}`}
                      className="scroll-mt-28 text-[21px] font-[800] leading-[1.4] tracking-[-0.02em] md:text-[24px]"
                    >
                      {b.h}
                    </h2>
                  )}
                  {b.p &&
                    !b.table &&
                    b.p.map((t) => (
                      <p
                        key={t}
                        className="text-[17px] leading-[1.8] text-[#3d4450]"
                      >
                        {t}
                      </p>
                    ))}
                  {b.steps && (
                    <ol className="space-y-4" role="list">
                      {b.steps.map((s, si) => (
                        <li
                          key={s.b}
                          className="flex gap-4 rounded-md bg-[#f6f7f9] p-5"
                        >
                          <span
                            aria-hidden
                            className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#15171c] text-[14px] font-bold tabular-nums text-white"
                          >
                            {si + 1}
                          </span>
                          <div>
                            <b className="block text-[17px] font-[800] leading-[1.5]">
                              {s.b}
                            </b>
                            <p className="mt-1 text-[16px] leading-[1.7] text-[#3d4450]">
                              {s.t}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                  {b.table && (
                    <>
                      {/* 휴대폰은 줄마다 카드로, md부터 표로 */}
                      <ul className="space-y-2 md:hidden" role="list">
                        {b.table.rows.map((r) => (
                          <li
                            key={r[0]}
                            className="rounded-md bg-[#f6f7f9] p-4"
                          >
                            <b className="block text-[17px] font-[800]">
                              {r[0]}
                            </b>
                            <dl className="mt-2 grid grid-cols-[72px_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-[15px] leading-[1.6]">
                              {r.slice(1).map((c, ci) => (
                                <div key={ci} className="contents">
                                  <dt className="text-[#6b7280]">
                                    {b.table!.head[ci + 1]}
                                  </dt>
                                  <dd className="text-[#3d4450]">{c}</dd>
                                </div>
                              ))}
                            </dl>
                          </li>
                        ))}
                      </ul>
                      <div className="hidden md:block">
                        <table className="w-full border-collapse border-t-2 border-[#15171c] text-left text-[15px] md:text-[16px]">
                          <thead>
                            <tr className="border-b border-[#e6e9ee] bg-[#f6f7f9]">
                              {b.table.head.map((h) => (
                                <th
                                  key={h}
                                  scope="col"
                                  className="px-4 py-3 font-bold text-[#3d4450]"
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {b.table.rows.map((r) => (
                              <tr
                                key={r[0]}
                                className="border-b border-[#e6e9ee] align-top"
                              >
                                {r.map((c, ci) =>
                                  ci === 0 ? (
                                    <th
                                      key={ci}
                                      scope="row"
                                      className="whitespace-nowrap px-4 py-3.5 font-bold"
                                    >
                                      {c}
                                    </th>
                                  ) : (
                                    <td
                                      key={ci}
                                      className="px-4 py-3.5 leading-[1.6] text-[#3d4450]"
                                    >
                                      {c}
                                    </td>
                                  ),
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                  {b.p &&
                    b.table &&
                    b.p.map((t) => (
                      <p
                        key={t}
                        className="text-[17px] leading-[1.8] text-[#3d4450]"
                      >
                        {t}
                      </p>
                    ))}
                </section>
              ))}
            </div>
            {n.next && (
              <aside className="border-t border-[#e6e9ee] py-8">
                <h2 className="text-[15px] font-bold text-[#6b7280]">
                  다음 편
                </h2>
                {nextOne ? (
                  <Link
                    href={`/insight/${nextOne.slug}`}
                    className="mt-2 block text-[18px] font-[800] hover:text-[#256ef4] hover:underline"
                  >
                    {nextOne.title}
                  </Link>
                ) : null}
                <p className="mt-2 text-[16px] leading-[1.7] text-[#3d4450]">
                  {n.next}
                </p>
              </aside>
            )}
            <div className="flex flex-wrap justify-center gap-3 border-t border-[#e6e9ee] pt-8">
              <Link href={n.service.href} className={btnPrimary}>
                {n.service.label}
              </Link>
              <Link href="/insight" className={btnLine}>
                목록
              </Link>
            </div>
          </div>
          {toc.length > 0 && (
            <nav aria-label="이 글의 목차" className="hidden xl:block">
              <div className="sticky top-28 border-l-2 border-[#e6e9ee] pl-5">
                <p className="text-[14px] font-bold text-[#6b7280]">목차</p>
                <ol className="mt-3 space-y-1" role="list">
                  {toc.map((t) => (
                    <li key={t.id}>
                      <a
                        href={`#${t.id}`}
                        className="block py-1.5 text-[15px] leading-[1.5] text-[#3d4450] hover:text-[#256ef4] hover:underline"
                      >
                        {t.h}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            </nav>
          )}
        </div>
      </article>
    </>
  );
}
