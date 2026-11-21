import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHead, wrap } from "@/components/classic/ui";
import { jaryo } from "@/data/classic/jaryo";
import { termGroups, termSections } from "@/data/classic/glossary";
import { insights } from "@/data/classic/insights";
import { toolCategories, tools } from "@/data/classic/tools";
import { catalogProjects, hrefOf, thumbOf } from "@/components/classic/works/samples";
import { pageMeta } from "@/lib/seo";

// 11-21 자료 허브. 점검표, 용어 사전, 인사이트, 무료 도구, 제작 샘플을 한 화면에서 찾는다.
// 각 자료는 원래 주소(/glossary, /insight, /tools, /works)에 그대로 두고 여기서는 연결만 한다.
// 인스타 '자료' 댓글 DM도 /go/jaryo/ 를 거쳐 여기로 들어오므로 점검표를 맨 위에 둔다.
export const metadata: Metadata = pageMeta({
  title: "자료",
  description: "홈페이지 점검표와 인수 기록표, 웹 용어 사전, 운영 인사이트, 무료 도구, 업종별 제작 샘플을 한곳에 모았습니다.",
  path: "/jaryo",
  image: { src: "/og/jaryo.jpg", alt: "곰파트너 자료" },
});

const termCount = termGroups.reduce((a, g) => a + g.terms.length, 0);

// 인사이트 묶음: 묶음마다 편 수와 1편
const series = [...new Set(insights.map((n) => n.series))].map((s) => {
  const list = insights.filter((n) => n.series === s).sort((a, b) => a.no - b.no);
  return { name: s, count: list.length, first: list[0] };
});

const sectionHead = "flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b-2 border-[#15171c] pb-4";
const sectionTitle = "text-[24px] font-[800] leading-[1.3] tracking-[-0.04em] md:text-[30px]";
const moreLink = "inline-flex items-center gap-1 text-[15px] font-bold text-[#256ef4] hover:underline underline-offset-4";

