"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

// 사진관 시안 B 가족, 기념 스튜디오(11-22 사례 분석: Logan Studio처럼 큰 사진 위 촬영 종류, 종류별 설명. 가족 손님은 촬영 시간, 의상, 보정 장수, 액자를 묻는다). 흰 바탕, 따뜻한 갈색. 인물 사진은 고객 자료로 교체. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/pho/b-*)
const IMG = "/images/drafts/pho";
const C = { ink: "#1e1a16", sub: "#6b635b", line: "#ece6df", soft: "#f7f4f0", brown: "#8b5e3c" };

const TYPES = [
  { t: "가족사진", d: "3대 가족, 형제 촬영", s: "촬영 60분, 보정 10컷, 액자 1점" },
  { t: "돌 기념", d: "돌상 소품 포함, 한복 대여", s: "촬영 90분, 보정 15컷, 앨범 1권" },
  { t: "기념일", d: "결혼기념, 칠순, 우정 촬영", s: "촬영 40분, 보정 6컷" },
  { t: "반려동물 동반", d: "가족과 함께 또는 단독", s: "촬영 40분, 보정 6컷" },
];

export function PhoB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="absolute inset-x-0 z-20 text-white">
        <div className="mx-auto flex h-[76px] max-w-[1280px] items-center justify-between px-5 md:px-10">
          <p className="text-[19px] font-bold tracking-[-0.02em]">볕 스튜디오</p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-medium text-white/85 lg:flex">
            {["촬영 종류", "스튜디오", "촬영 당일", "오시는 길"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-10 items-center rounded-full bg-white px-5 text-[14px] font-bold" style={{ color: C.ink }}>
            촬영 문의
          </span>
        </div>
      </header>

      <section className="relative flex min-h-[620px] items-end overflow-hidden text-white md:h-[92svh]">
        <Image src={`${IMG}/b-hero.jpg`} alt="거울과 감독 의자가 놓인 베이지톤 촬영 스튜디오" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-black/30" aria-hidden />
        <div className="relative mx-auto w-full max-w-[1280px] px-5 pb-14 md:px-10 md:pb-20">
          <p className="text-[15px] font-bold text-white/80">가족, 돌, 기념일 촬영</p>
          <h1 className="mt-3 text-[38px] font-bold leading-[1.22] tracking-[-0.045em] md:text-[66px]">
            오늘의 우리를
            <br />
            한 장에 남깁니다
          </h1>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1280px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">촬영 종류</h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TYPES.map((x) => (
              <li key={x.t} className="flex flex-col rounded-[22px] p-7" style={{ background: C.soft }}>
                <h3 className="text-[22px] font-bold tracking-[-0.03em]">{x.t}</h3>
                <p className="mt-1 flex-1 text-[15px]" style={{ color: C.sub }}>{x.d}</p>
                <p className="mt-6 border-t pt-4 text-[15px] font-semibold" style={{ borderColor: C.line, color: C.brown }}>{x.s}</p>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[15px]" style={{ color: C.sub }}>모든 촬영은 원본 전체를 당일 보여 드리고, 보정할 컷은 함께 고릅니다.</p>
        </div>
      </section>

      <section className="px-5 md:px-10">
        <div className="mx-auto grid max-w-[1280px] items-center gap-10 md:grid-cols-[1.15fr_1fr] md:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[24px]">
            <Image src={`${IMG}/b-set.jpg`} alt="큰 창으로 빛이 드는 흰 촬영실" fill sizes="(min-width: 768px) 55vw, 100vw" className="object-cover" />
          </div>
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">스튜디오</h2>
            <ul className="mt-7 grid gap-3">
              {[
                ["자연광 촬영실", "남향 창, 오전 촬영 추천"],
                ["배경지 6색", "흰색, 아이보리, 회색, 하늘색 외"],
                ["파우더룸", "아이 기저귀 교환대, 수유 공간"],
                ["의상", "가족 맞춤 니트와 셔츠 무료 대여"],
              ].map(([k, v]) => (
                <li key={k} className="flex justify-between gap-4 border-b pb-3" style={{ borderColor: C.line }}>
                  <span className="font-bold">{k}</span>
                  <span className="text-right" style={{ color: C.sub }}>{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1280px] gap-10 md:grid-cols-[1fr_1.15fr] md:gap-16">
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">촬영 당일 순서</h2>
            <ol className="mt-8 grid gap-5">
              {[
                ["의상, 소품 고르기", "도착 후 20분"],
                ["촬영", "종류별 40 ~ 90분, 중간 쉬는 시간"],
                ["원본 보기, 컷 고르기", "모니터로 함께 선택"],
                ["보정본, 액자 받기", "2주 뒤 문자 안내, 택배 가능"],
              ].map(([k, v], i) => (
                <li key={k} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[15px] font-bold text-white" style={{ background: C.brown }}>{i + 1}</span>
                  <div>
                    <p className="text-[18px] font-bold">{k}</p>
                    <p className="text-[15px]" style={{ color: C.sub }}>{v}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[22px]">
              <Image src={`${IMG}/b-frame.jpg`} alt="흰 벽 앞의 빈 나무 액자" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
            <div className="relative aspect-[3/4] overflow-hidden rounded-[22px]">
              <Image src={`${IMG}/b-camera.jpg`} alt="나무 테이블 위의 필름 카메라" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-10 md:pb-28">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-6 rounded-[28px] p-8 text-white md:flex-row md:items-center md:justify-between md:p-12" style={{ background: C.brown }}>
          <div>
            <h2 className="text-[26px] font-bold tracking-[-0.04em] md:text-[34px]">촬영 날짜 문의</h2>
            <p className="mt-2 text-white/75">화 ~ 일 10:00 ~ 19:00, 월요일 휴무. 주말은 2주 전에 마감됩니다.</p>
          </div>
          <div className="md:text-right">
            <p className="text-[30px] font-bold tabular-nums tracking-[-0.02em]">031-000-0000</p>
            <p className="inline-flex items-center gap-1.5 font-bold text-white/85">
              카카오톡 문의 <ArrowRight size={17} aria-hidden />
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-10" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1280px] flex-col gap-2 md:flex-row md:justify-between">
          <p>볕 스튜디오, 경기도 성남시 분당구 일대. 사업자등록번호 000-00-00000</p>
          <p>031-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
