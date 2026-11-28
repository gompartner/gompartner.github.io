import Image from "next/image";
import { MotionShot } from "@/components/classic/board/MotionShot";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BoardClose, BoardShell } from "@/components/classic/board/ui";
import { workCases, type WorkCase } from "@/data/classic/workCases";

// 11-26 작업 판(/works). 가상 브랜드 카탈로그(CatalogBoard) 자리에 직접 만들어 운영하는 작업 네 개를 크게 둔다.
// 작업마다 PC 화면 위에 휴대폰 화면을 겹쳐 놓고, 아래에 이름과 한 줄, 열어 보기를 둔다(11-27 대표 "글이 너무 많다": 문제, 만든 것, 지금 칸은 뺐다).

function Open({ c, className, children }: { c: WorkCase; className: string; children: React.ReactNode }) {
  // /trend, /3d/room 은 Next 경로가 아닌 정적 화면이라 Link 대신 a로 연다(11-28 트렌드 추가)
  if (c.href === "/") return <Link href={c.href} className={className}>{children}</Link>;
  return c.href.startsWith("/") ? (
    <a href={c.href} className={className}>{children}</a>
  ) : (
    <a href={c.href} target="_blank" rel="noopener" className={className}>{children}</a>
  );
}

export function WorksBoard() {
  return (
    <BoardShell no="04" en="WORKS" kw="홈페이지 제작 사례" ice="직접 만들어 " title={"운영하는 작업"} lead="곰파트너가 직접 개발해 매일 개선하며 운영하는 서비스입니다.">
      <ol className="mt-14 space-y-24 md:mt-20 md:space-y-36" role="list">
        {workCases.map((c, i) => (
          <li key={c.id} id={c.id} className="scroll-mt-24">
            <Open c={c} className="group relative block pb-[12%] md:pb-[6%]">
              <span className={`block overflow-hidden rounded-[10px] bg-[#151922] shadow-[0_0_0_1px_rgba(255,255,255,.08)] md:w-[86%]${c.phoneLeft ? " md:ml-auto" : ""}`}>
                <span className="flex h-8 items-center gap-1.5 border-b border-white/8 px-3 md:h-9">
                  <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  <span className="ml-3 truncate text-[12px] text-[#8a94a6]">{c.host}</span>
                </span>
                <span className="relative block aspect-[16/10] overflow-hidden">
                  {c.video ? (
                    <span className="absolute inset-0">
                      <MotionShot src={c.video.src} poster={c.pc} alt={c.alt} w={c.video.w} h={c.video.h} />
                    </span>
                  ) : (
                    <Image src={c.pc} alt={c.alt} fill sizes="(min-width: 1024px) 1000px, 100vw" className="object-cover object-top transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-[1.02] motion-reduce:transition-none" priority={i === 0} />
                  )}
                </span>
              </span>
              <span className={`absolute bottom-0 ${c.phoneLeft ? "left-0" : "right-0"} block w-[30%] overflow-hidden rounded-[18px] border-[5px] border-[#232833] bg-[#151922] shadow-[0_30px_60px_-20px_rgba(0,0,0,.8)] md:w-[19%] md:rounded-[26px] md:border-[7px]`}>
                <span className="relative block aspect-[390/844]">
                  {c.videoM ? (
                    <span className="absolute inset-0" aria-hidden>
                      <MotionShot src={c.videoM} poster={c.m} alt="" w={390} h={844} />
                    </span>
                  ) : (
                    <Image src={c.m} alt="" fill sizes="(min-width: 1024px) 240px, 30vw" className="object-cover object-top" />
                  )}
                </span>
              </span>
            </Open>

            <div className="mt-10 flex flex-col gap-6 md:mt-12 md:flex-row md:items-end md:justify-between md:gap-10">
              <div className="min-w-0">
                <p className="text-[14px] font-bold text-[#8a94a6]">
                  <span className="tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <span aria-hidden className="mx-2 text-white/25">|</span>
                  {c.kind}
                </p>
                <h2 className="mt-3 break-keep text-[34px] font-[800] leading-[1.15] tracking-[-0.05em] md:text-[48px]">{c.name}</h2>
                <p className="mt-3 break-keep text-[16px] leading-[1.7] text-[#c9ced6] md:text-[18px]">{c.line}</p>
              </div>
              <Open c={c} className="inline-flex w-fit shrink-0 min-h-[48px] items-center gap-2 rounded-full px-5 text-[15px] font-bold shadow-[inset_0_0_0_1.5px_rgba(255,255,255,.7)] hover:bg-white hover:text-[#0b0d12]">
                바로가기 <ArrowUpRight size={17} aria-hidden />
              </Open>
            </div>
          </li>
        ))}
      </ol>
      <BoardClose text="이런 화면이 필요하시면 문의해 주세요." />
    </BoardShell>
  );
}
