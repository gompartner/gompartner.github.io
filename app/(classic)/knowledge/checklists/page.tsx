import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArchiveShell, docH2 } from "@/components/classic/archive/ArchiveShell";
import { jaryo } from "@/data/classic/jaryo";
import { pageMeta } from "@/lib/seo";
import { NEW_TAB, NewTabMark } from "@/components/classic/NewTab";

// 점검표. 점검표 상세(/jaryo/<id>) 주소는 그대로. 11-22 무료 도구는 내리고 사이트 지킴이로 잇는다. 인스타 '자료' DM으로 들어오는 /jaryo 는 여기로 넘긴다.
export const metadata: Metadata = pageMeta({
  title: "점검표와 기록표 | 위키",
  description: "홈페이지 견적 질문지, 넘겨받은 날 기록표, 매달 점검표를 휴대폰으로 보고 PDF로 내려받습니다.",
  path: "/knowledge/checklists",
});

export default function ArchiveChecklists() {
  return (
    <ArchiveShell section="checklists" active="/knowledge/checklists" crumbs={[{ href: "/knowledge", label: "위키" }, { href: "/knowledge/checklists", label: "점검표와 기록표" }]} toc={[{ id: "sheets", label: "점검표와 기록표" }, { id: "watch", label: "사이트 감시" }]} head={{ title: "점검표와 기록표", meta: [["점검표", `${jaryo.length}종`]], lead: "휴대폰으로 열어 보고 PDF로 내려받을 수 있습니다." }} related={false}>
      <h2 id="sheets" className={docH2}>점검표와 기록표</h2>
      <ul role="list" className="mt-5 grid gap-3 sm:grid-cols-2">
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
      <h2 id="watch" className={docH2}>사이트 감시</h2>
      <p className="mt-3 text-[16px] leading-[1.7] text-[#3a404b]">
        인증서와 도메인 만료, 접속 장애는 <a href="https://jikimi.gompartner.co.kr/" {...NEW_TAB} className="inline-flex items-center gap-1 font-bold text-[#15171c] underline underline-offset-4">사이트 지킴이<NewTabMark size={14} /></a>에 주소를 등록하면 만료 전에 알림으로 받습니다.
      </p>
    </ArchiveShell>
  );
}
