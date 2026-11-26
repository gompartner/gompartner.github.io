import type { ReactNode } from "react";
import Image from "next/image";
import { ArrowUpRight, Check, ChevronDown } from "lucide-react";
import { BoardClose, BoardShell } from "@/components/classic/board/ui";
import { Frame } from "@/components/classic/catalog/CatalogDialog";
import { FaqBlock } from "@/components/classic/FaqBlock";
import { LiveStage } from "@/components/classic/three/LiveStage";
import { Reel } from "@/components/classic/three/Reel";
import { manwon } from "@/data/classic/pricing";
import { threeByIndustry, threeCommon, threeCompare, threeDeliver, threeDemos, threeExtras, threeFaq, threeForWhom, threeLeadSample, threeMeta, threePlanNote, threePlans, threeSteps, threeScope } from "@/data/classic/three";

// 11-26 3D 웹 한 판(사용자 "가격만 나와서, 무엇을 할 수 있는지랑 왜 필요한지, 이 상품을 사도록 매력 있게").
// 옛 페이지는 3D 마을 아래로 표가 이어지는 가격 문서였다. 순서를 이야기로 바꿨다.
//  1) 무엇을 할 수 있는지: 맨 위는 실제 3D(모듈 소파)를 그 자리에서 만져 보고, 아래는 업종별 화면을 조작하는 영상과 "체험하기"
//  2) 왜 필요한지: 도입이 필요한 경우 넷과 그때 화면이 하는 일, 사장님이 받게 되는 견적 요청
//  3) 무엇이 납품되고 얼마인지: 패키지, 구현 범위, 진행 절차와 납품물, 업종별 예상 비용, 제작 방식 비교
//  4) 자주 묻는 질문, 문의
// 사실과 금액은 data/classic/three.ts 에 있는 것만 쓴다. 영상은 실제 화면을 조작하며 녹화한 것(public/videos/3d).
// 파란 면은 한 군데(견적 요청 접수 예시)만 쓴다. 누르는 버튼은 흰 알약과 선 알약.

const V = "/videos/3d";
const demo = (id: string) => threeDemos.find((d) => d.href === `/3d/${id}/`)!;

/** 영상으로 보여 주는 화면(맨 위에서 직접 만지는 거실 상담 화면은 여기서 뺀다). head는 영상에서 실제로 하는 일. wide는 넓은 화면에서 두 칸을 차지하는 카드 */
const screens: { id: string; head: string; wide?: boolean; phone?: boolean }[] = [
  { id: "configurator", head: "칸과 부속을 붙이면 금액이 바뀝니다" },
  { id: "door", head: "설치 전에 문 방식과 색을 정합니다" },
  { id: "space", head: "시공 전과 후를 3D로 비교합니다" },
];

/** 도입이 필요한 경우(threeForWhom)마다 화면이 하는 일. 구현 범위(threeScope)에 있는 기능으로만 답한다 */
const answers = [
  "단가표와 옵션 규칙을 연결해 고객이 고르는 즉시 합계가 표시됩니다.",
  "구성과 금액, 연락처가 함께 접수됩니다. 접수된 구성을 3D로 다시 확인한 뒤 실측을 진행합니다.",
  "색상과 소재를 바꿔 가며 360도로 돌려 볼 수 있습니다.",
  "폭과 높이를 입력해 맞추고 평면도와 둘러보기로 전환해 보여 드립니다.",
];

/** 패키지마다 대표 화면 한 장 */
const planShot: Record<string, { img: string; alt: string }> = {
  "3d-viewer": { img: "/3d/assets/thumb/space.jpg", alt: "아파트 시공 사례를 3D로 둘러보는 화면" },
  "3d-brand": { img: "/3d/assets/thumb/island.jpg", alt: "3D 마을로 시작하는 곰파트너 홈페이지 첫 화면" },
  "3d-config": { img: "/3d/assets/thumb/configurator.jpg", alt: "시스템 선반을 구성하고 견적을 받는 화면" },
};

const h2 = "break-keep text-[28px] font-[800] leading-[1.25] tracking-[-0.045em] md:text-[40px]";
const h3 = "break-keep text-[21px] font-[800] leading-[1.3] tracking-[-0.035em] md:text-[24px]";
const sec = "mt-20 scroll-mt-24 md:mt-28";
const card = "rounded-[24px] border border-white/12 bg-[#121722]";
const pill = "inline-flex min-h-12 items-center gap-1.5 rounded-full border border-white/25 px-5 text-[16px] font-bold text-white hover:border-white/90";

