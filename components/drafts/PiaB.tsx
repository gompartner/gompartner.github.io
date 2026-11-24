"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

// 피아노 학원 시안 B 성인 취미 피아노(11-22 사례 분석: 위드피아노처럼 성인 대상, 레슨과 연습실 두 칸. 직장인은 저녁 시간, 연습실 개방, 내가 칠 수 있게 될 곡을 묻는다). 흰 바탕, 검정과 금색. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/pia/b-*)
const IMG = "/images/drafts/pia";
const C = { ink: "#141210", sub: "#6a645d", line: "#e9e5e0", soft: "#f6f4f1", gold: "#a8823e" };

const LEVELS = [
  ["입문", "3개월", "악보 읽기, 양손 연주, 쉬운 영화 음악"],
  ["초급", "6개월", "코드 반주로 가요 부르며 치기"],
  ["중급", "1년", "쇼팽 녹턴, 히사이시 조 연주곡"],
  ["재즈 코드", "선택", "보이싱, 리하모니, 반주 패턴"],
];

export function PiaB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="absolute inset-x-0 z-20 text-white">
        <div className="mx-auto flex h-[78px] max-w-[1320px] items-center justify-between px-5 md:px-10">
          <p className="text-[18px] font-bold tracking-[0.04em]">
            저녁 <span style={{ color: C.gold }}>피아노</span>
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-10 text-[15px] font-medium text-white/85 lg:flex">
            {["레슨", "연습실", "레벨", "시간", "오시는 길"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-10 items-center border border-white/70 px-5 text-[14px] font-bold">체험 레슨</span>
        </div>
      </header>

      <section className="relative flex min-h-[620px] items-end overflow-hidden bg-black text-white md:h-[96svh]">
        <Image src={`${IMG}/b-hero.jpg`} alt="어두운 홀 나무 바닥 위 검은 그랜드 피아노" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40" aria-hidden />
        <div className="relative mx-auto flex w-full max-w-[1320px] flex-col gap-6 px-5 pb-16 md:flex-row md:items-end md:justify-between md:px-10 md:pb-24">
          <h1 className="text-[38px] font-bold leading-[1.22] tracking-[-0.045em] md:text-[68px]">
            퇴근 뒤 한 시간,
            <br />
            치고 싶던 그 곡
          </h1>
          <p className="max-w-[360px] text-white/75">악보를 몰라도 시작할 수 있습니다. 첫 수업에서 치고 싶은 곡을 정하고 거기까지 가는 순서를 짭니다.</p>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1320px]">
          <h2 className="text-[32px] font-bold tracking-[-0.04em] md:text-[46px]">레벨별로 칠 수 있게 되는 곡</h2>
          <ul className="mt-12 border-t" style={{ borderColor: C.ink }}>
            {LEVELS.map(([t, p, d]) => (
              <li key={t} className="grid gap-1 border-b py-6 md:grid-cols-[1fr_0.6fr_2fr] md:items-center md:gap-8" style={{ borderColor: C.line }}>
                <h3 className="text-[24px] font-bold tracking-[-0.03em]">{t}</h3>
                <p className="font-bold tabular-nums" style={{ color: C.gold }}>{p}</p>
                <p style={{ color: C.sub }}>{d}</p>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[15px]" style={{ color: C.sub }}>주 1회 30분 레슨과 주 2회 이상 연습 기준입니다.</p>
        </div>
      </section>

      <section className="px-5 md:px-10" style={{ background: C.soft }}>
        <div className="mx-auto grid max-w-[1320px] gap-3 py-20 md:grid-cols-2 md:py-28">
          {[
            {
              f: "b-keys",
              alt: "옆에서 본 나무 피아노 건반",
              t: "1대1 레슨",
              rows: [
                ["시간", "30분 또는 50분"],
                ["횟수", "주 1회, 주 2회"],
                ["저녁반", "평일 19:00 ~ 22:00"],
              ],
            },
            {
              f: "b-sheet",
              alt: "초점이 맞은 악보의 음표",
              t: "연습실 개방",
              rows: [
                ["방", "방음 연습실 8개, 그랜드 피아노실 1개"],
                ["시간", "평일 10:00 ~ 23:00, 주말 10:00 ~ 20:00"],
                ["이용", "수강생 무료, 이용 시간 제한 없음"],
              ],
            },
          ].map((x) => (
            <div key={x.t} className="bg-white">
              <div className="relative aspect-[16/9]">
                <Image src={`${IMG}/${x.f}.jpg`} alt={x.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
              </div>
              <div className="p-7 md:p-9">
                <h3 className="text-[24px] font-bold tracking-[-0.03em]">{x.t}</h3>
                <dl className="mt-4">
                  {x.rows.map(([k, v]) => (
                    <div key={k} className="grid grid-cols-[72px_1fr] gap-3 border-b py-3" style={{ borderColor: C.line }}>
                      <dt style={{ color: C.sub }}>{k}</dt>
                      <dd className="font-semibold">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-6 bg-black p-8 text-white md:flex-row md:items-center md:justify-between md:p-12">
          <div>
            <h2 className="text-[26px] font-bold tracking-[-0.04em] md:text-[34px]">체험 레슨 30분</h2>
            <p className="mt-2 text-white/70">손 모양을 보고 시작 레벨과 첫 곡을 정해 드립니다. 강남역 3번 출구 앞 건물 5층.</p>
          </div>
          <p className="inline-flex shrink-0 items-center gap-2 text-[22px] font-bold tabular-nums" style={{ color: C.gold }}>
            02-000-0000 <ArrowRight size={20} aria-hidden />
          </p>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-10" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2 md:flex-row md:justify-between">
          <p>저녁 피아노, 서울특별시 강남구 일대. 평생교육시설 신고번호 000. 교습비는 학원 안에 게시합니다</p>
          <p>02-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
