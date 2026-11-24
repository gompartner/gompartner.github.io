"use client";

import Image from "next/image";
import { Bus } from "lucide-react";

// 운전 학원 시안 A 전문학원 면허 취득형(11-22 사례 분석: 오성자동차운전면허학원처럼 자체 시험, 면허 종류 칸을 앞에 둔다. 합격률 숫자 대신 법정 교육 시간과 등록 순서, 셔틀을 보여 준다). 흰 바탕, 남색과 노랑. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/drv/a-*)
const IMG = "/images/drafts/drv";
const C = { ink: "#101a2e", sub: "#5b6577", line: "#e2e6ee", soft: "#f2f4f8", navy: "#142a5c", yellow: "#f5b800" };

const LICENSES = [
  ["2종 보통", "승용차와 자동 변속기", "가장 많이 따는 면허"],
  ["1종 보통", "승합 15인 이하, 화물 12톤 미만", "수동 변속기 트럭"],
  ["1종 대형", "버스와 대형 화물", "1종 보통 1년 이상 경력"],
  ["2종 소형", "125cc 초과 이륜차", "장내 기능 연습장 별도"],
];

export function DrvA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="absolute inset-x-0 z-20 text-white">
        <div className="mx-auto flex h-[78px] max-w-[1320px] items-center justify-between px-5 md:px-10">
          <p className="text-[18px] font-bold tracking-[-0.02em]">
            한강 <span style={{ color: C.yellow }}>자동차운전전문학원</span>
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-10 text-[15px] font-medium text-white/85 lg:flex">
            {["면허 종류", "교육 과정", "등록 안내", "셔틀"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="hidden h-10 items-center px-5 text-[14px] font-bold sm:inline-flex" style={{ background: C.yellow, color: C.ink }}>
            등록 상담
          </span>
        </div>
      </header>

      <section className="relative flex min-h-[600px] items-end overflow-hidden bg-black text-white md:h-[90svh]">
        <Image src={`${IMG}/a-hero.jpg`} alt="노면 표시가 그려진 텅 빈 도로" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/40" aria-hidden />
        <div className="relative mx-auto w-full max-w-[1320px] px-5 pb-16 md:px-10 md:pb-24">
          <p className="text-[14px] font-bold tracking-[0.2em]" style={{ color: C.yellow }}>경찰청 지정 전문학원</p>
          <h1 className="mt-5 text-[40px] font-bold leading-[1.2] tracking-[-0.045em] md:text-[76px]">
            배운 코스에서
            <br />
            그대로 시험 봅니다
          </h1>
          <p className="mt-6 max-w-[520px] text-white/75">장내 기능과 도로 주행 시험을 학원 안에서 치릅니다. 운전면허시험장에 따로 갈 필요가 없습니다.</p>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1320px]">
          <h2 className="text-[32px] font-bold tracking-[-0.04em] md:text-[46px]">면허 종류</h2>
          <ul className="mt-12 grid gap-px sm:grid-cols-2 lg:grid-cols-4" style={{ background: C.line }}>
            {LICENSES.map(([t, car, d]) => (
              <li key={t} className="bg-white p-6 md:p-8">
                <h3 className="text-[24px] font-bold tracking-[-0.03em]">{t}</h3>
                <p className="mt-2 font-semibold" style={{ color: C.navy }}>{car}</p>
                <p className="mt-1 text-[15px]" style={{ color: C.sub }}>{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 md:px-10" style={{ background: C.soft }}>
        <div className="mx-auto grid max-w-[1320px] items-center gap-10 py-20 md:grid-cols-2 md:gap-16 md:py-28">
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">보통 면허 교육 과정</h2>
            <p className="mt-3" style={{ color: C.sub }}>1종, 2종 보통 면허 기준 법정 교육 시간입니다.</p>
            <ol className="mt-7 grid gap-4">
              {[
                ["학과 교육", "5시간", "교통 법규, 안전 운전 이론"],
                ["장내 기능", "4시간", "출발, 경사로, 직각 주행, 가속 구간"],
                ["도로 주행", "6시간", "지정 코스 4개 중 시험 당일 추첨"],
              ].map(([k, h, d], i) => (
                <li key={k} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center text-[15px] font-bold" style={{ background: C.navy, color: "#fff" }}>{i + 1}</span>
                  <div>
                    <p className="text-[18px] font-bold">
                      {k} <span className="tabular-nums" style={{ color: C.navy }}>{h}</span>
                    </p>
                    <p className="text-[15px]" style={{ color: C.sub }}>{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image src={`${IMG}/a-cones.jpg`} alt="도로 가장자리에 줄지어 세운 노란 안전 표지" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image src={`${IMG}/a-cone.jpg`} alt="젖은 아스팔트 위에 놓인 주황색 라바콘" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1320px] gap-4 md:grid-cols-2">
          <div className="border p-8 md:p-10" style={{ borderColor: C.line }}>
            <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">등록할 때 가져올 것</h2>
            <ul className="mt-5 grid gap-2.5" style={{ color: C.sub }}>
              <li className="border-b pb-2.5" style={{ borderColor: C.line }}>신분증(주민등록증, 여권)</li>
              <li className="border-b pb-2.5" style={{ borderColor: C.line }}>컬러 증명사진 3장(3.5 x 4.5cm)</li>
              <li className="border-b pb-2.5" style={{ borderColor: C.line }}>신체검사는 학원 안 검진실에서 받습니다</li>
              <li>교통안전교육 1시간은 첫날 학과 교육에 포함</li>
            </ul>
          </div>
          <div className="flex flex-col justify-between gap-8 p-8 text-white md:p-10" style={{ background: C.navy }}>
            <div>
              <p className="flex items-center gap-2 text-[15px] font-bold text-white/80">
                <Bus size={18} aria-hidden /> 무료 셔틀
              </p>
              <h2 className="mt-3 text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">역과 아파트 단지를 돕니다</h2>
              <ul className="mt-5 grid gap-2 text-white/80">
                <li>1호차 김포공항역, 개화산역 방면</li>
                <li>2호차 마곡나루역, 발산역 방면</li>
                <li>평일 08:30부터 30분 간격</li>
              </ul>
            </div>
            <p className="text-[28px] font-bold tabular-nums" style={{ color: C.yellow }}>02-000-0000</p>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-10" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2 md:flex-row md:justify-between">
          <p>한강 자동차운전전문학원, 서울특별시 강서구 일대. 전문학원 지정번호 제000호</p>
          <p>02-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
