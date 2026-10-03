import { Check } from "lucide-react";
import { ChannelTalkButton } from "@/components/layout/ChannelTalk";
import { formatWon, planByProject, plans } from "@/data/pricing";
import { projects } from "@/data/projects";

const h2 = "text-[24px] font-bold leading-[1.5] tracking-[-0.01em] md:text-[32px]";
const primaryButton =
  "inline-flex h-12 items-center justify-center rounded-md bg-accent px-6 text-[17px] font-bold text-accent-foreground transition-colors hover:bg-accent-hover md:h-14 md:px-7";

/** 홈페이지 패키지 3종. 랜딩과 업종별 제작 사례 페이지에서 함께 쓴다. */
export function PricingSection({ id = "pricing", cta = "pricing_chat" }: { id?: string; cta?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="relative isolate scroll-mt-16 overflow-hidden border-t border-border bg-surface">
      <div className="mx-auto w-full max-w-[1248px] px-4 py-16 md:px-6 md:py-24">
        <h2 id={`${id}-title`} className={h2}>
          홈페이지 제작 가격
        </h2>
        <p className="mt-2 text-[17px] leading-[1.5] text-foreground-secondary">
          모든 패키지에 원본 소스와 완료 후 1개월 무상 유지보수가 들어갑니다. 업무 프로그램은 기능을 듣고 따로 견적을 드립니다.
        </p>

        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {plans.map((plan) => {
            const examples = projects.filter((p) => planByProject[p.id] === plan.id);
            return (
              <li key={plan.id} className="flex flex-col rounded-[10px] border border-border bg-white p-6">
                <p className="text-[17px] font-bold">
                  {plan.name} <span className="font-normal text-foreground-secondary">· {plan.days}일</span>
                </p>
                <p className="mt-1 text-[32px] font-bold leading-[1.3] tabular-nums">{formatWon(plan.price)}</p>
                <p className="mt-1 text-[17px] text-foreground-secondary">{plan.summary}</p>
                <ul className="mt-5 space-y-2 border-t border-border pt-5 text-[17px]">
                  {plan.includes.map((item) => (
                    <li key={item} className="flex gap-2">
                      <Check size={20} strokeWidth={2.5} className="mt-[3px] shrink-0 text-accent" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
                {examples.length > 0 && (
                  <p className="mt-5 text-[15px] leading-[1.6] text-foreground-secondary">
                    비슷한 데모:{" "}
                    {examples.map((p, i) => (
                      <span key={p.id}>
                        {i > 0 && ", "}
                        <a href={p.demoUrl} className="underline underline-offset-4 hover:text-accent">
                          {p.title.replace(" 홈페이지", "")}
                        </a>
                      </span>
                    ))}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
        <div className="mt-8">
          <ChannelTalkButton cta={cta} className={primaryButton}>
            채팅으로 상담하기
          </ChannelTalkButton>
        </div>
      </div>
    </section>
  );
}
