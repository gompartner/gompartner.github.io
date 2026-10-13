import Link from "next/link";
import type { Industry } from "@/data/industries";
import { estimateFor, manwon, plans } from "@/data/pricing";
import type { Project } from "@/lib/types";

// 업종 페이지의 비용 표. "○○ 홈페이지 제작 비용"을 묻는 검색과 AI 답변에 바로 쓰이도록
// 첫 문장에 금액과 기간을 적고, 같은 내용을 FAQPage 구조화 데이터로도 넣는다.
export function IndustryCost({ industry, projects }: { industry: Industry; projects: Project[] }) {
  const rows = projects
    .map((p) => ({ project: p, est: estimateFor(p.id) }))
    .filter((r): r is { project: Project; est: NonNullable<typeof r.est> } => r.est !== null)
    .sort((a, b) => a.est.total - b.est.total);
  const base = plans[0];
  const totals = rows.map((r) => r.est.total);
  const days = rows.map((r) => r.est.days);

  const lead =
    rows.length === 0
      ? `소개만 하는 홈페이지는 ${manwon(base.price)}, 작업 기간 ${base.days}일입니다. 신청·심사 같은 업무 프로그램은 화면 수를 듣고 별도 견적을 제공합니다.`
      : `소개만 하는 홈페이지는 ${manwon(base.price)}, 작업 기간 ${base.days}일입니다. 아래 샘플처럼 기능을 넣으면 ${rangeText(totals.map(manwon))}, 작업 기간은 ${rangeText(days.map((d) => `${d}일`))}입니다.`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `${industry.label} 홈페이지 제작 비용은 얼마인가요?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: [lead, ...rows.map((r) => `${r.project.title}: ${manwon(r.est.total)}, ${r.est.days}일`)].join(" "),
        },
      },
      {
        "@type": "Question",
        name: "가격에 무엇이 포함되나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `${plans.map((p) => `${p.title} ${manwon(p.price)}(${p.includes.join(", ")})`).join(". ")}. 모든 패키지에 원본 소스와 완료 후 1개월 무상 오류 수정이 포함됩니다. 도메인과 호스팅 비용은 별도입니다.`,
        },
      },
    ],
  };

  return (
    <section aria-labelledby="cost-title" className="mt-14">
      <h2 id="cost-title" className="text-[24px] font-bold leading-[1.5] tracking-[-0.01em] md:text-[32px]">
        {industry.label} 홈페이지 제작 비용
      </h2>
      <p className="mt-3 max-w-[760px] text-[17px] leading-[1.7] text-foreground-secondary">{lead}</p>
      {rows.length > 0 && (
        <div className="wt-card mt-6 overflow-hidden bg-white">
          <table className="w-full text-left text-[15px] md:text-[17px]">
            <caption className="sr-only">{industry.label} 샘플별 제작 비용과 기간</caption>
            <thead className="border-b-[3px] border-[#1d1d1f] bg-[#fff3b0] text-[14px] font-bold text-foreground-secondary md:text-[15px]">
              <tr>
                <th scope="col" className="px-4 py-3">샘플</th>
                <th scope="col" className="hidden px-4 py-3 md:table-cell">구성</th>
                <th scope="col" className="px-3 py-3 text-right md:px-4">비용</th>
                <th scope="col" className="px-3 py-3 text-right md:px-4">기간</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map(({ project, est }) => (
                <tr key={project.id}>
                  <th scope="row" className="px-4 py-3 font-bold">
                    <Link href={project.demoUrl.replace("/demo/", "/sample/")} prefetch={false} className="underline-offset-4 hover:underline">
                      {project.title}
                    </Link>
                    <span className="mt-0.5 block text-[14px] font-normal text-foreground-secondary md:hidden">{features(est)}</span>
                  </th>
                  <td className="hidden px-4 py-3 text-foreground-secondary md:table-cell">{features(est)}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-right md:px-4 font-bold">{manwon(est.total)}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-right md:px-4">{est.days}일</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </section>
  );
}

function features(est: NonNullable<ReturnType<typeof estimateFor>>) {
  return [est.plan.title, ...est.lines.map((l) => l.name)].join(", ");
}

function rangeText(values: string[]) {
  const first = values[0];
  const last = values[values.length - 1];
  return first === last ? first : `${first}에서 ${last}`;
}
