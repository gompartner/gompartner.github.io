"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { h2, wrap } from "@/components/classic/ui";
import { ChannelTalkButton } from "@/components/layout/ChannelTalk";
import { addons, formatWon, manwon, plans, sampleReuseRate, type AddonId } from "@/data/classic/pricing";
import { cn } from "@/lib/utils";

/** 홈페이지 패키지 견적 계산. 패키지를 고르고 추가 기능 수량을 더하면 금액과 기간이 나온다. */
export function ClassicPriceCalculator() {
  const [planId, setPlanId] = useState(plans[1].id);
  const [qty, setQty] = useState<Partial<Record<AddonId, number>>>({});
  const [reuse, setReuse] = useState(true);

  const plan = plans.find((p) => p.id === planId)!;
  const picked = addons.filter((a) => (qty[a.id] ?? 0) > 0);
  const addonSum = picked.reduce((s, a) => s + a.price * qty[a.id]!, 0);
  const discount = reuse ? Math.round(addonSum * sampleReuseRate) : 0;
  const total = plan.price + addonSum - discount;
  const days = Math.ceil(plan.days + picked.reduce((s, a) => s + a.days * qty[a.id]!, 0));
  const max = (unit: string) => (unit === "식" ? 1 : unit === "쪽" ? 20 : 5);
  const set = (id: AddonId, n: number) => setQty((q) => ({ ...q, [id]: n }));
  const label = (id: AddonId) => {
    const a = addons.find((x) => x.id === id)!;
    return a.unit === "식" ? a.name : `${a.name} ${qty[id]}${a.unit}`;
  };
  const summary = [plan.title, ...picked.map((a) => label(a.id))].join(", ");
  const stepBtn = "grid size-10 place-items-center text-[#3d4450] hover:bg-[#f2f6fe] disabled:opacity-30 disabled:hover:bg-transparent";

  return (
    <section id="calc" aria-labelledby="calc-title" className="scroll-mt-20 border-t border-[#e6e9ee] md:scroll-mt-32">
      <div className={`${wrap} py-16 md:py-24`}>
        <h2 id="calc-title" className={h2}>
          견적 계산
        </h2>
        <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-12">
          <div>
            <fieldset>
              <legend className="text-[17px] font-extrabold tracking-[-0.02em]">패키지</legend>
              <div className="mt-3 grid border border-[#c9cfd8] sm:grid-cols-3">
                {plans.map((p, i) => {
                  const on = p.id === planId;
                  return (
                    <label
                      key={p.id}
                      className={cn(
                        "flex cursor-pointer flex-col px-4 py-3 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-2 has-[:focus-visible]:outline-[#256ef4]",
                        i > 0 && "border-t border-[#c9cfd8] sm:border-l sm:border-t-0",
                        on ? "bg-[#256ef4] text-white" : "bg-white hover:bg-[#f2f6fe]"
                      )}
                    >
                      <input type="radio" name="classic-calc-plan" value={p.id} checked={on} onChange={() => setPlanId(p.id)} className="sr-only" />
                      <span className="text-[16px] font-bold">{p.title}</span>
                      <span className={cn("text-[14px] tabular-nums", on ? "text-white/85" : "text-[#5b6370]")}>
                        {manwon(p.price)}, {p.days}일
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <p className="mt-8 text-[17px] font-extrabold tracking-[-0.02em]">추가 기능</p>
            <ul className="mt-3 border-t-2 border-[#15171c]" role="list">
              {addons.map((a) => {
                const n = qty[a.id] ?? 0;
                const m = max(a.unit);
                return (
                  <li key={a.id} className="flex items-center justify-between gap-3 border-b border-[#e6e9ee] py-3">
                    <span className="min-w-0">
                      <span className={cn("block text-[16px]", n > 0 && "font-bold")}>{a.name}</span>
                      <span className="block text-[14px] tabular-nums text-[#5b6370]">
                        {formatWon(a.price)}
                        {a.unit !== "식" && ` / ${a.unit}`}
                      </span>
                    </span>
                    {m === 1 ? (
                      <label className="flex shrink-0 cursor-pointer items-center gap-2 text-[15px] font-bold">
                        <input type="checkbox" checked={n > 0} onChange={(e) => set(a.id, e.target.checked ? 1 : 0)} className="size-5 accent-[#256ef4]" />
                        추가
                      </label>
                    ) : (
                      <span className="flex shrink-0 items-center rounded-md border border-[#c9cfd8]">
                        <button type="button" aria-label={`${a.name} 빼기`} disabled={n === 0} onClick={() => set(a.id, n - 1)} className={stepBtn}>
                          <Minus size={16} aria-hidden />
                        </button>
                        <span aria-live="polite" className="w-9 border-x border-[#c9cfd8] text-center text-[16px] font-bold leading-10 tabular-nums">
                          {n}
                        </span>
                        <button type="button" aria-label={`${a.name} 더하기`} disabled={n === m} onClick={() => set(a.id, n + 1)} className={stepBtn}>
                          <Plus size={16} aria-hidden />
                        </button>
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="border-t-2 border-[#15171c] bg-[#f6f7f9] p-5 md:p-6 lg:sticky lg:top-32">
            <p className="text-[17px] font-extrabold tracking-[-0.02em]">견적 내역</p>
            <dl className="mt-3 text-[15px] md:text-[16px]">
              <div className="flex justify-between gap-3 border-b border-[#e6e9ee] py-2.5">
                <dt className="font-bold">{plan.title}</dt>
                <dd className="tabular-nums">{formatWon(plan.price)}</dd>
              </div>
              {picked.map((a) => (
                <div key={a.id} className="flex justify-between gap-3 border-b border-[#e6e9ee] py-2.5">
                  <dt>{label(a.id)}</dt>
                  <dd className="tabular-nums">{formatWon(a.price * qty[a.id]!)}</dd>
                </div>
              ))}
              {discount > 0 && (
                <div className="flex justify-between gap-3 border-b border-[#e6e9ee] py-2.5 font-bold text-[#256ef4]">
                  <dt>오픈 할인</dt>
                  <dd className="tabular-nums">-{formatWon(discount)}</dd>
                </div>
              )}
              <div className="flex justify-between gap-3 py-2.5">
                <dt>작업 기간</dt>
                <dd className="tabular-nums">{days}일</dd>
              </div>
            </dl>
            <p className="mt-2 flex items-baseline justify-between gap-3 border-t-2 border-[#15171c] pt-4">
              <span className="text-[16px] font-bold">합계</span>
              <span className="text-[30px] font-extrabold tabular-nums tracking-[-0.03em] text-[#256ef4] md:text-[34px]">{formatWon(total)}</span>
            </p>
            <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-[15px] leading-[1.55]">
              <input type="checkbox" checked={reuse} onChange={(e) => setReuse(e.target.checked)} className="mt-1 size-4 shrink-0 accent-[#256ef4]" />
              <span>
                <b>샘플에 있는 기능을 그대로 사용</b>
                <span className="block text-[#5b6370]">추가 기능 금액의 {Math.round(sampleReuseRate * 100)}%를 오픈 할인으로 차감합니다.</span>
              </span>
            </label>
            <ChannelTalkButton
              cta="classic_calc_chat"
              message={`견적 계산: ${summary}, ${manwon(total)}로 상담받고 싶어요.`}
              className="mt-5 flex h-12 w-full items-center justify-center rounded-md bg-[#256ef4] text-[16px] font-bold text-white transition-colors hover:bg-[#0b50d0]"
            >
              이 견적으로 상담
            </ChannelTalkButton>
          </div>
        </div>
      </div>
    </section>
  );
}
