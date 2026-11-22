"use client";

import Image from "next/image";
import { ArrowRight, Globe } from "lucide-react";

// 출입국 행정사 시안 B 개인 체류형(11-22 사례 분석: 이미코리아처럼 다국어 선택과 비자 종류 메뉴, 비자인포처럼 공식 문의처 표기. 외국인 본인은 자기 비자 이름과 기한을 먼저 찾는다). 흰 바탕, 초록. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/visa/b-*)
const IMG = "/images/drafts/visa";
const C = { ink: "#14201b", sub: "#5c6964", line: "#e2ebe7", soft: "#f2f7f4", green: "#13795b", greenSoft: "#e2f2ec" };

const VISAS = [
  { c: "F-6", t: "결혼이민", en: "Marriage", d: "초청, 사증 발급, 연장, 국적 신청 전 단계" },
  { c: "F-5", t: "영주", en: "Permanent", d: "거주, 결혼, 점수 요건별 영주 자격 변경" },
  { c: "F-4", t: "재외동포", en: "Overseas Korean", d: "자격 변경, 연장, 거소 신고" },
  { c: "D-2", t: "유학", en: "Student", d: "연장, 시간제 취업 허가, 졸업 후 D-10" },
];

export function VisaB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[70px] max-w-[1200px] items-center justify-between px-5 md:px-8">
          <p className="text-[20px] font-bold tracking-[-0.03em]">
            <span style={{ color: C.green }}>이음</span> 행정사
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#3f4a45" }}>
            {["비자 종류", "연장, 변경", "준비 서류", "오시는 길"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-10 items-center gap-1.5 rounded-full border px-4 text-[14px] font-bold" style={{ borderColor: C.line }}>
            <Globe size={16} aria-hidden /> 한국어
          </span>
        </div>
      </header>

      <section className="px-5 pb-16 pt-10 md:px-8 md:pb-24 md:pt-14">
        <div className="mx-auto max-w-[1200px]">
          <div className="flex flex-wrap gap-2 text-[14px] font-semibold">
            {["한국어", "English", "中文", "Tiếng Việt", "Русский"].map((l, i) => (
              <span key={l} className="rounded-full px-3.5 py-1" style={i === 0 ? { background: C.green, color: "#fff" } : { background: C.soft, color: C.sub }}>
                {l}
              </span>
            ))}
          </div>
          <div className="mt-8 grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
            <div>
              <h1 className="text-[36px] font-bold leading-[1.24] tracking-[-0.045em] md:text-[56px]">
                체류 기간 연장,
                <br />
                만료 전에 준비하세요
              </h1>
              <p className="mt-5 max-w-[460px] text-[17px] md:text-[18px]" style={{ color: C.sub }}>
                외국인등록증 사진과 지금 비자만 보내 주시면 필요한 서류 목록을 모국어로 정리해 드립니다. 출입국관리사무소 방문 접수를 대신합니다.
              </p>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
              <Image src={`${IMG}/b-hero.jpg`} alt="인천공항 활주로에 서 있는 여객기" fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">비자 종류</h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {VISAS.map((v) => (
              <li key={v.c} className="flex gap-5 rounded-[22px] bg-white p-6 md:p-8">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[16px] text-[18px] font-bold" style={{ background: C.greenSoft, color: C.green }}>
                  {v.c}
                </span>
                <div className="min-w-0">
                  <h3 className="text-[21px] font-bold tracking-[-0.03em]">
                    {v.t} <span className="text-[14px] font-semibold" style={{ color: C.sub }}>{v.en}</span>
                  </h3>
                  <p className="mt-1 text-[15px]" style={{ color: C.sub }}>{v.d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 md:grid-cols-[1fr_1.1fr] md:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[24px]">
            <Image src={`${IMG}/b-pass.jpg`} alt="여러 나라 입국 도장이 찍힌 여권" fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
          </div>
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">연장 신청 때 기본 서류</h2>
            <ul className="mt-7 grid gap-3">
              {[
                ["여권, 외국인등록증", "원본"],
                ["통합 신청서", "사무소에서 작성"],
                ["체류지 증빙", "임대차계약서 또는 숙소 제공 확인서"],
                ["수수료", "인지 대금, 비자별 금액"],
              ].map(([k, v]) => (
                <li key={k} className="flex justify-between gap-4 border-b pb-3" style={{ borderColor: C.line }}>
                  <span className="font-bold">{k}</span>
                  <span className="text-right" style={{ color: C.sub }}>{v}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[15px]" style={{ color: C.sub }}>비자별 추가 서류는 상담 때 목록으로 드립니다.</p>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto grid max-w-[1200px] overflow-hidden rounded-[28px] md:grid-cols-[1.1fr_1fr]" style={{ background: C.green }}>
          <div className="p-8 text-white md:p-12">
            <h2 className="text-[26px] font-bold tracking-[-0.04em] md:text-[34px]">상담 안내</h2>
            <dl className="mt-6 grid gap-2.5">
              {[
                ["평일", "09:00 ~ 18:00"],
                ["토요일", "10:00 ~ 14:00 (예약)"],
                ["상담 언어", "한국어, 영어, 중국어, 베트남어"],
                ["전화", "032-000-0000"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-white/20 pb-2.5">
                  <dt className="text-white/70">{k}</dt>
                  <dd className="text-right font-bold">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 inline-flex items-center gap-1.5 font-bold">
              비자 상담 신청 <ArrowRight size={17} aria-hidden />
            </p>
          </div>
          <div className="relative min-h-[260px]">
            <Image src={`${IMG}/b-city.jpg`} alt="한강 건너 남산타워가 보이는 서울 풍경" fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 md:flex-row md:justify-between">
          <p>이음 행정사사무소, 인천광역시 남동구 일대. 행정사, 출입국 민원대행기관 등록번호 000</p>
          <p>032-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