function Head({ id, title, count, href, more }: { id: string; title: string; count: string; href?: string; more?: string }) {
  return (
    <div className={sectionHead}>
      <h2 id={id} className={sectionTitle}>
        {title} <span className="ml-1 text-[16px] font-bold text-[#5b6370] md:text-[18px]">{count}</span>
      </h2>
      {href && more ? (
        <Link href={href} className={moreLink}>
          {more} <ArrowRight size={16} aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}

export default function ClassicJaryoPage() {
  return (
    <>
      <PageHead title="자료" trail={[{ href: "/jaryo", label: "자료" }]} />

      <div className={`${wrap} space-y-16 pb-20 pt-10 md:space-y-24 md:pb-28 md:pt-14`}>
        {/* 점검표와 기록표 */}
        <section aria-labelledby="hub-sheets">
          <Head id="hub-sheets" title="점검표와 기록표" count={`${jaryo.length}종`} />
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
            {jaryo.map((it, i) => (
              <li key={it.id}>
                <Link href={`/jaryo/${it.id}`} className="group flex h-full items-center gap-4 rounded-lg border border-[#d9dee5] bg-white px-4 py-3 md:py-4 transition-colors hover:border-[#256ef4]">
                  <span className="relative block w-[48px] shrink-0 md:w-[64px] overflow-hidden rounded-[3px] border border-[#e1e5eb] bg-[#e9edf3]">
                    <Image src={`/images/jaryo/${it.id}-1.jpg`} alt="" width={128} height={181} className="block h-auto w-full" priority={i < 3} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[14px] font-bold text-[#256ef4]">{it.when}</span>
                    <span className="mt-0.5 block text-[17px] font-[800] leading-[1.4] tracking-[-0.03em] text-[#15171c] group-hover:text-[#256ef4]">{it.title}</span>
                    <span className="mt-1 block text-[14px] text-[#5b6370]">PDF {it.pages ?? 2}쪽</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* 웹 용어 사전 */}
        <section aria-labelledby="hub-terms">
          <Head id="hub-terms" title="웹 용어 사전" count={`용어 ${termCount}개`} href="/glossary" more="용어 사전 전체" />
          <div className="mt-6 space-y-8">
            {termSections.map((sec) => {
              const groups = termGroups.filter((g) => g.sec === sec);
              return (
                <div key={sec}>
                  <h3 className="text-[18px] font-[800] tracking-[-0.03em]">
                    {sec} <span className="text-[14px] font-bold text-[#5b6370]">{groups.length}묶음</span>
                  </h3>
                  <ul className="mt-3 flex flex-wrap gap-2" role="list">
                    {groups.map((g, gi) => (
                      // 휴대폰은 묶음 12개까지만(나머지는 용어 사전 전체에서)
                      <li key={g.id} className={gi >= 12 ? "max-md:hidden" : undefined}>
                        <Link href={`/glossary#${g.terms[0].id}`} className="inline-flex h-9 items-center rounded-md border border-[#d9dee5] bg-white px-3 text-[14px] text-[#3d4450] transition-colors hover:border-[#256ef4] hover:text-[#256ef4]">
                          {g.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {groups.length > 12 ? (
                    <Link href="/glossary" className={`${moreLink} mt-3 md:hidden`}>
                      {sec} {groups.length}묶음 모두 보기 <ArrowRight size={16} aria-hidden />
                    </Link>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>

        {/* 인사이트 */}
        <section aria-labelledby="hub-insight">
          <Head id="hub-insight" title="인사이트" count={`${insights.length}편`} href="/insight" more="인사이트 전체" />
          <ul className="mt-2" role="list">
            {series.map((s) => (
              <li key={s.name} className="border-b border-[#e6e9ee]">
                <Link href={`/insight/${s.first.slug}`} className="group flex flex-col gap-1 py-5 md:flex-row md:items-baseline md:gap-6">
                  <span className="w-[220px] shrink-0 text-[17px] font-[800] tracking-[-0.03em] text-[#15171c]">
                    {s.name} <span className="text-[14px] font-bold text-[#5b6370]">{s.count}편</span>
                  </span>
                  <span className="text-[16px] text-[#3d4450] group-hover:text-[#256ef4] group-hover:underline underline-offset-4">1편 {s.first.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* 무료 도구 */}
        <section aria-labelledby="hub-tools">
          <Head id="hub-tools" title="무료 도구" count={`${tools.length}종`} href="/tools" more="도구 전체" />
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-5">
            {toolCategories.map((c) => (
              <div key={c}>
                <h3 className="text-[16px] font-[800] tracking-[-0.03em] text-[#5b6370]">{c}</h3>
                <ul className="mt-3 space-y-2" role="list">
                  {tools
                    .filter((t) => t.category === c)
                    .map((t) => (
                      <li key={t.href}>
                        <Link href={t.href} className="text-[15px] font-bold md:text-[16px] text-[#15171c] hover:text-[#256ef4] hover:underline underline-offset-4">
                          {t.title}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* 제작 샘플 */}
        <section aria-labelledby="hub-works">
          <Head id="hub-works" title="업종별 제작 샘플" count={`${catalogProjects.length}개`} href="/works" more="샘플 전체" />
          <ul className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4" role="list">
            {catalogProjects.slice(0, 8).map((p) => (
              <li key={p.id}>
                <Link href={hrefOf(p)} className="group block">
                  <span className="block overflow-hidden rounded-md border border-[#e1e5eb] bg-[#f4f6f9]">
                    <Image src={thumbOf(p)} alt="" width={720} height={450} sizes="(min-width: 768px) 290px, 45vw" className="block aspect-[16/10] h-auto w-full object-cover object-top transition-transform group-hover:scale-[1.02]" />
                  </span>
                  <span className="mt-2 block text-[15px] font-bold leading-[1.4] text-[#15171c] group-hover:text-[#256ef4]">{p.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
