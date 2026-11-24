"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

// 건축사무소 시안 A 작품 갤러리형(11-22 사례 분석: VOID., 시너지 아키텍트처럼 글은 적게 사진은 크게, 영문 짧은 메뉴. 김창동 건축사사무소처럼 프로젝트마다 용도, 위치, 연도, 면적). 흰 바탕, 검정. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/arc/a-*)
const IMG = "/images/drafts/arc";
const C = { ink: "#111", sub: "#6b6b6b", line: "#e6e6e6" };

const WORKS = [
  { f: "a-p1", t: "성북동 주택", u: "단독주택", y: "2025", a: "248㎡", alt: "검은 금속 외장의 3층 주택" },
  { f: "a-p2", t: "판교 연립주택", u: "공동주택", y: "2024", a: "1,120㎡", alt: "노을 아래 노출 콘크리트 연립주택" },
  { f: "a-p3", t: "망원동 근린생활시설", u: "근린생활시설", y: "2024", a: "386㎡", alt: "회색 벽돌로 마감한 4층 건물" },
  { f: "a-p4", t: "양평 갤러리", u: "문화시설", y: "2023", a: "612㎡", alt: "노출 콘크리트 기둥과 계단이 있는 건물 안" },
];

export function ArcA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="absolute inset-x-0 z-20">
        <div className="mx-auto flex h-[76px] max-w-[1400px] items-center justify-between px-5 md:px-10">
          <p className="text-[18px] font-bold tracking-[0.02em]">ONDO ARCHITECTS</p>
          <nav aria-label="주 메뉴" className="hidden gap-10 text-[14px] font-semibold md:flex">
            {["작업", "사무소", "설계 방식", "문의"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="text-[14px] font-semibold md:hidden">메뉴</span>
        </div>
      </header>

      <section className="px-5 pt-[76px] md:px-10">
        <div className="mx-auto max-w-[1400px]">
          <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[16/10] lg:aspect-[16/8]">
            <Image src={`${IMG}/a-hero.jpg`} alt="파란 하늘 아래 곡선 노출 콘크리트 구조물" fill priority sizes="100vw" className="object-cover" />
          </div>
          <div className="grid gap-6 py-10 md:grid-cols-[1.3fr_1fr] md:py-16">
            <h1 className="text-[32px] font-bold leading-[1.28] tracking-[-0.045em] md:text-[52px]">
              땅이 먼저 말하게
              <br />
              짓습니다
            </h1>
            <p className="self-end" style={{ color: C.sub }}>
              온도 건축사사무소는 주택, 근린생활시설, 문화시설을 설계하고 감리합니다. 대지 조사부터 사용승인까지 한 팀이 맡습니다.
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-10 md:pb-32">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex items-end justify-between border-b pb-4" style={{ borderColor: C.ink }}>
            <h2 className="text-[14px] font-bold ">작업</h2>
            <span className="text-[14px]" style={{ color: C.sub }}>2019 ~ 2025</span>
          </div>
          <ul className="mt-10 grid gap-x-8 gap-y-14 md:grid-cols-2">
            {WORKS.map((w, i) => (
              <li key={w.t} className={i % 2 ? "md:mt-24" : ""}>
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image src={`${IMG}/${w.f}.jpg`} alt={w.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
                </div>
                <div className="mt-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-[21px] font-bold tracking-[-0.03em]">{w.t}</h3>
                    <p className="text-[14px] tabular-nums" style={{ color: C.sub }}>
                      {w.u}, 연면적 {w.a}, {w.y} 준공
                    </p>
                  </div>
                  <ArrowUpRight size={20} className="mt-1 shrink-0" aria-hidden />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-20 text-white md:px-10 md:py-28" style={{ background: C.ink }}>
        <div className="mx-auto grid max-w-[1400px] gap-12 md:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 className="text-[14px] font-bold text-white/60">설계 방식</h2>
            <p className="mt-5 text-[28px] font-bold leading-[1.4] tracking-[-0.04em] md:text-[38px]">설계는 세 가지를 지킵니다</p>
          </div>
          <ol className="grid gap-px bg-white/15 sm:grid-cols-3">
            {[
              ["대지", "해, 바람, 도로, 이웃집 창까지 현장에서 다시 잽니다."],
              ["예산", "계획설계 단계에서 공사비 범위를 함께 정합니다."],
              ["현장", "설계자가 감리까지 맡아 도면대로 짓는지 봅니다."],
            ].map(([k, v], i) => (
              <li key={k} className="p-6 md:p-7" style={{ background: C.ink }}>
                <p className="text-[14px] tabular-nums text-white/50">0{i + 1}</p>
                <p className="mt-3 text-[22px] font-bold">{k}</p>
                <p className="mt-2 text-[15px] text-white/65">{v}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1400px] items-center gap-10 md:grid-cols-2 md:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image src={`${IMG}/a-p5.jpg`} alt="흐린 하늘 아래 흰 상자 모양 주택" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
          <div>
            <h2 className="text-[14px] font-bold ">사무소</h2>
            <dl className="mt-6 border-t" style={{ borderColor: C.ink }}>
              {[
                ["업무", "건축 설계, 인허가, 감리, 리모델링"],
                ["규모", "단독주택부터 연면적 3,000㎡ 이하"],
                ["상담", "대지 주소와 원하는 규모를 메일로 보내 주세요"],
                ["전화", "02-000-0000"],
              ].map(([k, v]) => (
                <div key={k} className="grid gap-1 border-b py-4 sm:grid-cols-[110px_1fr]" style={{ borderColor: C.line }}>
                  <dt style={{ color: C.sub }}>{k}</dt>
                  <dd className="font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-10" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1400px] flex-col gap-2 md:flex-row md:justify-between">
          <p>온도 건축사사무소, 서울특별시 성동구 일대. 건축사사무소 신고번호 000000</p>
          <p>02-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
