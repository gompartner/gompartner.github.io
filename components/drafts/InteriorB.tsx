"use client";

import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";

// 인테리어 시안 B 비용 안심형(11-21 사례 분석: "부담스러운 비용이 고민이신가요?"처럼 비용 걱정을 먼저 꺼내 상담으로 잇는다). 평형별 예산, 공정 기간, 전후 비교. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/int/b-*)
const IMG = "/images/drafts/int";
const C = { ink: "#1b1a18", sub: "#66625c", line: "#e7e4df", soft: "#f5f4f2", wood: "#a5743f", woodSoft: "#f3ebe2" };

const BUDGET = [
  { p: "20평대", c: "3,500만 ~ 5,000만 원", w: "5 ~ 6주", d: ["도배, 바닥, 조명", "주방, 욕실 1곳", "샷시 제외"] },
  { p: "30평대", c: "5,000만 ~ 7,500만 원", w: "6 ~ 7주", d: ["전체 철거, 확장", "주방, 욕실 2곳", "붙박이장과 중문"] },
  { p: "40평대 이상", c: "7,500만 원부터", w: "8주 이상", d: ["구조 변경 설계", "시스템 에어컨", "맞춤 가구"] },
];

export function InteriorB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[70px] max-w-[1200px] items-center justify-between px-5 md:px-8">
          <p className="text-[20px] font-bold tracking-[-0.03em]">리모델링 인테리어</p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#45413c" }}>
            {["평형별 비용", "시공 사례", "공정 기간", "A/S 안내"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center rounded-[10px] px-5 text-[15px] font-bold text-white" style={{ background: C.ink }}>
            견적 받기
          </span>
        </div>
      </header>

      <section className="px-5 pb-16 pt-12 md:px-8 md:pb-24 md:pt-16">
        <div className="mx-auto max-w-[1200px]">
          <p className="text-[15px] font-bold" style={{ color: C.wood }}>아파트 리모델링 전문</p>
          <h1 className="mt-4 text-[38px] font-bold leading-[1.22] tracking-[-0.045em] md:text-[64px]">
            견적서 금액이
            <br />
            공사 끝까지 그대로입니다
          </h1>
          <p className="mt-6 max-w-[560px] text-[17px] md:text-[19px]" style={{ color: C.sub }}>
            공정별로 나눈 견적서를 드리고, 계약 뒤 추가 비용은 고객이 요청한 변경만 받습니다.
          </p>
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {[
              ["b-before", "철거 중인 아파트 내부", "시공 전"],
              ["b-after", "흰 벽과 원목 바닥으로 마감한 거실", "시공 후"],
            ].map(([img, alt, t]) => (
              <figure key={t} className="relative aspect-[4/3] overflow-hidden rounded-[20px]">
                <Image src={`${IMG}/${img}.jpg`} alt={alt} fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
                <figcaption className="absolute left-4 top-4 rounded-full px-3.5 py-1 text-[13px] font-bold tracking-[0.14em] text-white" style={{ background: t === "시공 후" ? C.wood : "rgba(0,0,0,0.6)" }}>{t}</figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-4 text-[15px]" style={{ color: C.sub }}>목동 아파트 32평, 전체 리모델링 6주</p>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">평형별 예상 비용</h2>
          <p className="mt-3" style={{ color: C.sub }}>최근 1년 시공 평균입니다. 자재 등급과 확장 여부에 따라 달라지며, 실측 뒤 확정합니다.</p>
          <ul className="mt-12 grid gap-4 md:grid-cols-3">
            {BUDGET.map((b, i) => (
              <li key={b.p} className="rounded-[22px] bg-white p-8" style={i === 1 ? { outline: `2px solid ${C.wood}` } : undefined}>
                <p className="text-[18px] font-bold">{b.p}</p>
                <p className="mt-2 text-[26px] font-bold tracking-[-0.03em] md:text-[28px]">{b.c}</p>
                <p className="mt-1 text-[15px] font-bold" style={{ color: C.wood }}>공사 기간 {b.w}</p>
                <ul className="mt-6 grid gap-2.5 border-t pt-6 text-[15px]" style={{ borderColor: C.line }}>
                  {b.d.map((x) => (
                    <li key={x} className="flex items-center gap-2">
                      <Check size={17} style={{ color: C.wood }} aria-hidden />
                      {x}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 md:grid-cols-[1fr_1.1fr] md:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[24px]">
            <Image src={`${IMG}/b-work.jpg`} alt="보양재를 덮고 시공 중인 주방" fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
          </div>
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[40px]">공사 중에도 매일 현장을 보여 드립니다</h2>
            <ul className="mt-8 grid gap-4">
              {[
                ["공정표 공유", "철거부터 입주 청소까지 날짜별 공정표를 계약 때 드립니다."],
                ["현장 사진 보고", "작업이 끝나는 날마다 사진과 진행률을 문자로 보냅니다."],
                ["이웃 동의, 승강기 보양", "관리사무소 신고와 소음 안내문은 저희가 처리합니다."],
              ].map(([t, d]) => (
                <li key={t} className="rounded-[16px] px-6 py-5" style={{ background: C.woodSoft }}>
                  <p className="text-[18px] font-bold">{t}</p>
                  <p className="mt-1 text-[15px]" style={{ color: C.sub }}>{d}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-[28px] px-7 py-14 text-white md:px-16 md:py-20" style={{ background: C.ink }}>
          <Image src={`${IMG}/b-kitchen.jpg`} alt="" fill sizes="100vw" className="object-cover opacity-30" />
          <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[40px]">부담스러운 비용이 고민이신가요?</h2>
              <p className="mt-3 text-white/75">평형과 원하는 공사 범위만 알려 주시면 예산에 맞춘 견적안을 두 가지로 드립니다.</p>
            </div>
            <span className="inline-flex h-[58px] shrink-0 items-center gap-2 self-start rounded-[12px] px-8 text-[17px] font-bold md:self-auto" style={{ background: C.wood }}>
              무료 견적 받기
              <ArrowRight size={18} aria-hidden />
            </span>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 md:flex-row md:justify-between">
          <p>리모델링 인테리어, 서울특별시 양천구 목동 일대, 실내건축공사업 등록</p>
          <p>견적 문의 02-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
