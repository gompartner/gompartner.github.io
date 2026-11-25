import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BoardClose, BoardShell } from "@/components/classic/board/ui";
import { Frame } from "@/components/classic/story/Frame";
import { StoryWindow } from "@/components/classic/story/StoryWindow";
import { boards, conclusion, stages, storyLead, ways, works } from "@/data/classic/storyline";

// 11-26 회사소개 한 판(사용자 "변천사와 서사 스토리도 녹일 거지", "우린 어떤 고민을 해서 결과를 만들었다", "이미지 대충 넣지 말고", "경력팔이 그만").
// 대표 경력, 수상, 연차는 쓰지 않는다. 회사가 하는 일과, 이 사이트와 상품을 어떤 고민으로 바꿔 왔는지를 쓴다. 옛 연혁(/history)도 여기로 합쳤다.
// 구조 셋을 놓고 골랐다.
// (1) 날짜 연표에 작은 그림: 옛 연혁 모양. 기록으로만 읽히고 화면이 작아 무엇이 바뀌었는지 보이지 않는다.
// (2) 단계마다 판 하나를 아래로 쌓기: 그림은 크지만 카탈로그 판과 같은 모양이 되고, 여덟 장이 서로 다른 사이트처럼 보인다.
// (3) 창 하나를 붙여 두고 글을 내리면 그 창의 화면이 바뀌기: 같은 사이트가 여덟 번 바뀐 것이 한눈에 보이고, 고민과 결정이 그 옆에서 순서대로 읽힌다.
// (3)으로 했다. 흐름은 하는 일(Build, Run, Care) > 변천사(창 + 고민과 결정) > 지금의 네 페이지 > 결론과 기준 > 일하는 방식 > 문의 링크 하나.

const h2 = "break-keep text-[28px] font-[800] leading-[1.25] tracking-[-0.045em] md:text-[40px]";
const tones = [
  { box: "bg-[#256ef4] text-white", sub: "text-white", link: "border-white/50 text-white hover:border-white" },
  { box: "bg-white text-[#0b0d12]", sub: "text-[#3d4450]", link: "border-[#0b0d12]/30 text-[#0b0d12] hover:border-[#0b0d12]" },
  { box: "bg-[#ffd84d] text-[#0b0d12]", sub: "text-[#2f2c14]", link: "border-[#0b0d12]/35 text-[#0b0d12] hover:border-[#0b0d12]" },
];

