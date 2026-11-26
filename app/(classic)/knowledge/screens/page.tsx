import type { Metadata } from "next";
import Link from "next/link";
import { ArchiveShell, docH2 } from "@/components/classic/archive/ArchiveShell";
import { screenTypes, shortTitle, termHref } from "@/data/classic/archive";
import { termGroups } from "@/data/classic/glossary";
import { termImages } from "@/data/classic/glossaryImages";
import { pageMeta } from "@/lib/seo";

// 화면 예시(11-21): 페이지 종류별 와이어프레임 모음. 그림은 용어 문서와 같은 원본, 누르면 그 용어 자리로.
export const metadata: Metadata = pageMeta({
  title: "화면 예시 | 위키",
  description: "첫 화면, 회사 소개, 게시판, 로그인, 결제, 예약, 온라인 접수처럼 페이지 종류별로 와이어프레임을 모았습니다. 업체와 AI에 화면을 요청할 때 이름과 모양을 함께 볼 수 있습니다.",
  path: "/knowledge/screens",
});

export default function ArchiveScreens() {
  const total = screenTypes.reduce((a, t) => a + t.groups.flatMap((id) => termGroups.find((g) => g.id === id)?.terms ?? []).filter((x) => termImages[x.id]).length, 0);
  return (
    <ArchiveShell section="screens" active="/knowledge/screens" crumbs={[{ href: "/knowledge", label: "위키" }, { href: "/knowledge/screens", label: "화면 예시" }]} toc={screenTypes.map((t) => ({ id: t.id, label: t.title }))} head={{ title: "화면 예시", meta: [["페이지 종류", `${screenTypes.length}가지`], ["와이어프레임", `${total}장`]], lead: "만들 페이지의 종류부터 고르면, 그 페이지에 흔히 들어가는 부품을 그림으로 한 번에 볼 수 있습니다. 그림을 누르면 이름, 쓰임, 요청 문장이 있는 용어 문서로 갑니다." }} related={false}>
      {screenTypes.map((t) => {
        const gs = t.groups.map((id) => termGroups.find((g) => g.id === id)!).filter(Boolean);
        return (
          <section key={t.id} aria-labelledby={t.id}>
            <h2 id={t.id} className={docH2}>{t.title}</h2>
            <p className="mt-2 text-[15px] text-[#5b6370]">{t.desc}</p>
            {gs.map((g) => (
              <div key={g.id} className="mt-5">
                <p className="text-[14px] font-[800]">
                  <Link href={termHref(g)} className="hover:text-[#256ef4] hover:underline underline-offset-4">{shortTitle(g)}</Link>
                </p>
                <ul role="list" className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-3">
                  {g.terms.filter((x) => termImages[x.id]).map((x) => (
                    <li key={x.id}>
                      <Link href={`${termHref(g)}#${x.id}`} className="group block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`/images/glossary/${x.id}.webp`} alt={`${x.name} 와이어프레임`} width={termImages[x.id][0]} height={termImages[x.id][1]} loading="lazy" decoding="async" className="block aspect-[4/3] h-auto w-full rounded-md border border-[#e1e5eb] bg-[#f5f7fa] object-cover object-top transition-colors group-hover:border-[#256ef4]" />
                        <span className="mt-1.5 block text-[13.5px] font-bold group-hover:text-[#256ef4]">{x.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        );
      })}
    </ArchiveShell>
  );
}
