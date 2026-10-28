import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Plus } from "lucide-react";
import { ChannelTalkButton } from "@/components/layout/ChannelTalk";
import { PageHead, btnLine, btnPrimary, h2, h3, more, wrap } from "@/components/classic/ui";
import { SampleGrid } from "@/components/classic/works/SampleGrid";
import { demoProjects, findBySlug, groupOf, industryOf, isMaintenance, mobileShotOf, samplesIn, slugOf } from "@/components/classic/works/samples";
import { estimateFor, formatWon, manwon } from "@/data/classic/pricing";
import { maintenanceServices } from "@/data/classic/maintenance";
import { pageMeta } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return demoProjects.map((p) => ({ slug: slugOf(p.demoUrl) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = findBySlug(slug);
  if (!p) return {};
  return pageMeta({ title: `${p.title} 샘플 소개`, description: p.description, path: `/classic/sample/${slug}` });
}

const row = "flex justify-between gap-4 border-b border-[#e6e9ee] py-3";

export default async function ClassicSamplePage({ params }: Props) {
  const { slug } = await params;
  const p = findBySlug(slug);
  if (!p) notFound();
  const est = estimateFor(p.id);
  const mobileShot = mobileShotOf(p);
  const ind = industryOf(p);
  const grp = groupOf(p);
  const others = (grp ? samplesIn(grp.slug) : ind ? samplesIn(ind.slug) : demoProjects).filter((x) => x.id !== p.id).slice(0, 4);

  return (
    <>
      <PageHead
        title={p.title}
        trail={[
          { href: "/classic/works", label: "샘플" },
          ...(ind ? [{ href: `/classic/works/${ind.slug}`, label: ind.label }] : []),
          { href: `/classic/sample/${slug}`, label: p.title },
        ]}
      />

      {/* PC 화면에 휴대폰 화면을 겹친다. 누르면 샘플이 열린다 */}
      <section aria-label="샘플 화면" className="bg-[#f4f6f9]">
        <div className={`${wrap} py-10 md:py-16`}>
          <Link href={p.demoUrl} prefetch={false} aria-label={`${p.title} 샘플 열기`} className="group relative mx-auto block max-w-[1040px] pb-[6%]">
            <span className="block w-[88%] overflow-hidden rounded-lg border border-[#d9dee5] bg-white">
              <span aria-hidden className="flex h-6 items-center gap-1.5 border-b border-[#e6e9ee] bg-[#eef1f5] px-3 md:h-8">
                <span className="h-2 w-2 rounded-full bg-[#c5cbd4]" />
                <span className="h-2 w-2 rounded-full bg-[#c5cbd4]" />
                <span className="h-2 w-2 rounded-full bg-[#c5cbd4]" />
              </span>
              <Image
                src={p.imageUrl}
                alt={p.imageAlt}
                width={1440}
                height={900}
                priority
                sizes="(min-width: 1088px) 915px, 80vw"
                className="aspect-[16/10] w-full object-cover object-top"
              />
            </span>
            {mobileShot && (
              <span className="absolute bottom-0 right-0 block w-[25%] max-w-[230px] overflow-hidden rounded-[14px] border-[4px] border-[#15171c] bg-white shadow-[0_16px_32px_rgba(21,23,28,.18)] md:rounded-[24px] md:border-[6px]">
                <Image src={mobileShot} alt="" width={390} height={736} sizes="(min-width: 768px) 230px, 25vw" className="aspect-[9/17] w-full object-cover object-top" />
              </span>
            )}
          </Link>
        </div>
      </section>

      <div className={`${wrap} grid gap-14 py-14 md:grid-cols-[minmax(0,1fr)_400px] md:gap-16 md:py-20`}>
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] font-bold">
            <span className="text-[#256ef4]">{p.category}</span>
            <span aria-hidden className="h-3.5 w-px bg-[#c9cfd8]" />
            <span className="text-[#5b6370]">{p.layout}</span>
          </p>
          <p className="mt-4 break-keep text-[18px] leading-[1.75] md:text-[19px]">{p.description}</p>

          <h2 className={`${h3} mt-12 border-b-2 border-[#15171c] pb-3`}>기능</h2>
          <ul role="list" className="sm:grid sm:grid-cols-2 sm:gap-x-8">
            {p.features.map((f) => (
              <li key={f} className="flex items-center gap-3 border-b border-[#e6e9ee] py-4 text-[16px] font-bold md:text-[17px]">
                <Check size={18} strokeWidth={2.5} aria-hidden className="shrink-0 text-[#256ef4]" />
                <span className="min-w-0 break-keep">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <section aria-labelledby="c-price" className="min-w-0">
          {est ? (
            <>
              <h2 id="c-price" className="border-b-2 border-[#15171c] pb-3 text-[18px] font-extrabold tracking-[-0.02em]">
                비슷하게 만들면
              </h2>
              <dl className="text-[15px] md:text-[16px]">
                <div className={row}>
                  <dt>{est.plan.title}</dt>
                  <dd className="shrink-0 tabular-nums">{formatWon(est.plan.price)}</dd>
                </div>
                {est.lines.map((l) => (
                  <div key={l.name} className={row}>
                    <dt className="min-w-0">{l.name}</dt>
                    <dd className="shrink-0 tabular-nums">{formatWon(l.amount)}</dd>
                  </div>
                ))}
                {est.discount > 0 && (
                  <div className={`${row} font-bold text-[#256ef4]`}>
                    <dt>오픈 할인</dt>
                    <dd className="shrink-0 tabular-nums">-{formatWon(est.discount)}</dd>
                  </div>
                )}
              </dl>
              <p className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                {est.discount > 0 && <s className="text-[17px] font-bold tabular-nums text-[#6b7280]">{manwon(est.list)}</s>}
                <span className="text-[34px] font-extrabold tabular-nums tracking-[-0.03em] md:text-[40px]">{manwon(est.total)}</span>
                <span className="text-[17px] font-bold text-[#5b6370]">작업 {est.days}일</span>
              </p>
            </>
          ) : isMaintenance(p) ? (
            <>
              <h2 id="c-price" className="border-b-2 border-[#15171c] pb-3 text-[18px] font-extrabold tracking-[-0.02em]">
                유지보수
              </h2>
              <dl className="text-[15px] md:text-[16px]">
                {maintenanceServices.map((s) => (
                  <div key={s.id} className={row}>
                    <dt className="shrink-0">{s.title}</dt>
                    <dd className="min-w-0 text-right font-bold">{s.price}</dd>
                  </div>
                ))}
              </dl>
            </>
          ) : (
            <>
              <h2 id="c-price" className="border-b-2 border-[#15171c] pb-3 text-[18px] font-extrabold tracking-[-0.02em]">
                업무 프로그램
              </h2>
              <p className="mt-5 text-[34px] font-extrabold tracking-[-0.03em] md:text-[40px]">별도 견적</p>
            </>
          )}

          <div className="mt-8 grid gap-3">
            <Link href={p.demoUrl} prefetch={false} data-gtm-cta={`classic_sample_open_${p.id}`} className={btnPrimary}>
              샘플 열기
            </Link>
            <ChannelTalkButton cta={`classic_sample_chat_${p.id}`} message={`${p.title} 샘플을 보고 문의합니다.`} className={btnLine}>
              채팅 상담
            </ChannelTalkButton>
          </div>
        </section>
      </div>

      {others.length > 0 && (
        <section aria-labelledby="c-others" className="border-t border-[#e6e9ee] bg-[#f4f6f9]">
          <div className={`${wrap} py-14 md:py-20`}>
            <div className="flex items-end justify-between gap-4">
              <h2 id="c-others" className={`${h2} break-keep`}>
                {ind ? `${ind.label} 샘플` : "다른 샘플"}
              </h2>
              <Link href={ind ? `/classic/works/${ind.slug}` : "/classic/works"} className={`${more} shrink-0`}>
                더보기 <Plus size={15} strokeWidth={2.5} aria-hidden />
              </Link>
            </div>
            <div className="mt-8 md:mt-10">
              <SampleGrid items={others} />
            </div>
          </div>
        </section>
      )}
    </>
  );
}
