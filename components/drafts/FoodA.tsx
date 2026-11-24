"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

// 한식당 시안 A 노포 브랜드형(11-21 사례 분석: 오래된 식당은 업력 한 줄, 큰 음식 사진, 대표 메뉴 서너 개, 매장 사진, 대표 번호를 크게 둔다). 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/food/a-*)
const IMG = "/images/drafts/food";
const C = { ink: "#171513", sub: "#6b655e", line: "#e7e3de", soft: "#f4f2ef", red: "#a4271c" };

const MENU = [
  { img: "a-hero", alt: "돌솥비빔밥과 반찬이 차려진 나무 식탁", t: "돌솥비빔밥", d: "제철 나물 일곱 가지와 직접 담근 고추장", p: "11,000" },
  { img: "a-bulgogi", alt: "뚝배기에 담긴 불고기와 반찬", t: "뚝배기 불고기", d: "간장 양념에 하루 재운 앞다리살", p: "13,000" },
  { img: "a-pot", alt: "두부와 채소를 올린 전골 냄비", t: "버섯 두부 전골", d: "사골 육수에 끓이는 2인 이상 전골", p: "32,000" },
];

export function FoodA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="absolute inset-x-0 z-20 text-white">
        <div className="mx-auto flex h-[78px] max-w-[1280px] items-center justify-between px-5 md:px-10">
          <p className="flex items-baseline gap-2">
            <span className="text-[21px] font-bold tracking-[-0.03em]">석교옥</span>
            <span className="text-[12px] font-bold tracking-[0.2em] text-white/70">SINCE 1998</span>
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-10 text-[15px] font-medium text-white/90 lg:flex">
            {["이야기", "메뉴", "매장", "오시는 길"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="text-[15px] font-bold tabular-nums">02-000-0000</span>
        </div>
      </header>

      <section className="relative flex min-h-[620px] items-end overflow-hidden text-white md:h-[92svh]">
        <Image src={`${IMG}/a-main.jpg`} alt="찌개와 만두, 국수가 차려진 상" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.1) 35%, rgba(0,0,0,0.7) 100%)" }} aria-hidden />
        <div className="relative mx-auto w-full max-w-[1280px] px-5 pb-16 md:px-10 md:pb-24">
          <p className="text-[15px] font-bold text-white/80">한자리에서 27년</p>
          <h1 className="mt-4 text-[40px] font-bold leading-[1.2] tracking-[-0.045em] md:text-[76px]">
            매일 아침
            <br />
            나물을 무칩니다
          </h1>
          <p className="mt-5 max-w-[460px] text-[16px] text-white/85 md:text-[18px]">반찬은 그날 만든 것만 냅니다. 장은 직접 담그고, 밥은 주문을 받고 짓습니다.</p>
        </div>
      </section>

      <section className="px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1280px]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2 className="text-[32px] font-bold tracking-[-0.04em] md:text-[50px]">대표 메뉴</h2>
            <p className="inline-flex items-center gap-1.5 text-[15px] font-bold">
              전체 메뉴 보기 <ArrowRight size={16} aria-hidden />
            </p>
          </div>
          <ul className="mt-12 grid gap-8 md:grid-cols-3 md:gap-6">
            {MENU.map((m) => (
              <li key={m.t}>
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image src={`${IMG}/${m.img}.jpg`} alt={m.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
                </div>
                <div className="mt-5 flex items-baseline justify-between gap-4 border-b pb-5" style={{ borderColor: C.line }}>
                  <h3 className="text-[22px] font-bold tracking-[-0.03em]">{m.t}</h3>
                  <p className="text-[19px] font-bold tabular-nums">{m.p}원</p>
                </div>
                <p className="mt-3 text-[15px]" style={{ color: C.sub }}>{m.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 md:px-10" style={{ background: C.ink }}>
        <div className="mx-auto grid max-w-[1280px] items-center gap-10 py-20 text-white md:grid-cols-[1fr_1.2fr] md:gap-16 md:py-28">
          <div>
            <p className="text-[14px] font-bold tracking-[0.2em] text-white/60">OUR STORY</p>
            <h2 className="mt-4 text-[30px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[44px]">
              처음 문을 연 날과
              <br />
              같은 상을 냅니다
            </h2>
            <p className="mt-6 text-white/75">메뉴를 늘리지 않았습니다. 대신 나물은 계절마다 바꾸고, 된장은 3년 묵힌 것만 씁니다. 점심이면 근처 직장인이, 주말이면 가족 손님이 같은 자리를 찾습니다.</p>
            <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-white/15 pt-8">
              {[
                ["27년", "같은 자리"],
                ["3년", "묵힌 된장"],
                ["7가지", "제철 나물"],
              ].map(([v, k]) => (
                <div key={k}>
                  <dt className="text-[28px] font-bold tracking-[-0.03em] md:text-[34px]">{v}</dt>
                  <dd className="text-[14px] text-white/60">{k}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative aspect-[4/3]">
            <Image src={`${IMG}/a-room.jpg`} alt="나무 식탁과 의자가 놓인 식당 내부" fill sizes="(min-width: 768px) 55vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto grid max-w-[1280px] gap-12 md:grid-cols-2 md:gap-16">
          <div>
            <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[42px]">영업 안내</h2>
            <dl className="mt-8 border-t" style={{ borderColor: C.ink }}>
              {[
                ["점심", "11:00 ~ 15:00"],
                ["브레이크 타임", "15:00 ~ 17:00"],
                ["저녁", "17:00 ~ 21:00 (주문 마감 20:20)"],
                ["정기 휴무", "매주 월요일"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b py-4" style={{ borderColor: C.line }}>
                  <dt style={{ color: C.sub }}>{k}</dt>
                  <dd className="text-right font-bold tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[42px]">오시는 길</h2>
            <ul className="mt-8 grid gap-3">
              {[
                ["주소", "서울특별시 종로구 일대, 지하철역 2번 출구 3분"],
                ["주차", "건물 뒤 전용 주차장 8대, 2시간 무료"],
                ["단체석", "방 2개, 최대 30명까지 예약 받습니다"],
              ].map(([k, v]) => (
                <li key={k} className="flex gap-5 px-6 py-5" style={{ background: C.soft }}>
                  <span className="w-14 shrink-0 font-bold" style={{ color: C.red }}>{k}</span>
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-10" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1280px] flex-col gap-2 md:flex-row md:justify-between">
          <p>석교옥, 서울특별시 종로구 일대, 원산지 표시는 매장 메뉴판에 있습니다</p>
          <p>예약 문의 02-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
