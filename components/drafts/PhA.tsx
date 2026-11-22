"use client";

import Image from "next/image";
import { Clock } from "lucide-react";

// 약국 시안 A 동네 약국 운영형(11-22 사례 분석: 아임웹 약국 납품 사례는 드물고 바로팜 팜페이지 같은 약국 전용 틀이 운영 시간, 휴일 운영, 처방전 접수를 앞에 둔다. 동네 손님은 지금 열었는지, 일요일 문 여는지, 처방약이 있는지를 묻는다). 흰 바탕, 초록. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/ph/a-*)
const IMG = "/images/drafts/ph";
const C = { ink: "#14211b", sub: "#5b6862", line: "#e1eae5", soft: "#f1f7f3", green: "#1d7a4e", greenSoft: "#e1f2e8" };

const HOURS = [
  ["평일", "08:30 ~ 21:00"],
  ["토요일", "09:00 ~ 18:00"],
  ["일요일, 공휴일", "휴일지킴이약국 당번일 10:00 ~ 18:00"],
];

const ITEMS = [
  ["처방 조제", "인근 내과, 소아과, 이비인후과 처방 의약품 상시 구비"],
  ["일반 의약품", "감기약, 소화제, 진통제, 파스, 연고"],
  ["건강기능식품", "비타민, 유산균, 오메가3 성분 비교 상담"],
  ["의약외품", "마스크, 밴드, 소독용품, 체온계"],
];

export function PhA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[70px] max-w-[1200px] items-center justify-between px-5 md:px-8">
          <p className="text-[20px] font-bold tracking-[-0.03em]">
            <span style={{ color: C.green }}>초록</span> 약국
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#3f4a45" }}>
            {["운영 시간", "취급 품목", "처방전 접수", "오시는 길"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center rounded-full px-5 text-[15px] font-bold text-white" style={{ background: C.green }}>
            전화 문의
          </span>
        </div>
      </header>

      <section className="px-5 pb-16 pt-10 md:px-8 md:pb-24 md:pt-14">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
          <div>
            <p className="text-[15px] font-bold" style={{ color: C.green }}>평일 밤 9시까지</p>
            <h1 className="mt-4 text-[36px] font-bold leading-[1.24] tracking-[-0.045em] md:text-[56px]">
              진료 끝나고 와도
              <br />
              문 열려 있습니다
            </h1>
            <p className="mt-5 max-w-[460px] text-[17px] md:text-[18px]" style={{ color: C.sub }}>
              처방전 사진을 미리 보내 주시면 도착하실 때 약을 준비해 둡니다. 복용법은 약 봉투와 말로 한 번 더 설명합니다.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
            <Image src={`${IMG}/a-hero.jpg`} alt="약장 선반에 정리된 약병들" fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto grid max-w-[1200px] gap-10 md:grid-cols-[1fr_1.2fr] md:gap-16">
          <div>
            <h2 className="flex items-center gap-3 text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">
              <Clock size={30} style={{ color: C.green }} aria-hidden /> 운영 시간
            </h2>
            <p className="mt-3" style={{ color: C.sub }}>점심시간 없이 운영합니다.</p>
          </div>
          <dl className="overflow-hidden rounded-[22px] bg-white">
            {HOURS.map(([k, v]) => (
              <div key={k} className="grid gap-1 border-b px-6 py-5 last:border-b-0 sm:grid-cols-[150px_1fr] md:px-8" style={{ borderColor: C.line }}>
                <dt className="text-[18px] font-bold">{k}</dt>
                <dd className="text-[17px] font-semibold tabular-nums" style={{ color: C.green }}>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">취급 품목</h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {ITEMS.map(([t, d]) => (
              <li key={t} className="rounded-[22px] border p-7" style={{ borderColor: C.line }}>
                <h3 className="text-[21px] font-bold tracking-[-0.03em]">{t}</h3>
                <p className="mt-1" style={{ color: C.sub }}>{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto grid max-w-[1200px] gap-4 md:grid-cols-[1.1fr_1fr]">
          <div className="overflow-hidden rounded-[28px]" style={{ background: C.greenSoft }}>
            <div className="relative aspect-[16/9]">
              <Image src={`${IMG}/a-case.jpg`} alt="요일별 칸이 나뉜 주황색 약 보관함" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
            </div>
            <div className="p-8 md:p-10">
              <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">처방전 접수</h2>
              <ol className="mt-5 grid gap-2.5" style={{ color: C.sub }}>
                <li>1. 처방전 사진을 문자로 보내 주세요</li>
                <li>2. 조제가 끝나면 문자로 알려 드립니다</li>
                <li>3. 원본 처방전을 가져와 약을 받아 가세요</li>
              </ol>
            </div>
          </div>
          <div className="flex flex-col justify-between rounded-[28px] p-8 text-white md:p-10" style={{ background: C.green }}>
            <div>
              <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">오시는 길</h2>
              <p className="mt-3 text-white/80">상가 1층, 내과 건물 맞은편입니다. 건물 뒤 공영주차장 10분 무료.</p>
            </div>
            <p className="mt-8 text-[30px] font-bold tabular-nums tracking-[-0.02em]">02-000-0000</p>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 md:flex-row md:justify-between">
          <p>초록 약국, 서울특별시 동작구 일대. 약국 개설등록번호 제000호</p>
          <p>02-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
