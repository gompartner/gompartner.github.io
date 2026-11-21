import type { Metadata } from "next";
import Link from "next/link";
import { ArchiveShell, DocHead, docH2 } from "@/components/classic/archive/ArchiveShell";
import { counts, shortTitle, takeover, termHref } from "@/data/classic/archive";
import { termGroups, termSections } from "@/data/classic/glossary";
import { termImages } from "@/data/classic/glossaryImages";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "용어 | 아카이브",
  description: `홈페이지 화면 부품, 디자인 용어, 운영 용어 ${counts.terms}개를 와이어프레임과 요청 문장으로 정리했습니다.`,
  path: "/archive/terms",
});

export default function ArchiveTerms() {
  return (
    <ArchiveShell section="terms" active="/archive/terms" crumbs={[{ href: "/archive", label: "아카이브" }, { href: "/archive/terms", label: "용어" }]} toc={termSections.map((s, i) => ({ id: `sec-${i}`, label: s }))}>
      <DocHead
        title="용어"
        meta={[["묶음", `${counts.groups}개`], ["용어", `${counts.terms}개`], ["전체 검색", "웹 용어 사전"]]}
        lead="이름을 정확히 말하면 업체와 AI에 요청이 한 번에 전달됩니다. 묶음마다 비교 표, 와이어프레임, 요청 문장을 함께 둡니다."
      />
      <p className="mt-4 text-[14.5px]">
        <Link href="/glossary" className="font-bold text-[#256ef4] hover:underline underline-offset-4">웹 용어 사전에서 {counts.terms}개 한 번에 검색하기</Link>
      </p>
      {termSections.map((sec, i) => {
        const gs = termGroups.filter((g) => g.sec === sec);
        return (
          <section key={sec} aria-labelledby={`sec-${i}`}>
            <h2 id={`sec-${i}`} className={docH2}>
              {sec} <span className="text-[15px] font-bold text-[#5b6370]">{gs.length}묶음</span>
            </h2>
            <ul role="list" className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {gs.map((g) => {
                const img = g.terms.find((t) => termImages[t.id]);
                return (
                  <li key={g.id}>
                    <Link href={termHref(g)} className="group flex h-full gap-3 rounded-lg border border-[#d9dee5] bg-white p-3 transition-colors hover:border-[#256ef4]">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={`/images/glossary/${img.id}.webp`} alt="" width={96} height={72} loading="lazy" className="h-[72px] w-[96px] shrink-0 rounded border border-[#e6e9ee] bg-[#f5f7fa] object-cover object-top" />
                      ) : null}
                      <span className="min-w-0">
                        <span className="block text-[15.5px] font-[800] leading-[1.4] tracking-[-0.02em] group-hover:text-[#256ef4]">{shortTitle(g)}</span>
                        <span className="mt-1 block text-[13px] leading-[1.5] text-[#5b6370]">{g.terms.map((t) => t.name).slice(0, 4).join(", ")}</span>
                        {takeover[g.id] ? <span className="mt-1.5 inline-block rounded bg-[#15171c] px-1.5 py-0.5 text-[11px] font-bold text-white">이어받을 때 볼 것</span> : null}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </ArchiveShell>
  );
}
