import type { Metadata } from "next";
import Link from "next/link";
import { ArchiveShell, DocHead, docH2 } from "@/components/classic/archive/ArchiveShell";
import { recentLog, topics, type TreeNode } from "@/data/classic/archive";
import { pageMeta } from "@/lib/seo";

// 웹 지식 공간 홈(11-21 컨플루언스식): 이 공간 안내, 상황별 시작점, 주제 표, 최근 수정된 문서
export const metadata: Metadata = pageMeta({
  title: "웹 지식",
  description: "홈페이지를 기획하고, 만들고, 넘겨받아 운영하는 데 필요한 것을 기획, 디자인, 프론트엔드, 개발, 인프라, 보안, 검색, 운영과 유지보수, 법과 규정으로 나눠 정리한 문서 모음입니다.",
  path: "/knowledge",
});

const count = (items: TreeNode[]): number => items.reduce((a, n) => a + (n.children ? count(n.children) : n.href ? 1 : 0), 0);

const starts = [
  { title: "홈페이지를 처음 만든다면", desc: "업체 고르기, 견적 질문지, 유지비 계산", topic: "plan" },
  { title: "남이 만든 사이트를 넘겨받았다면", desc: "인수 첫날 할 일, 기록표, 월 점검", topic: "ops" },
  { title: "업체에 화면을 설명해야 한다면", desc: "화면 부품 이름과 요청 문장, 화면 예시", topic: "design" },
  { title: "보안 경고 메일을 받았다면", desc: "보안 경보, PHP 버전, 인증서", topic: "security" },
];

export default function KnowledgeHome() {
  const ts = topics();
  const total = ts.reduce((a, t) => a + t.groups.reduce((b, g) => b + count(g.items), 0), 0);
  const log = recentLog(8);
  return (
    <ArchiveShell active="/knowledge" crumbs={[{ href: "/knowledge", label: "웹 지식" }]} toc={[{ id: "start", label: "처음 오셨다면" }, { id: "topics", label: "주제" }, { id: "recent", label: "최근 수정된 문서" }]}>
      <DocHead
        title="웹 지식"
        meta={[["관리", "곰파트너"], ["문서", `${total}개`], ["최종 수정일", log[0]?.date ?? "2026-11-21"]]}
        leadLabel="이 공간은"
        lead="홈페이지를 기획하고, 만들고, 넘겨받아 운영하는 데 필요한 것을 주제별로 정리한 문서 모음입니다. 왼쪽 페이지 트리에서 주제를 고르거나 검색으로 찾습니다."
      />

      <h2 id="start" className={docH2}>처음 오셨다면</h2>
      <ul role="list" className="mt-4 grid gap-3 sm:grid-cols-2">
        {starts.map((s) => {
          const t = ts.find((x) => x.id === s.topic)!;
          return (
            <li key={s.title}>
              <Link href={`/knowledge/${t.id}`} className="group block h-full rounded-lg border border-[#d9dee5] bg-white px-4 py-3.5 hover:border-[#256ef4]">
                <span className="block text-[16px] font-[800] group-hover:text-[#256ef4]">{s.title}</span>
                <span className="mt-1 block text-[14px] text-[#5b6370]">{s.desc}</span>
                <span className="mt-2 block text-[12.5px] font-bold text-[#1d5fd6]">{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <h2 id="topics" className={docH2}>주제</h2>
      <div className="mt-4 overflow-hidden rounded-lg border border-[#e1e5eb]">
        <table className="w-full border-collapse text-[14.5px]">
          <thead>
            <tr className="bg-[#f4f6f9] text-left">
              <th scope="col" className="px-4 py-2.5 font-[800]">주제</th>
              <th scope="col" className="hidden px-4 py-2.5 font-[800] md:table-cell">들어 있는 것</th>
              <th scope="col" className="px-4 py-2.5 text-right font-[800]">문서</th>
            </tr>
          </thead>
          <tbody>
            {ts.map((t) => (
              <tr key={t.id} className="border-t border-[#e6e9ee] align-top">
                <th scope="row" className="px-4 py-3 text-left font-[800]">
                  <Link href={`/knowledge/${t.id}`} className="hover:text-[#256ef4] hover:underline underline-offset-4">{t.label}</Link>
                  <span className="mt-0.5 block text-[13px] font-normal text-[#5b6370] md:hidden">{t.desc}</span>
                </th>
                <td className="hidden px-4 py-3 leading-[1.6] text-[#3d4450] md:table-cell">{t.desc}</td>
                <td className="px-4 py-3 text-right tabular-nums text-[#5b6370]">{t.groups.reduce((b, g) => b + count(g.items), 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 id="recent" className={docH2}>최근 수정된 문서</h2>
      <ul role="list" className="mt-2">
        {log.map((l, i) => (
          <li key={i} className="border-b border-[#e6e9ee]">
            <Link href={l.href} className="group grid grid-cols-[88px_minmax(0,1fr)] gap-x-3 py-3 text-[15px] md:grid-cols-[100px_minmax(0,1fr)_120px]">
              <time dateTime={l.date} className="text-[13.5px] tabular-nums text-[#5b6370]">{l.date}</time>
              <span className="font-bold leading-[1.5] group-hover:text-[#256ef4] group-hover:underline underline-offset-4">{l.title}</span>
              <span className="hidden text-right text-[13px] text-[#5b6370] md:block">{l.kind}</span>
            </Link>
          </li>
        ))}
      </ul>
    </ArchiveShell>
  );
}
