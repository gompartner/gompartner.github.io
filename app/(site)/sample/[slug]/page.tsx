import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Play } from "lucide-react";
import { ChannelTalkButton } from "@/components/layout/ChannelTalk";
import { SampleBack } from "@/components/renewal/SampleBack";
import { Bubble, Narration } from "@/components/renewal/ui";
import { projects } from "@/data/projects";
import { estimateFor, formatWon, manwon } from "@/data/pricing";
import { samplePalettes } from "@/data/samplePalettes";
import { scenarios, type Scene } from "@/data/scenes";
import { fitDescription } from "@/lib/seo";
import { productOf } from "@/components/landing/WorksGrid";
import { maintenanceServices } from "@/data/maintenance";

// 샘플 표지. 웹툰 한 편처럼 위에서 아래로 읽는다.
// PC·휴대폰 미리보기 → 의뢰인과 곰의 대화로 기획 의도와 만드는 과정, 기능 화면 → 색 → 맨 아래 금액과 샘플 열기.

type Props = { params: Promise<{ slug: string }> };

const slugOf = (demoUrl: string) => demoUrl.replace("/demo/", "");
const find = (slug: string) => projects.find((p) => p.demoUrl === `/demo/${slug}`);
const exists = (src: string) => fs.existsSync(path.join(process.cwd(), "public", src));

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
    description: fitDescription(est ? `비슷하게 만들면 ${manwon(est.total)}, ${est.days}일. ${p.description}` : p.description),
    alternates: { canonical: `/sample/${slug}` },
  };
}

const openButton =
  "inline-flex h-14 items-center justify-center gap-2 rounded-[6px] border-[3px] border-[#1d1d1f] bg-accent px-7 text-[18px] font-bold text-white shadow-[4px_4px_0_#1d1d1f] transition-[transform,box-shadow,background-color] duration-150 hover:bg-accent-hover active:translate-x-1 active:translate-y-1 active:shadow-none";
const subButton =
  "inline-flex h-14 items-center justify-center rounded-[6px] border-[3px] border-[#1d1d1f] bg-white px-6 text-[17px] font-bold transition-colors hover:bg-[#fff3b0]";

