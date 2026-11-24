"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

// 소아청소년과 시안 B 검진, 접종 중심형(11-22 사례 분석: 둘째 방문 이유는 영유아 검진과 예방접종. 월령별 검진 표와 접종 일정을 한 화면에). 흰 바탕, 초록 포인트, 둥근 카드. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/ped/b-*)
const IMG = "/images/drafts/ped";
const C = { ink: "#17211c", sub: "#5c6a62", line: "#e3ece6", soft: "#f2f8f4", green: "#1f9d62", greenSoft: "#e2f5eb", orange: "#f08a3c" };

const CHECK = [
  ["1차", "생후 14 ~ 35일"],
  ["2차", "4 ~ 6개월"],
  ["3차", "9 ~ 12개월"],
  ["4차", "18 ~ 24개월"],
  ["5차", "30 ~ 36개월"],
  ["6차", "42 ~ 48개월"],
  ["7차", "54 ~ 60개월"],
  ["8차", "66 ~ 71개월"],
];

export function PedB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[70px] max-w-[1200px] items-center justify-between px-5 md:px-8">
          <p className="text-[20px] font-bold tracking-[-0.03em]">
            튼튼 <span style={{ color: C.green }}>소아청소년과</span>
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#3f4a44" }}>
            {["영유아 검진", "예방접종", "진료시간", "오시는 길"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center rounded-full px-5 text-[15px] font-bold text-white" style={{ background: C.green }}>
            검진 예약
          </span>
        </div>
      </header>

      <section className="px-5 pb-16 pt-10 md:px-8 md:pb-24 md:pt-14">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
          <div>
            <p className="text-[15px] font-bold" style={{ color: C.green }}>영유아 건강검진 지정 의료기관</p>
            <h1 className="mt-4 text-[36px] font-bold leading-[1.24] tracking-[-0.045em] md:text-[56px]">
              자라는 속도에 맞춰
              <br />
              검진과 접종을 챙깁니다
            </h1>
            <p className="mt-5 max-w-[460px] text-[17px] md:text-[18px]" style={{ color: C.sub }}>
              검진 날 같이 맞을 수 있는 접종을 미리 알려 드립니다. 한 번 오실 때 한꺼번에 끝냅니다.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <span className="inline-flex h-[54px] items-center gap-2 rounded-full px-7 text-[16px] font-bold text-white" style={{ background: C.green }}>
                검진 예약 <ArrowRight size={18} aria-hidden />
              </span>
              <span className="inline-flex h-[54px] items-center rounded-full border px-7 text-[16px] font-bold" style={{ borderColor: C.line }}>
                02-000-0000
              </span>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[32px]">
            <Image src={`${IMG}/b-hero.jpg`} alt="알파벳과 숫자가 새겨진 원목 블록 더미" fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1200px]">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">영유아 건강검진 시기</h2>
            <p className="text-[15px]" style={{ color: C.sub }}>건강보험 가입자 무료. 구강검진은 1세 6개월부터 3회.</p>
          </div>
          <ol className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
            {CHECK.map(([n, t]) => (
              <li key={n} className="rounded-[22px] bg-white p-5 md:p-6">
                <p className="text-[14px] font-bold" style={{ color: C.green }}>{n} 검진</p>
                <p className="mt-1 text-[18px] font-bold tracking-[-0.02em] md:text-[20px]">{t}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 md:grid-cols-[1fr_1.1fr] md:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
            <Image src={`${IMG}/b-steth.jpg`} alt="하늘색 바탕 위의 청진기" fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
          </div>
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">예방접종</h2>
            <dl className="mt-7 border-t" style={{ borderColor: C.ink }}>
              {[
                ["국가 필수접종", "BCG, B형간염, DTaP, 폴리오 등", "무료"],
                ["인플루엔자", "생후 6개월 ~ 13세", "무료"],
                ["로타바이러스", "생후 2, 4, 6개월", "무료"],
                ["수막구균", "만 2개월부터, 상담 후", "유료"],
              ].map(([k, d, p]) => (
                <div key={k} className="flex items-start justify-between gap-4 border-b py-4" style={{ borderColor: C.line }}>
                  <div>
                    <dt className="font-bold">{k}</dt>
                    <dd className="text-[15px]" style={{ color: C.sub }}>{d}</dd>
                  </div>
                  <span
                    className="shrink-0 rounded-full px-3 py-0.5 text-[14px] font-bold"
                    style={p === "무료" ? { background: C.greenSoft, color: C.green } : { background: "#fdeee2", color: C.orange }}
                  >
                    {p}
                  </span>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[15px]" style={{ color: C.sub }}>열이 38도 넘는 날은 접종을 미룹니다. 접종 수첩을 가져와 주세요.</p>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto grid max-w-[1200px] gap-6 rounded-[32px] p-8 text-white md:grid-cols-[1fr_1.2fr] md:p-12" style={{ background: C.green }}>
          <div>
            <h2 className="text-[28px] font-bold tracking-[-0.04em] md:text-[38px]">진료시간</h2>
            <p className="mt-2 text-white/80">검진은 예약제, 일반 진료는 오신 순서대로 봅니다.</p>
          </div>
          <dl className="grid gap-2.5">
            {[
              ["평일", "09:00 ~ 19:00"],
              ["토요일", "09:00 ~ 14:00"],
              ["점심시간", "13:00 ~ 14:00"],
              ["휴진", "일요일과 공휴일"],
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
          <p>튼튼 소아청소년과의원, 경기도 화성시 동탄 일대, 상가 4층 (수유실 있음)</p>
          <p>예약 문의 031-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
