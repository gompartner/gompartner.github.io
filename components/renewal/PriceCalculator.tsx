"use client";

import { useEffect, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { ChannelTalkButton } from "@/components/layout/ChannelTalk";
import { addons, formatWon, manwon, plans, sampleReuseRate, type AddonId } from "@/data/pricing";

/**
 * 견적 계산기. 패키지를 고르고 추가 기능 개수를 더하면 금액과 기간이 바로 나온다.
 * 샘플에 있는 기능을 그대로 쓰면 추가 기능은 오픈 할인(절반)을 받는다.
 * 추가 기능 단가표를 겸해서, 따로 가격표를 두지 않는다.
 */
export function PriceCalculator() {
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

  // 휴대폰: 계산기를 보는 동안 아래 상담 줄 위에 합계를 띄운다(영수증이 목록 아래에 있어서)
  const sectionRef = useRef<HTMLElement>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const [inCalc, setInCalc] = useState(false);
  const [receiptSeen, setReceiptSeen] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver((es) => {
      for (const e of es) {
        if (e.target === sectionRef.current) setInCalc(e.isIntersecting);
        if (e.target === receiptRef.current) setReceiptSeen(e.isIntersecting);
      }
    });
    if (sectionRef.current) io.observe(sectionRef.current);
    if (receiptRef.current) io.observe(receiptRef.current);
    return () => io.disconnect();
  }, []);

  const summary = [plan.title, ...picked.map((a) => (a.unit === "식" ? a.name : `${a.name} ${qty[a.id]}${a.unit}`))].join(", ");

  return (
    <section ref={sectionRef} aria-labelledby="calc-title" className="border-t-[3px] border-[#1d1d1f]">
      <div className="mx-auto w-full max-w-[1248px] px-4 py-14 md:px-6 md:py-20">
        <h2 id="calc-title" className="text-[24px] font-bold leading-[1.5] tracking-[-0.01em] md:text-[32px]">
          견적 계산
        </h2>
        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-8">
          <div className="border-[3px] border-[#1d1d1f] bg-white shadow-[5px_5px_0_#1d1d1f]">
            <fieldset className="border-b-[3px] border-[#1d1d1f] p-5 md:p-6">
              <legend className="sr-only">패키지</legend>
              <p className="text-[15px] font-bold text-foreground-secondary">패키지</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {plans.map((p) => {
                  const on = p.id === planId;
                  return (
                    <label
                      key={p.id}
                      className={`flex cursor-pointer flex-col rounded-[6px] border-[2.5px] border-[#1d1d1f] px-3.5 py-2.5 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-accent ${on ? "bg-accent text-white" : "bg-white hover:bg-[#fff3b0]"}`}
                    >
                      <input type="radio" name="calc-plan" value={p.id} checked={on} onChange={() => setPlanId(p.id)} className="sr-only" />
                      <span className="text-[16px] font-bold">{p.title}</span>
                      <span className={`text-[14px] font-bold tabular-nums ${on ? "text-white/85" : "text-foreground-secondary"}`}>
                        {manwon(p.price)}, {p.days}일
                      </span>
                    </label>
                  );
                })}
              </div>
              {plan.id === "premium" && <p className="mt-3 text-[15px] text-foreground-secondary">맞춤 기능 1개는 패키지에 들어 있습니다.</p>}
            </fieldset>

            <div className="p-5 md:p-6">
              <p className="text-[15px] font-bold text-foreground-secondary">추가 기능</p>
              <ul className="mt-2 divide-y-2 divide-dotted divide-[#1d1d1f]/30">
                {addons.map((a) => {
                  const n = qty[a.id] ?? 0;
                  const m = max(a.unit);
                  return (
                    <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
                      <span className="min-w-0">
                        <span className={`block text-[16px] md:text-[17px] ${n ? "font-bold" : ""}`}>{a.name}</span>
                        <span className="block text-[14px] tabular-nums text-foreground-secondary">
                          {manwon(a.price)}
                          {a.unit !== "식" && ` / ${a.unit}`}
                        </span>
                      </span>
                      {m === 1 ? (
                        <button
                          type="button"
                          role="switch"
                          aria-checked={n > 0}
                          aria-label={`${a.name} 넣기`}
                          onClick={() => set(a.id, n ? 0 : 1)}
                          className={`h-9 shrink-0 rounded-full border-[2.5px] border-[#1d1d1f] px-4 text-[15px] font-bold transition-colors ${n ? "bg-[#1d1d1f] text-white" : "bg-white hover:bg-[#fff3b0]"}`}
                        >
                          {n ? "넣음" : "넣기"}
                        </button>
                      ) : (
                        <span className="flex shrink-0 items-center rounded-full border-[2.5px] border-[#1d1d1f] bg-white">
                          <button type="button" aria-label={`${a.name} 빼기`} disabled={n === 0} onClick={() => set(a.id, n - 1)} className="grid size-9 place-items-center rounded-full hover:bg-[#fff3b0] disabled:opacity-30">
                            <Minus size={16} strokeWidth={3} aria-hidden />
                          </button>
                          <span aria-live="polite" className="w-8 text-center text-[16px] font-bold tabular-nums">
                            {n}
                          </span>
                          <button type="button" aria-label={`${a.name} 더하기`} disabled={n === m} onClick={() => set(a.id, n + 1)} className="grid size-9 place-items-center rounded-full hover:bg-[#fff3b0] disabled:opacity-30">
                            <Plus size={16} strokeWidth={3} aria-hidden />
                          </button>
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* 영수증: 고른 것과 합계. PC에서는 스크롤해도 옆에 붙어 있다 */}
          <div ref={receiptRef} className="border-[3px] border-[#1d1d1f] bg-[#fffdf8] p-5 shadow-[5px_5px_0_#1d1d1f] md:p-6 lg:sticky lg:top-24">
            <dl className="divide-y divide-[#1d1d1f]/15 text-[15px] md:text-[16px]">
              <div className="flex justify-between gap-3 pb-2">
                <dt className="font-bold">{plan.title}</dt>
                <dd className="tabular-nums">{formatWon(plan.price)}</dd>
              </div>
              {picked.map((a) => (
                <div key={a.id} className="flex justify-between gap-3 py-2">
                  <dt>{a.unit === "식" ? a.name : `${a.name} ${qty[a.id]}${a.unit}`}</dt>
                  <dd className="tabular-nums">{formatWon(a.price * qty[a.id]!)}</dd>
                </div>
              ))}
              {discount > 0 && (
                <div className="flex justify-between gap-3 py-2 font-bold text-accent">
                  <dt>오픈 할인</dt>
                  <dd className="tabular-nums">-{formatWon(discount)}</dd>
                </div>
              )}
            </dl>
            <p className="mt-3 flex items-baseline justify-between gap-3 border-t-[3px] border-[#1d1d1f] pt-4">
              <span className="text-[16px] font-bold">합계 (작업 {days}일)</span>
              <span className="text-[30px] font-bold tabular-nums text-accent md:text-[34px]">{manwon(total)}</span>
            </p>
            <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-[15px] leading-[1.5]">
              <input type="checkbox" checked={reuse} onChange={(e) => setReuse(e.target.checked)} className="mt-1 size-4 shrink-0 accent-[#256ef4]" />
              <span>
                <b>샘플에 있는 기능을 그대로 써요</b>
                <span className="block text-foreground-secondary">추가 기능 금액의 절반을 오픈 할인으로 빼 드립니다.</span>
              </span>
            </label>
            <ChannelTalkButton
              cta="calc_chat"
              message={`견적 계산: ${summary}, ${manwon(total)}로 상담받고 싶어요.`}
              className="mt-5 flex h-14 w-full items-center justify-center rounded-[6px] border-[3px] border-[#1d1d1f] bg-accent text-[17px] font-bold text-white shadow-[4px_4px_0_#1d1d1f] transition-[transform,box-shadow,background-color] duration-150 hover:bg-accent-hover active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              이 견적으로 상담
            </ChannelTalkButton>
          </div>
        </div>
      </div>
      <p
        aria-hidden
        className={`fixed inset-x-4 z-40 flex items-center justify-between rounded-full border-[2.5px] border-[#1d1d1f] bg-[#fff3b0] px-4 py-2 text-[15px] font-bold shadow-[3px_3px_0_#1d1d1f] transition-[opacity,transform] duration-200 md:hidden ${inCalc && !receiptSeen ? "opacity-100" : "pointer-events-none translate-y-2 opacity-0"}`}
        style={{ bottom: "calc(86px + env(safe-area-inset-bottom))" }}
      >
        <span>합계 ({days}일)</span>
        <span className="tabular-nums text-accent">{manwon(total)}</span>
      </p>
    </section>
  );
}
