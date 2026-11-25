"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, Minus, Plus } from "lucide-react";
import { BoardShell } from "@/components/classic/board/ui";
import { addons, appPlans, formatWon, kioskPlans, landingPlans, manwon, plans, type Plan } from "@/data/classic/pricing";
import { threePlans } from "@/data/classic/three";

// 11-26 비용 한 판. 방향 셋: (1) 가격표 일곱 장을 한 페이지에 쌓기(지금 페이지) (2) 종류별 시작가만 한 줄씩 (3) 고르는 대로 합계가 나오는 견적판.
// 비용 페이지에 오는 사람이 알고 싶은 것은 "내 경우 얼마인가"라서 (3). 종류, 패키지, 추가 기능을 고르면 오른쪽에 합계와 기간이 바로 바뀌고,
// 그 구성 그대로 문의로 넘어간다(메인 신청서가 ?msg= 를 읽는다). 금액은 비용 자료(data/classic/pricing, three)를 그대로 쓴다.

const kinds: { id: string; name: string; plans: Plan[]; addon: boolean }[] = [
  { id: "homepage", name: "홈페이지", plans, addon: true },
  { id: "landing", name: "랜딩페이지", plans: landingPlans, addon: false },
  { id: "app", name: "앱", plans: appPlans, addon: false },
  { id: "kiosk", name: "키오스크", plans: kioskPlans, addon: false },
  { id: "3d", name: "3D 웹", plans: threePlans, addon: false },
];

const stepTitle = "flex items-center gap-3 text-[15px] font-bold text-[#7aa7ff]";

