"use client";

import Image from "next/image";
import { Wifi } from "lucide-react";

// 공유오피스 시안 A 코워킹형(11-22 사례 분석: 공간앤톡, 이스트라운지처럼 깔끔한 사진과 짧은 정보. 프리랜서, 소규모 팀은 좌석 종류별 월 이용료, 24시간 출입, 회의실 시간, 주소 등록을 묻는다). 흰 바탕, 검정과 초록. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/cw/a-*)
const IMG = "/images/drafts/cw";
const C = { ink: "#121614", sub: "#5f6763", line: "#e3e8e5", soft: "#f2f5f3", green: "#1f6b47" };

const PLANS = [
  ["자유석", "라운지 빈자리 이용", "월 19만 원"],
  ["고정석", "내 책상, 잠금 서랍", "월 29만 원"],
  ["1인실", "문 닫히는 방, 책상 2개까지", "월 55만 원"],
  ["4인실", "팀 사무실, 창가", "월 140만 원"],
];

export function CwA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between px-5 md:px-10">
          <p className="text-[19px] font-bold tracking-[0.06em]">
            DESK <span style={{ color: C.green }}>&amp; DOOR</span>
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#444b47" }}>
            {["좌석", "포함 사항", "회의실", "투어"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center px-5 text-[15px] font-bold text-white" style={{ background: C.green }}>
            공간 투어
          </span>
        </div>
      </header>

      <section className="px-5 pt-12 md:px-10 md:pt-20">
        <div className="mx-auto max-w-[1320px]">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h1 className="text-[38px] font-bold leading-[1.2] tracking-[-0.05em] md:text-[72px]">
              책상 하나부터
              <br />
              팀 사무실까지
            </h1>
            <p className="max-w-[380px]" style={{ color: C.sub }}>
              선릉역 3분, 9층 한 층 전체. 한 달 단위로 계약하고 언제든 큰 방으로 옮길 수 있습니다.
            </p>
          </div>
          <div className="relative mt-10 aspect-[4/3] overflow-hidden md:aspect-[21/9]">
            <Image src={`${IMG}/a-hero.jpg`} alt="큰 창 앞 긴 나무 바 책상과 의자" fill priority sizes="100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1320px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">좌석</h2>
          <ul className="mt-10 grid gap-px sm:grid-cols-2 lg:grid-cols-4" style={{ background: C.line }}>
            {PLANS.map(([t, d, p]) => (
              <li key={t} className="flex flex-col bg-white p-6 md:p-8">
                <h3 className="text-[23px] font-bold tracking-[-0.03em]">{t}</h3>
                <p className="mt-1 text-[15px]" style={{ color: C.sub }}>{d}</p>
                <p className="mt-6 text-[20px] font-bold tabular-nums" style={{ color: C.green }}>{p}</p>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[15px]" style={{ color: C.sub }}>부가세 별도, 보증금은 한 달 이용료입니다.</p>
        </div>
      </section>

      <section className="px-5 md:px-10" style={{ background: C.soft }}>
        <div className="mx-auto grid max-w-[1320px] items-center gap-10 py-20 md:grid-cols-2 md:gap-16 md:py-28">
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image src={`${IMG}/a-desk.jpg`} alt="칸막이 없는 밝은 사무 공간의 책상들" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
          <div>
            <h2 className="flex items-center gap-3 text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">
              <Wifi size={28} style={{ color: C.green }} aria-hidden /> 포함 사항
            </h2>
            <ul className="mt-7 flex flex-wrap gap-2">
              {["24시간 출입", "기가 와이파이", "복합기", "커피, 차", "개인 사물함", "택배 수령", "폰부스 4개", "샤워실"].map((m) => (
                <li key={m} className="rounded-full border bg-white px-4 py-1.5 font-semibold" style={{ borderColor: C.line }}>{m}</li>
              ))}
            </ul>
            <p className="mt-6 text-[15px]" style={{ color: C.sub }}>고정석 이상은 사업자 주소로 등록할 수 있습니다.</p>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1320px] gap-10 md:grid-cols-[1.2fr_1fr] md:gap-16">
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">회의실</h2>
            <dl className="mt-7 border-t" style={{ borderColor: C.ink }}>
              {[
                ["4인실", "TV 모니터, 월 8시간 무료"],
                ["8인실", "화이트보드, 화상 회의 카메라"],
                ["세미나룸", "20석, 빔프로젝터, 시간당 대여"],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[100px_1fr] gap-3 border-b py-4" style={{ borderColor: C.line }}>
                  <dt className="font-bold">{k}</dt>
                  <dd style={{ color: C.sub }}>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="flex flex-col bg-black text-white">
            <div className="relative aspect-[16/9]">
              <Image src={`${IMG}/a-meet.jpg`} alt="창가 원목 테이블이 있는 회의실" fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
            </div>
            <div className="p-8">
              <h3 className="text-[22px] font-bold">공간 투어 15분</h3>
              <p className="mt-2 text-white/70">평일 10:00 ~ 19:00, 전화로 시간을 정하고 오시면 빈 자리를 직접 보여 드립니다.</p>
              <p className="mt-5 text-[26px] font-bold tabular-nums">02-000-0000</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-10" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2 md:flex-row md:justify-between">
          <p>DESK &amp; DOOR 데스크앤도어, 서울특별시 강남구 일대. 사업자등록번호 000-00-00000</p>
          <p>02-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
