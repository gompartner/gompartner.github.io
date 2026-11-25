"use client";

import Image from "next/image";
import { CalendarCheck, Clock, Sparkles } from "lucide-react";

// 네일 시안 B 1인 샵 안내형(11-21 사례 분석: 왁싱, 네일 같은 1인 샵 사이트는 머리글에 PRICE, BOOKING을 두고 예약제 안내를 크게 쓴다. 손님은 걸리는 시간, 보수 기간, 예약 변경 규칙을 먼저 본다). 흰 바탕, 장미색 포인트. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/nail/b-*)
const IMG = "/images/drafts/nail";
const C = { ink: "#211a1c", sub: "#6e6366", line: "#f0e6e8", soft: "#faf5f6", rose: "#c94f6d", roseSoft: "#fbe8ee" };

const MENU = [
  { t: "젤 원컬러", time: "1시간", p: "40,000", d: "케어 포함, 이달의 컬러 중 선택" },
  { t: "아트 디자인", time: "1시간 30분", p: "55,000 ~", d: "사진 보고 상담, 파츠 별도" },
  { t: "패디 젤", time: "1시간 10분", p: "50,000", d: "각질 정리 포함" },
  { t: "젤 제거 + 케어", time: "30분", p: "15,000", d: "손톱 손상 없이 드릴 제거" },
];

export function NailB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[70px] max-w-[1200px] items-center justify-between px-5 md:px-8">
          <p className="text-[20px] font-bold tracking-[-0.03em]">봄날네일</p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#4b4144" }}>
            {["가격", "예약 안내", "보수 안내", "오시는 길"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
        </div>
      </header>

      <section className="px-5 pb-14 pt-10 md:px-8 md:pb-20 md:pt-14">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 overflow-hidden rounded-[32px] md:grid-cols-2" style={{ background: C.roseSoft }}>
          <div className="px-8 pt-12 md:px-14 md:py-16">
            <p className="inline-flex rounded-full bg-white px-3 py-1 text-[14px] font-bold" style={{ color: C.rose }}>100% 예약제, 1:1 시술</p>
            <h1 className="mt-5 text-[34px] font-bold leading-[1.22] tracking-[-0.045em] md:text-[54px]">
              기다리지 않는
              <br />
              1인 네일샵
            </h1>
            <p className="mt-4 max-w-[420px] text-[16px] md:text-[18px]" style={{ color: C.sub }}>한 번에 한 분만 받습니다. 예약 시간에 오시면 바로 시작합니다.</p>
          </div>
          <div className="relative min-h-[300px] self-stretch md:min-h-[460px]">
            <Image src={`${IMG}/b-hero.jpg`} alt="연보라 바탕 위 분홍 매니큐어 병" fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
        <ul className="mx-auto mt-6 grid max-w-[1200px] gap-3 sm:grid-cols-3">
          {[
            [CalendarCheck, "예약 변경", "하루 전까지 무료"],
            [Sparkles, "무료 보수", "시술 후 7일 안"],
            [Clock, "영업", "10:00 ~ 21:00, 화요일 휴무"],
          ].map(([Icon, k, v]) => {
            const I = Icon as typeof Clock;
            return (
              <li key={k as string} className="flex items-center gap-4 rounded-[20px] p-5" style={{ background: C.soft }}>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white" style={{ color: C.rose }}>
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

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">시술 시간과 가격</h2>
          <ul className="mt-10 grid gap-4 md:grid-cols-2">
            {MENU.map((m) => (
              <li key={m.t} className="flex items-start justify-between gap-4 rounded-[22px] border p-7" style={{ borderColor: C.line }}>
                <div>
                  <h3 className="text-[21px] font-bold tracking-[-0.03em]">{m.t}</h3>
                  <p className="mt-1 text-[15px]" style={{ color: C.sub }}>{m.d}</p>
                  <p className="mt-4 inline-flex rounded-full px-3 py-0.5 text-[14px] font-bold" style={{ background: C.roseSoft, color: C.rose }}>{m.time}</p>
                </div>
                <p className="shrink-0 text-[22px] font-bold tabular-nums">{m.p}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 md:grid-cols-[1.1fr_1fr] md:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[24px]">
            <Image src={`${IMG}/b-room.jpg`} alt="컬러 선반과 시술 테이블이 놓인 네일 매장" fill sizes="(min-width: 768px) 55vw, 100vw" className="object-cover" />
          </div>
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">예약 전에 알아 두세요</h2>
            <ul className="mt-7 grid gap-3">
              {["15분 넘게 늦으시면 다음 시간으로 옮깁니다", "다른 샵 젤 제거는 5,000원이 추가됩니다", "도구는 손님마다 소독하고 파일은 1회용을 씁니다", "주차는 건물 뒤 공영주차장을 이용해 주세요"].map((x) => (
                <li key={x} className="border-b pb-3" style={{ borderColor: C.line, color: C.sub }}>{x}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 md:flex-row md:justify-between">
          <p>봄날네일, 경기도 수원시 광교 일대</p>
          <p>대표전화 031-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
