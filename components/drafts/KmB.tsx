"use client";

import Image from "next/image";
import { ArrowRight, Car, Clock } from "lucide-react";

// 한의원 시안 B 증상별 상담형(11-22 사례 분석: 일상의 한의원, 365한의원처럼 증상별 클리닉을 카드로, 교통사고 자동차보험 진료를 따로 크게, 진료시간과 번호를 눈에 띄게). 흰 바탕, 쑥색 포인트. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/km/b-*)
const IMG = "/images/drafts/km";
const C = { ink: "#1a1d18", sub: "#626a5e", line: "#e6eae2", soft: "#f3f6f0", green: "#4e6b3a", greenSoft: "#eaf0e3" };

const SYM = [
  ["허리, 목 통증", "침, 약침, 추나요법"],
  ["소화 불량, 위장", "체질 한약, 뜸"],
  ["불면, 만성 피로", "상담 후 한약 처방"],
  ["다이어트", "체성분 검사 후 한약"],
  ["수험생 집중", "방학 기간 한약"],
  ["산후 조리", "출산 2주 뒤부터"],
];

export function KmB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[70px] max-w-[1200px] items-center justify-between px-5 md:px-8">
          <p className="text-[20px] font-bold tracking-[-0.03em]">
            <span style={{ color: C.green }}>바른숨</span> 한의원
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#41473d" }}>
            {["증상별 진료", "교통사고", "진료시간", "오시는 길"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center rounded-full px-5 text-[15px] font-bold text-white" style={{ background: C.green }}>
            상담 예약
          </span>
        </div>
      </header>

      <section className="px-5 pb-16 pt-10 md:px-8 md:pb-24 md:pt-14">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
          <div>
            <p className="text-[15px] font-bold" style={{ color: C.green }}>평일 밤 8시까지, 토요일 진료</p>
            <h1 className="mt-4 text-[36px] font-bold leading-[1.24] tracking-[-0.045em] md:text-[56px]">
              퇴근길에 들러
              <br />
              침 맞고 가세요
            </h1>
            <p className="mt-5 max-w-[460px] text-[17px] md:text-[18px]" style={{ color: C.sub }}>
              침 치료는 건강보험이 적용됩니다. 한약은 상담 뒤 원하실 때만 처방합니다.
            </p>
            <p className="mt-9 inline-flex items-center gap-1.5 text-[16px] font-bold" style={{ color: C.green }}>
              증상별 진료 보기 <ArrowRight size={17} aria-hidden />
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
            <Image src={`${IMG}/b-hero.jpg`} alt="나무 쟁반 위의 찻잔과 다관" fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">증상별 진료</h2>
          <p className="mt-2" style={{ color: C.sub }}>불편한 곳을 고르시면 진료 순서를 안내합니다.</p>
          <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SYM.map(([t, d]) => (
              <li key={t} className="flex items-center justify-between gap-4 rounded-[20px] bg-white p-6">
                <div>
                  <h3 className="text-[19px] font-bold tracking-[-0.03em]">{t}</h3>
                  <p className="text-[15px]" style={{ color: C.sub }}>{d}</p>
                </div>
                <ArrowRight size={18} className="shrink-0" style={{ color: C.green }} aria-hidden />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 md:grid-cols-[1.1fr_1fr] md:gap-16">
          <div className="grid grid-cols-2 gap-3">
            <div className="relative col-span-2 aspect-[16/9] overflow-hidden rounded-[22px]">
              <Image src={`${IMG}/b-herb.jpg`} alt="작은 접시에 담긴 약재와 차 한 잔" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
            </div>
            <div className="relative aspect-square overflow-hidden rounded-[22px]">
              <Image src={`${IMG}/b-tea.jpg`} alt="흰 다관과 찻잔" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
            <div className="relative aspect-square overflow-hidden rounded-[22px]">
              <Image src={`${IMG}/b-cup.jpg`} alt="약재 사이에 놓인 한방차" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
          </div>
          <div>
            <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[14px] font-bold" style={{ background: C.greenSoft, color: C.green }}>
              <Car size={16} aria-hidden /> 자동차보험 진료
            </span>
            <h2 className="mt-5 text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">교통사고 뒤 통증, 자동차보험으로 진료합니다</h2>
            <p className="mt-4" style={{ color: C.sub }}>
              보험사 접수번호만 알려 주시면 됩니다. 침, 약침, 추나, 한약까지 자동차보험으로 진료합니다.
            </p>
            <ul className="mt-7 grid gap-3">
              {["사고 당일 바로 진료 가능", "양방 병원 치료와 함께 받으실 수 있습니다", "입원이 필요하면 연계 한방병원으로 안내합니다"].map((x) => (
                <li key={x} className="border-b pb-3" style={{ borderColor: C.line }}>{x}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto grid max-w-[1200px] gap-6 rounded-[28px] p-8 text-white md:grid-cols-[1fr_1.2fr] md:p-12" style={{ background: C.green }}>
          <div>
            <p className="flex items-center gap-2 text-[15px] font-bold text-white/80">
              <Clock size={18} aria-hidden /> 진료시간
            </p>
            <p className="mt-3 text-[34px] font-bold tabular-nums tracking-[-0.02em] md:text-[40px]">031-000-0000</p>
            <p className="mt-2 text-white/75">경기도 고양시 일산동구 일대, 상가 3층. 건물 주차 1시간 무료.</p>
          </div>
          <dl className="grid gap-2.5">
            {[
              ["월 ~ 금", "10:00 ~ 20:00"],
              ["토요일", "09:00 ~ 14:00"],
              ["점심시간", "13:00 ~ 14:00"],
              ["휴진", "일요일, 공휴일"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-white/20 pb-2.5">
                <dt className="text-white/75">{k}</dt>
                <dd className="font-bold tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 md:flex-row md:justify-between">
          <p>바른숨 한의원, 경기도 고양시 일산동구 일대</p>
          <p>상담 예약 031-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
