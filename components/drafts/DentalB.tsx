"use client";

import Image from "next/image";
import { ArrowRight, Clock, MapPin, Phone } from "lucide-react";
import { MonthSchedule } from "./MonthSchedule";

// 치과 시안 B 동네 가족 치과형(11-21). 따뜻한 주황 포인트와 둥근 모서리, 아이와 부모가 함께 오는 동네 치과 분위기. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/dent/b-*)
const IMG = "/images/drafts/dent";
const C = { ink: "#1d1b19", sub: "#6a645e", line: "#ece6df", cream: "#ffffff", card: "#f5f6f7", orange: "#f06a2f", orangeSoft: "#fdeee5", green: "#2f7d6a" };
const TEL = "02-000-0000";

const CARE = [
  { t: "어린이 치과", d: "웃음가스와 짧은 진료로 아이가 겁먹지 않게 진행합니다.", tag: "만 12세 이하" },
  { t: "충치, 신경치료", d: "현미경으로 신경관을 확인하며 치료합니다.", tag: "보험 적용" },
  { t: "임플란트", d: "부분 틀니와 임플란트 중 나이와 잇몸 상태에 맞는 방법을 권해 드립니다.", tag: "65세 이상 보험" },
  { t: "스케일링, 잇몸", d: "1년에 한 번 건강보험 스케일링과 잇몸 상태 점검을 진행합니다.", tag: "연 1회 보험" },
];

export function DentalB() {
  return (
    <div className="min-h-screen text-[16px] leading-[1.75] md:text-[17px]" style={{ background: C.cream, color: C.ink }}>
      <header className="sticky top-0 z-20 border-b backdrop-blur" style={{ background: "rgba(255,255,255,0.94)", borderColor: C.line }}>
        <div className="mx-auto flex h-[70px] max-w-[1200px] items-center justify-between px-5 md:px-8">
          <p className="flex items-center gap-2 text-[20px] font-bold tracking-[-0.03em]">
            <span className="h-3 w-3 rounded-full" style={{ background: C.orange }} aria-hidden />
            새봄가족치과
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#4a4540" }}>
            {["병원 소개", "진료 과목", "어린이 진료", "진료 시간", "오시는 길"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center gap-1.5 rounded-full px-5 text-[15px] font-bold text-white" style={{ background: C.orange }}>
            <Phone size={16} aria-hidden />
            전화 예약
          </span>
        </div>
      </header>

      <section className="px-5 pb-14 pt-10 md:px-8 md:pb-20 md:pt-14">
        <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-[32px]">
          <div className="relative aspect-[4/5] sm:aspect-[16/10] md:aspect-[21/10]">
            <Image src={`${IMG}/b-hero.jpg`} alt="주황색 진료 의자가 있는 밝은 진료실" fill priority sizes="(min-width: 1200px) 1200px, 100vw" className="object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(0deg, rgba(29,27,25,0.75) 0%, rgba(29,27,25,0.05) 60%)" }} aria-hidden />
          </div>
          <div className="absolute inset-x-0 bottom-0 p-7 text-white md:p-14">
            <p className="inline-flex rounded-full bg-white/20 px-3 py-1 text-[14px] font-bold backdrop-blur">평일 저녁 8시, 토요일 진료</p>
            <h1 className="mt-4 text-[34px] font-bold leading-[1.22] tracking-[-0.045em] md:text-[64px]">
              아이도 부모님도
              <br />
              편하게 다니는 치과
            </h1>
          </div>
        </div>
        <div className="mx-auto mt-6 grid max-w-[1200px] gap-3 sm:grid-cols-3">
          {[
            [Clock, "오늘 진료", "09:30 ~ 20:00"],
            [Phone, "전화 예약", TEL],
            [MapPin, "오시는 길", "지하철역 2번 출구 1분"],
          ].map(([Icon, k, v]) => {
            const I = Icon as typeof Clock;
            return (
              <div key={k as string} className="flex items-center gap-4 rounded-[20px] p-5" style={{ background: C.card }}>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full" style={{ background: C.orangeSoft, color: C.orange }}>
                  <I size={21} aria-hidden />
                </span>
                <div>
                  <p className="text-[14px]" style={{ color: C.sub }}>{k as string}</p>
                  <p className="text-[18px] font-bold tabular-nums">{v as string}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-[30px] font-bold leading-[1.3] tracking-[-0.04em] md:text-[44px]">진료 과목</h2>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2">
            {CARE.map((c) => (
              <li key={c.t} className="flex flex-col justify-between rounded-[24px] p-8 md:p-10" style={{ background: C.card }}>
                <div>
                  <span className="inline-flex rounded-full px-3 py-1 text-[13px] font-bold" style={{ background: C.orangeSoft, color: C.orange }}>{c.tag}</span>
                  <h3 className="mt-5 text-[24px] font-bold tracking-[-0.03em] md:text-[28px]">{c.t}</h3>
                  <p className="mt-3" style={{ color: C.sub }}>{c.d}</p>
                </div>
                <p className="mt-8 inline-flex items-center gap-1.5 text-[15px] font-bold">
                  자세히 보기
                  <ArrowRight size={16} aria-hidden />
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 md:px-8">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 overflow-hidden rounded-[32px] md:grid-cols-2" style={{ background: C.green, color: "#fff" }}>
          <div className="px-8 py-14 md:px-14 md:py-20">
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[40px]">
              아이가 무서워하지 않도록,
              <br />
              첫 방문은 구경부터 합니다
            </h2>
            <ul className="mt-8 grid gap-4 text-[16px] text-white/85 md:text-[17px]">
              <li>첫 방문은 의자에 앉아 보고 기구를 만져 보는 것으로 끝납니다.</li>
              <li>진료는 15분 안에 끝나게 나눠서 잡습니다.</li>
              <li>진료가 끝나면 오늘 한 일을 사진으로 부모님께 보내 드립니다.</li>
            </ul>
          </div>
          <div className="relative min-h-[320px] self-stretch md:min-h-[480px]">
            <Image src={`${IMG}/b-brush.jpg`} alt="민트색 배경 위의 칫솔과 칫솔 상자" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-[1200px]"><div className="mb-14"><MonthSchedule accent={C.orange} night={C.green} rounded={28} bg={C.card} marks={{ 6: "~15시" }} markLabel="토요일 오후 3시까지" /></div><div className="grid gap-10 md:grid-cols-[1.1fr_1fr] md:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
            <Image src={`${IMG}/b-room.jpg`} alt="정돈된 진료실 내부" fill sizes="(min-width: 768px) 55vw, 100vw" className="object-cover" />
          </div>
          <div>
            <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">진료 시간</h2>
            <dl className="mt-8 grid gap-3">
              {[
                ["평일", "09:30 ~ 20:00"],
                ["토요일", "09:30 ~ 15:00"],
                ["점심시간", "13:00 ~ 14:00"],
                ["일요일, 공휴일", "휴진"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between rounded-[16px] px-6 py-4 text-[17px]" style={{ background: C.card }}>
                  <dt style={{ color: C.sub }}>{k}</dt>
                  <dd className="font-bold tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
            <span className="mt-8 inline-flex h-[56px] items-center gap-2 rounded-full px-8 text-[17px] font-bold text-white" style={{ background: C.orange }}>
              {TEL} 전화 예약
              <ArrowRight size={18} aria-hidden />
            </span>
          </div>
        </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 md:flex-row md:justify-between">
          <p>새봄가족치과, 경기도 고양시 일산동구 일대</p>
          <p>예약 문의 {TEL}</p>
        </div>
      </footer>
    </div>
  );
}
