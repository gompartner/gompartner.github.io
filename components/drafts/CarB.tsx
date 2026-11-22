"use client";

import Image from "next/image";
import { Clock } from "lucide-react";

// 자동차 디테일링 시안 B 동네 세차 광택형(11-22 사례 분석: 오늘의카 업체 페이지처럼 가격을 항목별로 공개. 동네 손님은 차급별 가격, 걸리는 시간, 기다릴 곳을 묻는다). 흰 바탕, 파랑. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/car/b-*)
const IMG = "/images/drafts/car";
const C = { ink: "#101820", sub: "#5c6670", line: "#e2e8ee", soft: "#f2f6f9", blue: "#0f6fd6", blueSoft: "#e6f1fc" };

const PRICE: [string, string, string, string, string][] = [
  ["외부 손세차", "40분", "3.0만", "3.5만", "4.0만"],
  ["실내외 세차", "1시간 30분", "6.0만", "7.0만", "8.0만"],
  ["실내 크리닝", "4시간", "15만", "18만", "22만"],
  ["광택, 유리막", "1 ~ 2일", "45만", "55만", "65만"],
];

export function CarB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[70px] max-w-[1200px] items-center justify-between px-5 md:px-8">
          <p className="text-[20px] font-bold tracking-[-0.03em]">
            <span style={{ color: C.blue }}>맑음</span> 손세차 광택
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#3d4752" }}>
            {["가격표", "작업 순서", "대기 공간", "오시는 길"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center rounded-full px-5 text-[15px] font-bold text-white" style={{ background: C.blue }}>
            전화 예약
          </span>
        </div>
      </header>

      <section className="px-5 pb-16 pt-10 md:px-8 md:pb-24 md:pt-14">
        <div className="mx-auto max-w-[1200px]">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] md:aspect-[21/9]">
            <Image src={`${IMG}/b-hero.jpg`} alt="거품 물줄기를 맞고 있는 세차장 안 자동차" fill priority sizes="100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" aria-hidden />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-12">
              <p className="text-[15px] font-bold text-white/80">손세차, 실내 크리닝, 광택</p>
              <h1 className="mt-3 text-[32px] font-bold leading-[1.25] tracking-[-0.045em] md:text-[56px]">
                기다리는 동안
                <br />
                손으로 닦아 드립니다
              </h1>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              ["영업", "매일 08:00 ~ 20:00"],
              ["대기", "커피와 와이파이가 있는 라운지"],
              ["전화", "02-000-0000"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-[20px] p-5 md:p-6" style={{ background: C.blueSoft }}>
                <p className="text-[14px] font-bold" style={{ color: C.blue }}>{k}</p>
                <p className="font-bold tabular-nums">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">가격표</h2>
          <p className="mt-3" style={{ color: C.sub }}>부가세 포함, 오염이 심하면 상담 후 추가될 수 있습니다.</p>
          <div className="mt-10 overflow-hidden rounded-[22px] bg-white">
            <div className="hidden grid-cols-[1.4fr_1fr_1fr_1fr_1fr] gap-4 border-b px-7 py-4 text-[14px] font-bold md:grid" style={{ borderColor: C.line, color: C.sub }}>
              <span>항목</span>
              <span>소요 시간</span>
              <span className="text-right">경차, 소형</span>
              <span className="text-right">중형</span>
              <span className="text-right">대형, SUV</span>
            </div>
            <ul>
              {PRICE.map(([t, time, s, m, l]) => (
                <li key={t} className="grid grid-cols-3 gap-x-4 gap-y-1 border-b px-6 py-5 last:border-b-0 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr] md:items-center md:px-7" style={{ borderColor: C.line }}>
                  <span className="col-span-2 text-[19px] font-bold md:col-span-1">{t}</span>
                  <span className="flex items-center justify-end gap-1.5 text-[14px] md:justify-start md:text-[15px]" style={{ color: C.sub }}>
                    <Clock size={14} aria-hidden /> {time}
                  </span>
                  {[
                    ["소형", s],
                    ["중형", m],
                    ["대형", l],
                  ].map(([k, v]) => (
                    <span key={k} className="flex flex-col text-[16px] font-bold tabular-nums md:block md:text-right">
                      <span className="text-[13px] font-semibold md:hidden" style={{ color: C.sub }}>{k}</span>
                      {v}원
                    </span>
                  ))}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 md:grid-cols-[1fr_1.1fr] md:gap-16">
          <div className="grid grid-cols-2 gap-3">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[22px]">
              <Image src={`${IMG}/b-foam.jpg`} alt="하얀 거품으로 덮인 검은 차" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
            <div className="relative aspect-[3/4] overflow-hidden rounded-[22px]">
              <Image src={`${IMG}/b-wheel.jpg`} alt="크롬 휠캡에 비친 주변 풍경" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
          </div>
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">외부 손세차 순서</h2>
            <ol className="mt-8 grid gap-5">
              {[
                ["프리워시", "고압수로 모래와 먼지를 먼저 씻어 냅니다"],
                ["폼 세차", "중성 거품을 올려 오염을 불립니다"],
                ["투 버킷 손세차", "미트를 헹궈 가며 흠집 없이 닦습니다"],
                ["건조, 마무리", "극세사 타월, 타이어와 유리까지"],
              ].map(([k, v], i) => (
                <li key={k} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[15px] font-bold text-white" style={{ background: C.blue }}>{i + 1}</span>
                  <div>
                    <p className="text-[18px] font-bold">{k}</p>
                    <p className="text-[15px]" style={{ color: C.sub }}>{v}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 md:flex-row md:justify-between">
          <p>맑음 손세차 광택, 서울특별시 송파구 일대. 사업자등록번호 000-00-00000, 차량 6대 동시 작업</p>
          <p>02-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
