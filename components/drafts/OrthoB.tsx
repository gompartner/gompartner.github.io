"use client";

import Image from "next/image";
import { Car, Clock, MapPin, Phone } from "lucide-react";

// 정형외과 시안 B 동네 의원형(11-22 사례 분석: 한별정형외과처럼 밝은 톤, 진료시간과 대표번호를 첫 화면에, 물리치료와 도수치료 안내, 처음 오시는 분 순서). 흰 바탕, 파랑 포인트. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/ortho/b-*)
const IMG = "/images/drafts/ortho";
const C = { ink: "#14181f", sub: "#5d6673", line: "#e5e9ef", soft: "#f2f6fb", blue: "#1f6fe5", blueSoft: "#e8f0fd" };

const CARE = [
  { t: "물리치료", d: "온열, 전기, 견인치료. 접수 후 바로 받으실 수 있습니다.", tag: "건강보험" },
  { t: "도수치료", d: "물리치료사가 30분간 1:1로 관절과 근육을 풀어 줍니다.", tag: "예약제" },
  { t: "체외충격파", d: "족저근막염, 테니스엘보, 석회성 건염에 씁니다.", tag: "예약제" },
  { t: "주사치료", d: "관절강 주사, 신경 주사. 초음파로 위치를 보며 놓습니다.", tag: "당일 가능" },
];

export function OrthoB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[70px] max-w-[1200px] items-center justify-between px-5 md:px-8">
          <p className="text-[20px] font-bold tracking-[-0.03em]">
            <span style={{ color: C.blue }}>우리동네</span> 정형외과
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#414a57" }}>
            {["진료시간", "진료 과목", "물리치료", "오시는 길"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center rounded-full px-5 text-[15px] font-bold text-white" style={{ background: C.blue }}>
            전화 걸기
          </span>
        </div>
      </header>

      <section className="px-5 pb-14 pt-10 md:px-8 md:pb-20 md:pt-14">
        <div className="mx-auto grid max-w-[1200px] gap-6 lg:grid-cols-[1.25fr_1fr]">
          <div className="relative min-h-[360px] overflow-hidden rounded-[28px] md:min-h-[480px]">
            <Image src={`${IMG}/b-hero.jpg`} alt="밝은 나무 바닥과 유리문이 있는 의원 대기 공간" fill priority sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.6) 100%)" }} aria-hidden />
            <div className="absolute inset-x-0 bottom-0 p-7 text-white md:p-10">
              <h1 className="text-[32px] font-bold leading-[1.25] tracking-[-0.045em] md:text-[50px]">
                허리, 무릎, 어깨
                <br />
                가까운 곳에서 꾸준히
              </h1>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex-1 rounded-[28px] p-7 md:p-9" style={{ background: C.blueSoft }}>
              <p className="flex items-center gap-2 text-[15px] font-bold" style={{ color: C.blue }}>
                <Clock size={18} aria-hidden /> 진료시간
              </p>
              <dl className="mt-4 grid gap-2.5">
                {[
                  ["평일", "08:30 ~ 19:00"],
                  ["수요일 야간", "08:30 ~ 21:00"],
                  ["토요일", "08:30 ~ 13:30"],
                  ["점심", "13:00 ~ 14:00"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <dt style={{ color: C.sub }}>{k}</dt>
                    <dd className="font-bold tabular-nums">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-[14px]" style={{ color: C.sub }}>일요일, 공휴일 휴진. 접수는 마감 30분 전까지.</p>
            </div>
            <div className="rounded-[28px] p-7 text-white md:p-9" style={{ background: C.blue }}>
              <p className="flex items-center gap-2 text-[15px] font-bold text-white/80">
                <Phone size={18} aria-hidden /> 대표번호
              </p>
              <p className="mt-2 text-[34px] font-bold tabular-nums tracking-[-0.02em] md:text-[40px]">031-000-0000</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">치료 안내</h2>
          <p className="mt-2" style={{ color: C.sub }}>진료 뒤 원장이 상태에 맞는 치료를 정해 드립니다.</p>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {CARE.map((c) => (
              <li key={c.t} className="rounded-[22px] bg-white p-7 md:p-8">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-[22px] font-bold tracking-[-0.03em]">{c.t}</h3>
                  <span className="rounded-full px-3 py-0.5 text-[13px] font-bold" style={{ background: C.blueSoft, color: C.blue }}>{c.tag}</span>
                </div>
                <p className="mt-3" style={{ color: C.sub }}>{c.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 md:grid-cols-[1fr_1.1fr] md:gap-16">
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">처음 오시는 분께</h2>
            <ol className="mt-8 grid gap-5">
              {[
                ["접수", "신분증을 꼭 가져와 주세요. 본인 확인 후 접수합니다."],
                ["진료와 촬영", "원장 진료 뒤 필요하면 엑스레이나 초음파를 바로 찍습니다."],
                ["치료", "물리치료실은 2층입니다. 대기 순서대로 안내합니다."],
                ["다음 예약", "도수, 충격파는 수납할 때 다음 날짜를 잡아 드립니다."],
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
          <div className="grid grid-cols-2 gap-3">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[22px]">
              <Image src={`${IMG}/b-hall.jpg`} alt="햇빛이 드는 병원 복도" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
            <div className="relative aspect-[3/4] overflow-hidden rounded-[22px]">
              <Image src={`${IMG}/b-desk.jpg`} alt="대리석 접수 데스크" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <ul className="mx-auto grid max-w-[1200px] gap-3 sm:grid-cols-2">
          {[
            [MapPin, "오시는 길", "경기도 성남시 분당구 일대, 상가 2층"],
            [Car, "주차", "건물 지하 주차장, 진료 시 1시간 무료"],
          ].map(([Icon, k, v]) => {
            const I = Icon as typeof MapPin;
            return (
              <li key={k as string} className="flex items-center gap-4 rounded-[20px] border p-6" style={{ borderColor: C.line }}>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full" style={{ background: C.blueSoft, color: C.blue }}>
                  <I size={21} aria-hidden />
                </span>
                <div>
                  <p className="text-[14px]" style={{ color: C.sub }}>{k as string}</p>
                  <p className="text-[17px] font-bold">{v as string}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 md:flex-row md:justify-between">
          <p>우리동네 정형외과의원, 경기도 성남시 분당구 일대</p>
          <p>대표번호 031-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
