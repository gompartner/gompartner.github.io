"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

// 동물병원 시안 A 24시 진료형(11-22 사례 분석: 러블리펫486처럼 진료시간과 응급 진료를 첫 스크롤에 크게, 진료 과목 칸, 개와 고양이 입원실 분리 같은 시설). 흰 바탕, 검정과 주황. 사람 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/vet/a-*)
const IMG = "/images/drafts/vet";
const C = { ink: "#141414", sub: "#666", line: "#e8e8e8", soft: "#f5f5f4", orange: "#ec6b2d" };

const DEPT = [
  ["내과", "구토, 설사, 신장, 당뇨"],
  ["외과", "중성화, 슬개골 탈구, 종양 수술"],
  ["영상 진단", "디지털 엑스레이, 초음파, CT 연계"],
  ["치과", "스케일링, 발치, 구강 엑스레이"],
  ["건강검진", "7세 이상 노령 검진"],
  ["응급", "야간, 휴일 24시간"],
];

export function VetA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="absolute inset-x-0 z-20 text-white">
        <div className="mx-auto flex h-[78px] max-w-[1320px] items-center justify-between px-5 md:px-10">
          <p className="text-[19px] font-bold tracking-[-0.02em]">
            24시 <span style={{ color: C.orange }}>온</span> 동물의료센터
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-10 text-[15px] font-medium text-white/85 lg:flex">
            {["진료 과목", "응급 진료", "고양이 진료", "시설", "오시는 길"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-10 items-center px-5 text-[14px] font-bold text-white" style={{ background: C.orange }}>
            응급 전화
          </span>
        </div>
      </header>

      <section className="relative flex min-h-[640px] items-end overflow-hidden text-white md:h-[100svh]">
        <Image src={`${IMG}/a-hero.jpg`} alt="바닥에 엎드려 한쪽 눈을 감은 골든 리트리버 강아지" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0.78) 100%)" }} aria-hidden />
        <div className="relative mx-auto flex w-full max-w-[1320px] flex-col gap-8 px-5 pb-16 md:flex-row md:items-end md:justify-between md:px-10 md:pb-24">
          <h1 className="text-[40px] font-bold leading-[1.2] tracking-[-0.045em] md:text-[72px]">
            밤에도, 휴일에도
            <br />
            수의사가 있습니다
          </h1>
          <div className="md:text-right">
            <p className="text-[15px] font-bold text-white/70">응급 진료 24시간</p>
            <p className="text-[36px] font-bold tabular-nums tracking-[-0.02em] md:text-[48px]">02-000-0000</p>
          </div>
        </div>
      </section>

      <section className="px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1320px]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[13px] font-bold tracking-[0.26em]" style={{ color: C.orange }}>MEDICAL</p>
              <h2 className="mt-4 text-[32px] font-bold tracking-[-0.04em] md:text-[48px]">진료 과목</h2>
            </div>
            <p className="text-[15px]" style={{ color: C.sub }}>수의사 6명이 3교대로 진료합니다.</p>
          </div>
          <ul className="mt-14 grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-3" style={{ background: C.line }}>
            {DEPT.map(([t, d]) => (
              <li key={t} className="flex items-center justify-between gap-4 bg-white p-8">
                <div>
                  <h3 className="text-[24px] font-bold tracking-[-0.03em]">{t}</h3>
                  <p className="text-[15px]" style={{ color: C.sub }}>{d}</p>
                </div>
                <ArrowRight size={20} className="shrink-0" aria-hidden />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 md:px-10" style={{ background: C.ink }}>
        <div className="mx-auto grid max-w-[1320px] gap-4 py-20 md:grid-cols-[1fr_1.15fr] md:py-28">
          <div className="flex flex-col justify-center p-2 text-white md:p-8">
            <p className="text-[13px] font-bold tracking-[0.26em]" style={{ color: C.orange }}>CAT FRIENDLY</p>
            <h2 className="mt-4 text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[40px]">고양이는 따로 기다리고, 따로 입원합니다</h2>
            <p className="mt-4 text-white/70">고양이 전용 대기실과 진료실, 입원실을 분리했습니다. 개 짖는 소리가 들리지 않는 층에 있습니다.</p>
          </div>
          <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[480px]">
            <Image src={`${IMG}/a-cat.jpg`} alt="어두운 바탕에서 고개를 돌린 샴 고양이" fill sizes="(min-width: 768px) 55vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto grid max-w-[1320px] gap-12 md:grid-cols-2 md:gap-16">
          <div className="relative aspect-[4/3]">
            <Image src={`${IMG}/a-room.jpg`} alt="수술등과 수술대가 있는 하얀 수술실" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
          <div className="self-center">
            <p className="text-[13px] font-bold tracking-[0.26em]" style={{ color: C.orange }}>HOURS</p>
            <h2 className="mt-4 text-[32px] font-bold tracking-[-0.04em] md:text-[44px]">진료시간</h2>
            <dl className="mt-8 border-t" style={{ borderColor: C.ink }}>
              {[
                ["일반 진료", "매일 09:00 ~ 21:00"],
                ["야간 응급", "21:00 ~ 다음 날 09:00"],
                ["예약 진료", "수술, 건강검진, 치과"],
                ["주차", "건물 앞 6대, 진료 시 무료"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b py-4" style={{ borderColor: C.line }}>
                  <dt style={{ color: C.sub }}>{k}</dt>
                  <dd className="text-right font-bold">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 text-[15px]" style={{ color: C.sub }}>야간에는 응급 진료비가 더해집니다. 오시기 전에 전화로 증상을 알려 주세요.</p>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-10" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2 md:flex-row md:justify-between">
          <p>24시 온 동물의료센터, 서울특별시 강서구 일대</p>
          <p>응급 전화 02-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
