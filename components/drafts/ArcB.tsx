"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

// 건축사무소 시안 B 단독주택 건축주형(11-22 사례 분석: 작품만 보여 주는 사이트가 대부분이지만 처음 집 짓는 건축주는 순서와 기간, 설계비에 무엇이 들어가는지, 땅을 사기 전에 볼 것을 묻는다). 흰 바탕, 흙색. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/arc/b-*)
const IMG = "/images/drafts/arc";
const C = { ink: "#1c1a17", sub: "#67615a", line: "#ebe6e0", soft: "#f6f4f1", clay: "#8a5a3c" };

const STEPS = [
  ["대지 상담", "1 ~ 2주", "법규 검토, 지을 수 있는 규모 확인"],
  ["계획설계", "1 ~ 2개월", "배치, 평면, 모형으로 방향 결정"],
  ["인허가", "1 ~ 2개월", "건축허가 또는 신고, 협의 대응"],
  ["실시설계", "2개월", "구조, 설비, 전기 도면과 공사 내역"],
  ["시공사 선정", "2 ~ 4주", "같은 도면으로 견적 비교"],
  ["공사와 감리", "5 ~ 7개월", "현장 점검과 사용승인"],
];

export function ArcB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[70px] max-w-[1200px] items-center justify-between px-5 md:px-8">
          <p className="text-[20px] font-bold tracking-[-0.03em]">
            마당 <span style={{ color: C.clay }}>건축사사무소</span>
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#4a443d" }}>
            {["집 짓는 순서", "설계비", "지은 집", "상담"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center rounded-full px-5 text-[15px] font-bold text-white" style={{ background: C.clay }}>
            대지 상담
          </span>
        </div>
      </header>

      <section className="px-5 pb-16 pt-10 md:px-8 md:pb-24 md:pt-14">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
          <div>
            <p className="text-[15px] font-bold" style={{ color: C.clay }}>단독주택과 전원주택 설계</p>
            <h1 className="mt-4 text-[36px] font-bold leading-[1.24] tracking-[-0.045em] md:text-[56px]">
              처음 짓는 집,
              <br />
              순서부터 같이 봅니다
            </h1>
            <p className="mt-5 max-w-[460px] text-[17px] md:text-[18px]" style={{ color: C.sub }}>
              땅을 사기 전이라도 괜찮습니다. 주소만 있으면 지을 수 있는 크기와 예상 공사비 범위를 먼저 알려 드립니다.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
            <Image src={`${IMG}/b-hero.jpg`} alt="책 위에 놓인 흰 주택 모형" fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">집 짓는 순서와 기간</h2>
          <p className="mt-3" style={{ color: C.sub }}>상담부터 입주까지 보통 1년 안팎입니다.</p>
          <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map(([t, p, d], i) => (
              <li key={t} className="rounded-[22px] bg-white p-6 md:p-7">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-bold tabular-nums" style={{ color: C.clay }}>{String(i + 1).padStart(2, "0")}</span>
                  <span className="rounded-full px-3 py-0.5 text-[14px] font-bold" style={{ background: C.soft }}>{p}</span>
                </div>
                <h3 className="mt-4 text-[21px] font-bold tracking-[-0.03em]">{t}</h3>
                <p className="mt-1 text-[15px]" style={{ color: C.sub }}>{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 md:grid-cols-[1fr_1.1fr] md:gap-16">
          <div className="grid grid-cols-2 gap-3">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[22px]">
              <Image src={`${IMG}/b-draw.jpg`} alt="치수가 적힌 도면 위의 연필" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
            <div className="relative aspect-[3/4] overflow-hidden rounded-[22px]">
              <Image src={`${IMG}/b-model.jpg`} alt="나무 모형이 놓인 단지 배치 모형" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
          </div>
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">설계비에 들어가는 것</h2>
            <ul className="mt-7 grid gap-3">
              {[
                ["포함", "계획설계, 실시설계, 인허가 서류, 모형 1회"],
                ["포함", "구조, 기계, 전기, 토목 협력 설계"],
                ["별도", "측량, 지반조사, 공사 감리"],
                ["별도", "인허가 수수료, 각종 부담금"],
              ].map(([k, v]) => (
                <li key={v} className="flex items-start gap-3 border-b pb-3" style={{ borderColor: C.line }}>
                  <span className="mt-[3px] shrink-0 rounded-full px-2.5 text-[13px] font-bold" style={k === "포함" ? { background: C.clay, color: "#fff" } : { background: C.soft, color: C.sub }}>
                    {k}
                  </span>
                  {v}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[15px]" style={{ color: C.sub }}>설계비는 연면적과 난이도에 따라 계약서에 항목별로 적습니다.</p>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto grid max-w-[1200px] overflow-hidden rounded-[28px] md:grid-cols-2" style={{ background: C.ink }}>
          <div className="p-8 text-white md:p-12">
            <h2 className="text-[26px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[34px]">땅을 사기 전에 볼 것</h2>
            <ul className="mt-6 grid gap-3 text-white/80">
              {[
                "용도지역과 건폐율, 용적률",
                "폭 4m 이상 도로에 2m 이상 닿는지",
                "상하수도, 전기 인입 거리",
                "경사지면 옹벽, 성토 비용",
              ].map((x) => (
                <li key={x} className="border-b border-white/15 pb-3">{x}</li>
              ))}
            </ul>
            <p className="mt-7 inline-flex items-center gap-1.5 font-bold" style={{ color: "#e0b48f" }}>
              주소로 대지 상담 신청 <ArrowRight size={18} aria-hidden />
            </p>
          </div>
          <div className="relative min-h-[280px]">
            <Image src={`${IMG}/b-house.jpg`} alt="잔디 마당이 있는 단층 주택" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 md:flex-row md:justify-between">
          <p>마당 건축사사무소, 경기도 용인시 수지구 일대. 건축사사무소 신고번호 000000</p>
          <p>평일 10:00 ~ 19:00, 031-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
