import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArchiveShell, DocHead, docH2 } from "@/components/classic/archive/ArchiveShell";
import { jaryo } from "@/data/classic/jaryo";
import { toolCategories, tools } from "@/data/classic/tools";
import { pageMeta } from "@/lib/seo";

// 점검표와 도구. 점검표 상세(/jaryo/<id>)와 도구(/tools/...) 주소는 그대로. 인스타 '자료' DM으로 들어오는 /jaryo 는 여기로 넘긴다.
export const metadata: Metadata = pageMeta({
  title: "점검표와 도구 | 웹 지식",
  description: "홈페이지 견적 질문지, 점검표, 넘겨받은 날 기록표와 매달 점검표, 개인정보처리방침 생성기 같은 무료 도구입니다.",
  path: "/knowledge/checklists",
  image: { src: "/og/jaryo.jpg", alt: "곰파트너 점검표와 도구" },
});

export default function ArchiveChecklists() {
  return (
    <ArchiveShell section="checklists" active="/knowledge/checklists" crumbs={[{ href: "/knowledge", label: "웹 지식" }, { href: "/knowledge/checklists", label: "점검표와 도구" }]} toc={[{ id: "sheets", label: "점검표와 기록표" }, { id: "tools", label: "무료 도구" }]}>
      <DocHead title="점검표와 도구" meta={[["점검표", `${jaryo.length}종`], ["도구", `${tools.length}종`]]} lead="휴대폰으로 열어 보고 PDF로 내려받을 수 있습니다. 도구는 설치 없이 바로 씁니다." />
      <h2 id="sheets" className={docH2}>점검표와 기록표</h2>
      <ul role="list" className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {jaryo.map((it, i) => (
          <li key={it.id}>
            <Link href={`/jaryo/${it.id}`} className="group flex h-full items-center gap-4 rounded-lg border border-[#d9dee5] bg-white px-4 py-3 transition-colors hover:border-[#256ef4]">
              <span className="block w-[52px] shrink-0 overflow-hidden rounded-[3px] border border-[#e1e5eb] bg-[#e9edf3]">
                <Image src={`/images/jaryo/${it.id}-1.jpg`} alt="" width={128} height={181} className="block h-auto w-full" priority={i < 3} />
              </span>
              <span className="min-w-0">
                <span className="block text-[13.5px] font-bold text-[#256ef4]">{it.when}</span>
                <span className="mt-0.5 block text-[16px] font-[800] leading-[1.4] tracking-[-0.03em] group-hover:text-[#256ef4]">{it.title}</span>
                <span className="mt-1 block text-[13.5px] text-[#5b6370]">PDF {it.pages ?? 2}쪽</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <h2 id="tools" className={docH2}>무료 도구</h2>
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-7 md:grid-cols-3">
        {toolCategories.map((c) => (
          <div key={c}>
            <h3 className="text-[14px] font-[800] text-[#5b6370]">{c}</h3>
            <ul role="list" className="mt-2.5 space-y-2">
              {tools.filter((t) => t.category === c).map((t) => (
                <li key={t.href}>
                  <Link href={t.href} className="text-[15.5px] font-bold hover:text-[#256ef4] hover:underline underline-offset-4">{t.title}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </ArchiveShell>
  );
}
