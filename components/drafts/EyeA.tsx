"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

// 안과 시안 A 수술센터형(11-22 사례 분석: 일점영안과, 서면성모안과처럼 백내장, 망막, 시력교정 센터를 메뉴 첫 줄에, 장비 사진과 정밀검사 순서를 길게). 흰 바탕, 짙은 청록. 인물 없음(의료광고). 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/eye/a-*)
const IMG = "/images/drafts/eye";
const C = { ink: "#0f1a1e", sub: "#5b686d", line: "#e1e8ea", soft: "#f1f5f6", teal: "#0d4a57", aqua: "#1aa3b8" };

const CENTERS = [
  { e: "CATARACT", t: "백내장 센터", d: "노안 백내장, 다초점 인공수정체 상담", m: "수술 전 정밀검사 1시간 30분" },
  { e: "RETINA", t: "망막 센터", d: "당뇨망막병증, 황반변성, 망막박리", m: "안저 촬영, 빛간섭단층촬영" },
  { e: "VISION", t: "시력교정 센터", d: "라식, 라섹, 렌즈삽입술", m: "검사 전 렌즈 착용 중단 필요" },
];

export function EyeA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="absolute inset-x-0 z-20 text-white">
        <div className="mx-auto flex h-[78px] max-w-[1320px] items-center justify-between px-5 md:px-10">
          <p className="text-[19px] font-bold tracking-[-0.02em]">맑은눈 안과</p>
          <nav aria-label="주 메뉴" className="hidden gap-10 text-[15px] font-medium text-white/85 lg:flex">
            {["백내장", "망막", "시력교정", "검사 장비", "진료 안내"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-10 items-center border border-white/70 px-5 text-[14px] font-bold">검사 예약</span>
        </div>
      </header>

      <section className="relative flex min-h-[640px] items-end overflow-hidden text-white md:h-[100svh]">
        <Image src={`${IMG}/a-phoro.jpg`} alt="검은 바탕 위 굴절 검사기의 렌즈 다이얼" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 40%, rgba(4,24,30,0.85) 100%)" }} aria-hidden />
        <div className="relative mx-auto flex w-full max-w-[1320px] flex-col gap-8 px-5 pb-16 md:flex-row md:items-end md:justify-between md:px-10 md:pb-24">
          <h1 className="text-[40px] font-bold leading-[1.2] tracking-[-0.045em] md:text-[72px]">
            수술 여부는
            <br />
            검사 결과로 정합니다
          </h1>
          <p className="max-w-[400px] text-[16px] text-white/85 md:text-[17px]">
            백내장, 망막, 시력교정 수술 전에 12가지 정밀검사를 같은 날 끝냅니다. 결과지를 보며 원장이 직접 설명합니다.
          </p>
        </div>
      </section>

      <section className="px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1320px]">
          <h2 className="text-[32px] font-bold tracking-[-0.04em] md:text-[48px]">진료 센터</h2>
          <ul className="mt-14 grid gap-px md:grid-cols-3" style={{ background: C.line }}>
            {CENTERS.map((c) => (
              <li key={c.t} className="flex flex-col bg-white p-8 md:p-10">
                <h3 className="text-[26px] font-bold tracking-[-0.03em]" style={{ color: C.teal }}>{c.t}</h3>
                <p className="mt-2 flex-1" style={{ color: C.sub }}>{c.d}</p>
                <p className="mt-8 border-t pt-4 text-[15px] font-semibold" style={{ borderColor: C.line }}>{c.m}</p>
                <ArrowRight className="mt-6" size={20} aria-hidden />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 md:px-10" style={{ background: C.teal }}>
        <div className="mx-auto grid max-w-[1320px] gap-10 py-20 text-white md:grid-cols-[1.1fr_1fr] md:gap-16 md:py-28">
          <div className="grid grid-cols-2 gap-3">
            <div className="relative col-span-2 aspect-[16/9] bg-white">
              <Image src={`${IMG}/a-hero.jpg`} alt="세극등 현미경과 자동 굴절 검사기" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
            </div>
            <div className="relative col-span-2 aspect-[16/7]">
              <Image src={`${IMG}/a-lens.jpg`} alt="하늘색 바탕 위의 투명한 렌즈" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
            </div>
          </div>
          <div className="self-center">
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[40px]">수술 전 정밀검사 순서</h2>
            <ol className="mt-8 grid gap-4">
              {[
                ["시력, 굴절", "나안 시력, 교정 시력, 안압"],
                ["각막", "각막 두께, 지형도, 내피세포 수"],
                ["망막", "산동 후 안저 촬영, 빛간섭단층촬영"],
                ["상담", "결과지로 수술 방법과 렌즈 종류 결정"],
              ].map(([k, v], i) => (
                <li key={k} className="flex gap-5 border-b border-white/15 pb-4">
                  <span className="w-8 shrink-0 font-bold tabular-nums" style={{ color: C.aqua }}>0{i + 1}</span>
                  <div>
                    <p className="text-[18px] font-bold">{k}</p>
                    <p className="text-[15px] text-white/70">{v}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-[15px] text-white/70">산동 검사 뒤 4~5시간은 운전하실 수 없습니다. 대중교통이나 보호자와 함께 오세요.</p>
          </div>
        </div>
      </section>

      <section className="px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto grid max-w-[1320px] gap-12 md:grid-cols-2 md:gap-16">
          <div>
            <h2 className="text-[32px] font-bold tracking-[-0.04em] md:text-[44px]">진료 안내</h2>
            <p className="mt-6 text-[34px] font-bold tabular-nums" style={{ color: C.teal }}>051-000-0000</p>
            <p className="mt-2" style={{ color: C.sub }}>부산광역시 부산진구 서면 일대, 건물 5층 전체. 지정 주차장 2시간 무료.</p>
          </div>
          <dl className="self-end border-t" style={{ borderColor: C.ink }}>
            {[
              ["평일", "08:30 ~ 17:30"],
              ["토요일", "08:30 ~ 13:00"],
              ["점심시간", "13:00 ~ 14:00"],
              ["수술", "화, 목 오전 (예약제)"],
              ["휴진", "일요일, 공휴일"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b py-4" style={{ borderColor: C.line }}>
                <dt style={{ color: C.sub }}>{k}</dt>
                <dd className="text-right font-bold tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-10" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2 md:flex-row md:justify-between">
          <p>맑은눈 안과의원, 부산광역시 부산진구 일대</p>
          <p>검사 예약 051-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
