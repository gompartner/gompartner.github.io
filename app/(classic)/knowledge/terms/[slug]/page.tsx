import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArchiveShell, TakeoverBox, docH2 } from "@/components/classic/archive/ArchiveShell";
import { docUpdated, groupBySlug, shortTitle, takeover, termHref, termSlugs } from "@/data/classic/archive";
import { termGroups, termLabels } from "@/data/classic/glossary";
import { termImages } from "@/data/classic/glossaryImages";
import { pageMeta } from "@/lib/seo";

// 용어 묶음 문서 한 장. 내용은 data/classic/glossary.ts, 인수 시 확인 사항은 data/classic/archive.ts
const CHECKED = "2026-11-21";
// 인수 시 확인 사항의 한 줄 설명을 묶음 이름으로 만들면 어색한 묶음만 따로 적는다
const TAKE_SUB: Record<string, string> = { g44: "3D와 움직임이 들어간 사이트를 인수했다면" };

/** 을/를: 마지막 글자 받침으로 고른다(영문 UI는 "유아이"라 를) */
function eulReul(w: string) {
  const c = w.trim().slice(-1);
  const code = c.charCodeAt(0) - 0xac00;
  if (code < 0 || code > 11171) return "를";
  return code % 28 ? "을" : "를";
}

export function generateStaticParams() {
  return termGroups.map((g) => ({ slug: termSlugs[g.id] }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const g = groupBySlug((await params).slug);
  if (!g) return {};
  return pageMeta({
    title: `${g.title} | 위키`,
    description: `${g.terms.map((t) => t.name).join(", ")}. 형태와 적용 사례, 와이어프레임, 업체와 AI에 요청하는 문장.`,
    path: termHref(g),
  });
}

export default async function TermDoc({ params }: { params: Promise<{ slug: string }> }) {
  const g = groupBySlug((await params).slug);
  if (!g) notFound();
  const take = takeover[g.id];
  const labels = termLabels[g.sec];
  // 나중에 더한 묶음은 더한 날(data/classic/archive.ts 의 manualLog)을 최종 수정일로 쓴다
  const checked = docUpdated(termHref(g)) ?? CHECKED;
  const toc = [{ id: "cmp", label: "한눈에 비교" }, { id: "terms", label: "용어별로 보기" }, ...(take ? [{ id: "take", label: "인수 시 확인 사항" }] : [])];

  return (
    <ArchiveShell
      section="terms"
      active={termHref(g)}
      crumbs={[{ href: "/knowledge", label: "위키" }, { href: "/knowledge/terms", label: "용어" }, { href: termHref(g), label: shortTitle(g) }]}
      toc={toc}
      head={{ title: g.title, meta: [["주제", `${g.sec}, ${g.cat}`], ["용어", `${g.terms.length}개`], ["최종 수정일", checked]] }}
      article={{ title: g.title, description: `${g.terms.map((t) => t.name).join(", ")}. 형태와 적용 사례, 와이어프레임, 업체와 AI에 요청하는 문장.`, modified: checked }}
    >
      <h2 id="cmp" className={docH2}>한눈에 비교</h2>
      {/* 휴대폰: 표 대신 용어마다 세로 칸(11-21 사용자: 가로 스크롤 말고 세로로) */}
      <ul role="list" className="mt-4 border-t-2 border-[#15171c] md:hidden">
        {g.terms.map((t) => (
          <li key={t.id} className="border-b border-[#e6e9ee] py-3.5">
            <a href={`#${t.id}`} className="text-[16px] font-[800] tracking-[-0.02em] hover:text-[#256ef4]">{t.name}</a>
            <dl className="mt-1.5 grid grid-cols-[5.2em_minmax(0,1fr)] gap-x-2 gap-y-1 text-[14.5px] leading-[1.55]">
              <dt className="text-[#5b6370]">{labels[0]}</dt>
              <dd>{t.look}</dd>
              <dt className="text-[#5b6370]">{labels[1]}</dt>
              <dd>{t.use}</dd>
            </dl>
          </li>
        ))}
      </ul>
      <div className="mt-4 hidden md:block">
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
          <section key={t.id} id={t.id} className="grid anchor-24 gap-5 border-b border-[#e6e9ee] py-7 md:grid-cols-[minmax(0,340px)_minmax(0,1fr)] md:gap-7">
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
                <p className="mt-4 border-l-2 border-[#15171c] py-0.5 pl-4 text-[15.5px] leading-[1.65]">
                  <span className="mb-0.5 block text-[13px] font-bold text-[#5b6370]">이렇게 요청하세요</span>&quot;{t.say}&quot;
                </p>
              ) : null}
            </div>
          </section>
        ))}
      </div>

      {take ? <TakeoverBox sub={TAKE_SUB[g.id] ?? `다른 업체가 만든 사이트의 ${shortTitle(g)}${eulReul(shortTitle(g))} 인수했다면`} items={take} /> : null}

    </ArchiveShell>
  );
}
