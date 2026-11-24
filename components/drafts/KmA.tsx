"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

// 한의원 시안 A 전통 브랜드형(11-22 사례 분석: 진정, 유담한의원처럼 짙은 나무색, 큰 사진에 한 줄, 진료 과목 4칸, 원내 탕전 안내). 흰 바탕, 짙은 갈색. 인물, 후기 없음(의료광고). 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/km/a-*)
const IMG = "/images/drafts/km";
const C = { ink: "#1b1612", sub: "#6d635a", line: "#e9e3dc", soft: "#f6f3ef", wood: "#4a3020", gold: "#a8733d" };

const DEPTS = [
  { t: "통증 클리닉", d: "목, 허리, 어깨 통증. 침, 약침, 추나", e: "PAIN" },
  { t: "교통사고 클리닉", d: "자동차보험 진료, 사고 뒤 통증과 후유증", e: "ACCIDENT" },
  { t: "여성 클리닉", d: "생리통, 산후 조리, 갱년기", e: "WOMEN" },
  { t: "체질 한약", d: "진맥과 체질 상담 후 처방", e: "HERBAL" },
];

export function KmA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="absolute inset-x-0 z-20 text-white">
        <div className="mx-auto flex h-[78px] max-w-[1320px] items-center justify-between px-5 md:px-10">
          <p className="text-[19px] font-bold tracking-[0.06em]">솔뫼 한의원</p>
          <nav aria-label="주 메뉴" className="hidden gap-10 text-[15px] font-medium text-white/85 lg:flex">
            {["한의원 소개", "진료 과목", "원내 탕전", "진료 안내"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-10 items-center border border-white/70 px-5 text-[14px] font-bold">진료 예약</span>
        </div>
      </header>

      <section className="relative flex min-h-[640px] items-end overflow-hidden text-white md:h-[100svh]">
        <Image src={`${IMG}/a-hero.jpg`} alt="창살문으로 빛이 드는 한옥 방과 다기가 놓인 낮은 상" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(20,12,6,0.5) 0%, rgba(20,12,6,0.15) 40%, rgba(20,12,6,0.78) 100%)" }} aria-hidden />
        <div className="relative mx-auto flex w-full max-w-[1320px] flex-col gap-8 px-5 pb-16 md:flex-row md:items-end md:justify-between md:px-10 md:pb-24">
          <h1 className="text-[40px] font-bold leading-[1.22] tracking-[-0.04em] md:text-[70px]">
            몸의 흐름을 살펴
            <br />
            원인부터 다스립니다
          </h1>
          <p className="max-w-[380px] text-[16px] text-white/85 md:text-[17px]">진맥과 체질 상담을 먼저 하고, 침과 약침, 한약의 순서를 함께 정합니다.</p>
        </div>
      </section>

      <section className="px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1320px]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[13px] font-bold tracking-[0.26em]" style={{ color: C.gold }}>CLINIC</p>
              <h2 className="mt-4 text-[32px] font-bold tracking-[-0.04em] md:text-[48px]">진료 과목</h2>
            </div>
            <p className="text-[15px]" style={{ color: C.sub }}>첫 진료는 상담과 진맥까지 40분 정도 걸립니다.</p>
          </div>
          <ul className="mt-14 grid gap-px sm:grid-cols-2 lg:grid-cols-4" style={{ background: C.line }}>
            {DEPTS.map((d) => (
              <li key={d.t} className="flex flex-col bg-white p-8 md:p-9">
                <p className="text-[12px] font-bold tracking-[0.22em]" style={{ color: C.gold }}>{d.e}</p>
                <h3 className="mt-3 text-[24px] font-bold tracking-[-0.03em]">{d.t}</h3>
                <p className="mt-2 flex-1 text-[15px]" style={{ color: C.sub }}>{d.d}</p>
                <ArrowRight className="mt-8" size={20} aria-hidden />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 md:px-10" style={{ background: C.wood }}>
        <div className="mx-auto grid max-w-[1320px] gap-4 py-20 md:grid-cols-[1.15fr_1fr] md:py-28">
          <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[540px]">
            <Image src={`${IMG}/a-ginseng.jpg`} alt="이끼 위에 놓인 뿌리째 인삼" fill sizes="(min-width: 768px) 55vw, 100vw" className="object-cover" />
          </div>
          <div className="grid gap-4">
            <div className="relative aspect-[4/3] md:aspect-auto">
              <Image src={`${IMG}/a-herb.jpg`} alt="대나무 쟁반 위의 말린 약재" fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
            </div>
            <div className="flex flex-col justify-center p-8 text-white md:p-10" style={{ background: "rgba(255,255,255,0.07)" }}>
              <p className="text-[13px] font-bold tracking-[0.26em] text-white/55">원내 탕전</p>
              <h2 className="mt-3 text-[26px] font-bold leading-[1.4] tracking-[-0.03em] md:text-[32px]">약재는 원산지를 적고, 한약은 이곳에서 달입니다</h2>
              <p className="mt-3 text-white/70">식약처 기준 검사를 거친 규격 약재만 씁니다. 처방 후 이틀 안에 받으실 수 있습니다.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto grid max-w-[1320px] gap-12 md:grid-cols-2 md:gap-16">
          <div>
            <p className="text-[13px] font-bold tracking-[0.26em]" style={{ color: C.gold }}>HOURS</p>
            <h2 className="mt-4 text-[32px] font-bold leading-[1.3] tracking-[-0.04em] md:text-[44px]">진료 안내</h2>
            <p className="mt-6 text-[34px] font-bold tabular-nums" style={{ color: C.wood }}>02-000-0000</p>
            <p className="mt-2" style={{ color: C.sub }}>서울특별시 종로구 일대, 지하철역 2번 출구에서 걸어서 3분.</p>
          </div>
          <dl className="self-end border-t" style={{ borderColor: C.ink }}>
            {[
              ["월 ~ 금", "09:30 ~ 19:00"],
              ["목요일 야간", "09:30 ~ 20:30"],
              ["토요일", "09:30 ~ 14:00"],
              ["점심시간", "13:00 ~ 14:00"],
              ["휴진", "일요일, 공휴일"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b py-4" style={{ borderColor: C.line }}>
                <dt style={{ color: C.sub }}>{k}</dt>
                <dd className="font-bold tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <div className="relative h-[260px] md:h-[340px]">
          <Image src={`${IMG}/a-door.jpg`} alt="나무 창살문이 이어진 한옥 벽" fill sizes="100vw" className="object-cover" />
        </div>
      </section>

      <footer className="px-5 py-10 text-[14px] md:px-10" style={{ background: C.soft, color: C.sub }}>
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2 md:flex-row md:justify-between">
          <p>솔뫼 한의원, 서울특별시 종로구 일대</p>
          <p>진료 예약 02-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
