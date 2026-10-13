import Link from "next/link";
import { Check } from "lucide-react";
import { ChannelTalkButton } from "@/components/layout/ChannelTalk";
import { addons, formatWon, landingPlans, manwon, planCommon, plans, runningCostNote, samplesForPlan } from "@/data/pricing";
import { projects } from "@/data/projects";

const h1 = "text-[28px] font-bold leading-[1.4] tracking-[-0.01em] md:text-[36px]";
const h2 = "text-[24px] font-bold leading-[1.5] tracking-[-0.01em] md:text-[32px]";

/**
 * 패키지 3종 카드와 나머지 상품 한 줄. primary 가 landing 이면 광고 랜딩 카드가 위, 홈페이지는 한 줄로 내려간다.
 * compact 이면 패키지 카드만, 아니면 추가 기능 가격표까지 보여 준다(가격 페이지).
 */
export function PricingSection({
  id = "pricing",
  compact = false,
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
    <section id={id} aria-labelledby={`${id}-title`} className="relative isolate scroll-mt-16 overflow-hidden border-t border-border bg-surface">
      <div className="mx-auto w-full max-w-[1248px] px-4 py-16 md:px-6 md:py-24">
        <Heading id={`${id}-title`} className={Heading === "h1" ? h1 : h2}>
          {landingFirst ? "광고 랜딩페이지 제작 가격" : "홈페이지 제작 가격"}
        </Heading>

        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {cardPlans.map((plan) => {
            // 이 패키지에 기능 몇 개를 더해 만든 샘플. 싼 것부터 셋만 보여 준다.
            const samples = samplesForPlan(plan.id).slice(0, 3);
            return (
              <li key={plan.id} className="wt-card flex flex-col rounded-[10px] border border-border bg-white p-6">
                <p className="text-[17px] font-bold">
                  {plan.title}{" "}
                  <span className="font-normal text-foreground-secondary">
                    · {plan.name} · {plan.days}일
                  </span>
                </p>
                <p className="mt-1 text-[32px] font-bold leading-[1.3] tabular-nums">{formatWon(plan.price)}</p>
                <p className="mt-1 text-[17px] text-foreground-secondary">{plan.summary}</p>
                <ul className="mt-5 space-y-2 border-t border-border pt-5 text-[17px]">
                  {[...plan.includes, `수정 ${plan.revisions}회`, ...planCommon].map((item) => (
                    <li key={item} className="flex gap-2">
                      <Check size={20} strokeWidth={2.5} className="mt-[3px] shrink-0 text-accent" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
                {samples.length > 0 && (
                  <div className="mt-5 border-t border-border pt-4 text-[15px]">
                    <p className="font-bold text-foreground-secondary">이 패키지로 만든 샘플</p>
                    <ul className="mt-1.5 space-y-1">
                      {samples.map((s) => {
                        const p = projects.find((x) => x.id === s.id)!;
                        return (
                          <li key={s.id} className="flex justify-between gap-3">
                            <Link href={p.demoUrl} prefetch={false} className="underline-offset-4 hover:text-accent hover:underline">
                              {p.title}
                            </Link>
                            <span className="shrink-0 tabular-nums text-foreground-secondary">{manwon(s.total)}</span>
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
                    className="flex h-12 w-full items-center justify-center rounded-[6px] border border-accent text-[17px] font-bold text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    이 패키지로 상담
                  </ChannelTalkButton>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="mt-4 flex flex-col gap-3 rounded-[10px] border border-border bg-white px-6 py-5 md:flex-row md:items-center md:gap-8">
          <p className="shrink-0 text-[17px] font-bold">
            {landingFirst ? "회사·가게 홈페이지" : "광고 랜딩페이지"} <span className="tabular-nums">{manwon(rowPlans[0].price)}</span>부터
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-1 text-[17px]">
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
                    <Link href={p.demoUrl} prefetch={false} className="underline-offset-4 hover:text-accent hover:underline">
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
        <p className="mt-4 text-[15px] leading-[1.6] text-foreground-secondary md:text-[17px]">
          {runningCostNote}{" "}
          <Link href="/tools/hosting-cost" className="font-bold text-accent underline-offset-4 hover:underline">
            업체별 비교
          </Link>
          {" · "}
          <Link href="/maintenance" className="font-bold text-accent underline-offset-4 hover:underline">
            제작 후 유지보수 가격
          </Link>
        </p>
        {!compact && !landingFirst && (
          <div className="mt-4 rounded-[10px] border border-border bg-white p-6">
            <h3 className="text-[17px] font-bold">
              추가 기능 <span className="font-normal text-foreground-secondary">· 고급 패키지는 맞춤 기능 1개 포함</span>
            </h3>
            <dl className="mt-4 grid border-t border-border text-[17px] md:grid-cols-2 md:gap-x-10">
              {addons.map((a) => (
                <div key={a.id} className="flex items-baseline justify-between gap-4 border-b border-border py-3">
                  <dt>{a.name}</dt>
                  <dd className="shrink-0 tabular-nums">
                    {manwon(a.price)}
                    {a.unit !== "식" && <span className="text-foreground-secondary"> / {a.unit}</span>}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </section>
  );
}
