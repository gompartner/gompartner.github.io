import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHead, wrap } from "@/components/classic/ui";
import { cases } from "@/data/classic/cases";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMeta({ title: "고객 사례", description: "곰파트너가 만든 고객 홈페이지와 맡긴 이유, 걸린 기간과 비용입니다.", path: "/classic/cases" }),
  // 사례가 쌓이기 전까지는 검색에 내보내지 않는다
  robots: { index: false, follow: true },
};

const dt = "text-[14px] font-bold text-[#3d4450]";

export default function ClassicCasesPage() {
  if (cases.length === 0) notFound();
  return (
    <>
      <PageHead title="고객 사례" trail={[{ href: "/classic/cases", label: "고객 사례" }]} />
      <ul className={`${wrap} grid gap-8 py-14 md:grid-cols-2 md:py-20`} role="list">
        {cases.map((c) => (
          <li key={c.id} className="border-t-2 border-[#15171c] pt-5">
            <p className="text-[15px] font-bold text-[#256ef4]">{c.industry}</p>
            <dl className="mt-3 space-y-3 text-[16px] leading-[1.65]">
              <div>
                <dt className={dt}>이런 문제가 있었어요</dt>
                <dd className="mt-0.5">{c.problem}</dd>
              </div>
              <div>
                <dt className={dt}>이렇게 만들었어요</dt>
                <dd className="mt-0.5">{c.made}</dd>
              </div>
              <div>
                <dt className={dt}>기간과 비용</dt>
                <dd className="mt-0.5 tabular-nums">{c.term}</dd>
              </div>
            </dl>
            {c.quote && <p className="mt-4 bg-[#f4f6f9] px-4 py-3 text-[16px] font-bold leading-[1.6]">{c.quote}</p>}
            {c.url && (
              <a href={c.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-[15px] font-bold text-[#256ef4] hover:underline">
                사이트 보기
              </a>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
