"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

// 정밀가공 제조업 시안 B 기업 소개형(11-22 리뉴얼. 기존 샘플의 회사소개, 기업부설연구소, 항온 가공실, 한영 전환 틀을 따른다. 사례 분석: 신형에프에이처럼 연혁과 사업 영역. 신규 거래처 검토 담당자는 회사 규모, 주요 산업, 품질 체계, 연혁을 먼저 본다). 흰 바탕, 남색. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/co/b-*)
const IMG = "/images/drafts/co";
const C = { ink: "#111827", sub: "#5d6575", line: "#e3e7ee", soft: "#f3f5f9", navy: "#1b2f5e" };

const FIELDS = [
  ["반도체 장비", "챔버 부품, 웨이퍼 이송 지그"],
  ["의료기기", "수술 기구 부품, 영상 장비 브래킷"],
  ["로봇, 자동화", "감속기 하우징, 그리퍼 블록"],
];

const HISTORY = [
  ["1998", "선반 2대로 창업"],
  ["2009", "법인 전환, 머시닝센터 도입"],
  ["2016", "ISO 9001, ISO 14001 인증"],
  ["2021", "기업부설연구소 설립"],
  ["2024", "화성 정밀산업단지 이전, 항온 가공실 준공"],
];

export function CoB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between px-5 md:px-10">
          <p className="text-[18px] font-bold tracking-[0.08em]">
            HANSOL <span style={{ color: C.navy }}>PRECISION</span>
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#434a58" }}>
            {["회사소개", "사업 분야", "품질", "연혁", "문의"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center px-5 text-[15px] font-bold text-white" style={{ background: C.navy }}>
            KOR / ENG
          </span>
        </div>
      </header>

      <section className="px-5 pt-12 md:px-10 md:pt-20">
        <div className="mx-auto max-w-[1320px]">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h1 className="text-[38px] font-bold leading-[1.2] tracking-[-0.05em] md:text-[72px]">
              장비가 멈추지 않게,
              <br />
              부품을 깎습니다
            </h1>
            <p className="max-w-[380px]" style={{ color: C.sub }}>
              직원 46명, 가공기 22대. 반도체, 의료, 로봇 장비 제조사에 정밀 부품을 공급합니다.
            </p>
          </div>
          <div className="relative mt-10 aspect-[4/3] overflow-hidden md:aspect-[21/9]">
            <Image src={`${IMG}/b-hero.jpg`} alt="밝게 정돈된 공장 생산 라인 바닥" fill priority sizes="100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1320px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">사업 분야</h2>
          <ul className="mt-10 border-t" style={{ borderColor: C.ink }}>
            {FIELDS.map(([t, d]) => (
              <li key={t} className="grid gap-1 border-b py-6 md:grid-cols-[1fr_2fr_auto] md:items-center md:gap-6" style={{ borderColor: C.line }}>
                <h3 className="text-[23px] font-bold tracking-[-0.03em]">{t}</h3>
                <p style={{ color: C.sub }}>{d}</p>
                <ArrowRight size={20} className="hidden md:block" aria-hidden />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 md:px-10" style={{ background: C.soft }}>
        <div className="mx-auto grid max-w-[1320px] items-center gap-10 py-20 md:grid-cols-2 md:gap-16 md:py-28">
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">품질 체계</h2>
            <ol className="mt-7 grid gap-4">
              {[
                ["수입 검사", "소재 성분 성적서 확인, 로트 기록"],
                ["공정 검사", "첫 개, 중간, 마지막 개 치수 측정"],
                ["출하 검사", "20도 항온실 3차원 측정, 성적서 동봉"],
              ].map(([k, v], i) => (
                <li key={k} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center text-[15px] font-bold text-white" style={{ background: C.navy }}>{i + 1}</span>
                  <div>
                    <p className="text-[18px] font-bold">{k}</p>
                    <p className="text-[15px]" style={{ color: C.sub }}>{v}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image src={`${IMG}/b-gear.jpg`} alt="겹쳐 놓인 금속 기어 부품" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image src={`${IMG}/b-parts.jpg`} alt="흰 바탕 위 축과 기어 등 정밀 부품" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1320px] gap-10 md:grid-cols-[1.2fr_1fr] md:gap-16">
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">연혁</h2>
            <dl className="mt-7 border-t" style={{ borderColor: C.ink }}>
              {HISTORY.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[72px_1fr] gap-3 border-b py-4" style={{ borderColor: C.line }}>
                  <dt className="font-bold tabular-nums" style={{ color: C.navy }}>{k}</dt>
                  <dd style={{ color: C.sub }}>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="flex flex-col justify-between gap-8 p-8 text-white md:p-10" style={{ background: C.navy }}>
            <div>
              <h3 className="text-[24px] font-bold tracking-[-0.03em]">거래 문의</h3>
              <p className="mt-3 text-white/75">회사소개서와 설비 목록을 메일로 보내 드립니다. 공장 방문은 평일 10:00 ~ 16:00.</p>
            </div>
            <p className="text-[28px] font-bold tabular-nums">031-000-0000</p>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-10" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2 md:flex-row md:justify-between">
          <p>한솔정밀(주) HANSOL PRECISION, 경기도 화성시 일대. 사업자등록번호 000-00-00000, 기업부설연구소 인정</p>
          <p>031-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
