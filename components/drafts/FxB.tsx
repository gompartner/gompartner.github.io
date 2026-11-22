"use client";

import Image from "next/image";
import { Bus } from "lucide-react";

// 꽃박람회 시안 B 개화 현황형(11-22 사례 분석: 지역축제 홈페이지는 방문객에게 필요한 정보를 한눈에. 꽃 축제는 언제 가야 만개인지가 가장 큰 질문이라, 꽃별 개화 상태와 붐비는 시간, 셔틀을 앞에 둔다). 흰 바탕, 빨강과 노랑. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/fx/b-*)
const IMG = "/images/drafts/fx";
const C = { ink: "#1e1a18", sub: "#6a6460", line: "#ede8e4", soft: "#fbf7f3", red: "#d9412f", yellow: "#f2b51b" };

const BLOOM: [string, number, string][] = [
  ["튤립", 90, "만개, 이번 주말까지 절정"],
  ["수선화", 60, "피는 중, 다음 주 만개 예상"],
  ["유채", 40, "피기 시작"],
  ["작약", 10, "꽃봉오리, 5월 초 예상"],
];

const HOURS = [
  ["09:00 ~ 11:00", "한적", 30],
  ["11:00 ~ 14:00", "붐빔", 95],
  ["14:00 ~ 16:00", "보통", 65],
  ["16:00 ~ 18:00", "한적", 35],
] as const;

export function FxB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[70px] max-w-[1200px] items-center justify-between px-5 md:px-8">
          <p className="text-[19px] font-bold tracking-[-0.03em]">
            <span style={{ color: C.red }}>태안</span> 꽃축제
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#4c4642" }}>
            {["개화 현황", "관람 시간", "셔틀", "입장료"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center rounded-full px-5 text-[15px] font-bold text-white" style={{ background: C.red }}>
            오시는 길
          </span>
        </div>
      </header>

      <section className="px-5 pb-16 pt-10 md:px-8 md:pb-24 md:pt-14">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
          <div>
            <p className="inline-flex rounded-full px-3 py-1 text-[14px] font-bold" style={{ background: "#fdf0cc" }}>4. 10 ~ 5. 10, 매일 09:00 ~ 18:00</p>
            <h1 className="mt-5 text-[36px] font-bold leading-[1.24] tracking-[-0.045em] md:text-[56px]">
              지금 튤립이
              <br />
              가장 붉습니다
            </h1>
            <p className="mt-5 max-w-[460px] text-[17px] md:text-[18px]" style={{ color: C.sub }}>
              정원 관리팀이 매일 아침 8시에 꽃밭을 돌아보고 개화 상태를 올립니다. 오시기 전에 확인해 주세요.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
            <Image src={`${IMG}/b-hero.jpg`} alt="분홍 튤립이 줄지어 핀 넓은 밭" fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1200px]">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">개화 현황</h2>
            <p className="text-[15px]" style={{ color: C.sub }}>4월 22일 08:00 기준</p>
          </div>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {BLOOM.map(([t, p, d]) => (
              <li key={t} className="rounded-[22px] bg-white p-6 md:p-7">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-[22px] font-bold tracking-[-0.03em]">{t}</h3>
                  <span className="text-[20px] font-bold tabular-nums" style={{ color: C.red }}>{p}%</span>
                </div>
                <div className="mt-3 h-2.5 overflow-hidden rounded-full" style={{ background: C.line }} aria-hidden>
                  <div className="h-full rounded-full" style={{ width: `${p}%`, background: p >= 80 ? C.red : C.yellow }} />
                </div>
                <p className="mt-3 text-[15px]" style={{ color: C.sub }}>{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 md:grid-cols-[1fr_1.1fr] md:gap-16">
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">관람하기 좋은 시간</h2>
            <ul className="mt-7 grid gap-4">
              {HOURS.map(([t, s, v]) => (
                <li key={t}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold tabular-nums">{t}</span>
                    <span className="text-[15px] font-bold" style={{ color: v > 80 ? C.red : C.sub }}>{s}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full" style={{ background: C.line }} aria-hidden>
                    <div className="h-full rounded-full" style={{ width: `${v}%`, background: v > 80 ? C.red : "#c9bfb6" }} />
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[15px]" style={{ color: C.sub }}>지난 주말 입장 기록 기준입니다. 평일 오전이 가장 한적합니다.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[22px]">
              <Image src={`${IMG}/b-red.jpg`} alt="파란 하늘 아래 빨간 튤립" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
            <div className="relative aspect-[3/4] overflow-hidden rounded-[22px]">
              <Image src={`${IMG}/b-yellow.jpg`} alt="노란 꽃밭 앞 자주색 달리아" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto grid max-w-[1200px] gap-4 md:grid-cols-2">
          <div className="rounded-[28px] p-8 md:p-10" style={{ background: "#fdf0cc" }}>
            <p className="flex items-center gap-2 text-[15px] font-bold" style={{ color: "#8a6400" }}>
              <Bus size={18} aria-hidden /> 무료 셔틀
            </p>
            <h2 className="mt-3 text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">터미널에서 20분 간격</h2>
            <ul className="mt-5 grid gap-2.5" style={{ color: C.sub }}>
              <li>태안 공용버스터미널, 09:00 ~ 17:00</li>
              <li>주말에는 제2 주차장에서도 운행</li>
              <li>주차 1,500대, 주말 오전 11시 전 만차</li>
            </ul>
          </div>
          <div className="flex flex-col justify-between rounded-[28px] p-8 text-white md:p-10" style={{ background: C.red }}>
            <div>
              <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">입장료</h2>
              <p className="mt-3 text-white/85">어른 10,000원, 어린이 6,000원, 입장권 절반은 지역 상품권으로 돌려드립니다.</p>
            </div>
            <p className="mt-8 text-[30px] font-bold tabular-nums tracking-[-0.02em]">041-000-0000</p>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 md:flex-row md:justify-between">
          <p>주최 태안군, 주관 태안꽃축제추진위원회. 충청남도 태안군 일대</p>
          <p>안내 041-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
