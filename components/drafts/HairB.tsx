"use client";

import Image from "next/image";
import { Car, Clock, Scissors } from "lucide-react";

// 미용실 시안 B 동네 가격표형(11-21 사례 분석: 뷰티 매장 사이트는 머리글에 가격과 예약을 따로 둔다. 동네 손님은 남녀 가격표, 걸리는 시간, 영업시간을 먼저 본다). 흰 바탕, 테라코타 포인트. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/hair/b-*)
const IMG = "/images/drafts/hair";
const C = { ink: "#1d1916", sub: "#6b635d", line: "#ebe5e0", soft: "#f6f3f1", terra: "#c2603e", terraSoft: "#fbece6" };

const PRICE: { g: string; rows: [string, string, string][] }[] = [
  { g: "여성", rows: [["커트", "25,000", "40분"], ["일반 펌", "70,000 ~", "2시간"], ["셋팅 펌", "110,000 ~", "3시간"], ["뿌리 염색", "55,000", "1시간 30분"], ["전체 염색", "80,000 ~", "2시간"]] },
  { g: "남성", rows: [["커트", "18,000", "30분"], ["다운펌", "30,000", "40분"], ["댄디 펌", "60,000", "1시간 30분"], ["새치 염색", "35,000", "1시간"], ["학생 커트 (고등까지)", "15,000", "30분"]] },
];

export function HairB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[70px] max-w-[1200px] items-center justify-between px-5 md:px-8">
          <p className="text-[20px] font-bold tracking-[-0.03em]">단정헤어</p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#4a423c" }}>
            {["가격표", "처음 오시는 분", "매장 안내", "오시는 길"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
        </div>
      </header>

      <section className="px-5 pb-16 pt-10 md:px-8 md:pb-24 md:pt-14">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
          <div>
            <p className="inline-flex rounded-full px-3.5 py-1 text-[14px] font-bold" style={{ background: C.terraSoft, color: C.terra }}>동네 미용실, 원장 직접 시술</p>
            <h1 className="mt-5 text-[38px] font-bold leading-[1.22] tracking-[-0.045em] md:text-[60px]">
              가격표 그대로,
              <br />
              추가 요금 없이
            </h1>
            <p className="mt-5 max-w-[460px] text-[17px] md:text-[19px]" style={{ color: C.sub }}>
              기장 추가, 약제 추가가 필요하면 시술 전에 먼저 말씀드립니다. 동의하지 않은 비용은 받지 않습니다.
            </p>
            <ul className="mt-9 grid max-w-[480px] grid-cols-3 gap-3">
              {[
                [Scissors, "의자 3개"],
                [Clock, "밤 9시까지"],
                [Car, "주차 2대"],
              ].map(([Icon, t]) => {
                const I = Icon as typeof Car;
                return (
                  <li key={t as string} className="flex flex-col items-center gap-2 rounded-[16px] py-4 text-[15px] font-bold" style={{ background: C.soft }}>
                    <I size={22} style={{ color: C.terra }} aria-hidden />
                    {t as string}
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
            <Image src={`${IMG}/b-hero.jpg`} alt="밝은 대리석 바닥에 거울과 의자가 줄지어 있는 미용실" fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1200px]">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">가격표</h2>
            <p className="text-[15px]" style={{ color: C.sub }}>어깨 아래 기장은 펌, 염색에 20,000원이 추가됩니다.</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {PRICE.map((p) => (
              <div key={p.g} className="rounded-[24px] bg-white p-7 md:p-9">
                <h3 className="text-[20px] font-bold" style={{ color: C.terra }}>{p.g}</h3>
                <ul className="mt-4">
                  {p.rows.map(([n, v, t]) => (
                    <li key={n} className="grid grid-cols-[1fr_auto] gap-x-4 border-b py-3.5 md:grid-cols-[1fr_110px_auto]" style={{ borderColor: C.line }}>
                      <span className="font-semibold">{n}</span>
                      <span className="hidden text-[14px] md:block" style={{ color: C.sub }}>{t}</span>
                      <span className="text-right font-bold tabular-nums">{v}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 md:grid-cols-2 md:gap-16">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[20px]">
              <Image src={`${IMG}/b-chair.jpg`} alt="흰 벽 앞의 미용 의자" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
            <div className="relative mt-10 aspect-[3/4] overflow-hidden rounded-[20px]">
              <Image src={`${IMG}/b-corner.jpg`} alt="화분이 놓인 매장 한쪽" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
          </div>
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[40px]">처음 오시는 분께</h2>
            <ol className="mt-8 grid gap-3">
              {["원하는 머리 사진을 보여 주세요", "모발 상태를 보고 가능한 것과 걸리는 시간을 말씀드립니다", "가격을 확인하신 뒤 시술을 시작합니다", "펌은 1주일 안에 풀리면 무료로 다시 합니다"].map((s, i) => (
                <li key={s} className="flex items-center gap-4 rounded-[16px] px-5 py-4" style={{ background: C.soft }}>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[15px] font-bold text-white" style={{ background: C.terra }}>{i + 1}</span>
                  <span className="font-semibold">{s}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto grid max-w-[1200px] gap-4 rounded-[28px] p-8 md:grid-cols-4 md:p-12" style={{ background: C.terraSoft }}>
          {[
            ["평일", "10:00 ~ 21:00"],
            ["토요일", "10:00 ~ 19:00"],
            ["휴무", "매주 일요일"],
            ["위치", "아파트 상가 2층"],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-[14px] font-bold" style={{ color: C.terra }}>{k}</p>
              <p className="mt-1 text-[19px] font-bold">{v}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 md:flex-row md:justify-between">
          <p>단정헤어, 경기도 화성시 동탄 일대</p>
          <p>대표전화 031-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
