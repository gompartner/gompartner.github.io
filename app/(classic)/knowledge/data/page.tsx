import type { Metadata } from "next";
import Link from "next/link";
import { ArchiveShell, docH2 } from "@/components/classic/archive/ArchiveShell";
import { LineChart } from "@/components/classic/archive/LineChart";
import { TREND_CHECKED, datasets } from "@/data/classic/trendData";
import { pageMeta } from "@/lib/seo";

// 데이터 분류(11-21). 차트마다 출처, 확인일, 원본 CSV. 출처 없는 숫자는 넣지 않는다.
export const metadata: Metadata = pageMeta({
  title: "데이터 | 위키",
  description: "브라우저, 모바일 접속, https, Flash와 jQuery, 페이지 무게를 연도별 차트와 원본 CSV로 공개합니다. 출처와 확인일을 함께 적습니다.",
  path: "/knowledge/data",
});

export default function ArchiveData() {
  return (
    <ArchiveShell section="data" active="/knowledge/data" crumbs={[{ href: "/knowledge", label: "위키" }, { href: "/knowledge/data", label: "데이터" }]} toc={datasets.map((d) => ({ id: d.id, label: d.title }))} head={{ title: "데이터", meta: [["자료", `${datasets.length}개`], ["최종 수정일", TREND_CHECKED]], lead: "트렌드 문서에 쓴 숫자의 원본입니다. 차트마다 출처와 확인일을 적고, 받을 수 있는 원본은 CSV로 둡니다." }} related={false}>
      {datasets.map((d) => (
        <section key={d.id} aria-labelledby={d.id}>
          <h2 id={d.id} className={docH2}>{d.title}</h2>
          <p className="mt-2 text-[15px] text-[#3d4450]">{d.desc}</p>
          <LineChart title={d.title} sub={d.unit ? `단위 ${d.unit}` : "상대값(최고 100)"} series={d.series} unit={d.unit} max={d.max ?? 100} source={{ label: d.source.label, href: d.source.href, note: d.note }} />
          {d.csv.length ? <p className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-[14px]">
            <span className="text-[#5b6370]">원본 CSV</span>
            {d.csv.map((c) => (
              <a key={c.href} href={c.href} download className="-my-2 py-2 font-bold text-[#15171c] underline underline-offset-4">{c.label}</a>
            ))}
          </p> : null}
          {d.usedIn ? (
            <p className="mt-1.5 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-[14px]">
              <span className="text-[#5b6370]">이 데이터를 쓴 문서</span>
              {d.usedIn.map((u) => (
                <Link key={u.href} href={u.href} className="-my-2 py-2 font-bold text-[#15171c] underline underline-offset-4">{u.label}</Link>
              ))}
            </p>
          ) : null}
        </section>
      ))}
    </ArchiveShell>
  );
}
