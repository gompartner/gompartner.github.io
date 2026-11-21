"use client";

import Image from "next/image";
import { ArrowRight, Download, Phone } from "lucide-react";

// 노무사 시안 A 기업 자문형(11-22 사례 분석: 노무법인 벗처럼 첫 화면 아래 상담 전화와 소개서 내려받기 띠, 기업 자문, 중대재해처벌법, 노동사건 대리를 업무 분야로). 흰 바탕, 남색. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/lab/a-*)
const IMG = "/images/drafts/lab";
const C = { ink: "#111827", sub: "#5b6474", line: "#e3e7ee", soft: "#f3f5f8", navy: "#0f2a5c", gold: "#b08a4a" };

const AREAS = [
  { e: "ADVISORY", t: "인사노무 자문", d: "취업규칙, 근로계약서, 임금체계 정비. 월 자문 계약." },
  { e: "SAFETY", t: "중대재해 대응", d: "안전보건관리체계 구축, 현장 점검, 사고 뒤 조사 대응." },
  { e: "DISPUTE", t: "노동사건 대리", d: "부당해고 구제신청, 노동위원회, 근로감독 대응." },
  { e: "PAYROLL", t: "급여, 4대보험", d: "급여 계산, 4대보험 신고, 정부 지원금 신청." },
];

export function LaborA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="absolute inset-x-0 z-20 text-white">
        <div className="mx-auto flex h-[78px] max-w-[1320px] items-center justify-between px-5 md:px-10">
          <p className="text-[19px] font-bold tracking-[-0.02em]">노무법인 한결</p>
          <nav aria-label="주 메뉴" className="hidden gap-10 text-[15px] font-medium text-white/85 lg:flex">
            {["법인 소개", "업무 분야", "중대재해", "자료실", "상담 신청"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-10 items-center border border-white/70 px-5 text-[14px] font-bold">상담 신청</span>
        </div>
      </header>

      <section className="relative flex min-h-[620px] items-center overflow-hidden text-white md:min-h-[700px]">
        <Image src={`${IMG}/a-hero.jpg`} alt="남산 아래로 늘어선 서울 도심 건물" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(8,20,46,0.9) 0%, rgba(8,20,46,0.65) 50%, rgba(8,20,46,0.3) 100%)" }} aria-hidden />
        <div className="relative mx-auto w-full max-w-[1320px] px-5 py-24 md:px-10">
          <p className="text-[14px] font-bold tracking-[0.2em]" style={{ color: C.gold }}>LABOR LAW FIRM</p>
          <h1 className="mt-5 text-[38px] font-bold leading-[1.22] tracking-[-0.045em] md:text-[64px]">
            분쟁이 되기 전에
            <br />
            규정부터 바로잡습니다
          </h1>
          <p className="mt-6 max-w-[520px] text-[16px] text-white/85 md:text-[18px]">
            상시 근로자 5인부터 300인 사업장까지, 취업규칙과 근로계약서를 먼저 점검하고 매달 노무 이슈를 함께 봅니다.
          </p>
        </div>
      </section>

      <section className="relative z-10 -mt-12 px-5 md:px-10">
        <div className="mx-auto grid max-w-[1320px] text-white sm:grid-cols-3" style={{ background: C.navy }}>
          <div className="flex items-center gap-4 p-6 md:p-8">
            <Phone size={22} aria-hidden style={{ color: C.gold }} />
            <div>
              <p className="text-[14px] text-white/60">상담 전화</p>
              <p className="text-[22px] font-bold tabular-nums">02-000-0000</p>
            </div>
          </div>
          {["법인 소개서 내려받기", "자문 제안서 내려받기"].map((t) => (
            <div key={t} className="flex items-center gap-4 border-t border-white/10 p-6 sm:border-l sm:border-t-0 md:p-8">
              <Download size={22} aria-hidden style={{ color: C.gold }} />
              <p className="text-[17px] font-bold">{t}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1320px]">
          <p className="text-[13px] font-bold tracking-[0.26em]" style={{ color: C.gold }}>PRACTICE</p>
          <h2 className="mt-4 text-[32px] font-bold tracking-[-0.04em] md:text-[48px]">업무 분야</h2>
          <ul className="mt-14 grid gap-px sm:grid-cols-2 lg:grid-cols-4" style={{ background: C.line }}>
            {AREAS.map((a) => (
              <li key={a.t} className="flex flex-col bg-white p-8">
                <p className="text-[12px] font-bold tracking-[0.22em]" style={{ color: C.gold }}>{a.e}</p>
                <h3 className="mt-3 text-[24px] font-bold tracking-[-0.03em]" style={{ color: C.navy }}>{a.t}</h3>
                <p className="mt-2 flex-1 text-[15px]" style={{ color: C.sub }}>{a.d}</p>
                <ArrowRight className="mt-8" size={20} aria-hidden />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 md:px-10" style={{ background: C.soft }}>
        <div className="mx-auto grid max-w-[1320px] items-center gap-10 py-20 md:grid-cols-2 md:gap-16 md:py-28">
          <div className="relative aspect-[4/3]">
            <Image src={`${IMG}/a-meet.jpg`} alt="나무 벽으로 둘러싸인 회의실과 긴 테이블" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
          <div>
            <p className="text-[13px] font-bold tracking-[0.26em]" style={{ color: C.gold }}>RETAINER</p>
            <h2 className="mt-4 text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[40px]">월 자문 계약에 들어가는 것</h2>
            <ul className="mt-8 grid gap-3">
              {[
                "인사노무 질의 전화, 메일 답변 (영업일 1일 안)",
                "근로계약서, 징계 절차 문서 검토",
                "분기 1회 사업장 방문 점검",
                "법 개정 사항 요약 보고",
              ].map((x) => (
                <li key={x} className="border-b pb-3" style={{ borderColor: C.line }}>{x}</li>
              ))}
            </ul>
            <span className="mt-9 inline-flex h-[56px] items-center gap-2 px-7 text-[16px] font-bold text-white" style={{ background: C.navy }}>
              자문 상담 신청 <ArrowRight size={18} aria-hidden />
            </span>
          </div>
        </div>
      </section>

      <footer className="px-5 py-10 text-[14px] text-white/70 md:px-10" style={{ background: C.navy }}>
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2 md:flex-row md:justify-between">
          <p>노무법인 한결, 서울특별시 중구 일대. 대표 공인노무사, 사업자등록번호 000-00-00000</p>
          <p>상담 전화 02-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
