"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

// 스몰웨딩 시안 A 가든 하우스웨딩형(11-22 사례 분석: 해석, 웨딩스냅처럼 여백 넓은 흰 화면과 큰 사진, 문의 버튼 하나. 스몰웨딩 예비부부는 하객 몇 명까지, 하루 몇 번 예식인지, 패키지에 무엇이 들었는지, 비 오면 어디서 하는지를 묻는다). 흰 바탕, 올리브와 검정. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/wd/a-*)
const IMG = "/images/drafts/wd";
const C = { ink: "#171915", sub: "#666a62", line: "#e6e8e2", soft: "#f4f5f1", olive: "#59663a" };

const PACKS = [
  ["가든 30", "하객 30명까지", "정원 예식, 코스 식사, 꽃 장식"],
  ["가든 60", "하객 60명까지", "정원 예식, 뷔페, 꽃 장식, 사회자"],
  ["하우스 80", "하객 80명까지", "실내 홀, 코스 식사, 본식 스냅 2시간"],
];

export function WdA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="absolute inset-x-0 z-20 text-white">
        <div className="mx-auto flex h-[78px] max-w-[1320px] items-center justify-between px-5 md:px-10">
          <p className="text-[18px] font-bold tracking-[0.16em]">MEADOW HOUSE</p>
          <nav aria-label="주 메뉴" className="hidden gap-10 text-[15px] font-medium text-white/85 lg:flex">
            {["공간", "패키지", "하루 순서", "상담"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-10 items-center border border-white/70 px-5 text-[14px] font-bold">투어 예약 문의</span>
        </div>
      </header>

      <section className="relative flex min-h-[620px] items-end overflow-hidden bg-black text-white md:h-[96svh]">
        <Image src={`${IMG}/a-hero.jpg`} alt="잔디 정원에 줄지어 놓인 흰 예식 의자" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" aria-hidden />
        <div className="relative mx-auto flex w-full max-w-[1320px] flex-col gap-6 px-5 pb-16 md:flex-row md:items-end md:justify-between md:px-10 md:pb-24">
          <h1 className="text-[38px] font-bold leading-[1.22] tracking-[-0.045em] md:text-[68px]">
            하루 한 쌍,
            <br />
            정원을 통째로
          </h1>
          <p className="max-w-[360px] text-white/80">예식은 하루 한 번만 엽니다. 앞뒤 예식에 쫓기지 않고 하객과 오후 내내 머무실 수 있습니다.</p>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1320px]">
          <h2 className="text-[32px] font-bold tracking-[-0.04em] md:text-[46px]">패키지</h2>
          <ul className="mt-12 border-t" style={{ borderColor: C.ink }}>
            {PACKS.map(([t, n, d]) => (
              <li key={t} className="grid gap-1 border-b py-6 md:grid-cols-[0.8fr_0.8fr_2fr_auto] md:items-center md:gap-8" style={{ borderColor: C.line }}>
                <h3 className="text-[24px] font-bold tracking-[-0.03em]">{t}</h3>
                <p className="font-bold" style={{ color: C.olive }}>{n}</p>
                <p style={{ color: C.sub }}>{d}</p>
                <ArrowRight size={20} className="hidden md:block" aria-hidden />
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[15px]" style={{ color: C.sub }}>모든 패키지에 신부 대기실, 혼주 대기실, 주차 40대가 포함됩니다.</p>
        </div>
      </section>

      <section className="px-5 md:px-10" style={{ background: C.soft }}>
        <div className="mx-auto grid max-w-[1320px] gap-3 py-20 md:grid-cols-2 md:py-28">
          {[
            { f: "a-table", alt: "촛불과 꽃이 놓인 긴 연회 테이블", t: "하우스 홀", d: "통창 실내 홀, 긴 테이블 연회, 비 오는 날 예식 장소" },
            { f: "a-bouquet", alt: "노을빛 들판 앞 분홍 장미 부케", t: "꽃 장식", d: "계절 꽃으로 버진로드, 테이블, 부케까지 한 플로리스트가" },
          ].map((x) => (
            <div key={x.t} className="bg-white">
              <div className="relative aspect-[16/9]">
                <Image src={`${IMG}/${x.f}.jpg`} alt={x.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
              </div>
              <div className="p-7 md:p-9">
                <h3 className="text-[24px] font-bold tracking-[-0.03em]">{x.t}</h3>
                <p className="mt-2" style={{ color: C.sub }}>{x.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1320px] gap-10 md:grid-cols-[1.2fr_1fr] md:gap-16">
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">하루 순서</h2>
            <dl className="mt-7 border-t" style={{ borderColor: C.ink }}>
              {[
                ["11:00", "신랑 신부 도착, 메이크업 마무리"],
                ["13:00", "하객 맞이, 웰컴 드링크"],
                ["14:00", "정원 예식 40분"],
                ["15:00", "하우스 홀 식사와 축하 공연"],
                ["17:30", "마무리와 정원 사진"],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[72px_1fr] gap-3 border-b py-4" style={{ borderColor: C.line }}>
                  <dt className="font-bold tabular-nums">{k}</dt>
                  <dd style={{ color: C.sub }}>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="flex flex-col justify-between gap-8 p-8 text-white md:p-10" style={{ background: C.olive }}>
            <div>
              <h3 className="text-[24px] font-bold tracking-[-0.03em]">투어 상담</h3>
              <p className="mt-3 text-white/85">평일 오후, 예식이 없는 날 정원과 홀을 직접 보여 드립니다. 날짜, 예상 하객 수를 알려 주세요.</p>
            </div>
            <p className="text-[28px] font-bold tabular-nums">031-000-0000</p>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-10" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2 md:flex-row md:justify-between">
          <p>MEADOW HOUSE 메도우하우스, 경기도 양평군 일대. 사업자등록번호 000-00-00000</p>
          <p>031-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
