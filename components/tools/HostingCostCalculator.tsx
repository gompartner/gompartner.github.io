"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { ChannelTalkButton } from "@/components/layout/ChannelTalk";
import { checkedAt, domainPrices, hostingPlans, tlds, type Tld } from "@/data/hostingPrices";

/* 홈페이지 1년 유지비 계산. 호스팅 상품과 도메인을 고르면 첫해와 다음 해부터 드는 돈을 나눠 보여 준다.
   첫해에는 설치비와 SSL 설치비가 붙고, 다음 해부터는 호스팅·도메인·SSL 연 비용만 든다. */

const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const select = "h-12 w-full rounded-[6px] border border-[#6d7882] bg-white px-3 text-[17px]";

export function HostingCostCalculator() {
  const [planId, setPlanId] = useState(hostingPlans[0].id);
  const [registrar, setRegistrar] = useState(domainPrices[0].registrar);
  const [tld, setTld] = useState<Tld>(".co.kr");

  const plan = hostingPlans.find((p) => p.id === planId)!;
  const domain = domainPrices.find((d) => d.registrar === registrar)!;
  const domainCost = domain.prices[tld];
  const ssl = plan.ssl;

  const first = [
    { name: `${plan.provider} ${plan.product} 1년`, amount: plan.yearly },
    ...(plan.setup ? [{ name: "호스팅 설치비(한 번)", amount: plan.setup }] : []),
    { name: `${registrar} ${tld} 도메인 1년`, amount: domainCost },
    ...(ssl && ssl.firstYear ? [{ name: "https(SSL)", amount: ssl.firstYear }] : []),
  ];
  const firstTotal = first.reduce((s, l) => s + l.amount, 0);
  const nextTotal = plan.yearly + domainCost + (ssl?.yearly ?? 0);

  return (
    <div className="mt-8">
      <div className="grid gap-6 rounded-[10px] border border-border bg-white p-5 md:grid-cols-2 md:p-8">
        <div className="space-y-5">
          <label className="block">
            <span className="text-[17px] font-bold">호스팅</span>
            <select value={planId} onChange={(e) => setPlanId(e.target.value)} className={`${select} mt-2`}>
              {(["웹호스팅", "구독형 빌더"] as const).map((kind) => (
                <optgroup key={kind} label={kind}>
                  {hostingPlans
                    .filter((p) => p.kind === kind)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.provider} {p.product} (1년 {won(p.yearly)})
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <label className="block">
              <span className="text-[17px] font-bold">도메인 살 곳</span>
              <select value={registrar} onChange={(e) => setRegistrar(e.target.value)} className={`${select} mt-2`}>
                {domainPrices.map((d) => (
                  <option key={d.registrar}>{d.registrar}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-[17px] font-bold">끝 주소</span>
              <select value={tld} onChange={(e) => setTld(e.target.value as Tld)} className={`${select} mt-2 w-[120px]`}>
                {tlds.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
          </div>
          <dl className="space-y-1.5 text-[15px] leading-[1.6] text-foreground-secondary">
            <div className="flex gap-2"><dt className="w-16 shrink-0 font-bold">용량</dt><dd>{plan.storage}, 트래픽 {plan.traffic}</dd></div>
            <div className="flex gap-2"><dt className="w-16 shrink-0 font-bold">https</dt><dd>{ssl ? ssl.label : "공식 페이지에서 확인하지 못했습니다"}</dd></div>
            <div className="flex gap-2"><dt className="w-16 shrink-0 font-bold">부가세</dt><dd>{plan.vat === "별도" ? "별도(10%를 더해 계산)" : plan.vat === "포함" ? "포함" : "요금표에 표기 없음"}</dd></div>
            <div className="flex gap-2"><dt className="w-16 shrink-0 font-bold">참고</dt><dd>{plan.note}</dd></div>
          </dl>
        </div>

        <div className="rounded-[10px] bg-surface p-5 md:p-6" aria-live="polite">
          <p className="text-[17px] font-bold">첫해</p>
          <p className="mt-1 text-[32px] font-bold leading-[1.3] tabular-nums">{won(firstTotal)}</p>
          <dl className="mt-3 divide-y divide-border border-y border-border text-[15px]">
            {first.map((l) => (
              <div key={l.name} className="flex justify-between gap-3 py-2">
                <dt>{l.name}</dt>
                <dd className="shrink-0 tabular-nums">{won(l.amount)}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 text-[17px] font-bold">
            다음 해부터 <span className="tabular-nums">1년 {won(nextTotal)}</span>
          </p>
          <p className="mt-1 text-[15px] leading-[1.6] text-foreground-secondary">
            호스팅과 도메인{ssl?.yearly ? ", SSL" : ""}을 해마다 연장하는 값입니다.
            {!ssl && " https 비용은 빠져 있습니다."}
          </p>
        </div>
      </div>

      <h2 className="mt-14 text-[24px] font-bold leading-[1.5]">업체별 요금</h2>
      <p className="mt-1 text-[15px] text-foreground-secondary">{checkedAt} 각 업체 공식 요금표 기준, 1년 결제 정가입니다.</p>
      {/* 휴대폰에서는 표 칸이 좁아 상품명이 세 줄로 접히고 오른쪽 칸이 가려져서, 상품마다 카드로 보여 준다 */}
      <ul className="mt-4 divide-y divide-border rounded-[10px] border border-border sm:hidden">
        {hostingPlans.map((p) => (
          <li key={p.id} className="px-4 py-4">
            <div className="flex items-baseline justify-between gap-3">
              <p className="min-w-0 text-[15px] leading-[1.5]">
                <span className="font-bold">{p.provider}</span> {p.product}
              </p>
              <p className="shrink-0 text-[16px] font-bold tabular-nums">{won(p.yearly)}</p>
            </div>
            <p className="mt-0.5 text-[14px] text-foreground-secondary">{p.kind}</p>
            <dl className="mt-2 grid grid-cols-[4.5rem_1fr] gap-x-2 gap-y-1 text-[14px]">
              <dt className="text-foreground-secondary">설치비</dt>
              <dd className="tabular-nums">{p.setup ? won(p.setup) : "없음"}</dd>
              <dt className="text-foreground-secondary">https</dt>
              <dd>{p.ssl ? p.ssl.label : "확인 못 함"}</dd>
              <dt className="text-foreground-secondary">용량</dt>
              <dd>{p.storage}</dd>
            </dl>
            <a href={p.source} target="_blank" rel="noopener nofollow" className="mt-2 inline-flex items-center gap-1 text-[14px] text-accent hover:underline">
              요금표 <ExternalLink size={13} aria-hidden />
            </a>
          </li>
        ))}
      </ul>
      <div className="mt-4 hidden overflow-x-auto rounded-[10px] border border-border sm:block">
        <table className="w-full min-w-[760px] text-left text-[15px]">
          <thead className="bg-surface">
            <tr>
              {["업체·상품", "1년", "설치비", "https", "용량", "출처"].map((h) => (
                <th key={h} scope="col" className="px-4 py-3 font-bold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {hostingPlans.map((p) => (
              <tr key={p.id}>
                <th scope="row" className="px-4 py-3 font-normal">
                  <span className="font-bold">{p.provider}</span> {p.product}
                  <span className="block text-[14px] text-foreground-secondary">{p.kind}</span>
                </th>
                <td className="px-4 py-3 tabular-nums">{won(p.yearly)}</td>
                <td className="px-4 py-3 tabular-nums">{p.setup ? won(p.setup) : "없음"}</td>
                <td className="px-4 py-3">{p.ssl ? p.ssl.label : "확인 못 함"}</td>
                <td className="px-4 py-3">{p.storage}</td>
                <td className="px-4 py-3">
                  <a href={p.source} target="_blank" rel="noopener nofollow" className="inline-flex items-center gap-1 text-accent hover:underline">
                    요금표 <ExternalLink size={13} aria-hidden />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-14 text-[24px] font-bold leading-[1.5]">도메인 1년</h2>
      <ul className="mt-4 divide-y divide-border rounded-[10px] border border-border sm:hidden">
        {domainPrices.map((d) => (
          <li key={d.registrar} className="px-4 py-4">
            <a href={d.source} target="_blank" rel="noopener nofollow" className="text-[15px] font-bold hover:text-accent hover:underline">{d.registrar}</a>
            <dl className="mt-2 grid grid-cols-[4.5rem_1fr] gap-x-2 gap-y-1 text-[14px]">
              {tlds.map((t) => (
                <div key={t} className="contents">
                  <dt className="text-foreground-secondary">{t}</dt>
                  <dd className="tabular-nums">{won(d.prices[t])}</dd>
                </div>
              ))}
            </dl>
            {d.note && <p className="mt-2 text-[14px] text-foreground-secondary">{d.note}</p>}
          </li>
        ))}
      </ul>
      <div className="mt-4 hidden overflow-x-auto rounded-[10px] border border-border sm:block">
        <table className="w-full min-w-[560px] text-left text-[15px]">
          <thead className="bg-surface">
            <tr>
              {["업체", ...tlds, "참고"].map((h) => (
                <th key={h} scope="col" className="px-4 py-3 font-bold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {domainPrices.map((d) => (
              <tr key={d.registrar}>
                <th scope="row" className="px-4 py-3">
                  <a href={d.source} target="_blank" rel="noopener nofollow" className="hover:text-accent hover:underline">{d.registrar}</a>
                </th>
                {tlds.map((t) => (
                  <td key={t} className="px-4 py-3 tabular-nums">{won(d.prices[t])}</td>
                ))}
                <td className="px-4 py-3 text-foreground-secondary">{d.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[14px] leading-[1.6] text-foreground-secondary">
        요금은 업체 사정으로 바뀔 수 있으니 결제 전에 각 요금표를 확인하세요. 연장 요금을 따로 밝히지 않은 곳은 등록 요금으로 계산했습니다.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-[10px] bg-surface p-5">
        <p className="text-[16px] font-bold">어느 호스팅이 맞을지 모르겠다면</p>
        <ChannelTalkButton cta="tool_hosting_chat" className="inline-flex h-11 items-center rounded-md bg-accent px-4 text-[15px] font-bold text-accent-foreground hover:bg-accent-hover">
          채팅 상담
        </ChannelTalkButton>
      </div>
    </div>
  );
}
