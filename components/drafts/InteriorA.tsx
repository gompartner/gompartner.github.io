"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

// 인테리어 시안 A 갤러리형(11-21 사례 분석: 실제 인테리어 사이트는 흰 바탕에 큰 시공 사진, 짧은 슬로건, 공간별 사례, 머리글 견적 요청). 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/int/a-*)
const IMG = "/images/drafts/int";
const C = { ink: "#141414", sub: "#6b6b6b", line: "#e6e6e6", soft: "#f4f4f2" };

const WORKS = [
  { img: "a-kitchen", alt: "검은 아일랜드 식탁이 있는 흰 주방", t: "잠실 아파트 34평", tag: "전체 리모델링, 6주" },
  { img: "a-living", alt: "흰 소파와 벽걸이 TV가 있는 거실", t: "분당 아파트 25평", tag: "거실, 주방, 8주" },
  { img: "a-bed", alt: "창이 높은 밝은 침실", t: "성수 오피스텔 18평", tag: "부분 시공, 3주" },
];

export function InteriorA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="absolute inset-x-0 z-20 text-white">
        <div className="mx-auto flex h-[78px] max-w-[1320px] items-center justify-between px-5 md:px-10">
          <p className="text-[18px] font-bold tracking-[0.18em]">공간담 인테리어</p>
          <nav aria-label="주 메뉴" className="hidden gap-10 text-[15px] font-medium text-white/90 lg:flex">
            {["스튜디오", "시공 사례", "진행 과정", "오시는 길"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-10 items-center border border-white/70 px-5 text-[14px] font-bold">견적 요청</span>
        </div>
      </header>

      <section className="relative flex min-h-[640px] items-end overflow-hidden text-white md:h-[100svh]">
        <Image src={`${IMG}/a-hero.jpg`} alt="벽난로와 흰 소파가 있는 넓은 거실" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.55) 100%)" }} aria-hidden />
        <div className="relative mx-auto flex w-full max-w-[1320px] flex-col gap-8 px-5 pb-16 md:flex-row md:items-end md:justify-between md:px-10 md:pb-20">
          <h1 className="text-[40px] font-bold leading-[1.18] tracking-[-0.045em] md:text-[76px]">
            오래 머물고 싶은
            <br />
            집을 만듭니다
          </h1>
          <p className="max-w-[360px] text-[16px] text-white/85 md:text-[17px]">설계부터 시공, 입주 후 1년 하자 점검까지 한 팀이 끝까지 맡습니다.</p>
        </div>
      </section>

      <section className="px-5 py-24 md:px-10 md:py-36">
        <div className="mx-auto max-w-[1320px]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[13px] font-bold tracking-[0.24em]" style={{ color: C.sub }}>PORTFOLIO</p>
              <h2 className="mt-4 text-[32px] font-bold tracking-[-0.04em] md:text-[50px]">최근 시공 사례</h2>
            </div>
            <p className="flex gap-5 text-[15px] font-bold">
              {["전체", "아파트", "주택", "상업 공간"].map((t, i) => (
                <span key={t} className={i === 0 ? "border-b-2 pb-1" : ""} style={{ borderColor: C.ink, color: i === 0 ? C.ink : C.sub }}>{t}</span>
              ))}
            </p>
          </div>
          <ul className="mt-14 grid gap-6 md:grid-cols-[1.4fr_1fr] md:grid-rows-2">
            {WORKS.map((w, i) => (
              <li key={w.t} className={i === 0 ? "md:row-span-2" : ""}>
                <div className={`relative overflow-hidden ${i === 0 ? "aspect-[4/3] md:aspect-auto md:h-full md:min-h-[640px]" : "aspect-[4/3] md:aspect-[16/10]"}`}>
                  <Image src={`${IMG}/${w.img}.jpg`} alt={w.alt} fill sizes="(min-width: 768px) 55vw, 100vw" className="object-cover" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-white md:p-7" style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.6), rgba(0,0,0,0))" }}>
                    <div>
                      <p className="text-[20px] font-bold md:text-[24px]">{w.t}</p>
                      <p className="text-[14px] text-white/80">{w.tag}</p>
                    </div>
                    <ArrowRight size={22} aria-hidden />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-24 md:px-10 md:py-32" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1320px]">
          <p className="text-[13px] font-bold tracking-[0.24em]" style={{ color: C.sub }}>PROCESS</p>
          <h2 className="mt-4 text-[32px] font-bold tracking-[-0.04em] md:text-[50px]">진행 과정</h2>
          <ol className="mt-14 grid gap-px md:grid-cols-5" style={{ background: C.line }}>
            {[
              ["상담, 실측", "현장을 재고 생활 방식과 예산을 듣습니다."],
              ["설계, 견적", "3D 도면과 공정별 견적서를 드립니다."],
              ["계약", "공사 기간과 자재를 계약서에 적습니다."],
              ["시공", "매일 현장 사진을 보내 드립니다."],
              ["입주, A/S", "입주 후 1년 무상 하자 점검을 합니다."],
            ].map(([t, d], i) => (
              <li key={t} className="p-7" style={{ background: C.soft }}>
                <p className="text-[14px] font-bold tabular-nums" style={{ color: C.sub }}>STEP {i + 1}</p>
                <h3 className="mt-3 text-[21px] font-bold">{t}</h3>
                <p className="mt-2 text-[15px]" style={{ color: C.sub }}>{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <h2 className="text-[32px] font-bold leading-[1.3] tracking-[-0.04em] md:text-[50px]">
            평면도 한 장으로
            <br />
            상담을 시작합니다
          </h2>
          <div className="flex flex-col gap-3 md:items-end">
            <span className="inline-flex h-[58px] items-center gap-2 px-8 text-[17px] font-bold text-white" style={{ background: C.ink }}>
              무료 실측 상담 신청
              <ArrowRight size={18} aria-hidden />
            </span>
            <span className="text-[15px]" style={{ color: C.sub }}>서울, 경기 전 지역, 상담 후 3일 안에 견적서를 드립니다</span>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-10" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2 md:flex-row md:justify-between">
          <p>공간담 인테리어, 서울특별시 성동구 성수동 일대, 실내건축공사업 등록</p>
          <p>견적 문의 02-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
