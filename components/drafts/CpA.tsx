"use client";

import Image from "next/image";
import { Trees } from "lucide-react";

// 캠핑장 시안 A 오토캠핑장형(11-22 사례 분석: 마리원캠핑장처럼 숲 사진 첫 화면, 시설 6칸, 지도. 예약 시스템 없이 안내 중심. 오토캠핑 손님은 사이트 크기와 바닥, 차를 옆에 댈 수 있는지, 전기, 개수대와 샤워장, 매너타임을 묻는다). 흰 바탕, 짙은 초록. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/cp/a-*)
const IMG = "/images/drafts/cp";
const C = { ink: "#141a15", sub: "#5c665e", line: "#e2e9e3", soft: "#f2f6f2", green: "#2c5a36", greenSoft: "#e3efe5" };

const SITES = [
  ["A구역 숲속", "10 x 8m, 파쇄석", "12면, 차량 옆 주차"],
  ["B구역 계곡", "9 x 7m, 데크", "8면, 물소리 가까운 쪽"],
  ["C구역 잔디", "12 x 10m, 잔디", "6면, 대형 텐트, 리빙쉘"],
  ["D구역 카라반", "8 x 12m, 파쇄석", "4면, 캠핑카, 카라반 전용"],
];

export function CpA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="absolute inset-x-0 z-20 text-white">
        <div className="mx-auto flex h-[78px] max-w-[1320px] items-center justify-between px-5 md:px-10">
          <p className="flex items-center gap-2 text-[18px] font-bold tracking-[-0.02em]">
            <Trees size={20} aria-hidden /> 솔바람 오토캠핑장
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-10 text-[15px] font-medium text-white/85 lg:flex">
            {["사이트", "시설", "이용 수칙", "오시는 길"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
        </div>
      </header>

      <section className="relative flex min-h-[620px] items-end overflow-hidden bg-black text-white md:h-[96svh]">
        <Image src={`${IMG}/a-hero.jpg`} alt="햇빛이 드는 키 큰 나무 숲 속 텐트 한 동" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/40" aria-hidden />
        <div className="relative mx-auto flex w-full max-w-[1320px] flex-col gap-6 px-5 pb-16 md:flex-row md:items-end md:justify-between md:px-10 md:pb-24">
          <h1 className="text-[38px] font-bold leading-[1.22] tracking-[-0.045em] md:text-[68px]">
            사이트마다
            <br />
            차를 옆에 댑니다
          </h1>
          <p className="max-w-[360px] text-white/75">잣나무 숲에 30면. 사이트 사이를 4m 이상 띄워 옆 텐트 소리가 덜 들립니다.</p>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1320px]">
          <h2 className="text-[32px] font-bold tracking-[-0.04em] md:text-[46px]">사이트</h2>
          <ul className="mt-12 border-t" style={{ borderColor: C.ink }}>
            {SITES.map(([t, s, d]) => (
              <li key={t} className="grid gap-1 border-b py-6 md:grid-cols-[1fr_1fr_1.4fr] md:items-center md:gap-8" style={{ borderColor: C.line }}>
                <h3 className="text-[23px] font-bold tracking-[-0.03em]">{t}</h3>
                <p className="font-bold tabular-nums" style={{ color: C.green }}>{s}</p>
                <p style={{ color: C.sub }}>{d}</p>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[15px]" style={{ color: C.sub }}>모든 사이트 전기 600W 제공, 사이트당 텐트 1동, 타프 1개, 최대 4인.</p>
        </div>
      </section>

      <section className="px-5 md:px-10" style={{ background: C.soft }}>
        <div className="mx-auto grid max-w-[1320px] items-center gap-10 py-20 md:grid-cols-2 md:gap-16 md:py-28">
          <div className="grid grid-cols-2 gap-3">
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image src={`${IMG}/a-chair.jpg`} alt="산 계곡이 내려다보이는 풀밭 위 캠핑 의자" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image src={`${IMG}/a-fire.jpg`} alt="어둠 속에서 타오르는 모닥불" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
          </div>
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">시설</h2>
            <ul className="mt-7 grid grid-cols-2 gap-px" style={{ background: C.line }}>
              {[
                ["개수대", "온수, 3곳"],
                ["샤워장", "남녀 구분, 온수"],
                ["화장실", "구역마다 1동"],
                ["매점", "장작, 숯, 얼음"],
                ["분리수거장", "입구 옆"],
                ["놀이터", "C구역 앞"],
              ].map(([k, v]) => (
                <li key={k} className="p-5" style={{ background: C.soft }}>
                  <p className="text-[18px] font-bold">{k}</p>
                  <p className="text-[15px]" style={{ color: C.sub }}>{v}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1320px] gap-10 md:grid-cols-[1.2fr_1fr] md:gap-16">
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">이용 수칙</h2>
            <dl className="mt-7 border-t" style={{ borderColor: C.ink }}>
              {[
                ["입실", "14:00부터"],
                ["퇴실", "12:00까지"],
                ["매너타임", "22:00 ~ 07:00, 차량 출입 통제"],
                ["화로", "화로대 위에서만, 바닥 직화 금지"],
                ["반려견", "A구역만 동반, 목줄 필수"],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[100px_1fr] gap-3 border-b py-4" style={{ borderColor: C.line }}>
                  <dt className="font-bold">{k}</dt>
                  <dd style={{ color: C.sub }}>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="flex flex-col justify-between gap-8 p-8 text-white md:p-10" style={{ background: C.green }}>
            <div>
              <h3 className="text-[24px] font-bold tracking-[-0.03em]">문의</h3>
              <p className="mt-3 text-white/80">매달 1일 10시에 다음 달 예약을 받습니다. 가평 IC에서 20분, 마지막 2km는 포장된 산길입니다.</p>
            </div>
            <p className="text-[28px] font-bold tabular-nums">031-000-0000</p>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-10" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2 md:flex-row md:justify-between">
          <p>솔바람 오토캠핑장, 경기도 가평군 일대. 야영장업 등록번호 제000호</p>
          <p>031-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