export function PriceBoard() {
  const [ki, setKi] = useState(0);
  const [pi, setPi] = useState(0);
  const [qty, setQty] = useState<Record<string, number>>({});
  const k = kinds[ki];
  const p = k.plans[pi];
  const picked = k.addon ? addons.filter((a) => (qty[a.id] ?? 0) > 0) : [];
  const total = p.price + picked.reduce((s, a) => s + a.price * qty[a.id], 0);
  const days = Math.ceil(p.days + picked.reduce((s, a) => s + a.days * qty[a.id], 0));
  const period = p.period && picked.length === 0 ? p.period : `${days}일`;
  const lines = [`${k.name} ${p.name}`, ...picked.map((a) => `${a.name} ${qty[a.id]}${a.unit}`)];
  const msg = `견적 문의: ${lines.join(", ")} / 합계 ${formatWon(total)}(부가세 별도), 예상 기간 ${period}`;
  const bump = (id: string, d: number) => setQty((q) => ({ ...q, [id]: Math.max(0, Math.min(20, (q[id] ?? 0) + d)) }));

  return (
    <BoardShell no="03" en="PRICE" ice="얼마" title="가 들까요" lead="고르는 대로 합계와 기간이 바로 바뀝니다.">
      <div className="mt-10 grid gap-6 md:mt-14 lg:grid-cols-[1fr_400px] lg:gap-10">
        <div className="min-w-0 space-y-10">
          <section aria-labelledby="pr-1">
            <h2 id="pr-1" className={stepTitle}>
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#7aa7ff] text-[14px] text-[#0b0d12]">1</span>무엇을 만드나요
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {kinds.map((x, i) => (
                <button
                  key={x.id}
                  type="button"
                  aria-pressed={ki === i}
                  onClick={() => {
                    setKi(i);
                    setPi(0);
                  }}
                  className={`min-h-12 rounded-full border px-5 text-[17px] font-[800] tracking-[-0.03em] transition-colors ${ki === i ? "border-white bg-white text-[#0b0d12]" : "border-white/20 text-white/70 hover:border-white/60 hover:text-white"}`}
                >
                  {x.name}
                </button>
              ))}
            </div>
          </section>

          <section aria-labelledby="pr-2">
            <h2 id="pr-2" className={stepTitle}>
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#7aa7ff] text-[14px] text-[#0b0d12]">2</span>어디까지 필요한가요
            </h2>
            <div className="mt-4 grid gap-3 md:grid-cols-3" key={k.id}>
              {k.plans.map((x, i) => (
                <button
                  key={x.id}
                  type="button"
                  aria-pressed={pi === i}
                  onClick={() => setPi(i)}
                  className={`bd-in flex flex-col rounded-[22px] border p-5 text-left transition-colors md:p-6 ${pi === i ? "border-[#256ef4] bg-[#256ef4] text-white" : "border-white/12 bg-[#121722] hover:border-white/40"}`}
                  style={{ "--d": `${i * 0.05}s` } as React.CSSProperties}
                >
                  <span className="text-[18px] font-[800] tracking-[-0.03em] md:text-[20px]">{x.name}</span>
                  <span className={`mt-1 break-keep text-[14px] leading-[1.55] md:text-[15px] ${pi === i ? "text-white" : "text-[#aab2bf]"}`}>{x.summary}</span>
                  <span className="mt-5 text-[28px] font-[800] leading-none tracking-[-0.05em] md:text-[32px]">{manwon(x.price)}</span>
                  <span className={`mt-2 text-[14px] font-bold ${pi === i ? "text-white" : "text-[#7aa7ff]"}`}>제작 기간 {x.period ?? `${x.days}일`}</span>
                  <span className={`mt-4 block space-y-1.5 border-t pt-4 ${pi === i ? "border-white/30" : "border-white/12"}`}>
                    {x.includes.map((t) => (
                      <span key={t} className="flex items-start gap-2 break-keep text-[14px] leading-[1.5]">
                        <Check aria-hidden size={15} strokeWidth={3} className={`mt-0.5 shrink-0 ${pi === i ? "text-[#ffd84d]" : "text-[#7aa7ff]"}`} />
                        {t}
                      </span>
                    ))}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {k.addon && (
            <section aria-labelledby="pr-3">
              <h2 id="pr-3" className={stepTitle}>
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[#7aa7ff] text-[14px] text-[#0b0d12]">3</span>더 넣을 기능이 있나요
              </h2>
              <ul className="mt-4 grid gap-2 md:grid-cols-2" role="list">
                {addons.map((a) => {
                  const n = qty[a.id] ?? 0;
                  return (
                    <li key={a.id} className={`flex items-center justify-between gap-3 rounded-[16px] border px-4 py-3 ${n > 0 ? "border-[#7aa7ff] bg-[#7aa7ff]/10" : "border-white/12 bg-[#121722]"}`}>
                      <span className="min-w-0">
                        <span className="block break-keep text-[16px] font-bold">{a.name}</span>
                        <span className="text-[14px] text-[#aab2bf]">
                          {manwon(a.price)} / {a.unit}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1">
                        <button type="button" onClick={() => bump(a.id, -1)} disabled={n === 0} aria-label={`${a.name} 빼기`} className="grid h-11 w-11 place-items-center rounded-full border border-white/20 text-white disabled:opacity-30">
                          <Minus size={16} aria-hidden />
                        </button>
                        <span className="w-7 text-center text-[17px] font-[800] tabular-nums" aria-live="polite">
                          {n}
                        </span>
                        <button type="button" onClick={() => bump(a.id, 1)} aria-label={`${a.name} 더하기`} className="grid h-11 w-11 place-items-center rounded-full border border-white/20 text-white hover:border-white">
                          <Plus size={16} aria-hidden />
                        </button>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>

        {/* 합계: 넓은 화면에서는 따라 내려온다 */}
        <aside aria-label="견적 합계" className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[28px] bg-white p-6 text-[#0b0d12] md:p-8">
            <p className="text-[14px] font-bold text-[#256ef4]">예상 견적</p>
            <p className="mt-2 text-[44px] font-[800] leading-none tracking-[-0.055em] tabular-nums md:text-[52px]" aria-live="polite">
              {formatWon(total)}
            </p>
            <p className="mt-2 text-[15px] text-[#5b6370]">부가세 포함 {formatWon(Math.round(total * 1.1))}</p>
            <dl className="mt-6 space-y-2.5 border-t border-[#e6e9ee] pt-5 text-[15px]">
              <div className="flex justify-between gap-3">
                <dt className="break-keep text-[#3d4450]">
                  {k.name} {p.name}
                </dt>
                <dd className="shrink-0 font-bold tabular-nums">{formatWon(p.price)}</dd>
              </div>
              {picked.map((a) => (
                <div key={a.id} className="flex justify-between gap-3">
                  <dt className="break-keep text-[#3d4450]">
                    {a.name} {qty[a.id]}
                    {a.unit}
                  </dt>
                  <dd className="shrink-0 font-bold tabular-nums">{formatWon(a.price * qty[a.id])}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-3 border-t border-[#e6e9ee] pt-3">
                <dt className="text-[#3d4450]">예상 제작 기간</dt>
                <dd className="font-[800]">{period}</dd>
              </div>
            </dl>
            <Link href={`/?msg=${encodeURIComponent(msg)}#apply`} className="mt-6 flex min-h-[54px] items-center justify-center gap-2 rounded-full bg-[#0b0d12] text-[16px] font-bold text-white hover:bg-[#256ef4]">
              이 구성으로 문의 <ArrowUpRight size={18} aria-hidden />
            </Link>
          </div>
          <div className="mt-4 rounded-[22px] border border-white/12 bg-[#121722] p-6">
            <p className="text-[15px] font-bold text-[#7aa7ff]">업무 시스템과 유지보수</p>
            <dl className="mt-3 space-y-2 text-[15px]">
              {[
                ["업무 시스템", "요구사항 확인 후 견적"],
                ["수정 한 건", "10,000원부터"],
                ["월 유지관리", "규모 기준 견적"],
              ].map(([a, b]) => (
                <div key={a} className="flex justify-between gap-3">
                  <dt className="text-[#c9ced6]">{a}</dt>
                  <dd className="font-bold">{b}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </div>
    </BoardShell>
  );
}
