import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TrendNav } from "@/components/classic/archive/TrendNav";
import { ArchiveShell, DocHead } from "@/components/classic/archive/ArchiveShell";
import { insightBySlug, insights, readMinutes } from "@/data/classic/insights";
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

// 인사이트 글(운영 노트). 11-21부터 아카이브 틀(왼쪽 분류 트리, 오른쪽 목차). 본문 폭은 읽기 좋게 760px. 주소 /insight/<slug>는 그대로.
// 대표 이미지(scripts/insight-cards.mjs로 만든 제목 카드)는 공유 미리보기, 디스커버, 구조화 데이터에만 쓰고 본문에는 넣지 않는다. 끝에 맞는 유지보수 메뉴 한 줄. 11-21부터 글마다 독립(편 번호, 다음 편 없음).
export default async function ClassicInsightDetailPage({ params }: Props) {
  const { slug } = await params;
  const n = insightBySlug(slug);
  if (!n) notFound();
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
          dateModified: `${n.updated ?? n.date}T09:00:00+09:00`,
          author: { "@id": ORG_ID },
          publisher: { "@id": ORG_ID },
          mainEntityOfPage: `/insight/${slug}`,
        }}
      />
      <LdScript
        data={breadcrumbLd([
          { name: "웹 지식", path: "/knowledge" },
          { name: "운영 노트", path: "/knowledge/notes" },
          { name: n.title, path: `/insight/${slug}` },
        ])}
      />
      <ArchiveShell
        section="notes"
        active={`/insight/${slug}`}
        crumbs={[
          { href: "/knowledge", label: "웹 지식" },
          { href: "/knowledge/notes", label: "운영 노트" },
          { href: `/insight/${slug}`, label: n.title },
        ]}
        toc={[...toc.map((t) => ({ id: t.id, label: t.h })), { id: "rel", label: "관련 문서" }]}
      >
        <article className="max-w-[760px]">
          <DocHead title={n.title} meta={[["주제", n.series], ["최종 수정일", n.updated ?? n.date], ["읽는 시간", `${readMinutes(n)}분`]]} lead={n.summary} />
            <div className="space-y-9 py-8 md:py-10">
              {n.blocks.map((b, bi) => (
                <section key={bi} className="space-y-4">
                  {b.h && (
                    <h2
                      id={`s${bi}`}
                      className="anchor-24 text-[21px] font-[800] leading-[1.4] tracking-[-0.02em] md:text-[24px]"
                    >
                      {b.h}
                    </h2>
                  )}
                  {b.p &&
                    !b.table &&
                    b.p.map((t) => (
                      <Para key={t} t={t} />
                    ))}
                  {b.code && (
                    <pre tabIndex={0} className="overflow-x-auto rounded-md bg-[#1e2127] p-4 text-[13.5px] leading-[1.6] text-[#e6e6e6]">
                      <code>{b.code}</code>
                    </pre>
                  )}
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
                        {b.table.rows.map((r) => {
                          // 첫 칸이 순번 숫자뿐이면 둘째 칸과 합쳐 제목으로 ("1. 장애")
                          const num = /^\d+$/.test(r[0]) && r.length > 2;
                          const start = num ? 2 : 1;
                          return (
                          <li
                            key={r[0]}
                            className="rounded-md bg-[#f6f7f9] p-4"
                          >
                            <b className="block text-[17px] font-[800]">
                              {num ? `${r[0]}. ${r[1]}` : r[0]}
                            </b>
                            <dl className="mt-2 grid grid-cols-[72px_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-[15px] leading-[1.6]">
                              {r.slice(start).map((c, ci) => (
                                <div key={ci} className="contents">
                                  <dt className="text-[#6b7280]">
                                    {b.table!.head[ci + start]}
                                  </dt>
                                  <dd className="text-[#3d4450]">{c}</dd>
                                </div>
                              ))}
                            </dl>
                          </li>
                          );
                        })}
                      </ul>
                      <div className="hidden md:block">
                        <table className="w-full border-collapse border-t-2 border-[#15171c] text-left text-[15px] md:text-[16px]">
                          <thead>
                            <tr className="border-b border-[#e6e9ee] bg-[#f6f7f9]">
                              {b.table.head.map((h) => (
                                <th
                                  key={h}
                                  scope="col"
                                  className="px-3 py-3 font-bold text-[#3d4450] xl:px-4"
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
                                      className="whitespace-nowrap px-3 py-3.5 font-bold xl:px-4"
                                    >
                                      {c}
                                    </th>
                                  ) : (
                                    <td
                                      key={ci}
                                      className="px-3 py-3.5 leading-[1.6] text-[#3d4450] xl:px-4"
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
                      <Para key={t} t={t} />
                    ))}
                </section>
              ))}
            </div>
            {/* 11-21 사용자: 시리즈 금지, 글마다 독립. 다음 편 예고 상자 뺌 */}
            <TrendNav current={`/insight/${n.slug}`} />
        </article>
      </ArchiveShell>
    </>
  );
}

// 11-22 "> "로 시작하는 문단은 관리업체에 보낼 요청 문구. 꺾쇠를 그대로 찍지 않고 인용 상자로
function Para({ t }: { t: string }) {
  if (t.startsWith("> "))
    return (
      <blockquote className="rounded-md border border-[#dfe3ea] bg-[#f5f7fa] px-5 py-4 text-[16px] leading-[1.75] text-[#15171c]">
        {t.slice(2)}
      </blockquote>
    );
  // 11-22 출처는 한 줄만 보이고 더보기로 펼침
  if (t.startsWith("참고: ")) {
    const src = t.slice(4).split(" / ");
    return (
      <details className="group border-t border-[#e6e9ee] pt-3 text-[14px] leading-[1.7] text-[#5b6370]">
        <summary className="flex cursor-pointer list-none items-center gap-2 [&::-webkit-details-marker]:hidden">
          <span className="shrink-0 font-bold text-[#15171c]">출처 {src.length}</span>
          <span className="min-w-0 flex-1 truncate group-open:invisible">{src[0]}</span>
          <span className="shrink-0 font-bold text-[#256ef4] group-open:hidden">더보기</span>
          <span className="hidden shrink-0 font-bold text-[#256ef4] group-open:inline">접기</span>
        </summary>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {src.map((s) => (
            <li key={s}>{srcLink(s)}</li>
          ))}
        </ul>
      </details>
    );
  }
  return <p className="text-[17px] leading-[1.8] text-[#3d4450]">{t}</p>;
}

// "이름 (https://...)" 꼴이면 이름에 링크를 건다
function srcLink(s: string) {
  const m = s.match(/^(.*?)\s*\((https?:\/\/[^)\s]+)\)$/);
  if (!m) return s;
  return (
    <a href={m[2]} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-[#256ef4]">
      {m[1]}
    </a>
  );
}
