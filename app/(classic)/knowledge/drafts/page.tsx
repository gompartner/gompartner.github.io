import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArchiveShell, DocHead, TakeoverBox, docH2 } from "@/components/classic/archive/ArchiveShell";
import { draftSets } from "@/data/classic/archive";
import { pageMeta } from "@/lib/seo";

// 시안 작업(11-21): 카탈로그 세션이 만든 업종별 시안 A, B. 사례 분석은 01_Work/03_Resource/사례분석(실제 납품 사이트 13곳 + 학원, 인테리어, 피부과)
export const metadata: Metadata = pageMeta({
  title: "시안 작업 | 웹 지식",
  description: "제조사, 법률사무소, 세무회계, 치과, 피부과, 학원, 인테리어. 업종마다 방향이 다른 시안 두 장을 나란히 놓고, 어떤 고객에게 맞는지와 실제 사례 분석에서 반영한 것을 정리했습니다.",
  path: "/knowledge/drafts",
});

export default function ArchiveDrafts() {
  return (
    <ArchiveShell section="drafts" active="/knowledge/drafts" crumbs={[{ href: "/knowledge", label: "웹 지식" }, { href: "/knowledge/drafts", label: "시안 작업" }]} toc={[{ id: "how", label: "시안을 두 장 만드는 이유" }, ...draftSets.map((d) => ({ id: d.slug, label: d.name })), { id: "take", label: "시안을 고를 때 확인할 것" }]}>
      <DocHead title="시안 작업" meta={[["업종", `${draftSets.length}곳`], ["시안", `${draftSets.length * 2}장`], ["최종 수정일", "2026-11-21"]]} lead="같은 업종이라도 고객이 다르면 첫 화면이 달라야 합니다. 업종마다 방향이 다른 시안을 두 장씩 만들고, 누구에게 맞는지 함께 적었습니다." />

      <h2 id="how" className={docH2}>시안을 두 장 만드는 이유</h2>
      <p className="mt-4 max-w-[760px] text-[16.5px] leading-[1.8] text-[#2b313b]">
        시안 한 장은 "좋다, 싫다"로 끝나기 쉽습니다. 방향이 다른 두 장을 나란히 보면 "우리 고객은 이쪽"이라는 판단이 빨라집니다. 시안을 만들기 전에 같은 업종의 실제 납품 사이트를 분석해 공통으로 반복되는 것을 먼저 반영했습니다.
      </p>
      <ul role="list" className="mt-4 max-w-[760px] list-disc space-y-1.5 pl-5 text-[15.5px] leading-[1.65] text-[#2b313b]">
        <li>어디서든 바로 연락하는 오른쪽 고정 바로가기(전화, 카톡, 상담 신청, 맨 위로). 휴대폰은 아래 고정 띠</li>
        <li>업종마다 매일 찾는 정보를 첫 화면 가까이: 치과는 이번 달 진료 일정, 학원은 진도 안내</li>
        <li>연혁, 누적 건수 같은 신뢰 숫자를 위쪽에</li>
        <li>문구는 합니다체로 통일, 사진 위 글자는 휴대폰에서도 읽히는 대비</li>
      </ul>

      {draftSets.map((d) => (
        <section key={d.slug} aria-labelledby={d.slug}>
          <h2 id={d.slug} className={docH2}>{d.name}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {[d.a, d.b].map((v, i) => (
              <figure key={v.id} className="overflow-hidden rounded-lg border border-[#d9dee5] bg-white">
                <Link href={`/work/${d.slug}?v=${v.id}`} className="group block">
                  <Image src={`/images/archive/drafts/${d.slug}-${v.id}.jpg`} alt={`${d.name} 시안 ${i ? "B" : "A"} ${v.label} 첫 화면`} width={1200} height={750} sizes="(min-width: 768px) 45vw, 92vw" className="block h-auto w-full border-b border-[#e6e9ee] transition-opacity group-hover:opacity-90" />
                </Link>
                <figcaption className="px-4 pb-4 pt-3">
                  <p className="text-[12.5px] font-[800] text-[#1d5fd6]">시안 {i ? "B" : "A"}</p>
                  <p className="text-[16px] font-[800]">{v.label}</p>
                  <p className="mt-1 text-[14px] leading-[1.6] text-[#3d4450]">{v.desc}</p>
                  <Link href={`/work/${d.slug}?v=${v.id}`} className="mt-2 inline-block text-[13.5px] font-bold text-[#256ef4] hover:underline underline-offset-4">시안 열어 보기</Link>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ))}

      <TakeoverBox
        sub="시안을 받아 고를 때"
        items={[
          { b: "누구를 위한 화면인지", t: "예쁜 쪽보다 우리 고객이 처음 찾는 정보가 위에 있는 쪽을 고릅니다. 법인 고객과 개인 고객, 입시와 초중등처럼 대상이 다르면 첫 화면이 달라야 합니다." },
          { b: "휴대폰에서 먼저", t: "시안은 PC로 보기 쉽지만 방문은 휴대폰이 더 많습니다. 휴대폰 폭으로 열어 첫 화면에서 연락 수단이 보이는지 확인합니다." },
          { b: "실제 사진과 문구로 바꿨을 때", t: "시안의 사진과 문구는 예시입니다. 우리 사진과 문구가 들어가도 같은 인상이 나는지, 사진이 준비돼 있는지 먼저 봅니다." },
        ]}
      />
    </ArchiveShell>
  );
}
