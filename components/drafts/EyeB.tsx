"use client";

import Image from "next/image";
import { Clock, Phone } from "lucide-react";

// 안과 시안 B 동네 안과형(11-22 사례 분석: 동네 안과 손님은 결막염, 안구건조, 안경 처방으로 온다. 진료시간과 번호를 첫 화면에, 진료 과목 칸, 검사 전 준비물). 흰 바탕, 하늘색. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/eye/b-*)
const IMG = "/images/drafts/eye";
const C = { ink: "#13202a", sub: "#5c6a75", line: "#e3eaf0", soft: "#f2f6f9", blue: "#1677c9", blueSoft: "#e6f1fa" };

const DEPT = [
  ["안구건조증", "눈물막 검사, 마이봄샘 관리"],
  ["결막염과 다래끼", "당일 진료, 처방"],
  ["안경과 렌즈 처방", "정밀 굴절 검사 후 처방전"],
  ["소아 시력", "약시, 사시, 근시 진행 관리"],
  ["녹내장 검진", "안압과 시야 검사"],
  ["백내장 상담", "정밀검사 후 수술 병원 연계"],
];

export function EyeB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[70px] max-w-[1200px] items-center justify-between px-5 md:px-8">
          <p className="text-[20px] font-bold tracking-[-0.03em]">
            <span style={{ color: C.blue }}>밝은</span> 안과의원
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#3e4954" }}>
            {["진료시간", "진료 과목", "검사 안내", "오시는 길"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center rounded-full px-5 text-[15px] font-bold text-white" style={{ background: C.blue }}>
            전화 걸기
          </span>
        </div>
      </header>

      <section className="px-5 pb-14 pt-10 md:px-8 md:pb-20 md:pt-14">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
          <div>
            <p className="text-[15px] font-bold" style={{ color: C.blue }}>안과 전문의 진료</p>
            <h1 className="mt-4 text-[36px] font-bold leading-[1.24] tracking-[-0.045em] md:text-[56px]">
              눈이 불편한 날,
              <br />
              기다리지 않게
            </h1>
            <p className="mt-5 max-w-[460px] text-[17px] md:text-[18px]" style={{ color: C.sub }}>
              검사실 세 곳을 따로 두어 대기 시간을 줄였습니다. 어린이 시력 검사는 그림 시력표로 합니다.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
            <Image src={`${IMG}/b-hero.jpg`} alt="밝은 검사실의 자동 굴절 검사기" fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          </div>
        </div>
        <div className="mx-auto mt-6 grid max-w-[1200px] gap-3 md:grid-cols-[1.4fr_1fr]">
          <div className="rounded-[22px] p-6 md:p-7" style={{ background: C.blueSoft }}>
            <p className="flex items-center gap-2 text-[15px] font-bold" style={{ color: C.blue }}>
              <Clock size={18} aria-hidden /> 진료시간
            </p>
            <dl className="mt-3 grid gap-x-8 gap-y-1.5 sm:grid-cols-2">
              {[
                ["평일", "09:00 ~ 18:30"],
                ["토요일", "09:00 ~ 13:00"],
                ["점심", "13:00 ~ 14:00"],
                ["휴진", "일요일과 공휴일"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt style={{ color: C.sub }}>{k}</dt>
                  <dd className="font-bold tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="flex flex-col justify-center rounded-[22px] p-6 text-white md:p-7" style={{ background: C.blue }}>
            <p className="flex items-center gap-2 text-[15px] font-bold text-white/80">
              <Phone size={18} aria-hidden /> 대표번호
            </p>
            <p className="mt-1 text-[32px] font-bold tabular-nums tracking-[-0.02em]">02-000-0000</p>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">진료 과목</h2>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DEPT.map(([t, d]) => (
              <li key={t} className="rounded-[20px] bg-white p-6 md:p-7">
                <h3 className="text-[20px] font-bold tracking-[-0.03em]">{t}</h3>
                <p className="mt-1 text-[15px]" style={{ color: C.sub }}>{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 md:grid-cols-[1.1fr_1fr] md:gap-16">
          <div className="grid grid-cols-2 gap-3">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[22px]">
              <Image src={`${IMG}/b-room.jpg`} alt="검사실 벽에 걸린 굴절 검사기" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
            <div className="relative aspect-[3/4] overflow-hidden rounded-[22px]">
              <Image src={`${IMG}/b-glasses.jpg`} alt="나무 책상 위 메모지에 놓인 동그란 안경" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
          </div>
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">검사 오시기 전에</h2>
            <ul className="mt-7 grid gap-3">
              {[
                "소프트렌즈는 3일, 하드렌즈는 2주 전부터 빼 주세요",
                "지금 쓰는 안경과 먹는 약 목록을 가져와 주세요",
                "동공을 넓히는 검사 뒤에는 운전하실 수 없습니다",
                "만 6세 이하 어린이는 보호자와 함께 와 주세요",
              ].map((x) => (
                <li key={x} className="border-b pb-3" style={{ borderColor: C.line, color: C.sub }}>{x}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 md:flex-row md:justify-between">
          <p>밝은 안과의원, 서울특별시 노원구 일대, 상가 3층. 건물 주차 1시간 무료</p>
          <p>대표번호 02-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
