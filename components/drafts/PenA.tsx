"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

// 펜션 시안 A 바다 전망형(11-22 사례 분석: 아임웹 펜션 납품 사례는 야경 첫 화면, 객실 미리보기, 부대시설(수영장, 스파, 바비큐), 갤러리, 오시는 길 순서. 손님은 객실 인원, 바다가 보이는지, 입실과 퇴실 시간, 바비큐를 묻는다). 흰 바탕에 어두운 첫 화면, 남색. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/pen/a-*)
const IMG = "/images/drafts/pen";
const C = { ink: "#0f1824", sub: "#5c6573", line: "#e3e7ed", soft: "#f2f5f8", navy: "#173a63", sand: "#d8b77a" };

const ROOMS = [
  ["윤슬", "2인 기준, 최대 3인", "33㎡, 정면 바다, 스파 욕조"],
  ["물마루", "2인 기준, 최대 4인", "40㎡, 복층, 테라스"],
  ["너울", "4인 기준, 최대 6인", "56㎡, 방 2개, 개별 바비큐"],
  ["갯바람", "6인 기준, 최대 8인", "72㎡, 독채, 단체 바비큐장 옆"],
];

export function PenA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="absolute inset-x-0 z-20 text-white">
        <div className="mx-auto flex h-[78px] max-w-[1320px] items-center justify-between px-5 md:px-10">
          <p className="text-[18px] font-bold tracking-[0.06em]">
            윤슬 <span style={{ color: C.sand }}>펜션</span>
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-10 text-[15px] font-medium text-white/85 lg:flex">
            {["객실", "부대시설", "이용 안내", "오시는 길"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
        </div>
      </header>

      <section className="relative flex min-h-[620px] items-end overflow-hidden bg-black text-white md:h-[96svh]">
        <Image src={`${IMG}/a-hero.jpg`} alt="큰 창 너머로 바다가 보이는 객실 침대" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40" aria-hidden />
        <div className="relative mx-auto flex w-full max-w-[1320px] flex-col gap-6 px-5 pb-16 md:flex-row md:items-end md:justify-between md:px-10 md:pb-24">
          <h1 className="text-[38px] font-bold leading-[1.22] tracking-[-0.045em] md:text-[68px]">
            침대에 누워도
            <br />
            바다가 보입니다
          </h1>
          <p className="max-w-[360px] text-white/75">네 객실 모두 정면이 바다입니다. 해변까지 걸어서 2분, 해 뜨는 쪽으로 창을 냈습니다.</p>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1320px]">
          <p className="text-[13px] font-bold tracking-[0.26em]" style={{ color: C.navy }}>ROOMS</p>
          <h2 className="mt-4 text-[32px] font-bold tracking-[-0.04em] md:text-[46px]">객실</h2>
          <ul className="mt-12 border-t" style={{ borderColor: C.ink }}>
            {ROOMS.map(([t, p, d]) => (
              <li key={t} className="grid gap-1 border-b py-6 md:grid-cols-[0.8fr_1fr_1.6fr_auto] md:items-center md:gap-8" style={{ borderColor: C.line }}>
                <h3 className="text-[24px] font-bold tracking-[-0.03em]">{t}</h3>
                <p className="font-bold" style={{ color: C.navy }}>{p}</p>
                <p style={{ color: C.sub }}>{d}</p>
                <ArrowRight size={20} className="hidden md:block" aria-hidden />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 md:px-10" style={{ background: C.soft }}>
        <div className="mx-auto grid max-w-[1320px] gap-3 py-20 md:grid-cols-2 md:py-28">
          {[
            { f: "a-pool", alt: "해 질 녘 바다를 내려다보는 야외 수영장", t: "야외 수영장", d: "6월 ~ 9월 운영, 10:00 ~ 21:00, 온수 아님" },
            { f: "a-grill", alt: "숯불 위에서 익는 고기", t: "바비큐", d: "객실 테라스 또는 공용 바비큐장, 숯과 그릴 준비" },
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
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">이용 안내</h2>
            <dl className="mt-7 border-t" style={{ borderColor: C.ink }}>
              {[
                ["입실", "15:00부터"],
                ["퇴실", "11:00까지"],
                ["기준 인원", "초과 1인당 추가 요금, 영유아 포함"],
                ["반려동물", "동반 불가"],
                ["주차", "객실당 1대, 펜션 앞 전용 주차장"],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[100px_1fr] gap-3 border-b py-4" style={{ borderColor: C.line }}>
                  <dt className="font-bold">{k}</dt>
                  <dd style={{ color: C.sub }}>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="flex flex-col justify-between gap-8 p-8 text-white md:p-10" style={{ background: C.navy }}>
            <div>
              <h3 className="text-[24px] font-bold tracking-[-0.03em]">문의</h3>
              <p className="mt-3 text-white/75">원하시는 날짜와 인원을 알려 주시면 남은 객실을 바로 알려 드립니다. 양양 IC에서 15분.</p>
            </div>
            <p className="text-[28px] font-bold tabular-nums" style={{ color: C.sand }}>033-000-0000</p>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-10" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2 md:flex-row md:justify-between">
          <p>윤슬 펜션, 강원특별자치도 양양군 일대. 농어촌민박사업 신고번호 제000호</p>
          <p>033-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
