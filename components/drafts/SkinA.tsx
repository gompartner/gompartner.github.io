"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { MonthSchedule } from "./MonthSchedule";

// 피부과 시안 A 프리미엄 미니멀(11-21 사례 분석: 실제 병원 사이트는 밝은 사진과 한 줄 진료 철학, 로고 아래 진료 과목 탭, 진료일정을 둔다). 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/skin/a-*)
const IMG = "/images/drafts/skin";
const C = { ink: "#1f1d1b", sub: "#6e6a65", line: "#e8e5e1", soft: "#f3f2f0", sage: "#7d8f7a" };

const CARE = [
  { en: "MEDICAL", t: "피부 질환", d: "여드름, 아토피, 습진, 두드러기를 건강보험으로 진료합니다." },
  { en: "LIFTING", t: "탄력, 리프팅", d: "피부 두께와 처짐 정도를 측정한 뒤 장비와 횟수를 정합니다." },
  { en: "PIGMENT", t: "기미, 색소", d: "색소의 깊이를 먼저 진단하고 레이저 종류를 고릅니다." },
  { en: "SCAR", t: "흉터, 모공", d: "흉터 종류별로 시술을 나눠 단계별로 진행합니다." },
];

export function SkinA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="border-b bg-white" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[76px] max-w-[1280px] items-center justify-between px-5 md:px-10">
          <p className="flex items-baseline gap-2">
            <span className="text-[20px] font-bold tracking-[-0.02em]">맑은결피부과의원</span>
            <span className="text-[11px] font-bold tracking-[0.22em]" style={{ color: C.sage }}>DERMATOLOGY</span>
          </p>
          <span className="text-[15px] font-bold tabular-nums">02-000-0000</span>
        </div>
        <nav aria-label="진료 과목" className="mx-auto hidden max-w-[1280px] gap-0 border-t px-10 text-[15px] font-medium md:flex" style={{ borderColor: C.line }}>
          {["병원 소개", "피부 질환", "리프팅", "색소, 기미", "흉터, 모공", "진료 안내", "오시는 길"].map((m, i) => (
            <span key={m} className="flex-1 py-3.5 text-center" style={{ color: i === 0 ? C.ink : C.sub }}>{m}</span>
          ))}
        </nav>
      </header>

      <section className="px-5 md:px-10" style={{ background: C.soft }}>
        <div className="mx-auto grid max-w-[1280px] items-center gap-10 py-14 lg:grid-cols-[1fr_1.2fr] lg:gap-16 lg:py-0">
          <div className="lg:py-28">
            <p className="text-[13px] font-bold tracking-[0.24em]" style={{ color: C.sage }}>SKIN, AS IT SHOULD BE</p>
            <h1 className="mt-6 text-[38px] font-bold leading-[1.25] tracking-[-0.04em] md:text-[60px]">
              피부는 진단이
              <br />
              먼저입니다
            </h1>
            <p className="mt-6 max-w-[440px] text-[16px] md:text-[18px]" style={{ color: C.sub }}>
              같은 기미도 깊이에 따라 치료가 다릅니다. 피부 측정 결과를 보여 드리고, 필요한 시술만 권합니다.
            </p>
            <span className="mt-10 inline-flex h-[54px] items-center gap-2 px-7 font-bold text-white" style={{ background: C.ink }}>
              진료 예약
              <ArrowRight size={18} aria-hidden />
            </span>
          </div>
          <div className="relative aspect-[4/3] lg:aspect-[5/6]">
            <Image src={`${IMG}/a-hero.jpg`} alt="밝은 배경 위에 놓인 흰 화장품 병들" fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1280px]">
          <p className="text-[13px] font-bold tracking-[0.24em]" style={{ color: C.sage }}>TREATMENTS</p>
          <h2 className="mt-4 text-[30px] font-bold tracking-[-0.03em] md:text-[46px]">진료 과목</h2>
          <ul className="mt-14 grid gap-px md:grid-cols-4" style={{ background: C.line }}>
            {CARE.map((c) => (
              <li key={c.en} className="bg-white p-7 md:p-8">
                <p className="text-[12px] font-bold tracking-[0.22em]" style={{ color: C.sage }}>{c.en}</p>
                <h3 className="mt-3 text-[24px] font-bold tracking-[-0.03em]">{c.t}</h3>
                <p className="mt-3 text-[15px]" style={{ color: C.sub }}>{c.d}</p>
                <p className="mt-8 inline-flex items-center gap-1 text-[14px] font-bold">
                  자세히 보기 <ArrowRight size={15} aria-hidden />
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 md:px-10">
        <div className="mx-auto grid max-w-[1280px] gap-5 md:grid-cols-[1fr_1.3fr]">
          <div className="flex flex-col justify-center gap-6 p-8 md:p-12" style={{ background: C.soft }}>
            <p className="text-[13px] font-bold tracking-[0.24em]" style={{ color: C.sage }}>CONSULTATION</p>
            <h2 className="text-[28px] font-bold leading-[1.4] tracking-[-0.03em] md:text-[36px]">
              시술 전 상담은
              <br />
              원장이 직접 합니다
            </h2>
            <p style={{ color: C.sub }}>피부 측정 사진과 예상 횟수, 비용을 상담지에 적어 드립니다. 당일 시술을 권하지 않습니다.</p>
          </div>
          <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[480px]">
            <Image src={`${IMG}/a-product.jpg`} alt="트레이 위에 정돈된 스킨케어 제품" fill sizes="(min-width: 768px) 55vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto grid max-w-[1280px] gap-8 lg:grid-cols-[1fr_1.4fr] lg:items-center lg:gap-16">
          <div>
            <p className="text-[13px] font-bold tracking-[0.24em]" style={{ color: C.sage }}>HOURS</p>
            <h2 className="mt-4 text-[30px] font-bold tracking-[-0.03em] md:text-[42px]">진료 시간</h2>
            <dl className="mt-8 border-t" style={{ borderColor: C.ink }}>
              {[
                ["평일", "10:00 ~ 19:00"],
                ["화, 목 야간", "10:00 ~ 21:00"],
                ["토요일", "10:00 ~ 15:00"],
                ["점심시간", "13:00 ~ 14:00"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b py-4" style={{ borderColor: C.line }}>
                  <dt style={{ color: C.sub }}>{k}</dt>
                  <dd className="font-bold tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="border" style={{ borderColor: C.line }}>
            <MonthSchedule accent="#b4533b" night={C.sage} rounded={0} />
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-10" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1280px] flex-col gap-2 md:flex-row md:justify-between">
          <p>맑은결피부과의원, 서울특별시 강남구 신사동 일대, 피부과 전문의 진료</p>
          <p>예약 문의 02-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
