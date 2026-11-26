import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BoardClose, BoardShell } from "@/components/classic/board/ui";
import { workCases, type WorkCase } from "@/data/classic/workCases";

// 11-26 작업 판(/works). 가상 브랜드 카탈로그(CatalogBoard) 자리에 직접 만들어 운영하는 작업 네 개를 크게 둔다.
// 작업마다 PC 화면 위에 휴대폰 화면을 겹쳐 놓고, 아래에 문제와 만든 것, 지금 쓰는 모습을 적는다.

function Open({ c, className, children }: { c: WorkCase; className: string; children: React.ReactNode }) {
  return c.href.startsWith("/") ? (
    <Link href={c.href} className={className}>{children}</Link>
  ) : (
    <a href={c.href} target="_blank" rel="noopener" className={className}>{children}</a>
  );
}

const dt = "text-[13px] font-bold tracking-[0.02em] text-[#7aa7ff]";
const dd = "mt-2 break-keep text-[16px] leading-[1.7] text-[#c9ced6] md:text-[17px]";

export function WorksBoard() {
  return (
    <BoardShell no="04" en="WORKS" kw="홈페이지 제작 사례" ice="직접 만들어 " title={"운영하는 작업"} lead="곰파트너가 만들어 지금도 매일 고치고 운영하는 서비스와 화면입니다.">
      <ol className="mt-14 space-y-24 md:mt-20 md:space-y-36" role="list">
        {workCases.map((c, i) => (
          <li key={c.id} id={c.id} className="scroll-mt-24">
            <Open c={c} className="group relative block pb-[12%] md:pb-[6%]">
              <span className="block overflow-hidden rounded-[10px] bg-[#151922] shadow-[0_0_0_1px_rgba(255,255,255,.08)] md:w-[86%]">
                <span className="flex h-8 items-center gap-1.5 border-b border-white/8 px-3 md:h-9">
                  <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  <span className="ml-3 truncate text-[12px] text-[#8a94a6]">{c.host}</span>
                </span>
                <span className="relative block aspect-[16/10] overflow-hidden">
                  <Image src={c.pc} alt={c.alt} fill sizes="(min-width: 1024px) 1000px, 100vw" className="object-cover object-top transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-[1.02] motion-reduce:transition-none" priority={i === 0} />
                </span>
              </span>
              <span className="absolute bottom-0 right-0 block w-[30%] overflow-hidden rounded-[18px] border-[5px] border-[#232833] bg-[#151922] shadow-[0_30px_60px_-20px_rgba(0,0,0,.8)] md:w-[19%] md:rounded-[26px] md:border-[7px]">
                <span className="relative block aspect-[390/844]">
                  <Image src={c.m} alt="" fill sizes="(min-width: 1024px) 240px, 30vw" className="object-cover object-top" />
                </span>
              </span>
            </Open>

            <div className="mt-10 grid gap-8 md:mt-12 md:grid-cols-12 md:gap-10">
              <div className="md:col-span-4">
                <p className="text-[14px] font-bold text-[#8a94a6]">
                  <span className="tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <span aria-hidden className="mx-2 text-white/25">|</span>
                  {c.kind}
                </p>
                <h2 className="mt-3 break-keep text-[34px] font-[800] leading-[1.15] tracking-[-0.05em] md:text-[48px]">{c.name}</h2>
                <Open c={c} className="mt-6 inline-flex min-h-[48px] items-center gap-2 rounded-full px-5 text-[15px] font-bold shadow-[inset_0_0_0_1.5px_rgba(255,255,255,.7)] hover:bg-white hover:text-[#0b0d12]">
                  열어 보기 <ArrowUpRight size={17} aria-hidden />
                </Open>
              </div>
              <dl className="grid gap-7 md:col-span-8 md:grid-cols-3 md:gap-8">
                <div><dt className={dt}>문제</dt><dd className={dd}>{c.problem}</dd></div>
                <div><dt className={dt}>만든 것</dt><dd className={dd}>{c.made}</dd></div>
                <div><dt className={dt}>지금</dt><dd className={dd}>{c.now}</dd></div>
              </dl>
            </div>
          </li>
        ))}
      </ol>
      <BoardClose text="이런 화면이 필요하면 알려 주세요." />
    </BoardShell>
  );
}
