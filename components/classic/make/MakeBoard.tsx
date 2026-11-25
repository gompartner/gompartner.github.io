"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { appPlans, kioskPlans, landingPlans, manwon, plans, type Plan } from "@/data/classic/pricing";
import { threePlans } from "@/data/classic/three";

// 11-26 제작 한 판(사용자 "제작 한 판, 유지보수 한 판, 비용 한 판, 카탈로그 한 판", "각자 유닛으로 만들어 일원화가 안 됨").
// 방향 셋을 놓고 골랐다: (1) 기존 긴 문서 페이지 6개를 색만 어둡게 (2) 한 화면에서 종류를 고르면 구성, 금액, 기간이 바뀌는 판 (3) 메인에 전부 넣기.
// (1)은 여전히 따로 노는 긴 문서, (3)은 메인이 길어져서 (2)로 했다. 메인과 같은 바탕, 같은 글자, 같은 색 판.
// 금액과 구성은 비용 데이터(data/classic/pricing, three)를 그대로 읽는다. 자세한 조건은 각 상세 페이지로 잇는다.

type Shot = { img: string; name: string };
type Kind = { id: string; name: string; en: string; line: string; who: string[]; plans: Plan[]; href: string; c: string; shots: Shot[] };
const kinds: Kind[] = [
  { id: "homepage", name: "홈페이지", en: "Website", line: "병원, 매장, 전문직, 기업, 학원의 얼굴이 되는 사이트", who: ["처음 홈페이지를 만드는 사업장", "오래된 사이트를 새로 바꾸려는 곳", "문의와 예약을 홈페이지로 받고 싶은 곳"], plans, href: "/homepage", c: "#7aa7ff", shots: [{ img: "/images/demos/dental-homepage.jpg", name: "치과" }, { img: "/images/demos/bakery-cafe.jpg", name: "베이커리 카페" }, { img: "/images/demos/tax-office.jpg", name: "세무사무소" }] },
  { id: "landing", name: "랜딩페이지", en: "Landing", line: "광고로 들어온 손님을 신청으로 잇는 한 장", who: ["광고를 돌리는데 신청이 적은 곳", "행사, 모집, 분양처럼 기간이 정해진 일", "신청 내역을 한곳에 모으고 싶은 곳"], plans: landingPlans, href: "/landing-page", c: "#ffd84d", shots: [{ img: "/images/demos/landing-move-clean.jpg", name: "입주 청소 상담 신청" }, { img: "/images/demos/landing-water-rental.jpg", name: "정수기 렌탈 상담" }, { img: "/images/demos/landing-coding-camp.jpg", name: "코딩 캠프 모집" }] },
  { id: "program", name: "업무 시스템", en: "System", line: "엑셀로 하던 정산, 재고, 접수, 견적을 웹 화면 하나로", who: ["엑셀 파일이 사람마다 다른 곳", "같은 내용을 여러 번 옮겨 적는 곳", "담당자가 바뀌면 일이 멈추는 곳"], plans: [], href: "/program", c: "#ffffff", shots: [{ img: "/images/demos/shop-admin.jpg", name: "쇼핑몰 옵션과 주문 관리" }, { img: "/images/demos/lms.jpg", name: "온라인 강의와 수료 관리" }, { img: "/images/demos/excel-automation.jpg", name: "엑셀 반복 업무 자동화" }] },
  { id: "app", name: "앱", en: "App", line: "예약, 주문, 적립, 현장 보고를 손안에서", who: ["단골이 자주 쓰는 예약, 주문이 있는 곳", "현장에서 바로 기록해야 하는 일", "스토어에 내 앱을 올리고 싶은 곳"], plans: appPlans, href: "/app", c: "#7aa7ff", shots: [{ img: "/images/demos/app-pilates.jpg", name: "필라테스 예약과 회원권" }, { img: "/images/demos/app-academy.jpg", name: "학원 출결과 알림" }] },
  { id: "kiosk", name: "키오스크", en: "Kiosk", line: "접수, 출결, 안내를 터치 화면으로", who: ["접수 창구가 붐비는 병원, 학원", "안내 인력이 부족한 시설", "출결과 방문 기록을 남겨야 하는 곳"], plans: kioskPlans, href: "/kiosk", c: "#ffd84d", shots: [{ img: "/images/demos/kiosk-clinic.jpg", name: "병원 접수" }, { img: "/images/demos/kiosk-academy.jpg", name: "학원 출결" }] },
  { id: "3d", name: "3D 웹", en: "3D Web", line: "제품과 공간을 고객이 직접 돌려 보고 고르게", who: ["옵션이 많아 설명이 긴 제품", "직접 와 봐야 아는 공간", "견적 문의를 미리 걸러 받고 싶은 곳"], plans: threePlans, href: "/3d", c: "#ffffff", shots: [{ img: "/3d/assets/og/configurator.jpg", name: "옵션을 고르는 3D 견적" }, { img: "/3d/assets/og/space.jpg", name: "공간 둘러보기" }, { img: "/3d/assets/og/sofa.jpg", name: "모듈 소파 구성" }] },
];

