import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Play } from "lucide-react";
import { ChannelTalkButton } from "@/components/layout/ChannelTalk";
import { SampleBack } from "@/components/renewal/SampleBack";
import { Bubble } from "@/components/renewal/ui";
import { projects } from "@/data/projects";
import { estimateFor, formatWon, manwon } from "@/data/pricing";
import { samplePalettes } from "@/data/samplePalettes";
import { stories } from "@/data/stories";

// 샘플 표지. 샘플을 열기 전에 금액·기능·색·만든 이야기를 웹툰 컷 한 장으로 보여 준다.
// 바로 써 보고 싶은 사람은 맨 위 '샘플 열기'로 곧장 들어간다.

type Props = { params: Promise<{ slug: string }> };

const slugOf = (demoUrl: string) => demoUrl.replace("/demo/", "");
const find = (slug: string) => projects.find((p) => p.demoUrl === `/demo/${slug}`);

export function generateStaticParams() {
  return projects.filter((p) => p.demoUrl.startsWith("/demo/")).map((p) => ({ slug: slugOf(p.demoUrl) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = find(slug);
  if (!p) return {};
  const est = estimateFor(p.id);
  return {
    title: `${p.title} 샘플 소개`,
    description: est ? `${p.description} 비슷하게 만들면 ${manwon(est.total)}, ${est.days}일.` : p.description,
    alternates: { canonical: `/sample/${slug}` },
  };
}

const openButton =
  "inline-flex h-14 items-center justify-center gap-2 rounded-[6px] border-[3px] border-[#1d1d1f] bg-accent px-7 text-[18px] font-bold text-white shadow-[4px_4px_0_#1d1d1f] transition-[transform,box-shadow,background-color] duration-150 hover:bg-accent-hover active:translate-x-1 active:translate-y-1 active:shadow-none";
const subButton =
  "hidden h-14 md:inline-flex items-center justify-center rounded-[6px] border-[3px] border-[#1d1d1f] bg-white px-6 text-[17px] font-bold transition-colors hover:bg-[#fff3b0]";
const h2 = "text-[24px] font-bold leading-[1.4] md:text-[28px]";

// 만든 이야기 컷 그림: 처음은 자료를 찾아보는 곰, 중간은 고민하고 고치는 곰, 마지막은 완성한 화면을 가리키는 곰
const storyCut = (i: number, n: number) =>
  i === 0 ? "/images/webtoon/bear-research.jpg" : i === n - 1 ? "/images/webtoon/bear-point.jpg" : i % 2 ? "/images/webtoon/bear-think.jpg" : "/images/webtoon/bear-work.jpg";

export default async function SamplePage({ params }: Props) {
  const { slug } = await params;
  const p = find(slug);
  if (!p) notFound();
  const est = estimateFor(p.id);
  const colors = samplePalettes[slug] ?? [];
  const story = stories[p.id] ?? [];

  return (
    <div className="mx-auto w-full max-w-[1248px] px-4 pb-16 pt-6 md:px-6 md:pt-10">
      <div className="flex items-center justify-between gap-3">
        <SampleBack className="inline-flex h-10 items-center gap-1.5 rounded-full border-[2.5px] border-[#1d1d1f] bg-white px-4 text-[15px] font-bold hover:bg-[#fff3b0]" />
        <span className="border-[3px] border-[#1d1d1f] bg-[#fff3b0] px-3 py-1 text-[14px] font-bold md:text-[15px]">
          {p.category}·{p.layout}
        </span>
      </div>

      {/* PC: 왼쪽 컷(캡처와 샘플 열기)은 고정, 오른쪽 내용만 내려간다. 휴대폰: 위에서 아래로 한 줄 */}
      <div className="mt-6 grid items-start gap-8 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] md:gap-14">
        <div className="md:sticky md:top-24">
          <Link href={p.demoUrl} prefetch={false} aria-label={`${p.title} 샘플 열기`} className="group relative block -rotate-1 overflow-hidden border-[3px] border-[#1d1d1f] bg-white shadow-[6px_6px_0_#1d1d1f]">
            <Image src={p.imageUrl} alt={p.imageAlt} width={1200} height={750} priority sizes="(min-width: 768px) 620px, 100vw" className="aspect-[16/10] h-auto w-full object-cover object-top" />
            <span aria-hidden className="absolute inset-0 grid place-items-center bg-black/0 transition-colors duration-200 group-hover:bg-black/25">
              <span className="grid h-16 w-16 scale-90 place-items-center rounded-full border-[3px] border-[#1d1d1f] bg-white opacity-0 shadow-[3px_3px_0_#1d1d1f] transition-[opacity,transform] duration-200 group-hover:scale-100 group-hover:opacity-100">
                <Play size={26} strokeWidth={2.5} className="ml-1 text-accent" />
              </span>
            </span>
          </Link>
          <div className="mt-7 hidden gap-3 md:flex">
            <Link href={p.demoUrl} prefetch={false} data-gtm-cta={`sample_open_${p.id}`} className={`${openButton} flex-1`}>
              <Play size={18} strokeWidth={2.5} aria-hidden />
              샘플 열기
            </Link>
            <ChannelTalkButton cta={`sample_chat_${p.id}`} message={`${p.title} 샘플을 보고 문의합니다.`} className={subButton}>
              채팅 상담
            </ChannelTalkButton>
          </div>
        </div>

        <div>
          <h1 className="text-[32px] leading-[1.2] md:text-[44px]">{p.title}</h1>
          <p className="mt-3 text-[17px] leading-[1.7] text-foreground-secondary">{p.description}</p>

          <div className="wt-card mt-6 bg-white p-5 md:p-6">
            {est ? (
              <>
                <p className="text-[15px] font-bold text-foreground-secondary">비슷하게 만들면</p>
                <p className="mt-1 flex items-baseline gap-3">
                  <span className="text-[30px] font-bold tabular-nums text-accent md:text-[34px]">{manwon(est.total)}</span>
                  <span className="text-[17px] font-bold">작업 {est.days}일</span>
                </p>
                <dl className="mt-4 divide-y divide-[#1d1d1f]/15 border-t-2 border-[#1d1d1f] text-[15px] md:text-[16px]">
                  <div className="flex justify-between gap-3 py-2">
                    <dt>{est.plan.title}</dt>
                    <dd className="tabular-nums">{formatWon(est.plan.price)}</dd>
                  </div>
                  {est.lines.map((l) => (
                    <div key={l.name} className="flex justify-between gap-3 py-2">
                      <dt>{l.name}</dt>
                      <dd className="tabular-nums">{formatWon(l.amount)}</dd>
                    </div>
                  ))}
                </dl>
              </>
            ) : (
              <>
                <p className="text-[15px] font-bold text-foreground-secondary">업무 프로그램</p>
                <p className="mt-1 text-[28px] font-bold text-accent">별도 견적</p>
                <p className="mt-2 text-[15px] leading-[1.6] text-foreground-secondary">화면 수와 쓰는 사람을 듣고 금액과 기간을 알려 드립니다.</p>
              </>
            )}
          </div>

          <div className="mt-6 md:hidden">
            <Link href={p.demoUrl} prefetch={false} data-gtm-cta={`sample_open_${p.id}`} className={`${openButton} w-full`}>
              <Play size={18} strokeWidth={2.5} aria-hidden />
              샘플 열기
            </Link>
          </div>

          {/* 넣은 기능: 말풍선 */}
          <section aria-labelledby="features-title" className="mt-14">
            <h2 id="features-title" className={h2}>
              넣은 기능
            </h2>
            <ul className="mt-5 flex flex-col items-start gap-3">
              {p.features.map((f, i) => (
                <li
                  key={f}
                  className={`flex items-center gap-2 rounded-[22px] rounded-bl-[6px] border-[3px] border-[#1d1d1f] bg-white px-4 py-2.5 text-[16px] font-bold shadow-[3px_3px_0_#1d1d1f] md:text-[17px] ${i % 2 ? "ml-6 md:ml-10" : ""}`}
                >
                  <Check size={18} strokeWidth={3} className="shrink-0 text-accent" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
          </section>

          {/* 브랜드 색 */}
          {colors.length > 0 && (
            <section aria-labelledby="colors-title" className="mt-14">
              <h2 id="colors-title" className={h2}>
                색
              </h2>
              <ul className="mt-5 flex flex-wrap gap-5">
                {colors.map((c) => (
                  <li key={c} className="text-center">
                    <span className="block h-20 w-20 border-[3px] border-[#1d1d1f] shadow-[3px_3px_0_#1d1d1f]" style={{ background: c }} />
                    <span className="mt-2 block font-mono text-[14px] font-bold uppercase">{c}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[15px] leading-[1.6] text-foreground-secondary">상호와 로고에 맞춰 색을 바꿔 드립니다.</p>
            </section>
          )}

          {/* 만든 이야기: 곰이 작업하며 한 말을 컷마다 말풍선으로 */}
          {story.length > 0 && (
            <section aria-labelledby="story-title" className="mt-14">
              <h2 id="story-title" className={h2}>
                만든 이야기
              </h2>
              <ol className="mt-5 flex flex-col gap-5">
                {story.map((line, i) => (
                  <li key={line}>
                    <figure className={`overflow-hidden border-[3px] border-[#1d1d1f] bg-[#fffdf8] ${i % 2 ? "rotate-[0.6deg]" : "-rotate-[0.6deg]"}`}>
                      <figcaption className={`flex px-3 pb-5 pt-3 ${i % 2 ? "justify-end" : ""}`}>
                        <Bubble tail={i % 2 ? "bottom-right" : "bottom-left"} className="max-w-[88%] text-[15px] md:text-[16px]">
                          {line}
                        </Bubble>
                      </figcaption>
                      <Image src={storyCut(i, story.length)} alt="" width={900} height={900} sizes="(min-width: 768px) 560px, 100vw" className="aspect-[16/9] h-auto w-full border-t-[3px] border-[#1d1d1f] object-cover object-[50%_35%]" />
                    </figure>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
