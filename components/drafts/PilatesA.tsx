"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

// 필라테스 시안 A 프리미엄 미니멀(11-21 사례 분석: 웰핏, Alas, MELUA처럼 흑백, 베이지 톤에 큰 스튜디오 사진, 영문 한 줄과 한국어 한 줄, 수업 구성을 A, B, C 표로). 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/pil/a-*)
const IMG = "/images/drafts/pil";
const C = { ink: "#141312", sub: "#6c6863", line: "#e6e3df", soft: "#f3f2f0" };

const CLASSES = [
  { k: "A", t: "개인 레슨", en: "Private", d: "체형 평가 후 1:1로 진행합니다. 통증이나 재활이 목적이라면 여기서 시작합니다.", n: "1:1, 50분" },
  { k: "B", t: "듀엣 레슨", en: "Duet", d: "가족, 친구와 둘이서 같은 시간에 기구 수업을 받습니다.", n: "2:1, 50분" },
  { k: "C", t: "그룹 레슨", en: "Group", d: "리포머와 체어를 쓰는 소규모 수업. 동작마다 강사가 자세를 잡아 드립니다.", n: "최대 4명, 50분" },
];

export function PilatesA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="absolute inset-x-0 z-20 text-white">
        <div className="mx-auto flex h-[78px] max-w-[1320px] items-center justify-between px-5 md:px-10">
          <p className="text-[17px] font-bold tracking-[0.32em]">온새 필라테스</p>
          <nav aria-label="주 메뉴" className="hidden gap-10 text-[15px] font-medium text-white/90 lg:flex">
            {["스튜디오", "수업 안내", "지도자 과정", "오시는 길"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-10 items-center border border-white/70 px-5 text-[14px] font-bold">상담 예약</span>
        </div>
      </header>

      <section className="relative flex min-h-[640px] items-center overflow-hidden text-white md:h-[100svh]">
        <Image src={`${IMG}/a-hero.jpg`} alt="리포머 기구가 줄지어 놓인 베이지 톤 필라테스 스튜디오" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-black/45" aria-hidden />
        <div className="relative mx-auto w-full max-w-[1320px] px-5 text-center md:px-10">
          <p className="text-[14px] font-bold tracking-[0.36em] text-white/75">STRONG &amp; GRACEFUL</p>
          <h1 className="mt-6 text-[38px] font-bold leading-[1.25] tracking-[-0.04em] md:text-[68px]">
            바른 자세는
            <br />
            몸이 기억합니다
          </h1>
          <p className="mx-auto mt-6 max-w-[440px] text-[16px] text-white/85 md:text-[18px]">체형 평가로 시작해 한 사람의 몸에 맞춘 순서로 수업합니다.</p>
        </div>
      </section>

      <section className="px-5 py-24 md:px-10 md:py-36">
        <div className="mx-auto max-w-[1320px]">
          <p className="text-[13px] font-bold tracking-[0.28em]" style={{ color: C.sub }}>CLASS</p>
          <h2 className="mt-4 text-[32px] font-bold tracking-[-0.04em] md:text-[50px]">수업 안내</h2>
          <ul className="mt-14 border-t" style={{ borderColor: C.ink }}>
            {CLASSES.map((c) => (
              <li key={c.k} className="grid gap-3 border-b py-8 md:grid-cols-[80px_1fr_1.4fr_160px] md:items-center md:gap-8 md:py-10" style={{ borderColor: C.line }}>
                <span className="text-[14px] font-bold tracking-[0.2em]" style={{ color: C.sub }}>{c.k} CLASS</span>
                <div>
                  <h3 className="text-[24px] font-bold tracking-[-0.03em] md:text-[28px]">{c.t}</h3>
                  <p className="text-[14px] tracking-[0.12em]" style={{ color: C.sub }}>{c.en}</p>
                </div>
                <p style={{ color: C.sub }}>{c.d}</p>
                <p className="font-bold md:text-right">{c.n}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 md:px-10">
        <div className="mx-auto grid max-w-[1320px] gap-5 md:grid-cols-[1.3fr_1fr]">
          <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[520px]">
            <Image src={`${IMG}/a-room.jpg`} alt="창이 넓은 밝은 방에 놓인 캐딜락과 리포머" fill sizes="(min-width: 768px) 55vw, 100vw" className="object-cover grayscale-[30%]" />
          </div>
          <div className="flex flex-col justify-center gap-6 p-8 md:p-12" style={{ background: C.soft }}>
            <p className="text-[13px] font-bold tracking-[0.28em]" style={{ color: C.sub }}>STUDIO</p>
            <h2 className="text-[28px] font-bold leading-[1.4] tracking-[-0.03em] md:text-[36px]">
              기구 한 대에
              <br />
              한 사람
            </h2>
            <ul className="grid gap-3" style={{ color: C.sub }}>
              {["리포머, 캐딜락, 체어, 바렐 전 기구 구비", "수업마다 기구 소독, 개인 매트 제공", "탈의실, 샤워실, 수건 비치"].map((x) => (
                <li key={x} className="border-b pb-3" style={{ borderColor: C.line }}>{x}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="px-5 py-24 md:px-10 md:py-36">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <h2 className="text-[32px] font-bold leading-[1.3] tracking-[-0.04em] md:text-[50px]">
            첫 수업은
            <br />
            체형 평가부터
          </h2>
          <div className="flex flex-col gap-3 md:items-end">
            <span className="inline-flex h-[58px] items-center gap-2 px-8 text-[17px] font-bold text-white" style={{ background: C.ink }}>
              체형 평가 상담 예약
              <ArrowRight size={18} aria-hidden />
            </span>
            <span className="text-[15px]" style={{ color: C.sub }}>평일 07:00 ~ 22:00, 토요일 09:00 ~ 15:00</span>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-10" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2 md:flex-row md:justify-between">
          <p>온새 필라테스, 서울특별시 마포구 일대</p>
          <p>상담 문의 02-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
