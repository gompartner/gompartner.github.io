import type { Metadata } from "next";
import Link from "next/link";
import { ArchiveShell, DocHead, docH2 } from "@/components/classic/archive/ArchiveShell";
import { LineChart } from "@/components/classic/archive/LineChart";
import { TREND_CHECKED, datasets } from "@/data/classic/trendData";
import { pageMeta } from "@/lib/seo";

// 데이터 분류(11-21). 차트마다 출처, 확인일, 원본 CSV. 출처 없는 숫자는 넣지 않는다.
export const metadata: Metadata = pageMeta({
  title: "데이터 | 아카이브",
  description: "브라우저, 모바일 접속, https, Flash와 jQuery, 페이지 무게를 연도별 차트와 원본 CSV로 공개합니다. 출처와 확인일을 함께 적습니다.",
  path: "/archive/data",
});

export default function ArchiveData() {
  return (
    <ArchiveShell section="data" active="/archive/data" crumbs={[{ href: "/archive", label: "아카이브" }, { href: "/archive/data", label: "데이터" }]} toc={datasets.map((d) => ({ id: d.id, label: d.title }))}>
      <DocHead title="데이터" meta={[["자료", `${datasets.length}개`], ["확인일", TREND_CHECKED]]} lead="트렌드 문서에 쓴 숫자의 원본입니다. 차트마다 출처와 확인일을 적고, 받을 수 있는 원본은 CSV로 둡니다." />
      {datasets.map((d) => (
        <section key={d.id} aria-labelledby={d.id}>
          <h2 id={d.id} className={docH2}>{d.title}</h2>
          <p className="mt-2 text-[15px] text-[#3d4450]">{d.desc}</p>
          <LineChart title={d.title} sub={`단위 ${d.unit}`} series={d.series} unit={d.unit === "KB" ? "KB" : "%"} max={d.max ?? 100} source={{ label: d.source.label, href: d.source.href, note: d.note }} />
          {d.csv.length ? <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13.5px]">
            <span className="text-[#5b6370]">원본 CSV</span>
            {d.csv.map((c) => (
              <a key={c.href} href={c.href} download className="font-bold text-[#256ef4] hover:underline underline-offset-4">{c.label}</a>
            ))}
          </p> : null}
          {d.usedIn ? (
            <p className="mt-1.5 text-[13.5px]">
              <span className="text-[#5b6370]">이 데이터를 쓴 문서 </span>
              {d.usedIn.map((u) => (
                <Link key={u.href} href={u.href} className="font-bold text-[#256ef4] hover:underline underline-offset-4">{u.label}</Link>
              ))}
            </p>
          ) : null}
        </section>
      ))}
    </ArchiveShell>
  );
}