export function StoryBoard() {
  return (
    <BoardShell no="06" en="ABOUT" ice="곰파트너는 " title="매일 바꿉니다" lead={storyLead}>
      {/* 하는 일: 메인 첫 문장과 같은 순서, 같은 색 판 */}
      <ul className="mt-10 grid gap-4 md:mt-14 md:grid-cols-3" role="list">
        {works.map((w, i) => (
          <li key={w.en} className={`bd-in flex flex-col rounded-[28px] p-7 md:p-9 ${tones[i].box}`} style={{ "--d": `${0.5 + i * 0.08}s` } as CSSProperties}>
            <p className="text-[44px] font-[800] leading-none tracking-[-0.05em] md:text-[56px]">{w.en.charAt(0) + w.en.slice(1).toLowerCase()}</p>
            <h2 className="mt-3 text-[20px] font-[800] tracking-[-0.03em] md:text-[22px]">{w.name}</h2>
            <p className={`mt-3 break-keep text-[16px] leading-[1.7] ${tones[i].sub}`}>{w.body}</p>
            <p className="mt-auto flex flex-wrap gap-2 pt-7">
              {w.links.map((l) => {
                const cls = `inline-flex min-h-11 items-center gap-1 rounded-full border px-4 text-[15px] font-bold ${tones[i].link}`;
                return l.href.startsWith("http") ? (
                  <a key={l.href} href={l.href} target="_blank" rel="noopener" className={cls}>
                    {l.label} <ArrowUpRight size={16} aria-hidden />
                    <span className="sr-only">(새 창)</span>
                  </a>
                ) : (
                  <Link key={l.href} href={l.href} className={cls}>
                    {l.label} <ArrowUpRight size={16} aria-hidden />
                  </Link>
                );
              })}
            </p>
          </li>
        ))}
      </ul>

      {/* 변천사 */}
      <section aria-labelledby="st-history" className="mt-20 md:mt-28">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <h2 id="st-history" className={h2}>
            사이트 변천사
          </h2>
          <p className="max-w-[460px] break-keep text-[16px] leading-[1.7] text-[#aab2bf] md:text-[17px]">2026년 7월 오픈부터 지금까지의 화면 여덟 장입니다. 화면마다 고민한 것과 정한 것을 함께 적습니다.</p>
        </div>
        <StoryWindow stages={stages} />
      </section>

      {/* 지금의 네 페이지 */}
      <section aria-labelledby="st-now" className="mt-20 md:mt-28">
        <h2 id="st-now" className={h2}>
          지금은 메인 한 장과 페이지 네 개입니다
        </h2>
        <ul className="mt-8 grid gap-x-6 gap-y-10 md:mt-12 lg:grid-cols-2" role="list">
          {boards.map((b) => (
            <li key={b.href}>
              <Link href={b.href} className="group block">
                <Frame label={`2026.11.26 ${b.name}`}>
                  <span className="relative block aspect-[16/10] overflow-hidden bg-[#0f131b]">
                    <Image src={b.img} alt={b.alt} fill sizes="(min-width: 1024px) 600px, 100vw" className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transition-none" />
                  </span>
                </Frame>
                <span className="mt-4 flex items-baseline gap-3">
                  <span className="text-[22px] font-[800] tracking-[-0.04em] group-hover:text-[#7aa7ff] md:text-[24px]">{b.name}</span>
                  <ArrowUpRight size={18} aria-hidden className="translate-y-0.5 text-[#7aa7ff]" />
                </span>
                <span className="mt-1 block break-keep text-[16px] leading-[1.7] text-[#aab2bf]">{b.line}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 결론과, 고객 홈페이지에 똑같이 대는 기준 */}
      <section aria-labelledby="st-end" className="mt-20 md:mt-28">
        <div className="rounded-[28px] bg-[#256ef4] p-7 md:p-14">
          <p className="text-[16px] font-bold text-white md:text-[17px]">{conclusion.lead}</p>
          <h2 id="st-end" className="mt-4 max-w-[900px] break-keep text-[30px] font-[800] leading-[1.25] tracking-[-0.05em] md:text-[52px]">
            {conclusion.text}
          </h2>
        </div>
        <p className="mt-10 break-keep text-[20px] font-[800] tracking-[-0.035em] md:mt-14 md:text-[24px]">{conclusion.note}</p>
        <ol className="mt-5 grid gap-4 md:grid-cols-3" role="list">
          {conclusion.checks.map((c, i) => (
            <li key={c.title} className="rounded-[24px] border border-white/12 bg-[#121722] p-6 md:p-8">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-[15px] font-[800] tabular-nums text-[#0b0d12]">{i + 1}</span>
              <h3 className="mt-5 break-keep text-[20px] font-[800] leading-[1.35] tracking-[-0.035em] md:text-[22px]">{c.title}</h3>
              <p className="mt-3 break-keep text-[16px] leading-[1.7] text-[#c9ced6]">{c.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 일하는 방식 */}
      <section aria-labelledby="st-ways" className="mt-20 md:mt-28">
        <h2 id="st-ways" className={h2}>
          일하는 방식
        </h2>
        <dl className="mt-8 border-t border-white/25 md:mt-10">
          {ways.map((w) => (
            <div key={w.title} className="grid gap-1.5 border-b border-white/12 py-6 md:grid-cols-[340px_1fr] md:gap-10 md:py-7">
              <dt className="break-keep text-[19px] font-[800] tracking-[-0.03em] md:text-[21px]">{w.title}</dt>
              <dd className="break-keep text-[16px] leading-[1.7] text-[#c9ced6] md:text-[17px]">{w.body}</dd>
            </div>
          ))}
        </dl>
      </section>

      <BoardClose text="팔고 싶은 상품이 무엇인지 한 줄만 남겨 주세요." />
    </BoardShell>
  );
}
