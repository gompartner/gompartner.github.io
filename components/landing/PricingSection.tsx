import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { ChannelTalkButton } from "@/components/layout/ChannelTalk";
import { estimateFor, formatWon, landingPlans, manwon, planCommon, plans, runningCostNote, samplesForPlan } from "@/data/pricing";
import { projects } from "@/data/projects";
import { SMALL_IMAGE_HEIGHT, SMALL_IMAGE_WIDTH, smallImage } from "@/lib/images";

const h1 = "text-[32px] leading-[1.25] md:text-[44px]";
const h2 = "text-[24px] font-bold leading-[1.5] tracking-[-0.01em] md:text-[32px]";
const sampleHref = (demoUrl: string) => demoUrl.replace("/demo/", "/sample/");

/**
 * 패키지 3종 카드와 나머지 상품 한 줄. primary 가 landing 이면 광고 랜딩 카드가 위, 홈페이지는 한 줄로 내려간다.
 * 카드는 웹툰 컷처럼 굵은 먹선과 단단한 그림자, 위에는 패키지 이름 상자, 아래에는 이 패키지로 만든 샘플 썸네일.
 */
export function PricingSection({
  id = "pricing",
  heading: Heading = "h2",
  primary = "homepage",
}: {
  id?: string;
  compact?: boolean;
  heading?: "h1" | "h2";
  primary?: "homepage" | "landing";
}) {
  const landingFirst = primary === "landing";
  const cardPlans = landingFirst ? landingPlans : plans;
  const rowPlans = landingFirst ? plans : landingPlans;
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="relative isolate scroll-mt-16 border-t-[3px] border-[#1d1d1f]">
      <div className="mx-auto w-full max-w-[1248px] px-4 py-14 md:px-6 md:py-20">
        <Heading id={`${id}-title`} className={Heading === "h1" ? h1 : h2}>
          {landingFirst ? "광고 랜딩페이지 제작 가격" : "홈페이지 제작 가격"}
        </Heading>

        <ul className="mt-8 grid gap-6 md:grid-cols-3 md:gap-5">
          {cardPlans.map((plan, i) => {
            // 이 패키지로 만든 샘플. 싼 것부터 둘만 썸네일로 보여 준다.
            const samples = samplesForPlan(plan.id).slice(0, 2);
            return (
              <li key={plan.id} className={`flex flex-col border-[3px] border-[#1d1d1f] bg-white shadow-[5px_5px_0_#1d1d1f] ${i === 1 ? "md:-translate-y-2" : ""}`}>
                <div className="flex items-center justify-between gap-3 border-b-[3px] border-[#1d1d1f] bg-[#fff3b0] px-5 py-3">
                  <p className="text-[17px] font-bold">{plan.title}</p>
                  <p className="shrink-0 text-[15px] font-bold">
                    {plan.name} · {plan.days}일
                  </p>
                </div>
                <div className="flex flex-1 flex-col p-5 md:p-6">
                  <p className="text-[34px] font-bold leading-[1.2] tabular-nums text-accent">{formatWon(plan.price)}</p>
                  <p className="mt-1 text-[16px] text-foreground-secondary">{plan.summary}</p>
                  <ul className="mt-5 space-y-2 border-t-2 border-[#1d1d1f] pt-4 text-[16px] md:text-[17px]">
                    {[...plan.includes, `수정 ${plan.revisions}회`, ...planCommon].map((item) => (
                      <li key={item} className="flex gap-2">
                        <Check size={20} strokeWidth={3} className="mt-[2px] shrink-0 text-accent" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                  {samples.length > 0 && (
                    <div className="mt-5">
                      <p className="text-[14px] font-bold text-foreground-secondary">이 패키지로 만든 샘플</p>
                      <ul className="mt-2 grid grid-cols-2 gap-2">
                        {samples.map((s) => {
                          const p = projects.find((x) => x.id === s.id)!;
                          const est = estimateFor(s.id)!;
                          return (
                            <li key={s.id}>
                              <Link href={sampleHref(p.demoUrl)} prefetch={false} className="group block overflow-hidden border-[2.5px] border-[#1d1d1f] bg-white">
                                <Image src={smallImage(p.imageUrl)} alt="" width={SMALL_IMAGE_WIDTH} height={SMALL_IMAGE_HEIGHT} className="aspect-[16/10] h-auto w-full object-cover object-top transition-transform duration-300 group-hover:scale-105" />
                                <span className="block border-t-[2.5px] border-[#1d1d1f] px-2 py-1.5 text-[13px] font-bold leading-[1.35]">
                                  <span className="line-clamp-1">{p.title}</span>
                                  <span className="tabular-nums text-accent">{manwon(est.total)}</span>
                                </span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                  <div className="mt-auto pt-6">
                    <ChannelTalkButton
                      cta={`pricing_chat_${plan.id}`}
                      message={`${plan.title}(${manwon(plan.price)}) 패키지로 상담받고 싶어요.`}
                      className="flex h-12 w-full items-center justify-center rounded-[6px] border-[2.5px] border-[#1d1d1f] bg-white text-[17px] font-bold shadow-[3px_3px_0_#1d1d1f] transition-[transform,box-shadow,background-color] duration-150 hover:bg-[#fff3b0] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
                    >
                      이 패키지로 상담
                    </ChannelTalkButton>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 flex flex-col gap-3 border-[3px] border-[#1d1d1f] bg-white px-5 py-4 md:flex-row md:items-center md:gap-8 md:px-6">
          <p className="shrink-0 text-[17px] font-bold">
            {landingFirst ? "회사·가게 홈페이지" : "광고 랜딩페이지"} <span className="tabular-nums text-accent">{manwon(rowPlans[0].price)}</span>부터
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-1 text-[16px] md:text-[17px]">
            {rowPlans.map((plan) => {
              const sample = samplesForPlan(plan.id)[0];
              const p = sample && projects.find((x) => x.id === sample.id);
              const label = (
                <>
                  {plan.title} <span className="tabular-nums text-foreground-secondary">{manwon(plan.price)} · {plan.days}일</span>
                </>
              );
              return (
                <li key={plan.id}>
                  {p ? (
                    <Link href={sampleHref(p.demoUrl)} prefetch={false} className="underline-offset-4 hover:text-accent hover:underline">
                      {label}
                    </Link>
                  ) : (
                    label
                  )}
                </li>
              );
            })}
          </ul>
        </div>
        <p className="mt-4 text-[15px] leading-[1.6] text-foreground-secondary md:text-[16px]">
          {runningCostNote}{" "}
          <Link href="/tools/hosting-cost" className="font-bold text-accent underline-offset-4 hover:underline">
            업체별 비교
          </Link>
        </p>
      </div>
    </section>
  );
}
