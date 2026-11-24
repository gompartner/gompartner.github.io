"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

// 주류 가게 시안 A 와인 보틀샵형(11-22 사례 분석: Vinery처럼 어두운 첫 화면과 와인 이야기, CORKK처럼 원페이지에 리스트와 위치. 보틀샵 손님은 가격대별 추천, 산지, 시음회, 선물 포장을 묻는다. 온라인 판매 없이 매장 안내만, 청소년 판매 금지와 과음 경고 문구). 흰 바탕, 버건디. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/lq/a-*)
const IMG = "/images/drafts/lq";
const C = { ink: "#1a1214", sub: "#6a5f61", line: "#ece4e5", soft: "#f7f3f3", wine: "#7a1f2b" };

const PICKS = [
  ["2만 원대", "데일리", "칠레 카르메네르, 스페인 가르나차"],
  ["3 ~ 5만 원", "식사 자리", "부르고뉴 피노 누아, 리오하 크리안사"],
  ["5 ~ 10만 원", "선물", "바롤로, 나파 카베르네 소비뇽"],
  ["내추럴", "가볍게", "오렌지 와인, 펫낫"],
];

export function LqA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="absolute inset-x-0 z-20 text-white">
        <div className="mx-auto flex h-[78px] max-w-[1320px] items-center justify-between px-5 md:px-10">
          <p className="text-[18px] font-bold tracking-[0.14em]">CAVE 9</p>
          <nav aria-label="주 메뉴" className="hidden gap-10 text-[15px] font-medium text-white/85 lg:flex">
            {["추천", "시음회", "선물", "매장"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-10 items-center border border-white/70 px-5 text-[14px] font-bold">매장 안내</span>
        </div>
      </header>

      <section className="relative flex min-h-[620px] items-end overflow-hidden bg-black text-white md:h-[96svh]">
        <Image src={`${IMG}/a-hero.jpg`} alt="곡선 벽면을 따라 와인병이 가득 진열된 셀러" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/45" aria-hidden />
        <div className="relative mx-auto flex w-full max-w-[1320px] flex-col gap-6 px-5 pb-16 md:flex-row md:items-end md:justify-between md:px-10 md:pb-24">
          <h1 className="text-[38px] font-bold leading-[1.22] tracking-[-0.045em] md:text-[68px]">
            오늘 저녁 메뉴를
            <br />
            말씀해 주세요
          </h1>
          <p className="max-w-[360px] text-white/75">와인 600여 종. 드실 음식과 예산을 들으면 소믈리에가 두세 병으로 좁혀 드립니다.</p>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1320px]">
          <h2 className="text-[32px] font-bold tracking-[-0.04em] md:text-[46px]">가격대별 추천</h2>
          <ul className="mt-12 border-t" style={{ borderColor: C.ink }}>
            {PICKS.map(([p, use, d]) => (
              <li key={p} className="grid gap-1 border-b py-6 md:grid-cols-[0.8fr_0.6fr_2fr_auto] md:items-center md:gap-8" style={{ borderColor: C.line }}>
                <h3 className="text-[23px] font-bold tracking-[-0.03em] tabular-nums">{p}</h3>
                <p className="font-bold" style={{ color: C.wine }}>{use}</p>
                <p style={{ color: C.sub }}>{d}</p>
                <ArrowRight size={20} className="hidden md:block" aria-hidden />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 md:px-10" style={{ background: C.soft }}>
        <div className="mx-auto grid max-w-[1320px] gap-3 py-20 md:grid-cols-2 md:py-28">
          {[
            { f: "a-glass", alt: "어두운 탁자 위 레드 와인 한 잔", t: "토요 시음회", d: "매주 토요일 16:00, 4종 시음, 8명까지" },
            { f: "a-rack", alt: "눕혀 보관 중인 와인병들", t: "선물 포장", d: "1병, 2병 나무 상자, 카드 문구 무료" },
          ].map((x) => (
            <div key={x.t} className="bg-white">
              <div className="relative aspect-[16/9]">
                <Image src={`${IMG}/${x.f}.jpg`} alt={x.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
              </div>
              <div className="p-7 md:p-9">
                <h3 className="text-[24px] font-bold tracking-[-0.03em]">{x.t}</h3>
                <p className="mt-2" style={{ color: C.sub }}>{x.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-6 p-8 text-white md:flex-row md:items-center md:justify-between md:p-12" style={{ background: C.wine }}>
          <div>
            <h2 className="text-[26px] font-bold tracking-[-0.04em] md:text-[34px]">매장</h2>
            <p className="mt-2 text-white/80">매일 12:00 ~ 22:00. 한남동 대사관로 1층, 셀러 온도 14도. 와인은 매장에서만 판매합니다.</p>
          </div>
          <p className="shrink-0 text-[26px] font-bold tabular-nums">02-000-0000</p>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-10" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2">
          <div className="flex flex-col gap-2 md:flex-row md:justify-between">
            <p>CAVE 9 까브나인, 서울특별시 용산구 한남동 일대. 주류소매업 신고번호 000</p>
            <p>02-000-0000</p>
          </div>
          <p>19세 미만 청소년에게는 주류를 판매하지 않습니다. 지나친 음주는 건강을 해칩니다.</p>
        </div>
      </footer>
    </div>
  );
}
