"use client";

import Image from "next/image";
import { Moon, Sun, Syringe, Baby } from "lucide-react";

// 소아청소년과 시안 A 진료시간 안내형(11-22 사례 분석: 부모는 "오늘 문 여는지"를 먼저 본다. 야간, 토요일, 일요일 진료를 첫 화면 카드로, 예방접종과 영유아 검진을 그 아래). 흰 바탕, 하늘색. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/ped/a-*)
const IMG = "/images/drafts/ped";
const C = { ink: "#14202b", sub: "#5c6975", line: "#e2ebf2", soft: "#f1f7fb", sky: "#1b8fd6", skySoft: "#e4f3fc", yellow: "#ffc93c" };

const DAYS: [string, string, boolean][] = [
  ["월", "09:00 ~ 21:00", true],
  ["화", "09:00 ~ 19:00", false],
  ["수", "09:00 ~ 21:00", true],
  ["목", "09:00 ~ 19:00", false],
  ["금", "09:00 ~ 21:00", true],
  ["토", "09:00 ~ 15:00", false],
  ["일, 공휴일", "10:00 ~ 14:00", false],
];

export function PedA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[70px] max-w-[1200px] items-center justify-between px-5 md:px-8">
          <p className="text-[20px] font-bold tracking-[-0.03em]">
            <span style={{ color: C.sky }}>새싹</span> 소아청소년과
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#3f4b56" }}>
            {["진료시간", "예방접종", "영유아 검진", "오시는 길"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center rounded-full px-5 text-[15px] font-bold text-white" style={{ background: C.sky }}>
            진료 접수
          </span>
        </div>
      </header>

      <section className="px-5 pb-14 pt-10 md:px-8 md:pb-20 md:pt-14">
        <div className="mx-auto grid max-w-[1200px] items-center gap-8 overflow-hidden rounded-[32px] lg:grid-cols-2" style={{ background: C.skySoft }}>
          <div className="px-7 pt-10 md:px-14 lg:py-16">
            <p className="inline-flex rounded-full bg-white px-3 py-1 text-[14px] font-bold" style={{ color: C.sky }}>일요일, 공휴일 진료</p>
            <h1 className="mt-5 text-[34px] font-bold leading-[1.25] tracking-[-0.045em] md:text-[52px]">
              아이가 아픈 날,
              <br />
              문 열려 있습니다
            </h1>
            <p className="mt-4 max-w-[430px] text-[16px] md:text-[18px]" style={{ color: C.sub }}>
              월, 수, 금은 밤 9시까지, 일요일과 공휴일에도 오전 진료를 합니다.
            </p>
          </div>
          <div className="relative min-h-[280px] self-stretch md:min-h-[440px]">
            <Image src={`${IMG}/a-hero.jpg`} alt="흰 선반에 정리된 원목 장난감" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto grid max-w-[1200px] gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="rounded-[28px] border p-7 md:p-10" style={{ borderColor: C.line }}>
            <h2 className="text-[26px] font-bold tracking-[-0.04em] md:text-[34px]">요일별 진료시간</h2>
            <ul className="mt-6">
              {DAYS.map(([d, t, night]) => (
                <li key={d} className="flex items-center justify-between gap-3 border-b py-3.5" style={{ borderColor: C.line }}>
                  <span className="font-semibold">{d}</span>
                  <span className="flex items-center gap-2">
                    {night && (
                      <span className="rounded-full px-2.5 py-0.5 text-[13px] font-bold" style={{ background: C.yellow, color: C.ink }}>
                        야간
                      </span>
                    )}
                    <span className="font-bold tabular-nums">{t}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[14px]" style={{ color: C.sub }}>점심시간 13:00 ~ 14:00 (토, 일 없음). 접수는 마감 20분 전까지 받습니다.</p>
          </div>
          <div className="grid gap-4">
            {[
              [Moon, "야간 진료", "월, 수, 금 21:00까지. 퇴근 뒤 오셔도 됩니다."],
              [Sun, "휴일 진료", "일요일, 공휴일 10:00 ~ 14:00"],
            ].map(([Icon, k, v]) => {
              const I = Icon as typeof Moon;
              return (
                <div key={k as string} className="flex gap-5 rounded-[28px] p-7" style={{ background: C.soft }}>
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white" style={{ color: C.sky }}>
                    <I size={24} aria-hidden />
                  </span>
                  <div>
                    <p className="text-[21px] font-bold">{k as string}</p>
                    <p style={{ color: C.sub }}>{v as string}</p>
                  </div>
                </div>
              );
            })}
            <div className="rounded-[28px] p-7 text-white" style={{ background: C.sky }}>
              <p className="text-[15px] text-white/80">진료 문의</p>
              <p className="text-[32px] font-bold tabular-nums tracking-[-0.02em]">02-000-0000</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">진료 과목</h2>
          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              { img: "a-blocks", alt: "숫자가 적힌 원목 블록", t: "소아 일반 진료", d: "감기, 장염, 중이염, 아토피, 알레르기" },
              { img: "a-train", alt: "원목 기차 장난감", t: "영유아 건강검진", d: "생후 14일부터 71개월까지 8차례, 발달 평가 포함" },
            ].map((b) => (
              <li key={b.t} className="overflow-hidden rounded-[24px] bg-white">
                <div className="relative aspect-[16/10]">
                  <Image src={`${IMG}/${b.img}.jpg`} alt={b.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
                </div>
                <div className="p-7">
                  <h3 className="text-[21px] font-bold tracking-[-0.03em]">{b.t}</h3>
                  <p className="mt-1 text-[15px]" style={{ color: C.sub }}>{b.d}</p>
                </div>
              </li>
            ))}
            <li className="flex flex-col rounded-[24px] bg-white p-7">
              <span className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: C.skySoft, color: C.sky }}>
                <Syringe size={24} aria-hidden />
              </span>
              <h3 className="mt-5 text-[21px] font-bold tracking-[-0.03em]">예방접종</h3>
              <p className="mt-1 text-[15px]" style={{ color: C.sub }}>국가 필수접종, 독감, 로타, 수막구균</p>
              <ul className="mt-5 grid gap-2 text-[15px]">
                {["국가 필수접종 무료", "독감 접종 10월부터", "접종 수첩 꼭 가져오세요"].map((x) => (
                  <li key={x} className="flex items-center gap-2">
                    <Baby size={16} style={{ color: C.sky }} aria-hidden />
                    {x}
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 md:flex-row md:justify-between">
          <p>새싹 소아청소년과의원, 서울특별시 마포구 일대, 건물 3층 (엘리베이터, 유모차 이동 가능)</p>
          <p>진료 문의 02-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
