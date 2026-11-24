"use client";

import Image from "next/image";
import { Calendar } from "lucide-react";

// 꽃박람회 시안 A 축제 안내형(11-22 사례 분석: 스윙앤소울 페스티벌처럼 대회 개요(일정, 장소, 참가 방법)를 한눈에, TEC FAIR처럼 프로그램 일정과 공지. 나들이 가족은 기간, 입장료, 날짜별 프로그램, 어떤 길로 돌면 좋은지를 묻는다). 흰 바탕, 분홍과 초록. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/fx/a-*)
const IMG = "/images/drafts/fx";
const C = { ink: "#1b1a1d", sub: "#666369", line: "#ece8ee", soft: "#f8f5f8", pink: "#d6336c", green: "#2f8f4e" };

const FEES = [
  ["어른", "12,000원"],
  ["청소년과 군인", "9,000원"],
  ["어린이(4 ~ 12세)", "6,000원"],
  ["65세 이상, 장애인", "6,000원"],
  ["3세 이하", "무료"],
];

const PROGRAM = [
  ["매일", "11:00, 15:00", "꽃 정원 해설 투어(40분)"],
  ["주말", "13:00", "잔디 광장 실내악 공연"],
  ["4. 25(토)", "19:00", "튤립 정원 야간 개장, 조명 쇼"],
  ["5. 3(일)", "10:00 ~ 16:00", "꽃모종 나눔(선착순 500명)"],
];

export function FxA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="absolute inset-x-0 z-20 text-white">
        <div className="mx-auto flex h-[78px] max-w-[1320px] items-center justify-between px-5 md:px-10">
          <p className="text-[18px] font-bold tracking-[-0.02em]">2027 고양 봄꽃 박람회</p>
          <nav aria-label="주 메뉴" className="hidden gap-10 text-[15px] font-medium text-white/85 lg:flex">
            {["행사 개요", "입장료", "프로그램", "추천 코스"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="hidden h-10 items-center px-5 text-[14px] font-bold text-white sm:inline-flex" style={{ background: C.pink }}>
            오시는 길
          </span>
        </div>
      </header>

      <section className="relative flex min-h-[620px] items-end overflow-hidden bg-black text-white md:h-[96svh]">
        <Image src={`${IMG}/a-hero.jpg`} alt="색색의 튤립이 줄지어 핀 꽃밭" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" aria-hidden />
        <div className="relative mx-auto w-full max-w-[1320px] px-5 pb-16 md:px-10 md:pb-24">
          <p className="inline-flex items-center gap-2 text-[15px] font-bold text-white/90">
            <Calendar size={18} aria-hidden /> 2027. 4. 17(토) ~ 5. 9(일), 일산호수공원
          </p>
          <h1 className="mt-4 text-[40px] font-bold leading-[1.2] tracking-[-0.045em] md:text-[76px]">
            튤립 120만 송이,
            <br />
            호숫가를 따라
          </h1>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1320px] gap-10 md:grid-cols-2 md:gap-16">
          <div>
            <h2 className="text-[32px] font-bold tracking-[-0.04em] md:text-[46px]">입장료</h2>
            <dl className="mt-8 border-t" style={{ borderColor: C.ink }}>
              {FEES.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[1fr_auto] gap-3 border-b py-4" style={{ borderColor: C.line }}>
                  <dt className="font-semibold">{k}</dt>
                  <dd className="font-bold tabular-nums" style={{ color: C.pink }}>{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[15px]" style={{ color: C.sub }}>고양시민 30% 할인, 20명 이상 단체 20% 할인. 운영 09:00 ~ 18:00, 입장 마감 17:00.</p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden self-center">
            <Image src={`${IMG}/a-field.jpg`} alt="분홍 튤립이 끝없이 이어진 밭" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 md:px-10" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1320px] py-20 md:py-28">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">날짜별 프로그램</h2>
          <ul className="mt-10 bg-white">
            {PROGRAM.map(([d, t, p]) => (
              <li key={p} className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 border-b px-6 py-5 last:border-b-0 md:grid-cols-[0.6fr_0.8fr_2fr] md:items-center md:px-8" style={{ borderColor: C.line }}>
                <span className="text-[18px] font-bold tabular-nums">{d}</span>
                <span className="text-right font-semibold tabular-nums md:text-left" style={{ color: C.green }}>{t}</span>
                <span className="col-span-2 md:col-span-1" style={{ color: C.sub }}>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1320px] gap-4 md:grid-cols-3">
          {[
            ["1시간 코스", "정문, 튤립 정원, 호수 데크, 정문", "유모차, 휠체어 가능"],
            ["2시간 코스", "정문, 튤립 정원, 장미 터널, 수변 꽃길, 전망대", "가장 많이 걷는 길"],
            ["사진 코스", "꽃 시계, 하트 아치, 튤립 언덕", "오전 10시 전이 한적합니다"],
          ].map(([t, r, n], i) => (
            <div key={t} className="flex flex-col border p-7" style={{ borderColor: C.line }}>
              <p className="text-[14px] font-bold" style={{ color: C.pink }}>COURSE {i + 1}</p>
              <h3 className="mt-2 text-[22px] font-bold tracking-[-0.03em]">{t}</h3>
              <p className="mt-2" style={{ color: C.sub }}>{r}</p>
              <p className="mt-auto pt-5 text-[15px] font-semibold" style={{ color: C.green }}>{n}</p>
            </div>
          ))}
        </div>
        <div className="relative mx-auto mt-4 aspect-[16/9] max-w-[1320px] overflow-hidden md:aspect-[21/9]">
          <Image src={`${IMG}/a-path.jpg`} alt="잔디 사이로 이어진 디딤돌 정원 길" fill sizes="100vw" className="object-cover" />
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-10" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2 md:flex-row md:justify-between">
          <p>주최 고양시, 주관 고양꽃박람회재단. 경기도 고양시 일산동구 일대</p>
          <p>안내 031-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
