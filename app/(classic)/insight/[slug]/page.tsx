import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArchiveShell, docH2Base, type Src } from "@/components/classic/archive/ArchiveShell";
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

// 인사이트 글(운영 노트). 위키 문서 틀(ArchiveShell)을 쓴다. 본문 폭은 읽기 좋게 760px. 주소 /insight/<slug>는 그대로.
// 대표 이미지(scripts/insight-cards.mjs로 만든 제목 카드)는 공유 미리보기, 디스커버, 구조화 데이터에만 쓰고 본문에는 넣지 않는다. 11-21부터 글마다 독립(편 번호, 다음 편 없음).
// 11-26 글 끝 "참고: " 문단(출처)은 본문에서 빼 틀의 참고 자료 한 칸으로 넘긴다. 관련 문서도 틀이 세 개까지만 보여 준다.
export default async function ClassicInsightDetailPage({ params }: Props) {
  const { slug } = await params;
  const n = insightBySlug(slug);
  if (!n) notFound();
  const toc = n.blocks
    .map((b, bi) => ({ label: b.h, id: `s${bi}` }))
    .filter((t): t is { label: string; id: string } => !!t.label);
  const sources = n.blocks.flatMap((b) => (b.p ?? []).filter(isSrc)).flatMap((t) => t.slice(SRC.length).split(" / ")).map(toSrc);

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
          { name: "위키", path: "/knowledge" },
          { name: "운영 노트", path: "/knowledge/notes" },
          { name: n.title, path: `/insight/${slug}` },
        ])}
      />
      <ArchiveShell
        section="notes"
        active={`/insight/${slug}`}
        crumbs={[
          { href: "/knowledge", label: "위키" },
          { href: "/knowledge/notes", label: "운영 노트" },
          { href: `/insight/${slug}`, label: n.title },
        ]}
        toc={toc}
        head={{ title: n.title, meta: [["주제", n.series], ["최종 수정일", n.updated ?? n.date], ["읽는 시간", `${readMinutes(n)}분`]], lead: n.summary }}
        sources={sources}
        article
      >
        {n.blocks.map((b, bi) => (
          <section key={bi} className="mt-12 space-y-4 first-of-type:mt-10">
            {b.h && (
              <h2 id={`s${bi}`} className={docH2Base}>
                {b.h}
              </h2>
            )}
            {b.p && !b.table && b.p.map((t) => <Para key={t} t={t} />)}
            {b.code && (
              <pre tabIndex={0} className="overflow-x-auto rounded-md bg-[#1e2127] p-4 text-[13.5px] leading-[1.6] text-[#e6e6e6]">
                <code>{b.code}</code>
              </pre>
            )}
            {b.steps && (
              <ol className="border-t border-[#e6e9ee]" role="list">
                {b.steps.map((s, si) => (
                  <li key={s.b} className="flex gap-4 border-b border-[#e6e9ee] py-4">
                    <span aria-hidden className="mt-0.5 w-5 shrink-0 text-[17px] font-[800] tabular-nums text-[#5b6370]">
                      {si + 1}
                    </span>
                    <div>
                      <b className="block text-[17px] font-[800] leading-[1.5]">{s.b}</b>
                      <p className="mt-1 text-[16px] leading-[1.7] text-[#3d4450]">{s.t}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
            {b.table && (
              <>
                {/* 휴대폰은 줄마다 한 묶음으로, md부터 표로 */}
                <ul className="border-t border-[#15171c] md:hidden" role="list">
                  {b.table.rows.map((r, ri) => {
                    // 첫 칸이 순번 숫자뿐이면 둘째 칸과 합쳐 제목으로 ("1. 장애")
                    const num = /^\d+$/.test(r[0]) && r.length > 2;
                    const start = num ? 2 : 1;
                    return (
                      <li key={ri} className="border-b border-[#e6e9ee] py-3.5">
                        <b className="block text-[16.5px] font-[800]">{num ? `${r[0]}. ${r[1]}` : r[0]}</b>
                        <dl className="mt-1.5 grid grid-cols-[72px_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-[15px] leading-[1.6]">
                          {r.slice(start).map((c, ci) => (
                            <div key={ci} className="contents">
                              <dt className="text-[#5b6370]">{b.table!.head[ci + start]}</dt>
                              <dd className="text-[#3d4450]">{c}</dd>
                            </div>
                          ))}
                        </dl>
                      </li>
                    );
                  })}
                </ul>
                <div className="hidden md:block">
                  <table className="w-full border-collapse border-t border-[#15171c] text-left text-[15.5px]">
                    <thead>
                      <tr className="border-b border-[#d9dee5]">
                        {b.table.head.map((h, hi) => (
                          <th key={hi} scope="col" className="px-3 py-3 text-[14.5px] font-bold text-[#5b6370] first:pl-0">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {b.table.rows.map((r, ri) => (
                        <tr key={ri} className="border-b border-[#e6e9ee] align-top">
                          {r.map((c, ci) =>
                            // 첫 칸이 빈 줄은 줄 제목이 아니라 빈 칸으로(빈 머리 칸은 화면 읽기 프로그램에서 이름 없는 제목이 된다)
                            ci === 0 && c.trim() ? (
                              <th key={ci} scope="row" className="whitespace-nowrap py-3.5 pl-0 pr-3 font-bold">
                                {c}
                              </th>
                            ) : (
                              <td key={ci} className="px-3 py-3.5 leading-[1.6] text-[#3d4450] first:pl-0">
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
            {b.p && b.table && b.p.map((t) => <Para key={t} t={t} />)}
          </section>
        ))}
      </ArchiveShell>
    </>
  );
}

const SRC = "참고: ";
const isSrc = (t: string) => t.startsWith(SRC);
// "이름 (https://...)" 꼴이면 이름과 주소로 나눈다
function toSrc(s: string): Src {
  const m = s.match(/^(.*?)\s*\((https?:\/\/[^)\s]+)\)$/);
  return m ? { label: m[1], href: m[2] } : { label: s };
}

function Para({ t }: { t: string }) {
  // 출처 문단은 틀의 참고 자료로 간다
  if (isSrc(t)) return null;
  // 11-22 "> "로 시작하는 문단은 관리업체에 보낼 요청 문구. 꺾쇠를 그대로 찍지 않고 인용 줄로
  if (t.startsWith("> ")) return <blockquote className="border-l-2 border-[#15171c] py-1 pl-5 text-[16.5px] leading-[1.75] text-[#15171c]">{t.slice(2)}</blockquote>;
  return <p className="text-[17px] leading-[1.8] text-[#3d4450]">{t}</p>;
}