/** 대화 한 장면 */
function SceneView({ s, slug, client, shotOk, cont }: { s: Scene; slug: string; client: string; shotOk: (n: number) => boolean; cont: boolean }) {
  switch (s.t) {
    case "note":
      return <Narration className="mt-10 first:mt-0">{s.text}</Narration>;
    case "client":
      return (
        <div className="flex items-end gap-2.5">
          <span aria-hidden className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border-[2.5px] border-[#1d1d1f] bg-white text-[13px] font-bold ${cont ? "invisible" : ""}`}>
            {client.slice(0, 1)}
          </span>
          <div className="min-w-0">
            {!cont && <p className="mb-1 text-[13px] font-bold text-foreground-tertiary">{client}</p>}
            <Bubble tail="none" className="max-w-full rounded-bl-[6px] text-[16px] md:text-[17px]">
              {s.text}
            </Bubble>
          </div>
        </div>
      );
    case "bear":
      return (
        <div className="flex items-end justify-end gap-2.5">
          <Bubble tail="none" tone="blue" className="max-w-[calc(100%-3.25rem)] rounded-br-[6px] text-[16px] md:text-[17px]">
            {s.text}
          </Bubble>
          <Image src="/images/webtoon/bear-face.jpg" alt="곰파트너" width={40} height={40} className={`h-10 w-10 shrink-0 rounded-full border-[2.5px] border-[#1d1d1f] ${cont ? "invisible" : ""}`} />
        </div>
      );
    case "cut":
      return (
        <figure className="my-2 overflow-hidden border-[3px] border-[#1d1d1f] bg-[#fffdf8]">
          {s.text && (
            <figcaption className="flex justify-center px-3 pb-5 pt-4">
              <Bubble tail="bottom-left" className="max-w-[90%] text-[16px] md:text-[17px]">
                {s.text}
              </Bubble>
            </figcaption>
          )}
          <Image src={`/images/webtoon/${s.img}.jpg`} alt="" width={900} height={900} sizes="(min-width: 768px) 660px, 100vw" className={`aspect-[16/10] h-auto w-full object-cover object-[50%_35%] ${s.text ? "border-t-[3px] border-[#1d1d1f]" : ""}`} />
        </figure>
      );
    case "shot":
      if (!shotOk(s.step)) return s.text ? <Narration>{s.text}</Narration> : null;
      return (
        <figure className="my-2 overflow-hidden border-[3px] border-[#1d1d1f] bg-[radial-gradient(rgba(29,29,31,.12)_1.2px,transparent_1.3px)] bg-[length:12px_12px] px-6 pb-6 pt-9 md:px-10">
          {/* 실제 화면은 말풍선 틀에 넣지 않고, 테이프로 붙인 캡처 사진처럼 칸 안에 띄운다(먹선과 겹치지 않게) */}
          <div className={`shot-print relative mx-auto max-w-[340px] bg-white p-2 pt-5 shadow-[0_14px_28px_rgba(29,29,31,.22)] ${s.step % 2 ? "[--tilt:1.6deg]" : "[--tilt:-1.6deg]"}`}>
            <span aria-hidden className="absolute -top-3.5 left-6 h-6 w-16 -rotate-6 bg-[#ffe14d]/75 shadow-[0_1px_2px_rgba(0,0,0,.12)]" />
            <span aria-hidden className="absolute -top-3.5 right-6 h-6 w-16 rotate-6 bg-[#ffe14d]/75 shadow-[0_1px_2px_rgba(0,0,0,.12)]" />
            <Image src={`/images/sample-cuts/${slug}-${s.step}.jpg`} alt={s.text ?? ""} width={780} height={1440} sizes="340px" className="h-auto w-full" />
          </div>
          {s.text && <figcaption className="mx-auto mt-6 w-fit max-w-full border-[3px] border-[#1d1d1f] bg-[#fff3b0] px-3.5 py-1.5 text-[15px] font-bold leading-[1.5] md:text-[16px]">{s.text}</figcaption>}
        </figure>
      );
  }
}

export default async function SamplePage({ params }: Props) {
  const { slug } = await params;
  const p = find(slug);
  if (!p) notFound();
  const est = estimateFor(p.id);
  const colors = samplePalettes[slug] ?? [];
  const scenario = scenarios[p.id];
  const mobileShot = `/images/demos/m/${slug}.jpg`;
  const shotOk = (n: number) => exists(`/images/sample-cuts/${slug}-${n}.jpg`);

  return (
    <div className="mx-auto w-full max-w-[760px] px-4 pb-16 pt-6 md:px-6 md:pt-10">
      <div className="flex items-center justify-between gap-3">
        <SampleBack className="inline-flex h-10 items-center gap-1.5 rounded-full border-[2.5px] border-[#1d1d1f] bg-white px-4 text-[15px] font-bold hover:bg-[#fff3b0]" />
        <span className="border-[3px] border-[#1d1d1f] bg-[#fff3b0] px-3 py-1 text-[14px] font-bold md:text-[15px]">
          {p.category}·{p.layout}
        </span>
      </div>

      <h1 className="mt-8 text-[32px] leading-[1.2] md:text-[44px]">{p.title}</h1>
      <p className="mt-3 text-[17px] leading-[1.7] text-foreground-secondary">{p.description}</p>

      {/* 미리보기: PC 화면 창에 휴대폰 화면을 겹쳐 놓는다. 누르면 샘플이 열린다 */}
      <Link href={p.demoUrl} prefetch={false} aria-label={`${p.title} 샘플 열기`} className="group relative mt-8 block pb-10 pr-6 md:pb-12 md:pr-10">
        <span className="block overflow-hidden rounded-[10px] border-[3px] border-[#1d1d1f] bg-white shadow-[6px_6px_0_#1d1d1f]">
          <span aria-hidden className="flex h-7 items-center gap-1.5 border-b-[3px] border-[#1d1d1f] bg-[#f3ece0] px-3">
            <span className="h-2.5 w-2.5 rounded-full border-2 border-[#1d1d1f] bg-[#ff5a4e]" />
            <span className="h-2.5 w-2.5 rounded-full border-2 border-[#1d1d1f] bg-[#ffd447]" />
            <span className="h-2.5 w-2.5 rounded-full border-2 border-[#1d1d1f] bg-[#3ccf6e]" />
          </span>
          <Image src={p.imageUrl} alt={p.imageAlt} width={1200} height={750} priority sizes="(min-width: 768px) 680px, 100vw" className="aspect-[16/10] h-auto w-full object-cover object-top" />
        </span>
        {exists(mobileShot) && (
          <span className="absolute bottom-0 right-0 block w-[30%] max-w-[180px] overflow-hidden rounded-[18px] border-[3px] border-[#1d1d1f] bg-white shadow-[5px_5px_0_#1d1d1f] md:rounded-[22px]">
            <Image src={mobileShot} alt="" width={390} height={844} sizes="180px" className="aspect-[390/700] h-auto w-full object-cover object-top" />
          </span>
        )}
        <span aria-hidden className="absolute left-1/2 top-[42%] grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 scale-90 place-items-center rounded-full border-[3px] border-[#1d1d1f] bg-white opacity-0 shadow-[3px_3px_0_#1d1d1f] transition-[opacity,transform] duration-200 group-hover:scale-100 group-hover:opacity-100">
          <Play size={26} strokeWidth={2.5} className="ml-1 text-accent" />
        </span>
      </Link>

      {/* 대화형 웹툰 */}
      {scenario && (
        <section aria-label="만든 이야기" className="mt-16 flex flex-col gap-4">
          {scenario.scenes.map((s, i) => (
            <SceneView key={i} s={s} slug={slug} client={scenario.client} shotOk={shotOk} cont={i > 0 && scenario.scenes[i - 1].t === s.t} />
          ))}
        </section>
      )}

      {colors.length > 0 && (
        <section aria-labelledby="colors-title" className="mt-16">
          <h2 id="colors-title" className="text-[22px] font-bold md:text-[24px]">
            색
          </h2>
          <ul className="mt-4 flex flex-wrap gap-4">
            {colors.map((c) => (
              <li key={c} className="text-center">
                <span className="block h-16 w-16 border-[3px] border-[#1d1d1f] shadow-[3px_3px_0_#1d1d1f]" style={{ background: c }} />
                <span className="mt-2 block font-mono text-[13px] font-bold uppercase">{c}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[15px] leading-[1.6] text-foreground-secondary">상호와 로고에 맞춰 색을 바꿔 드립니다.</p>
        </section>
      )}

      {/* 맨 아래: 금액과 샘플 열기 */}
      <section aria-labelledby="price-title" className="wt-card mt-14 bg-white p-5 md:p-8">
        {est ? (
          <>
            <h2 id="price-title" className="text-[15px] font-bold text-foreground-secondary">
              비슷하게 만들면
            </h2>
            <p className="mt-1 flex items-baseline gap-3">
              {est.discount > 0 && <s className="text-[18px] font-bold tabular-nums text-foreground-tertiary">{manwon(est.list)}</s>}
              <span className="text-[30px] font-bold tabular-nums text-accent md:text-[36px]">{manwon(est.total)}</span>
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
              {est.discount > 0 && (
                <div className="flex justify-between gap-3 py-2 font-bold text-accent">
                  <dt>오픈 할인</dt>
                  <dd className="tabular-nums">-{formatWon(est.discount)}</dd>
                </div>
              )}
            </dl>
          </>
        ) : productOf(p) === "유지보수" ? (
          <>
            <h2 id="price-title" className="text-[15px] font-bold text-foreground-secondary">
              유지보수
            </h2>
            <dl className="mt-3 divide-y divide-[#1d1d1f]/15 border-t-2 border-[#1d1d1f] text-[15px] md:text-[16px]">
              {maintenanceServices.map((s) => (
                <div key={s.id} className="flex justify-between gap-3 py-2">
                  <dt>{s.title}</dt>
                  <dd className="text-right font-bold text-accent">{s.price}</dd>
                </div>
              ))}
            </dl>
          </>
        ) : (
          <>
            <h2 id="price-title" className="text-[15px] font-bold text-foreground-secondary">
              업무 프로그램
            </h2>
            <p className="mt-1 text-[28px] font-bold text-accent">별도 견적</p>
            <p className="mt-2 text-[15px] leading-[1.6] text-foreground-secondary">화면 수와 쓰는 사람을 듣고 금액과 기간을 알려 드립니다.</p>
          </>
        )}
        <div className="mt-6 hidden gap-3 md:flex">
          <Link href={p.demoUrl} prefetch={false} data-gtm-cta={`sample_open_${p.id}`} className={`${openButton} flex-1`}>
            <Play size={18} strokeWidth={2.5} aria-hidden />
            샘플 열기
          </Link>
          <ChannelTalkButton cta={`sample_chat_${p.id}`} message={`${p.title} 샘플을 보고 문의합니다.`} className={subButton}>
            채팅 상담
          </ChannelTalkButton>
        </div>
      </section>
    </div>
  );
}
