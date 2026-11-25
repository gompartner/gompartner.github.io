"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { MonthSchedule } from "./MonthSchedule";

// 치과 시안 A 화이트 미니멀(11-21). 회색과 흰색, 큰 여백과 얇은 선으로 정돈된 진료 이미지를 보여 준다. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/dent/a-*)
const IMG = "/images/drafts/dent";
const C = { ink: "#1a1c1f", sub: "#6b7079", line: "#e5e6e8", soft: "#f2f2f0", teal: "#2a7f86" };
const TEL = "02-000-0000";

const CARE = [
  { en: "IMPLANT", t: "임플란트", d: "3D CT로 뼈 두께와 신경 위치를 확인한 뒤 식립 위치를 미리 설계합니다." },
  { en: "ORTHODONTICS", t: "치아교정", d: "투명교정과 설측교정 중 생활 방식에 맞는 방법을 상담에서 비교해 드립니다." },
  { en: "AESTHETIC", t: "심미 보철", d: "라미네이트와 올세라믹으로 자연 치아에 가까운 색과 모양을 맞춥니다." },
  { en: "GENERAL", t: "일반 진료", d: "충치, 신경치료, 잇몸 치료와 정기 검진, 스케일링을 진행합니다." },
];

export function DentalA() {
  return (
    <div className="min-h-screen text-[16px] leading-[1.75] md:text-[17px]" style={{ background: "#fff", color: C.ink }}>
      <header className="absolute inset-x-0 z-20">
        <div className="mx-auto flex h-[78px] max-w-[1280px] items-center justify-between px-5 md:px-10">
          <p className="flex items-baseline gap-2">
            <span className="text-[20px] font-bold tracking-[-0.02em]">서로치과의원</span>
            <span className="text-[11px] font-bold tracking-[0.22em]" style={{ color: C.sub }}>DENTAL CLINIC</span>
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-10 text-[15px] font-medium lg:flex" style={{ color: "#3b3f45" }}>
            {["병원 소개", "진료 과목", "둘러보기", "진료 안내", "오시는 길"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-10 items-center border-b-2 text-[15px] font-bold" style={{ borderColor: C.ink }}>
            {TEL}
          </span>
        </div>
      </header>

      <section className="relative px-5 pt-[78px] md:px-10" style={{ background: C.soft }}>
        <div className="mx-auto grid max-w-[1280px] items-center gap-10 pb-16 pt-10 lg:grid-cols-[1fr_1.15fr] lg:gap-16 lg:pb-0 lg:pt-0">
          <div className="lg:py-28">
            <p className="text-[13px] font-bold tracking-[0.24em]" style={{ color: C.teal }}>QUIET, PRECISE CARE</p>
            <h1 className="mt-6 text-[38px] font-bold leading-[1.25] tracking-[-0.04em] md:text-[62px]">
              과잉진료 없이,
              <br />
              필요한 치료만
            </h1>
            <p className="mt-6 max-w-[440px] text-[16px] md:text-[18px]" style={{ color: C.sub }}>
              당장 필요한 치료와 나중에 해도 되는 치료를 나눠서 말씀드립니다. 진료 전에 비용과 횟수를 먼저 확인하실 수 있습니다.
            </p>
          </div>
          <div className="relative aspect-[4/3] lg:aspect-[5/6] lg:self-stretch">
            <Image src={`${IMG}/a-hero.jpg`} alt="밝은 회색 배경 위의 전동 칫솔" fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 pt-16 md:px-10 md:pt-24">
        <div className="mx-auto grid max-w-[1280px] gap-8 lg:grid-cols-[1fr_1.4fr] lg:items-center lg:gap-16">
          <div>
            <p className="text-[13px] font-bold tracking-[0.24em]" style={{ color: C.teal }}>SCHEDULE</p>
            <h2 className="mt-4 text-[30px] font-bold leading-[1.3] tracking-[-0.03em] md:text-[42px]">
              화, 목요일은
              <br />
              밤 9시까지 진료합니다
            </h2>
            <p className="mt-4" style={{ color: C.sub }}>퇴근 후에도 예약 없이 검진받으실 수 있습니다. 휴진일은 매달 이 달력에 먼저 공지합니다.</p>
          </div>
          <div className="border" style={{ borderColor: C.line }}>
            <MonthSchedule accent="#c2412d" night={C.teal} rounded={0} />
          </div>
        </div>
      </section>

      <section className="px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1280px]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[13px] font-bold tracking-[0.24em]" style={{ color: C.teal }}>TREATMENTS</p>
              <h2 className="mt-4 text-[30px] font-bold tracking-[-0.03em] md:text-[46px]">진료 과목</h2>
            </div>
            <p className="max-w-[420px]" style={{ color: C.sub }}>과목마다 진료 순서와 기간, 비용 범위를 진료 전에 서면으로 안내합니다.</p>
          </div>
          <ul className="mt-16 border-t" style={{ borderColor: C.ink }}>
            {CARE.map((c) => (
              <li key={c.en} className="grid gap-3 border-b py-9 md:grid-cols-[220px_1fr_1.3fr_40px] md:items-center md:gap-8 md:py-11" style={{ borderColor: C.line }}>
                <span className="text-[12px] font-bold tracking-[0.22em]" style={{ color: C.sub }}>{c.en}</span>
                <h3 className="text-[26px] font-bold tracking-[-0.03em] md:text-[32px]">{c.t}</h3>
                <p className="text-[15px] md:text-[16px]" style={{ color: C.sub }}>{c.d}</p>
                <ArrowRight size={22} className="hidden md:block" aria-hidden />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 md:px-10">
        <div className="mx-auto grid max-w-[1280px] gap-5 md:grid-cols-[1.4fr_1fr]">
          <div className="relative aspect-[4/3] overflow-hidden md:aspect-auto md:min-h-[560px]">
            <Image src={`${IMG}/a-room.jpg`} alt="햇빛이 드는 밝은 진료실과 진료 의자" fill sizes="(min-width: 768px) 58vw, 100vw" className="object-cover" />
          </div>
          <div className="flex flex-col justify-between gap-10 p-8 md:p-12" style={{ background: C.soft }}>
            <div>
              <p className="text-[13px] font-bold tracking-[0.24em]" style={{ color: C.teal }}>CLINIC</p>
              <h2 className="mt-4 text-[28px] font-bold leading-[1.4] tracking-[-0.03em] md:text-[36px]">
                진료실은 모두
                <br />
                독립된 방입니다
              </h2>
              <p className="mt-5" style={{ color: C.sub }}>
                옆 의자의 소리가 들리지 않게 진료실을 나눴습니다. 기구는 환자마다 멸균 포장을 열어 사용합니다.
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-6 border-t pt-8" style={{ borderColor: "#d9dad6" }}>
              {[
                ["독립 진료실", "6실"],
                ["3D CT", "보유"],
                ["멸균 기준", "1인 1기구"],
                ["야간 진료", "화, 목"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[13px]" style={{ color: C.sub }}>{k}</dt>
                  <dd className="mt-1 text-[22px] font-bold">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="px-5 py-24 md:px-10 md:py-36">
        <div className="mx-auto grid max-w-[1280px] items-center gap-12 md:grid-cols-2 md:gap-20">
          <div>
            <p className="text-[13px] font-bold tracking-[0.24em]" style={{ color: C.teal }}>HOURS</p>
            <h2 className="mt-4 text-[30px] font-bold tracking-[-0.03em] md:text-[46px]">진료 시간</h2>
            <dl className="mt-10 grid gap-0 border-t" style={{ borderColor: C.ink }}>
              {[
                ["월, 수, 금", "09:30 ~ 18:30"],
                ["화, 목", "09:30 ~ 21:00 야간"],
                ["토요일", "09:30 ~ 14:00"],
                ["점심시간", "13:00 ~ 14:00"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b py-5 text-[17px] md:text-[18px]" style={{ borderColor: C.line }}>
                  <dt style={{ color: C.sub }}>{k}</dt>
                  <dd className="font-bold tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[14px]" style={{ color: C.sub }}>일요일, 공휴일 휴진</p>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image src={`${IMG}/a-brush.jpg`} alt="흰 받침 위에 세워 둔 검은 전동 칫솔" fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 text-white md:px-10 md:py-24" style={{ background: C.ink }}>
        <div className="mx-auto flex max-w-[1280px] flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.03em] md:text-[40px]">첫 진료는 검진과 상담부터</h2>
          <div className="flex flex-wrap items-center gap-5">
            <span className="text-[22px] font-bold tabular-nums">{TEL}</span>
          </div>
        </div>
      </section>

      <footer className="px-5 py-10 text-[14px] md:px-10" style={{ color: C.sub }}>
        <div className="mx-auto flex max-w-[1280px] flex-col gap-2 md:flex-row md:justify-between">
          <p>서로치과의원, 서울특별시 송파구 일대, 지하철역 2번 출구 앞</p>
          <p>대표전화 {TEL}</p>
        </div>
      </footer>
    </div>
  );
}