const css = `
@keyframes mk-in { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
.mk-in { animation: mk-in 0.38s cubic-bezier(0.2, 0.8, 0.3, 1) both; animation-delay: var(--d, 0s); }
@media (prefers-reduced-motion: reduce) { .mk-in { animation: none; } }
/* 메인과 같게: 휴대폰 아래에 떠 있는 전화, 카카오톡 상담 바와 그 높이만큼의 바닥글 여백을 뺀다 */
html:has(.gp-home) [aria-label="전화와 카카오톡 상담"] { display: none; }
@media (max-width: 767px) { html:has(.gp-home) footer { padding-bottom: 0; } }
.mk-ice { background-image: linear-gradient(112deg, #ffffff 0%, #d5e4ff 30%, #8db4ff 52%, #e8f1ff 74%, #ffffff 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
`;

const wrap = "mx-auto w-full max-w-[1248px] px-4 md:px-6";

export function MakeBoard() {
  const [on, setOn] = useState(0);
  const k = kinds[on];
  return (
    <div className="keep-light gp-home">
      <style>{css}</style>
      <div className="bg-[#0b0d12] bg-[linear-gradient(rgba(122,167,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(122,167,255,.05)_1px,transparent_1px)] bg-[size:48px_48px] text-white">
        <div className={`${wrap} pb-20 pt-10 md:pb-28 md:pt-16`}>
          <p className="flex items-center gap-3 text-[13px] font-bold tracking-[0.18em] text-[#7aa7ff] md:text-[14px]">
            <span>01</span>
            <span aria-hidden className="h-px w-10 bg-current" />
            BUILD
          </p>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
            <h1 className="text-[40px] font-[800] leading-[1.1] tracking-[-0.05em] md:text-[68px]">
              <span className="mk-ice">무엇을</span> 만들까요
            </h1>
            <p className="max-w-[420px] break-keep pb-2 text-[16px] leading-[1.7] text-[#aab2bf] md:text-[17px]">종류를 고르면 만든 화면과 금액, 기간이 바로 나옵니다.</p>
          </div>

          <div className="mt-10 grid gap-6 md:mt-14 lg:grid-cols-[300px_1fr] lg:gap-10">
            {/* 종류 고르기: 넓은 화면은 세로 목록, 좁은 화면은 옆으로 넘기는 줄 */}
            <div role="tablist" aria-label="제작 종류" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] lg:mx-0 lg:block lg:space-y-1 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden">
              {kinds.map((x, i) => (
                <button
                  key={x.id}
                  type="button"
                  role="tab"
                  id={`mk-tab-${x.id}`}
                  aria-selected={on === i}
                  aria-controls="mk-panel"
                  onClick={() => setOn(i)}
                  className={`group flex shrink-0 items-baseline gap-3 rounded-full border px-5 py-2.5 text-left transition-colors lg:w-full lg:rounded-[18px] lg:border-0 lg:px-5 lg:py-4 ${
                    on === i ? "border-white bg-white text-[#0b0d12]" : "border-white/20 text-white/55 hover:text-white lg:hover:bg-white/[0.06]"
                  }`}
                >
                  <span className={`hidden text-[13px] font-bold tabular-nums lg:inline ${on === i ? "text-[#256ef4]" : "text-white/40"}`}>{String(i + 1).padStart(2, "0")}</span>
                  <span className="whitespace-nowrap text-[17px] font-[800] tracking-[-0.03em] lg:text-[26px]">{x.name}</span>
                  <span className={`ml-auto hidden text-[13px] font-bold tracking-[0.08em] lg:inline ${on === i ? "text-[#256ef4]" : "text-white/30"}`}>{x.en}</span>
                </button>
              ))}
            </div>

            {/* 고른 종류의 판. key로 다시 그려 들어오는 움직임을 준다 */}
            <div id="mk-panel" role="tabpanel" aria-labelledby={`mk-tab-${k.id}`} key={k.id} className="min-w-0">
              <div className="mk-in rounded-[28px] border border-white/12 bg-[#121722] p-6 md:p-9">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[14px] font-bold tracking-[0.1em]" style={{ color: k.c }}>
                      {k.en.toUpperCase()}
                    </p>
                    <h2 className="mt-2 break-keep text-[26px] font-[800] leading-[1.25] tracking-[-0.045em] md:text-[36px]">{k.line}</h2>
                  </div>
                  <Link href={k.href} className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-full border border-white/25 px-4 text-[15px] font-bold text-white hover:border-white">
                    자세한 구성 <ArrowUpRight size={16} aria-hidden />
                  </Link>
                </div>
                <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2" role="list">
                  {k.who.map((w) => (
                    <li key={w} className="flex items-center gap-2 text-[15px] text-[#c9ced6] md:text-[16px]">
                      <i aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: k.c }} />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 만든 화면: 눌러 들어가는 데모가 아니라 그림으로 보여 준다(데모, 샘플 주소는 내린다) */}
              <ul className={`mt-4 grid gap-4 ${k.shots.length === 2 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3"}`} role="list">
                {k.shots.map((sh, i) => (
                  <li key={sh.img} className={`mk-in overflow-hidden rounded-[20px] border border-white/12 bg-[#121722] ${k.shots.length === 3 && i === 0 ? "col-span-2 md:col-span-1" : ""}`} style={{ "--d": `${0.04 + i * 0.05}s` } as React.CSSProperties}>
                    <span className="relative block aspect-[16/10]">
                      <Image src={sh.img} alt={`${sh.name} 화면`} fill sizes="(min-width: 1024px) 300px, 50vw" className="object-cover object-top" />
                    </span>
                    <span className="block px-4 py-3 text-[14px] font-bold text-[#c9ced6] md:text-[15px]">{sh.name}</span>
                  </li>
                ))}
              </ul>

              {k.plans.length > 0 ? (
                <ul className="mt-4 grid gap-4 md:grid-cols-3" role="list">
                  {k.plans.map((p, i) => (
                    <li key={p.id} className={`mk-in flex flex-col rounded-[24px] p-6 md:p-7 ${i === 1 ? "bg-[#256ef4] text-white" : "border border-white/12 bg-[#121722]"}`} style={{ "--d": `${0.06 + i * 0.06}s` } as React.CSSProperties}>
                      <h3 className="text-[19px] font-[800] tracking-[-0.03em] md:text-[21px]">{p.name}</h3>
                      <p className={`mt-1 break-keep text-[15px] leading-[1.6] ${i === 1 ? "text-white" : "text-[#aab2bf]"}`}>{p.summary}</p>
                      <p className="mt-6 text-[34px] font-[800] leading-none tracking-[-0.05em] md:text-[40px]">{manwon(p.price)}</p>
                      <p className={`mt-2 text-[15px] font-bold ${i === 1 ? "text-white" : "text-[#7aa7ff]"}`}>제작 기간 {p.period ?? `${p.days}일`}</p>
                      <ul className={`mt-6 space-y-2.5 border-t pt-5 ${i === 1 ? "border-white/30" : "border-white/12"}`} role="list">
                        {p.includes.map((t) => (
                          <li key={t} className="flex items-start gap-2 break-keep text-[15px] leading-[1.5]">
                            <Check aria-hidden size={16} strokeWidth={3} className={`mt-0.5 shrink-0 ${i === 1 ? "text-[#ffd84d]" : "text-[#7aa7ff]"}`} />
                            {t}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mk-in mt-4 rounded-[24px] bg-[#256ef4] p-6 md:p-9" style={{ "--d": "0.06s" } as React.CSSProperties}>
                  <p className="text-[34px] font-[800] leading-none tracking-[-0.05em] md:text-[40px]">요구사항 확인 후 견적</p>
                  <p className="mt-4 max-w-[560px] break-keep text-[16px] leading-[1.7] text-white md:text-[17px]">
                    업무마다 화면과 계산 방식이 달라 정해진 패키지가 없습니다. 지금 쓰는 엑셀이나 양식을 보여 주시면 범위와 금액, 일정을 견적서로 드립니다.
                  </p>
                </div>
              )}
              <p className="mt-4 text-[14px] text-[#8a94a6]">금액은 부가세 별도입니다.</p>
            </div>
          </div>

          <div className="mt-16 flex flex-col gap-5 border-t border-white/12 pt-10 md:mt-24 md:flex-row md:items-center md:justify-between">
            <p className="break-keep text-[22px] font-[800] leading-[1.35] tracking-[-0.04em] md:text-[30px]">어떤 것이 맞는지 모르겠다면 한 줄만 남겨 주세요.</p>
            <Link href="/#apply" className="inline-flex min-h-[52px] shrink-0 items-center gap-2 self-start rounded-full bg-white px-6 text-[16px] font-bold text-[#0b0d12] hover:bg-[#dfe9ff]">
              Contact <ArrowUpRight size={18} aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
