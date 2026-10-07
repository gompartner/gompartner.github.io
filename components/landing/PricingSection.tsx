import { Check } from "lucide-react";
import { addons, formatWon, manwon, planCommon, plans } from "@/data/pricing";

const h2 = "text-[24px] font-bold leading-[1.5] tracking-[-0.01em] md:text-[32px]";

/** 홈페이지 패키지 3종. 랜딩과 업종별 포트폴리오 페이지에서 함께 쓴다. */
export function PricingSection({ id = "pricing" }: { id?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="relative isolate scroll-mt-16 overflow-hidden border-t border-border bg-surface">
      <div className="mx-auto w-full max-w-[1248px] px-4 py-16 md:px-6 md:py-24">
        <h2 id={`${id}-title`} className={h2}>
          홈페이지 제작 가격
        </h2>

        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {plans.map((plan) => {
            return (
              <li key={plan.id} className="flex flex-col rounded-[10px] border border-border bg-white p-6">
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
              </li>
            );
          })}
        </ul>
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
      </div>
    </section>
  );
}
