"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

// 정형외과 시안 A 척추관절 비수술형(11-22 사례 분석: 마포엄지척, 무척바른처럼 부위별 진료 카드와 진단 장비, 진료시간 표를 첫 스크롤 안에 둔다). 남색, 흰 바탕. 인물, 후기, 숫자 띠 없음(의료광고). 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/ortho/a-*)
const IMG = "/images/drafts/ortho";
const C = { ink: "#101826", sub: "#5f6b7a", line: "#e3e8ef", soft: "#f3f6f9", navy: "#13294b", sky: "#3d7bd9" };

const PARTS = [
  { t: "목", d: "일자목, 거북목, 목 디스크, 손 저림", c: "경추" },
  { t: "어깨", d: "오십견, 회전근개 파열, 석회성 건염", c: "견관절" },
  { t: "허리", d: "허리 디스크, 척추관 협착증, 좌골신경통", c: "요추" },
  { t: "무릎", d: "퇴행성 관절염, 반월상 연골판 손상", c: "슬관절" },
];

export function OrthoA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[74px] max-w-[1280px] items-center justify-between px-5 md:px-10">
          <p className="text-[19px] font-bold tracking-[-0.03em]" style={{ color: C.navy }}>
            바른척추 정형외과
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-10 text-[15px] font-semibold lg:flex" style={{ color: "#3a4656" }}>
            {["병원 소개", "척추 클리닉", "관절 클리닉", "비수술 치료", "진료 안내"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center px-5 text-[15px] font-bold text-white" style={{ background: C.navy }}>
            진료 예약
          </span>
        </div>
      </header>

      <section className="relative flex min-h-[600px] items-center overflow-hidden text-white md:min-h-[680px]">
        <Image src={`${IMG}/a-hero.jpg`} alt="밝은 조명의 넓은 병원 접수 데스크와 대기 공간" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(10,24,48,0.88) 0%, rgba(10,24,48,0.6) 45%, rgba(10,24,48,0.15) 100%)" }} aria-hidden />
        <div className="relative mx-auto w-full max-w-[1280px] px-5 py-20 md:px-10">
          <p className="text-[14px] font-bold tracking-[0.2em] text-white/70">SPINE &amp; JOINT</p>
          <h1 className="mt-5 text-[38px] font-bold leading-[1.22] tracking-[-0.045em] md:text-[64px]">
            수술을 정하기 전에
            <br />
            정확한 진단부터
          </h1>
          <p className="mt-6 max-w-[500px] text-[16px] text-white/85 md:text-[18px]">
            엑스레이, 초음파로 통증 부위를 직접 확인한 뒤 주사, 도수, 체외충격파 같은 비수술 치료 순서를 정합니다.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <span className="inline-flex h-[54px] items-center gap-2 bg-white px-7 text-[16px] font-bold" style={{ color: C.navy }}>
              진료 예약 <ArrowRight size={18} aria-hidden />
            </span>
            <span className="inline-flex h-[54px] items-center border border-white/60 px-7 text-[16px] font-bold">02-000-0000</span>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1280px]">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[14px] font-bold" style={{ color: C.sky }}>부위별 진료</p>
              <h2 className="mt-3 text-[30px] font-bold tracking-[-0.04em] md:text-[46px]">어디가 불편하신가요</h2>
            </div>
            <p className="text-[15px]" style={{ color: C.sub }}>부위를 고르시면 해당 클리닉 진료 과정을 안내합니다.</p>
          </div>
          <ul className="mt-12 grid gap-px sm:grid-cols-2 lg:grid-cols-4" style={{ background: C.line }}>
            {PARTS.map((p) => (
              <li key={p.t} className="flex flex-col bg-white p-8">
                <p className="text-[13px] font-bold tracking-[0.1em]" style={{ color: C.sub }}>{p.c}</p>
                <h3 className="mt-2 text-[30px] font-bold tracking-[-0.04em]" style={{ color: C.navy }}>{p.t}</h3>
                <p className="mt-3 flex-1 text-[15px]" style={{ color: C.sub }}>{p.d}</p>
                <p className="mt-8 inline-flex items-center gap-1.5 text-[15px] font-bold" style={{ color: C.sky }}>
                  클리닉 보기 <ArrowRight size={16} aria-hidden />
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 md:px-10" style={{ background: C.soft }}>
        <div className="mx-auto grid max-w-[1280px] items-center gap-10 py-20 md:grid-cols-2 md:gap-16 md:py-28">
          <div className="grid grid-cols-2 gap-3">
            <div className="relative col-span-2 aspect-[16/9]">
              <Image src={`${IMG}/a-spine.jpg`} alt="추간판이 표시된 척추 모형" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
            </div>
            <div className="relative col-span-2 aspect-[16/7]">
              <Image src={`${IMG}/a-xray.jpg`} alt="어깨 관절 엑스레이 사진" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
            </div>
          </div>
          <div>
            <p className="text-[14px] font-bold" style={{ color: C.sky }}>비수술 치료 순서</p>
            <h2 className="mt-3 text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[40px]">진단, 치료, 재활을 한 곳에서</h2>
            <ol className="mt-8 grid gap-4">
              {[
                ["진단", "디지털 엑스레이, 근골격계 초음파로 당일 확인"],
                ["시술", "신경차단술, 증식치료, 체외충격파"],
                ["도수, 운동", "물리치료사 1:1 도수치료와 운동치료"],
                ["재검", "4주 단위로 통증과 움직임을 다시 확인"],
              ].map(([k, v], i) => (
                <li key={k} className="flex gap-5 border-b pb-4" style={{ borderColor: C.line }}>
                  <span className="w-8 shrink-0 text-[15px] font-bold tabular-nums" style={{ color: C.sky }}>0{i + 1}</span>
                  <div>
                    <p className="text-[18px] font-bold">{k}</p>
                    <p className="text-[15px]" style={{ color: C.sub }}>{v}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1280px] gap-10 md:grid-cols-[1fr_1.2fr] md:gap-16">
          <div>
            <p className="text-[14px] font-bold" style={{ color: C.sky }}>진료 안내</p>
            <h2 className="mt-3 text-[28px] font-bold tracking-[-0.04em] md:text-[40px]">진료시간</h2>
            <p className="mt-6 text-[34px] font-bold tabular-nums tracking-[-0.02em] md:text-[44px]" style={{ color: C.navy }}>02-000-0000</p>
            <p className="mt-2 text-[15px]" style={{ color: C.sub }}>서울특별시 송파구 일대, 지하철역 3번 출구 앞 건물 4층. 건물 주차 2시간 무료.</p>
          </div>
          <dl className="border-t-2" style={{ borderColor: C.navy }}>
            {[
              ["월, 수, 금", "09:00 ~ 18:30"],
              ["화, 목 (야간)", "09:00 ~ 20:30"],
              ["토요일", "09:00 ~ 14:00 (점심시간 없음)"],
              ["점심시간", "13:00 ~ 14:00"],
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

      <footer className="px-5 py-10 text-[14px] text-white/70 md:px-10" style={{ background: C.navy }}>
        <div className="mx-auto flex max-w-[1280px] flex-col gap-2 md:flex-row md:justify-between">
          <p>바른척추 정형외과의원, 서울특별시 송파구 일대</p>
          <p>대표전화 02-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
