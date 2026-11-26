import type { ReactNode } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUpRight, Check, ChevronDown } from "lucide-react";
import { BoardClose, BoardShell } from "@/components/classic/board/ui";
import { Frame } from "@/components/classic/catalog/CatalogDialog";
import { FaqBlock } from "@/components/classic/FaqBlock";
import { LiveStage } from "@/components/classic/three/LiveStage";
import { Reel } from "@/components/classic/three/Reel";
import { manwon } from "@/data/classic/pricing";
import { threeByIndustry, threeCommon, threeCompare, threeDeliver, threeDemos, threeExtras, threeFaq, threeForWhom, threeMeta, threePlanNote, threePlans, threeSteps, threeScope } from "@/data/classic/three";

// 11-26 3D 웹 한 판(사용자 "가격만 나와서, 무엇을 할 수 있는지랑 왜 필요한지, 이 상품을 사도록 매력 있게").
// 옛 페이지는 3D 마을 아래로 표가 이어지는 가격 문서였다. 순서를 이야기로 바꿨다.
//  1) 무엇을 할 수 있는지: 맨 위는 실제 3D(모듈 소파)를 그 자리에서 만져 보고, 아래는 업종별 화면을 조작하는 영상과 "체험하기"
//  2) 왜 필요한지: 도입이 필요한 경우 넷과 그때 화면이 하는 일, 사장님이 받게 되는 견적 요청
//  3) 무엇이 납품되고 얼마인지: 패키지, 구현 범위, 진행 절차와 납품물, 업종별 예상 비용, 제작 방식 비교
//  4) 자주 묻는 질문, 문의
// 사실과 금액은 data/classic/three.ts 에 있는 것만 쓴다. 영상은 실제 화면을 조작하며 녹화한 것(public/videos/3d).
// 색 면은 쓰지 않는다(11-27 견적 요청 예시 파란 판은 조립 흐름으로 옮김). 누르는 버튼은 흰 알약과 선 알약.

const V = "/videos/3d";
const demo = (id: string) => threeDemos.find((d) => d.href === `/3d/${id}/`)!;

