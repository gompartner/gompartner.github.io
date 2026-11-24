"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

// 독서 논술 시안 B 중고등 국어 논술형(11-22 사례 분석: 서로국어논술처럼 학년별, 학교별 내신 교재와 비문학 독해를 앞에 둔다. 합격자 명단, 명예의 전당 대신 과정과 내신 대비 일정을 보여 준다). 흰 바탕, 검정과 남색. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/rd/b-*)
const IMG = "/images/drafts/rd";
const C = { ink: "#121620", sub: "#626875", line: "#e5e7ec", soft: "#f4f5f8", navy: "#233a7a" };

const TRACKS = [
  ["중등 국어", "중1 ~ 중3", "문법, 문학 갈래, 서술형 답안 쓰기"],
  ["고등 내신", "고1 ~ 고3", "학교별 교과서, 부교재, 기출 분석"],
  ["수능 독서", "고1 ~ 고3", "비문학 지문 구조 읽기, 시간 배분"],
  ["인문 논술", "고2 ~ 고3", "제시문 요약, 비교, 견해 쓰기"],
];

export function ReadB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between px-5 md:px-10">
          <p className="text-[19px] font-bold tracking-[-0.02em]">
            서재 <span style={{ color: C.navy }}>국어논술</span>
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#444a56" }}>
            {["과정", "내신 대비", "주간 수업", "입학 상담"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center px-5 text-[15px] font-bold text-white" style={{ background: C.navy }}>
            입학 상담
          </span>
        </div>
      </header>

      <section className="px-5 pt-12 md:px-10 md:pt-20">
        <div className="mx-auto max-w-[1320px]">
          <h1 className="text-[38px] font-bold leading-[1.2] tracking-[-0.05em] md:text-[72px]">
            지문을 읽는 순서부터
            <br />
            바로잡습니다
          </h1>
          <div className="relative mt-10 aspect-[4/3] overflow-hidden md:aspect-[21/9]">
            <Image src={`${IMG}/b-hero.jpg`} alt="여러 색 책이 가득 꽂힌 나무 책장" fill priority sizes="100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1320px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">과정</h2>
          <ul className="mt-10 border-t" style={{ borderColor: C.ink }}>
            {TRACKS.map(([t, g, d]) => (
              <li key={t} className="grid gap-1 border-b py-6 md:grid-cols-[1fr_0.7fr_1.8fr_auto] md:items-center md:gap-6" style={{ borderColor: C.line }}>
                <h3 className="text-[23px] font-bold tracking-[-0.03em]">{t}</h3>
                <p className="font-bold" style={{ color: C.navy }}>{g}</p>
                <p style={{ color: C.sub }}>{d}</p>
                <ArrowRight size={20} className="hidden md:block" aria-hidden />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 md:px-10" style={{ background: C.soft }}>
        <div className="mx-auto grid max-w-[1320px] items-center gap-10 py-20 md:grid-cols-2 md:gap-16 md:py-28">
          <div className="grid grid-cols-2 gap-3">
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image src={`${IMG}/b-note.jpg`} alt="스프링 공책 위에 놓인 연필" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image src={`${IMG}/b-pages.jpg`} alt="펼쳐진 채 쌓인 책장들" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
          </div>
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">학교별 내신 대비</h2>
            <p className="mt-3" style={{ color: C.sub }}>시험 4주 전부터 학교마다 반을 나눕니다.</p>
            <ol className="mt-7 grid gap-4">
              {[
                ["4주 전", "시험 범위 교과서, 부교재 본문 분석"],
                ["3 ~ 2주 전", "학교 기출 3개년, 서술형 답안 첨삭"],
                ["1주 전", "실전 모의고사 2회, 오답 정리"],
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
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1320px] gap-10 md:grid-cols-[1.2fr_1fr] md:gap-16">
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">주간 수업</h2>
            <dl className="mt-7 border-t" style={{ borderColor: C.ink }}>
              {[
                ["중등", "주 2회, 화, 목 18:00 ~ 20:00"],
                ["고1, 고2", "주 2회, 월, 수 19:00 ~ 22:00"],
                ["고3", "주 3회, 평일 저녁, 토요일 오전"],
                ["논술반", "토요일 14:00 ~ 18:00"],
              ].map(([k, v]) => (
                <div key={k} className="grid gap-1 border-b py-4 sm:grid-cols-[120px_1fr]" style={{ borderColor: C.line }}>
                  <dt className="font-bold">{k}</dt>
                  <dd style={{ color: C.sub }}>{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[14px]" style={{ color: C.sub }}>교습비는 교육지원청에 신고한 금액이며 학원 안에 게시합니다.</p>
          </div>
          <div className="flex flex-col justify-between gap-8 p-8 text-white md:p-10" style={{ background: C.navy }}>
            <div>
              <h3 className="text-[24px] font-bold tracking-[-0.03em]">입학 상담</h3>
              <p className="mt-3 text-white/75">최근 국어 시험지를 가져오시면 틀린 유형을 함께 보고 맞는 반을 정합니다. 진단 독해 테스트 40분.</p>
            </div>
            <p className="text-[28px] font-bold tabular-nums">031-000-0000</p>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-10" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2 md:flex-row md:justify-between">
          <p>서재 국어논술학원, 경기도 안양시 동안구 평촌 일대. 학원 등록번호 제000호</p>
          <p>031-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
