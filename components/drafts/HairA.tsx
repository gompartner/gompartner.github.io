"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

// 미용실 시안 A 프리미엄 살롱형(11-21 사례 분석: IPS HAIR처럼 큰 사진 한 장과 얇은 글씨, 머리글에 가격과 예약 메뉴. 인물 대신 공간 사진과 시술 메뉴로 채운다). 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/hair/a-*)
const IMG = "/images/drafts/hair";
const C = { ink: "#121614", sub: "#6a706c", line: "#e4e7e5", soft: "#f2f4f3", green: "#1f3a32" };

const MENU = [
  { t: "CUT", k: "커트", d: "두상과 모류를 보고 손질이 쉬운 길이로", p: "35,000 ~" },
  { t: "PERM", k: "펌", d: "열펌, 볼륨매직, 다운펌", p: "120,000 ~" },
  { t: "COLOR", k: "컬러", d: "새치 커버부터 탈색 후 디자인 컬러까지", p: "90,000 ~" },
  { t: "CARE", k: "클리닉", d: "모발 진단 후 단백질, 수분 케어", p: "60,000 ~" },
];

export function HairA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="absolute inset-x-0 z-20 text-white">
        <div className="mx-auto flex h-[78px] max-w-[1320px] items-center justify-between px-5 md:px-10">
          <p className="text-[17px] font-bold tracking-[0.3em]">헤어담</p>
          <nav aria-label="주 메뉴" className="hidden gap-10 text-[14px] font-medium tracking-[0.14em] text-white/85 lg:flex">
            {["ABOUT", "PRICE", "SPACE", "BOOKING"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-10 items-center border border-white/70 px-5 text-[14px] font-bold">예약 문의</span>
        </div>
      </header>

      <section className="relative flex min-h-[640px] items-end overflow-hidden text-white md:h-[100svh]">
        <Image src={`${IMG}/a-hero.jpg`} alt="둥근 거울에 비친 살롱 의자와 밝은 창" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.7) 100%)" }} aria-hidden />
        <div className="relative mx-auto flex w-full max-w-[1320px] flex-col gap-8 px-5 pb-16 md:flex-row md:items-end md:justify-between md:px-10 md:pb-24">
          <h1 className="text-[40px] font-bold leading-[1.2] tracking-[-0.04em] md:text-[72px]">
            손질은 쉽게,
            <br />
            모양은 오래
          </h1>
          <p className="max-w-[380px] text-[16px] text-white/85 md:text-[17px]">한 시간에 한 분만 예약을 받습니다. 상담부터 마무리 스타일링까지 같은 디자이너가 맡습니다.</p>
        </div>
      </section>

      <section className="px-5 py-24 md:px-10 md:py-36">
        <div className="mx-auto max-w-[1320px]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[13px] font-bold tracking-[0.28em]" style={{ color: C.sub }}>PRICE</p>
              <h2 className="mt-4 text-[32px] font-bold tracking-[-0.04em] md:text-[50px]">시술 메뉴</h2>
            </div>
            <p className="text-[15px]" style={{ color: C.sub }}>기장과 모발 상태에 따라 상담 후 확정합니다. 디자이너 지정 비용은 없습니다.</p>
          </div>
          <ul className="mt-14 grid gap-px md:grid-cols-4" style={{ background: C.line }}>
            {MENU.map((m) => (
              <li key={m.t} className="flex flex-col bg-white p-8">
                <p className="text-[13px] font-bold tracking-[0.24em]" style={{ color: C.sub }}>{m.t}</p>
                <h3 className="mt-3 text-[26px] font-bold tracking-[-0.03em]">{m.k}</h3>
                <p className="mt-2 flex-1 text-[15px]" style={{ color: C.sub }}>{m.d}</p>
                <p className="mt-8 text-[22px] font-bold tabular-nums">{m.p}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 md:px-10" style={{ background: C.green }}>
        <div className="mx-auto grid max-w-[1320px] gap-4 py-20 md:grid-cols-[1.2fr_1fr] md:py-28">
          <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[560px]">
            <Image src={`${IMG}/a-shelf.jpg`} alt="밝은 창가의 거울과 의자, 제품 선반" fill sizes="(min-width: 768px) 55vw, 100vw" className="object-cover" />
          </div>
          <div className="grid gap-4">
            <div className="relative aspect-[4/3] md:aspect-auto">
              <Image src={`${IMG}/a-wash.jpg`} alt="검은 가죽 샴푸 의자" fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
            </div>
            <div className="flex flex-col justify-center p-8 text-white md:p-10" style={{ background: "rgba(255,255,255,0.06)" }}>
              <p className="text-[13px] font-bold tracking-[0.28em] text-white/55">SPACE</p>
              <h2 className="mt-3 text-[26px] font-bold leading-[1.4] tracking-[-0.03em] md:text-[32px]">의자 네 개, 샴푸실은 따로</h2>
              <p className="mt-3 text-white/70">옆 손님과 거리를 두고 앉습니다. 샴푸는 누워서 받는 별도 공간에서 합니다.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto grid max-w-[1320px] gap-12 md:grid-cols-2 md:gap-16">
          <div>
            <p className="text-[13px] font-bold tracking-[0.28em]" style={{ color: C.sub }}>BOOKING</p>
            <h2 className="mt-4 text-[32px] font-bold leading-[1.3] tracking-[-0.04em] md:text-[46px]">
              원하는 사진 한 장이면
              <br />
              상담이 빨라집니다
            </h2>
            <span className="mt-10 inline-flex h-[56px] items-center gap-2 px-8 text-[16px] font-bold text-white" style={{ background: C.ink }}>
              예약 문의
              <ArrowRight size={18} aria-hidden />
            </span>
          </div>
          <dl className="self-end border-t" style={{ borderColor: C.ink }}>
            {[
              ["화 ~ 금", "11:00 ~ 21:00"],
              ["토, 일", "10:00 ~ 19:00"],
              ["정기 휴무", "매주 월요일"],
              ["주차", "건물 지하 2시간 무료"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b py-4" style={{ borderColor: C.line }}>
                <dt style={{ color: C.sub }}>{k}</dt>
                <dd className="font-bold tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-10" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2 md:flex-row md:justify-between">
          <p>헤어담, 서울특별시 강남구 신사동 일대</p>
          <p>예약 문의 02-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