/** 영상으로 보여 주는 화면(맨 위에서 직접 만지는 거실 상담 화면은 여기서 뺀다). head는 영상에서 실제로 하는 일. wide는 넓은 화면에서 두 칸을 차지하는 카드 */
// 11-27 사용자 "소파 아래 넣어 줘야지 사라짐": 맨 위를 거실로 바꾸며 빠졌던 모듈 소파를 첫 카드로
const screens: { id: string; head: string; wide?: boolean; phone?: boolean }[] = [
  { id: "sofa", head: "모듈을 붙이고 원단을 바꾸면 금액이 바뀝니다" },
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

/** 11-27 사용자 "3D는 소개와 비용만 부각, 빌드에서 만들고 조립하는 느낌, 서비스를 어떻게 연결할지 고민한다 식으로":
 *  3D 화면(BUILD)이 거래장부 견적서(RUN)로 이어지고 단가 변경은 관리(CARE)로 받는 흐름. 메인의 BUILD, RUN, CARE와 같은 이름.
 *  금액은 현관 중문 3D 화면의 기본 구성(3연동 슬라이딩, 폭 1,200mm, 브론즈 유리)에서 읽은 실제 값. 그림은 그 구성을 실제로 보낸 견적서와 받는 화면 */
const doorLines: [string, string][] = [
  ["기본 제품가, 3연동 슬라이딩", "720,000"],
  ["치수 추가, 폭 100mm당 33,000원", "66,000"],
  ["유리 브론즈", "179,000"],
  ["그 밖의 부속과 시공비", "310,000"],
];
const csvLines = ["품목,옵션,단가", "중문,3연동 슬라이딩,720000", "치수,폭 100mm,33000", "부속,자동 닫힘,70000"];

function Joint({ label }: { label: string }) {
  return (
    <div aria-hidden className="flex items-center gap-3 py-3 pl-6 md:pl-9 lg:pl-[calc(220px+2.25rem)]">
      <span className="grid h-10 w-10 place-items-center rounded-full border border-white/25 bg-[#0b0d12] text-white">
        <ArrowDown size={18} />
      </span>
      <span className="text-[14px] font-bold text-[#8a94a6]">{label}</span>
    </div>
  );
}

/** 한 줄: 왼쪽은 큰 번호와 BUILD, RUN, CARE, 오른쪽은 그 단계의 부품 */
function Row({ no, en, ko, children }: { no: string; en: string; ko: string; children: ReactNode }) {
  return (
    <div className={`${card} grid gap-6 p-6 md:p-9 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-9`}>
      <p className="flex items-baseline gap-3 lg:flex-col lg:gap-1">
        <span className="text-[40px] font-[800] leading-none tracking-[-0.05em] text-white md:text-[56px]">{no}</span>
        <span className="text-[14px] font-bold tracking-[0.16em] text-[#7aa7ff] md:text-[15px]">{en}</span>
        <span className="text-[15px] font-bold text-[#c9ced6] md:text-[16px]">{ko}</span>
      </p>
      {children}
    </div>
  );
}

function Piece({ title, body, children }: { title: string; body: string; children?: ReactNode }) {
  return (
    <div className="min-w-0">
      {children}
      <h3 className={`${children ? "mt-5" : ""} break-keep text-[20px] font-[800] leading-[1.35] tracking-[-0.035em] md:text-[22px]`}>{title}</h3>
      <p className="mt-2 break-keep text-[15px] leading-[1.7] text-[#aab2bf] md:text-[16px]">{body}</p>
    </div>
  );
}


/** 연동 범위. 업무 시스템 연결은 사용 중인 시스템의 API나 웹훅을 확인한 뒤 범위를 정한다(협의) */
const integrations: [string, string[]][] = [
  ["홈페이지", ["아임웹", "카페24", "워드프레스", "자체 개발 사이트"]],
  ["견적 접수", ["곰파트너 거래장부", "메일 알림", "구글 시트"]],
  ["업무 시스템(협의)", ["사용 중인 CRM", "ERP", "자체 관리자 화면", "API와 웹훅 연동"]],
];

/** 패키지마다 대표 화면 한 장 */
const planShot: Record<string, { img: string; alt: string }> = {
  "3d-viewer": { img: "/3d/assets/thumb/space.jpg?v=11273", alt: "아파트 시공 사례를 3D로 둘러보는 화면" },
  "3d-brand": { img: "/3d/assets/thumb/island.jpg", alt: "3D 마을로 시작하는 곰파트너 홈페이지 첫 화면" },
  "3d-config": { img: "/3d/assets/thumb/configurator.jpg?v=11272", alt: "시스템 선반을 구성하고 견적을 받는 화면" },
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
          poster={`${V}/room.jpg?v=11272`}
          stages={[{ min: 1180, src: `${V}/room-stage-1200.jpg` }, { min: 900, src: `${V}/room-stage-1000.jpg` }, { min: 768, src: `${V}/room-stage-800.jpg` }]}
          preview={{ src: `${V}/room-m.mp4?v=11273`, poster: `${V}/room-m.jpg?v=11272`, w: 390, h: 844, alt: "휴대폰에서 거실을 돌려 보고 소파 모듈을 붙이고 선반과 바닥을 바꾸는 화면" }}
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

      {/* 2. 조립: 3D 화면(BUILD)에서 견적서(RUN), 단가 변경(CARE)까지. 11-27 사용자 "만든다 만 느낌": 좁은 세 칸이 태블릿에서 눌려 넓은 세 줄로 */}
      <section aria-labelledby="t3d-flow" className={sec}>
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <h2 id="t3d-flow" className={h2}>
            3D 견적에서 견적서 발행까지
          </h2>
          <p className="max-w-[460px] break-keep text-[16px] leading-[1.7] text-[#aab2bf] md:text-[17px]">
            3D 컨피규레이터 구축과 견적서 발행, 단가 관리를 하나의 업무 흐름으로 연동합니다. 어디에 붙이고 어떻게 받을지 먼저 설계한 뒤 조립합니다.
          </p>
        </div>
        <div className="mt-8 md:mt-10">
          <Row no="01" en="BUILD" ko="만듭니다">
            <div className="grid gap-8 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:gap-9">
              <Piece title="3D 컨피규레이터" body="고객이 문 방식과 치수, 유리를 직접 선택하고 3D로 확인합니다. 운영 중인 홈페이지에 별도 페이지나 삽입 코드로 연동합니다.">
                <Frame shot={{ src: `${V}/door.jpg?v=11273`, frame: "browser", ratio: "16/10", alt: "현관 중문 3D 화면에서 문 방식과 색을 바꾸는 영상", video: { src: `${V}/door.mp4?v=11273`, w: 960, h: 600 } }} sizes="(min-width: 1024px) 520px, 90vw" />
              </Piece>
              <Piece title="실시간 견적 산출" body="업체 단가표를 옵션별 계산 규칙으로 구성해 선택 즉시 합계를 산출합니다.">
                <div className="rounded-[14px] border border-white/12 bg-[#0f131b] p-5 text-[15px] tabular-nums">
                  <p className="text-[13px] font-bold tracking-[0.04em] text-[#8a94a6]">현관 중문, 3연동 슬라이딩, 폭 1,200mm</p>
                  <dl className="mt-3">
                    {doorLines.map(([k, v]) => (
                      <div key={k} className="flex items-baseline justify-between gap-4 border-b border-white/10 py-2.5">
                        <dt className="min-w-0 break-keep text-[#c9ced6]">{k}</dt>
                        <dd className="shrink-0 whitespace-nowrap text-white">{v}</dd>
                      </div>
                    ))}
                    <div className="flex items-baseline justify-between gap-4 pt-4">
                      <dt className="whitespace-nowrap font-bold">합계 <span className="text-[13px] font-normal text-[#8a94a6]">부가세 포함</span></dt>
                      <dd className="shrink-0 whitespace-nowrap text-[22px] font-[800] tracking-[-0.03em]">1,275,000원</dd>
                    </div>
                  </dl>
                </div>
              </Piece>
            </div>
          </Row>

          <Joint label="견적 데이터" />

          <Row no="02" en="RUN" ko="운영합니다">
            <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_200px] md:items-start md:gap-9 lg:grid-cols-[minmax(0,1fr)_230px]">
              <Piece title="견적서 자동 작성" body="견적 요청 시 품목과 규격, 금액이 입력된 견적서가 거래장부에 자동으로 작성됩니다. 담당자는 검토 후 발행합니다.">
                <span className="block overflow-hidden rounded-[14px] border border-white/12 bg-white">
                  <Image src="/images/three/flow-quote.jpg" alt="거래장부 견적서. 현관 중문 3연동 슬라이딩, 폭 1,200mm, 합계 1,275,000원" width={1200} height={772} sizes="(min-width: 1024px) 640px, 90vw" className="block h-auto w-full" />
                </span>
              </Piece>
              <Piece title="고객 수령 확인" body="발행한 견적서를 링크로 전달하면 고객이 휴대폰에서 수령 확인이나 수정 요청을 남깁니다. 확인 일시는 기록으로 남습니다.">
                <div className="mx-auto max-w-[200px] md:max-w-none">
                  <Frame shot={{ src: "/images/three/flow-recv-m.jpg", frame: "phone", ratio: "390/580", alt: "고객 휴대폰의 받는 화면. 견적서 아래 받았어요와 수정 요청 단추" }} sizes="230px" />
                </div>
              </Piece>
            </div>
          </Row>

          <Joint label="단가 변경" />

          <Row no="03" en="CARE" ko="관리합니다">
            <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center md:gap-9">
              <div>
                <Piece title="단가와 옵션 관리" body="단가와 옵션은 코드와 분리된 엑셀(CSV) 파일로 관리합니다. 직접 수정이 어려우면 월 운영(월 10만 원부터)으로 변경을 대행합니다." />
                <p className="mt-6">
                  <a href="/maintenance" className={pill}>
                    유지보수 보기 <ArrowUpRight size={17} aria-hidden />
                  </a>
                </p>
              </div>
              <div className="overflow-hidden rounded-[14px] border border-white/12 bg-[#0f131b]">
                <p className="border-b border-white/10 px-5 py-3 font-mono text-[13px] text-[#8a94a6]">door-prices.csv</p>
                <pre className="overflow-x-auto px-5 py-4 font-mono text-[14px] leading-[1.9] text-[#c9ced6]">{csvLines.join("\n")}</pre>
              </div>
            </div>
          </Row>
        </div>

        {/* 연동 범위: 곰파트너 거래장부 외에 쓰고 있는 홈페이지, 접수 채널, 업무 시스템 */}
        <div className={`${card} mt-4 p-6 md:p-8`}>
          <h3 className={h3}>연동 범위</h3>
          <p className="mt-2 break-keep text-[15px] leading-[1.65] text-[#aab2bf] md:text-[16px]">곰파트너 거래장부 외에 지금 쓰고 계신 홈페이지와 업무 시스템에도 연결합니다.</p>
          <dl className="mt-6 grid gap-5 md:grid-cols-3 md:gap-8">
            {integrations.map(([k, items]) => (
              <div key={k} className="border-t border-white/12 pt-4">
                <dt className="text-[14px] font-bold tracking-[-0.01em] text-[#7aa7ff] md:text-[15px]">{k}</dt>
                <dd className="mt-3">
                  <ul className="flex flex-wrap gap-2" role="list">
                    {items.map((t) => (
                      <li key={t} className="rounded-full border border-white/20 px-3.5 py-1.5 text-[15px] text-[#e3e7ee]">
                        {t}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 3. 업종별 화면: 조작하는 영상과 체험하기 */}
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
                    <Frame shot={{ src: `${V}/${s.id}.jpg?v=11273`, frame: "browser", ratio: "16/10", alt: `${name} 화면을 조작하는 영상`, video: { src: `${V}/${s.id}.mp4?v=11273`, w: 960, h: 600 } }} sizes="(min-width: 768px) 600px, 86vw" />
                    {s.phone && (
                      <div className="absolute bottom-0 right-0 hidden w-[21%] md:block">
                        <Frame shot={{ src: `${V}/${s.id}-m.jpg?v=11273`, frame: "phone", ratio: "390/844", alt: `${name} 휴대폰 화면을 조작하는 영상`, video: { src: `${V}/${s.id}-m.mp4?v=11273`, w: 390, h: 844 } }} sizes="160px" />
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

      {/* 4. 왜 필요한지 */}
      <section aria-labelledby="t3d-whom" className={sec}>
        <h2 id="t3d-whom" className={h2}>
          도입이 필요한 경우
        </h2>
        <div className="mt-8 md:mt-10">
          <ul className={`${card} grid px-6 md:px-9 lg:grid-cols-2 lg:gap-x-12`} role="list">
            {threeForWhom.map((t, i) => (
              <li key={t} className="flex flex-col border-b border-white/12 py-6 last:border-b-0 md:py-7 lg:[&:nth-last-child(2)]:border-b-0">
                <h3 className="break-keep text-[19px] font-[800] leading-[1.4] tracking-[-0.035em] md:text-[22px]">{t}</h3>
                <p className="mt-2 flex gap-2.5 break-keep text-[16px] leading-[1.65] text-[#c9ced6]">
                  <Check aria-hidden size={18} strokeWidth={3} className="mt-[5px] shrink-0 text-[#7aa7ff]" />
                  {answers[i]}
                </p>
              </li>
            ))}
          </ul>

        </div>
      </section>

      {/* 5. 패키지, 금액, 기간 */}
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

      {/* 6. 제작 방식 비교 */}
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

      {/* 7. 자주 묻는 질문 */}
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