/** 접어 두는 칸(눌러서 편다). 브라우저 기본 세모는 숨기고 화살표를 둔다 */
function Fold({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="group border-b border-white/12">
      <summary className="flex min-h-[72px] cursor-pointer list-none items-center justify-between gap-4 py-4 [&::-webkit-details-marker]:hidden">
        <h3 className={`${h3} group-hover:text-[#7aa7ff]`}>{title}</h3>
        <ChevronDown size={24} aria-hidden className="shrink-0 text-[#8a94a6] transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" />
      </summary>
      <div className="pb-9">{children}</div>
    </details>
  );
}

export function ThreeBoard() {
  // 11-26 사용자 "썸네일 교체하고 이 기준으로": 맨 위 첫 체험을 모듈 소파에서 3D 거실 상담 화면으로(소파, 선반, 붙박이장을 한 화면에서)
  const room = demo("room");
  return (
    <BoardShell no="01" en="3D WEB" kw="3D 홈페이지 제작" ice="고객이 직접 구성하는 " title={"3D 견적 화면"} lead={`${threeMeta.lead}.`}>
      {/* 1. 그 자리에서 만져 보는 실제 3D */}
      <section aria-labelledby="t3d-live" className="mt-10 md:mt-14">
        <LiveStage
          src={`${room.href}?embed=1`}
          href={room.href}
          title="3D 거실 상담 화면. 거실 크기를 정하고 가구를 놓고 옮기면 합계가 바뀝니다."
          poster={`${V}/room.jpg?v=1127`}
          preview={{ src: `${V}/room-m.mp4?v=1127`, poster: `${V}/room-m.jpg?v=1127`, w: 390, h: 844, alt: "휴대폰에서 거실을 돌려 보고 소파 모듈을 붙이고 선반과 바닥을 바꾸는 화면" }}
          hint="가구를 눌러 고르고 끌어서 옮기면 합계가 같이 바뀝니다. 고른 구성은 견적서로 보낼 수 있습니다."
        >
          <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[14px] font-bold md:text-[15px]">
            <span className="text-[#7aa7ff]">{room.category}</span>
            <span aria-hidden className="h-3 w-px bg-white/25" />
            <span className="text-[#c9ced6]">{room.title}</span>
          </p>
          <h2 id="t3d-live" className="mt-2 break-keep text-[24px] font-[800] leading-[1.3] tracking-[-0.045em] md:text-[32px]">
            우리 집 거실에 놓아 보고 견적서까지 받습니다
          </h2>
        </LiveStage>
      </section>

      {/* 2. 업종별 화면: 조작하는 영상과 체험하기 */}
      <section aria-labelledby="t3d-screens" className={sec}>
        <h2 id="t3d-screens" className={h2}>
          업종별 3D 화면
        </h2>
        <div className="mt-8 md:mt-10">
          <Reel count={screens.length} label="업종별 3D 화면">
            {screens.map((s) => {
              const d = demo(s.id);
              const name = `${d.category} ${d.title}`;
              return (
                <li key={s.id} className={`${card} flex w-[86%] shrink-0 snap-center flex-col gap-5 p-4 md:w-auto md:p-6 ${s.wide ? "md:col-span-2 md:grid md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] md:items-center md:gap-9 md:p-8" : ""}`}>
                  <div className={`relative ${s.phone ? "md:pb-[7%] md:pr-[8%]" : ""}`}>
                    <Frame shot={{ src: `${V}/${s.id}.jpg?v=1127`, frame: "browser", ratio: "16/10", alt: `${name} 화면을 조작하는 영상`, video: { src: `${V}/${s.id}.mp4?v=1127`, w: 960, h: 600 } }} sizes="(min-width: 768px) 600px, 86vw" />
                    {s.phone && (
                      <div className="absolute bottom-0 right-0 hidden w-[21%] md:block">
                        <Frame shot={{ src: `${V}/${s.id}-m.jpg?v=1127`, frame: "phone", ratio: "390/844", alt: `${name} 휴대폰 화면을 조작하는 영상`, video: { src: `${V}/${s.id}-m.mp4?v=1127`, w: 390, h: 844 } }} sizes="160px" />
                      </div>
                    )}
                  </div>
                  <div className="flex grow flex-col px-1 pb-1 md:px-0 md:pb-0">
                    <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[14px] font-bold md:text-[15px]">
                      <span className="text-[#7aa7ff]">{d.category}</span>
                      <span aria-hidden className="h-3 w-px bg-white/25" />
                      <span className="text-[#c9ced6]">{d.title}</span>
                    </p>
                    <h3 className={`mt-2 ${s.wide ? "break-keep text-[21px] font-[800] leading-[1.3] tracking-[-0.04em] md:text-[30px]" : h3}`}>{s.head}</h3>
                    <p className="mt-2 break-keep text-[15px] leading-[1.65] text-[#aab2bf] md:text-[16px]">{d.desc}.</p>
                    <p className="mt-auto pt-5">
                      <a href={d.href} aria-label={`${name} 체험하기`} className={pill}>
                        체험하기 <ArrowUpRight size={17} aria-hidden />
                      </a>
                    </p>
                  </div>
                </li>
              );
            })}
          </Reel>
        </div>
      </section>

      {/* 3. 왜 필요한지 */}
      <section aria-labelledby="t3d-whom" className={sec}>
        <h2 id="t3d-whom" className={h2}>
          도입이 필요한 경우
        </h2>
        <div className="mt-8 grid gap-4 md:mt-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <ul className={`${card} flex flex-col px-6 md:px-9`} role="list">
            {threeForWhom.map((t, i) => (
              <li key={t} className="flex grow flex-col justify-center border-b border-white/12 py-6 last:border-b-0 md:py-7">
                <h3 className="break-keep text-[19px] font-[800] leading-[1.4] tracking-[-0.035em] md:text-[22px]">{t}</h3>
                <p className="mt-2 flex gap-2.5 break-keep text-[16px] leading-[1.65] text-[#c9ced6]">
                  <Check aria-hidden size={18} strokeWidth={3} className="mt-[5px] shrink-0 text-[#7aa7ff]" />
                  {answers[i]}
                </p>
              </li>
            ))}
          </ul>

          {/* 파란 면: 사장님이 받게 되는 것 */}
          <div className="flex flex-col rounded-[24px] bg-[#256ef4] p-5 text-white sm:p-6 md:p-9">
            <h3 className={h3}>견적 요청 접수 예시</h3>
            <p className="mt-2 break-keep text-[16px] leading-[1.65] text-white">고객이 선택한 구성과 금액이 연락처와 함께 접수됩니다.</p>
            <div className="mt-6 rounded-[18px] bg-white p-4 text-[#0b0d12] sm:p-5 md:p-6">
              <p className="break-keep text-[18px] font-[800] tracking-[-0.03em] md:text-[20px]">{threeLeadSample.title}</p>
              <p className="mt-1 text-[14px] text-[#5b6370]">{threeLeadSample.from}</p>
              <dl className="mt-4 border-t border-[#0b0d12]/15">
                {threeLeadSample.rows.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[56px_minmax(0,1fr)] gap-3 border-b border-[#0b0d12]/10 py-3">
                    <dt className="text-[14px] font-bold text-[#5b6370]">{k}</dt>
                    <dd className="break-keep text-[15px] font-semibold leading-[1.55]">{v}</dd>
                  </div>
                ))}
                <div className="grid grid-cols-[56px_minmax(0,1fr)] items-center gap-3 pt-4">
                  <dt className="text-[14px] font-bold text-[#5b6370]">합계</dt>
                  <dd className="whitespace-nowrap text-[22px] font-[800] tabular-nums leading-none tracking-[-0.04em] sm:text-[26px] md:text-[30px]">{threeLeadSample.total}</dd>
                </div>
              </dl>
            </div>
            <p className="mt-auto flex gap-3 pt-6 text-[15px] leading-[1.6] md:text-[16px]">
              <b className="shrink-0">받는 곳</b>
              <span className="break-keep text-white">{threeLeadSample.to}</span>
            </p>
          </div>
        </div>
      </section>

      {/* 4. 패키지, 금액, 기간 */}
      <section id="plans" aria-labelledby="t3d-plans" className={sec}>
        <h2 id="t3d-plans" className={h2}>
          패키지와 제작 기간
        </h2>
        <ul className="mt-8 grid gap-4 md:mt-10 md:grid-cols-3" role="list">
          {threePlans.map((p) => (
            <li key={p.id} className={`${card} flex flex-col overflow-hidden`}>
              <span className="relative hidden aspect-[16/10] bg-[#0f131b] md:block">
                <Image src={planShot[p.id].img} alt={planShot[p.id].alt} fill sizes="(min-width: 768px) 400px, 1px" className="object-cover object-top" />
              </span>
              <div className="flex grow flex-col p-6 md:p-7">
                <h3 className="text-[19px] font-[800] tracking-[-0.03em] md:text-[21px]">{p.name}</h3>
                <p className="mt-1 break-keep text-[15px] leading-[1.6] text-[#aab2bf]">{p.summary}</p>
                <p className="mt-6 text-[34px] font-[800] leading-none tracking-[-0.05em] md:text-[40px]">{manwon(p.price)}</p>
                <p className="mt-2 text-[15px] font-bold text-[#7aa7ff]">제작 기간 {p.period ?? `${p.days}일`}</p>
                <ul className="mt-6 space-y-2.5 border-t border-white/12 pt-5" role="list">
                  {p.includes.map((t) => (
                    <li key={t} className="flex items-start gap-2 break-keep text-[15px] leading-[1.5]">
                      <Check aria-hidden size={16} strokeWidth={3} className="mt-0.5 shrink-0 text-[#7aa7ff]" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
        <div className={`${card} mt-4 flex flex-col gap-4 p-6 md:flex-row md:items-center md:gap-8 md:px-8`}>
          <h3 className="shrink-0 text-[16px] font-[800] tracking-[-0.02em] text-[#7aa7ff] md:text-[17px]">공통 포함</h3>
          <ul className="flex flex-wrap gap-2" role="list">
            {threeCommon.map((t) => (
              <li key={t} className="rounded-full border border-white/20 px-3.5 py-1.5 text-[15px] text-[#e3e7ee]">
                {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-4 break-keep text-[14px] leading-[1.6] text-[#8a94a6]">{threePlanNote} 금액은 부가세 별도입니다.</p>

        <h3 className={`${h3} mt-14 md:mt-16`}>구현 범위</h3>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" role="list">
          {threeScope.map((g) => (
            <li key={g.title} className={`${card} p-6`}>
              <h4 className="text-[17px] font-[800] tracking-[-0.03em] text-[#7aa7ff] md:text-[18px]">{g.title}</h4>
              <ul className="mt-4 space-y-2.5" role="list">
                {g.items.map((t) => (
                  <li key={t} className="flex items-start gap-2 break-keep text-[15px] leading-[1.55] text-[#e3e7ee]">
                    <Check aria-hidden size={16} strokeWidth={3} className="mt-[3px] shrink-0 text-[#7aa7ff]" />
                    {t}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        <div className="mt-14 grid gap-x-12 gap-y-14 md:mt-16 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div>
            <h3 className={h3}>진행 절차</h3>
            <ol className="mt-5 border-t border-white/12" role="list">
              {threeSteps.map((st, i) => (
                <li key={st.title} className="grid grid-cols-[36px_minmax(0,1fr)] gap-4 border-b border-white/12 py-5">
                  <span aria-hidden className="grid h-9 w-9 place-items-center rounded-full border border-white/25 text-[15px] font-[800] tabular-nums">
                    {i + 1}
                  </span>
                  <span>
                    <span className="block text-[17px] font-[800] tracking-[-0.02em] md:text-[18px]">{st.title}</span>
                    <span className="mt-1 block break-keep text-[15px] leading-[1.65] text-[#aab2bf] md:text-[16px]">{st.body}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h3 className={h3}>납품물</h3>
            <ul className="mt-5 border-t border-white/12" role="list">
              {threeDeliver.items.map((t) => (
                <li key={t} className="flex items-start gap-3 border-b border-white/12 py-5 break-keep text-[16px] font-bold leading-[1.5] md:text-[17px]">
                  <Check aria-hidden size={18} strokeWidth={3} className="mt-[3px] shrink-0 text-[#7aa7ff]" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 더 자세한 금액은 접어 둔다(가격표가 판을 덮지 않게). 눌러서 편다 */}
        <div className="mt-14 border-t border-white/12 md:mt-16">
        <Fold title="업종별 예상 비용">
        <ul className="border-t border-white/12" role="list">
          {threeByIndustry.map((r) => (
            <li key={r.name} className="grid gap-x-8 gap-y-3 border-b border-white/12 py-5 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)_minmax(0,1fr)] md:items-start md:py-6">
              <p className="flex items-baseline justify-between gap-4 md:block">
                <span className="text-[18px] font-[800] tracking-[-0.03em] md:text-[19px]">{r.name}</span>
                <span className="whitespace-nowrap text-[18px] font-[800] tabular-nums tracking-[-0.03em] text-[#7aa7ff] md:mt-1 md:block md:text-[22px]">{r.price}</span>
              </p>
              <p className="break-keep text-[15px] leading-[1.6] md:text-[16px]">
                <span className="block text-[14px] font-bold text-[#8a94a6]">구성</span>
                {r.make}
              </p>
              <p className="break-keep text-[15px] leading-[1.6] text-[#c9ced6] md:text-[16px]">
                <span className="block text-[14px] font-bold text-[#8a94a6]">필요한 자료</span>
                {r.need}
              </p>
            </li>
          ))}
        </ul>
        </Fold>
        <Fold title="별도 비용">
        <ul className="border-t border-white/12" role="list">
          {threeExtras.map((x) => (
            <li key={x.name} className="flex flex-col gap-1 border-b border-white/12 py-4 text-[16px] md:flex-row md:items-center md:justify-between md:text-[17px]">
              <span className="break-keep text-[#e3e7ee]">{x.name}</span>
              <b className="shrink-0 tabular-nums">{x.price}</b>
            </li>
          ))}
        </ul>
        <p className="mt-4 break-keep text-[14px] leading-[1.6] text-[#8a94a6]">표시한 금액 외 별도 비용은 없으며, 기능 추가 시에만 추가 비용이 발생합니다.</p>
        </Fold>
        </div>
      </section>

      {/* 5. 제작 방식 비교 */}
      <section aria-labelledby="t3d-compare" className={sec}>
        <h2 id="t3d-compare" className={h2}>
          제작 방식 비교
        </h2>
        {/* 넓은 화면: 표 */}
        <div className={`${card} mt-8 hidden overflow-hidden md:mt-10 md:block`}>
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">3D 웹 제작 방식 비교</caption>
            <thead>
              <tr className="border-b border-white/12">
                <th scope="col" className="w-[190px] px-6 py-5">
                  <span className="sr-only">항목</span>
                </th>
                {threeCompare.cols.map((c, i) => (
                  <th key={c} scope="col" className={`px-6 py-5 text-[19px] font-[800] tracking-[-0.03em] lg:text-[21px] ${i === 0 ? "bg-[#7aa7ff]/10 text-white" : "text-[#aab2bf]"}`}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {threeCompare.rows.map(([k, ...v]) => (
                <tr key={k} className="border-b border-white/12 last:border-b-0">
                  <th scope="row" className="px-6 py-4 align-top text-[15px] font-bold text-[#8a94a6]">
                    {k}
                  </th>
                  {v.map((x, i) => (
                    <td key={i} className={`break-keep px-6 py-4 align-top text-[16px] leading-[1.55] ${i === 0 ? "bg-[#7aa7ff]/10 font-bold text-white" : "text-[#aab2bf]"}`}>
                      {x}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* 휴대폰: 항목마다 세 방식을 차례로 */}
        <ul className="mt-8 space-y-3 md:hidden" role="list">
          {threeCompare.rows.map(([k, ...v]) => (
            <li key={k} className={`${card} p-5`}>
              <h3 className="text-[15px] font-bold text-[#7aa7ff]">{k}</h3>
              <dl className="mt-3 space-y-2.5">
                {v.map((x, i) => (
                  <div key={i} className="grid grid-cols-[104px_minmax(0,1fr)] gap-3">
                    <dt className={`text-[14px] leading-[1.55] ${i === 0 ? "font-[800] text-white" : "text-[#8a94a6]"}`}>{threeCompare.cols[i]}</dt>
                    <dd className={`break-keep text-[15px] leading-[1.55] ${i === 0 ? "font-bold text-white" : "text-[#aab2bf]"}`}>{x}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
        <p className="mt-4 break-keep text-[14px] leading-[1.6] text-[#8a94a6] md:text-right">{threeCompare.note}</p>
      </section>

      {/* 6. 자주 묻는 질문 */}
      <section aria-labelledby="t3d-faq" className={sec}>
        <h2 id="t3d-faq" className={`${h2} scroll-mt-24`}>
          자주 묻는 질문
        </h2>
        <div className="mt-8 md:mt-10">
          <FaqBlock items={threeFaq} bare />
        </div>
      </section>

      <BoardClose text="제품 사진과 치수, 단가표를 보내 주시면 구성과 견적, 일정을 드립니다." />
    </BoardShell>
  );
}
