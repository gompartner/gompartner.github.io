import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BoardClose, BoardShell } from "@/components/classic/board/ui";
import { storyLead, ways, works } from "@/data/classic/storyline";
import { NEW_TAB, NewTabMark } from "@/components/classic/NewTab";

// 11-26 회사소개 한 판(사용자 "변천사와 서사 스토리도 녹일 거지", "우린 어떤 고민을 해서 결과를 만들었다", "이미지 대충 넣지 말고", "경력팔이 그만").
// 대표 경력, 수상, 연차는 쓰지 않는다. 회사가 하는 일과, 이 사이트와 상품을 어떤 고민으로 바꿔 왔는지를 쓴다.
// 구조 셋을 놓고 골랐다.
// (1) 날짜 연표에 작은 그림: 옛 연혁 모양. 기록으로만 읽히고 화면이 작아 무엇이 바뀌었는지 보이지 않는다.
// (2) 단계마다 판 하나를 아래로 쌓기: 그림은 크지만 카탈로그 판과 같은 모양이 되고, 여덟 장이 서로 다른 사이트처럼 보인다.
// (3) 창 하나를 붙여 두고 글을 내리면 그 창의 화면이 바뀌기: 같은 사이트가 여덟 번 바뀐 것이 한눈에 보이고, 고민과 결정이 그 옆에서 순서대로 읽힌다.
// (3)으로 했다. 11-27 사이트 변천사 칸과 연혁 주소(/history)를 내렸다. 흐름은 하는 일(Build, Run, Care) > 일하는 방식 > 문의 링크 하나(11-27 지금의 페이지와 결론 칸은 내림).

const h2 = "break-keep text-[28px] font-[800] leading-[1.25] tracking-[-0.045em] md:text-[40px]";
const tones = [
  { box: "bg-[#256ef4] text-white", sub: "text-white", link: "border-white/50 text-white hover:border-white" },
  { box: "bg-white text-[#0b0d12]", sub: "text-[#3d4450]", link: "border-[#0b0d12]/30 text-[#0b0d12] hover:border-[#0b0d12]" },
  { box: "bg-[#ffd84d] text-[#0b0d12]", sub: "text-[#2f2c14]", link: "border-[#0b0d12]/35 text-[#0b0d12] hover:border-[#0b0d12]" },
];

export function StoryBoard() {
  return (
    <BoardShell no="06" en="ABOUT" ice="말씀하신 대로 " title="끝까지 맞춰 드립니다" lead={storyLead}>
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
                  <a key={l.href} href={l.href} {...NEW_TAB} className={cls}>
                    {l.label} <NewTabMark size={15} />
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

      {/* 일하는 방식 */}
      <section aria-labelledby="st-ways" className="mt-20 md:mt-28">
        <h2 id="st-ways" className={h2}>
          일하는 방식
        </h2>
        <ul className="mt-8 border-t border-white/25 md:mt-10" role="list">
          {ways.map((w) => (
            <li key={w.title} className="break-keep border-b border-white/12 py-5 text-[19px] font-[800] tracking-[-0.03em] md:py-6 md:text-[21px]">
              {w.title}
            </li>
          ))}
        </ul>
      </section>

      <BoardClose text="원하시는 것을 한 줄만 남겨 주세요." />
    </BoardShell>
  );
}
