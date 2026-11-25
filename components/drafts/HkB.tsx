"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

// 가격 시세 확인(11-25): 약과 3,800원부터(서촌 공방 당근 프로필). 라테, 에이드는 출처 못 찾아 예시값.
// 한옥 카페 시안 B 한옥 커피형(11-22 사례 분석: 한옥 스테이, 카페 사례처럼 사진을 크게 두고 공간 이야기를 짧게. 한옥 커피집 손님은 시그니처 음료, 자리(창가, 툇마루), 사진 찍기 좋은 시간을 묻는다). 흰 바탕, 검정과 갈색. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/hk/b-*)
const IMG = "/images/drafts/hk";
const C = { ink: "#161412", sub: "#67625c", line: "#e8e4de", soft: "#f5f3f0", brown: "#7a4a26" };

const MENU = [
  ["흑임자 크림 라테", "볶은 흑임자 크림, 에스프레소", "7,000원"],
  ["쑥 라테", "강화 사자발쑥, 우유", "6,500원"],
  ["유자 에이드", "고흥 유자청을 직접 담급니다", "6,500원"],
  ["약과 휘낭시에", "조청을 바른 구움과자", "3,800원"],
];

export function HkB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between px-5 md:px-10">
          <p className="text-[19px] font-bold tracking-[0.04em]">
            툇마루 <span style={{ color: C.brown }}>커피</span>
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#4a4540" }}>
            {["메뉴", "자리", "이용 안내", "오시는 길"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center px-5 text-[15px] font-bold text-white" style={{ background: C.ink }}>
            오시는 길
          </span>
        </div>
      </header>

      <section className="px-5 pt-12 md:px-10 md:pt-20">
        <div className="mx-auto max-w-[1320px]">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h1 className="text-[38px] font-bold leading-[1.2] tracking-[-0.05em] md:text-[72px]">
              기와 담장 너머로
              <br />
              커피를 내립니다
            </h1>
            <p className="max-w-[380px]" style={{ color: C.sub }}>
              ㄱ자 한옥 한 채, 툇마루 자리 열 개. 오후 네 시쯤 볕이 마루 끝까지 들어옵니다.
            </p>
          </div>
          <div className="relative mt-10 aspect-[4/3] overflow-hidden md:aspect-[21/9]">
            <Image src={`${IMG}/b-hero.jpg`} alt="나무 그늘 아래 기와 담장과 한옥" fill priority sizes="100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1320px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">시그니처</h2>
          <ul className="mt-10 border-t" style={{ borderColor: C.ink }}>
            {MENU.map(([t, d, p]) => (
              <li key={t} className="grid gap-1 border-b py-6 md:grid-cols-[1.2fr_1.6fr_0.6fr_auto] md:items-center md:gap-6" style={{ borderColor: C.line }}>
                <h3 className="text-[23px] font-bold tracking-[-0.03em]">{t}</h3>
                <p style={{ color: C.sub }}>{d}</p>
                <p className="font-bold tabular-nums" style={{ color: C.brown }}>{p}</p>
                <ArrowRight size={20} className="hidden md:block" aria-hidden />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 md:px-10" style={{ background: C.soft }}>
        <div className="mx-auto grid max-w-[1320px] items-center gap-10 py-20 md:grid-cols-2 md:gap-16 md:py-28">
          <div className="grid grid-cols-2 gap-3">
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image src={`${IMG}/b-window.jpg`} alt="나무 문살 창가에 놓인 커피와 구움과자" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image src={`${IMG}/b-eaves.jpg`} alt="파란 하늘 아래 단청 처마 끝" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
          </div>
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">자리</h2>
            <ol className="mt-7 grid gap-4">
              {[
                ["툇마루", "마당을 보고 나란히 앉는 10석"],
                ["안방 창가", "문살 창 앞 2인석 4개"],
                ["별채", "6인 테이블 하나, 모임 자리"],
              ].map(([k, v], i) => (
                <li key={k} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center text-[15px] font-bold text-white" style={{ background: C.brown }}>{i + 1}</span>
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
        <div className="mx-auto flex max-w-[1320px] flex-col gap-6 bg-black p-8 text-white md:flex-row md:items-center md:justify-between md:p-12">
          <div>
            <h2 className="text-[26px] font-bold tracking-[-0.04em] md:text-[34px]">이용 안내</h2>
            <p className="mt-2 text-white/70">매일 10:00 ~ 21:00, 화요일 쉽니다. 신발을 벗고 들어오는 자리는 툇마루와 안방입니다. 전주 한옥마을 경기전 뒷길.</p>
          </div>
          <p className="inline-flex shrink-0 items-center gap-2 text-[22px] font-bold tabular-nums" style={{ color: "#c79a6b" }}>
            063-000-0000 <ArrowRight size={20} aria-hidden />
          </p>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-10" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2 md:flex-row md:justify-between">
          <p>툇마루 커피, 전북특별자치도 전주시 완산구 일대. 사업자등록번호 000-00-00000</p>
          <p>063-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
