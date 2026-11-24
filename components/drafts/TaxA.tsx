"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

// 세무회계 시안 A 법인 기장형(11-21). 남색과 큰 숫자, 법인과 중소기업 대표를 상대로 신뢰와 체계를 보여 준다. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/tax/a-*)
const IMG = "/images/drafts/tax";
const C = { navy: "#0b1f3a", navy2: "#12294a", ink: "#0f1720", sub: "#5b6576", line: "#dfe3ea", soft: "#f3f5f8", accent: "#2f6bff", mint: "#7fe0c3" };
const TEL = "02-000-0000";

const SERVICES = [
  { en: "BOOKKEEPING", t: "법인, 개인 기장", d: "매월 장부 작성과 부가세, 원천세 신고를 정해진 날짜에 처리하고 결과를 리포트로 보내 드립니다." },
  { en: "TAX FILING", t: "법인세, 종합소득세 신고", d: "공제와 감면 항목을 빠짐없이 검토해 신고 전 예상 세액과 근거를 먼저 설명드립니다." },
  { en: "ADVISORY", t: "세무 자문, 조사 대응", d: "가업승계, 법인 전환, 세무조사 사전 점검과 소명 자료 작성을 맡습니다." },
  { en: "PAYROLL", t: "급여, 4대보험 아웃소싱", d: "급여 계산, 명세서 발송, 4대보험 취득과 상실 신고를 대신 처리합니다." },
];

export function TaxA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="absolute inset-x-0 z-20 text-white">
        <div className="mx-auto flex h-[76px] max-w-[1240px] items-center justify-between px-5 md:px-8">
          <p className="flex items-baseline gap-2">
            <span className="text-[20px] font-bold tracking-[-0.02em]">세무법인 신우</span>
            <span className="text-[11px] font-bold tracking-[0.2em] text-white/60">TAX & ACCOUNTING</span>
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-10 text-[15px] font-semibold text-white/85 lg:flex">
            {["사무소 소개", "업무 안내", "기장 절차", "세무 소식", "오시는 길"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-10 items-center rounded-[4px] bg-white px-4 text-[14px] font-bold" style={{ color: C.navy }}>
            기장 상담
          </span>
        </div>
      </header>

      <section className="relative flex min-h-[640px] items-center overflow-hidden text-white md:h-[92svh]" style={{ background: C.navy }}>
        <Image src={`${IMG}/a-hero.jpg`} alt="아래에서 올려다본 유리 외벽 고층 빌딩" fill priority sizes="100vw" className="object-cover opacity-60" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(11,31,58,0.95) 0%, rgba(11,31,58,0.7) 50%, rgba(11,31,58,0.25) 100%)" }} aria-hidden />
        <div className="relative mx-auto w-full max-w-[1240px] px-5 pt-20 md:px-8">
          <p className="text-[13px] font-bold tracking-[0.24em]" style={{ color: C.mint }}>SINCE 2004, CORPORATE TAX PARTNER</p>
          <h1 className="mt-5 max-w-[820px] text-[36px] font-bold leading-[1.25] tracking-[-0.035em] md:text-[62px]">
            숫자가 보이면
            <br />
            경영 판단이 빨라집니다
          </h1>
          <p className="mt-6 max-w-[540px] text-[16px] text-white/75 md:text-[19px]">
            매달 손익과 예상 세액을 한 장으로 정리해 드립니다. 신고 기한이 아니라 대표님의 다음 결정에 맞춰 일합니다.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <span className="inline-flex h-[54px] items-center gap-2 rounded-[4px] px-7 font-bold" style={{ background: C.accent }}>
              기장 상담 신청
              <ArrowRight size={18} aria-hidden />
            </span>
            <span className="inline-flex h-[54px] items-center rounded-[4px] border border-white/40 px-7 font-bold">업무 안내</span>
          </div>
        </div>
      </section>

      <section aria-label="사무소 현황" className="border-b px-5 md:px-8" style={{ borderColor: C.line }}>
        <dl className="mx-auto grid max-w-[1240px] grid-cols-2 gap-px md:grid-cols-4" style={{ background: C.line }}>
          {[
            ["기장 고객사", "320", "곳"],
            ["법인 고객 비중", "64", "%"],
            ["누적 신고", "18,000", "건"],
            ["신고 기한 준수", "100", "%"],
          ].map(([k, v, u]) => (
            <div key={k} className="bg-white px-1 py-10 md:px-8 md:py-14">
              <dt className="text-[14px]" style={{ color: C.sub }}>{k}</dt>
              <dd className="mt-2 flex items-baseline gap-1">
                <span className="text-[40px] font-bold tabular-nums tracking-[-0.03em] md:text-[56px]" style={{ color: C.navy }}>{v}</span>
                <span className="text-[16px] font-bold" style={{ color: C.sub }}>{u}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="px-5 py-24 md:px-8 md:py-32">
        <div className="mx-auto max-w-[1240px]">
          <p className="text-[13px] font-bold tracking-[0.24em]" style={{ color: C.accent }}>SERVICES</p>
          <h2 className="mt-4 text-[30px] font-bold leading-[1.3] tracking-[-0.03em] md:text-[46px]">업무 안내</h2>
          <ul className="mt-14 grid gap-5 md:grid-cols-2">
            {SERVICES.map((s) => (
              <li key={s.en} className="group flex flex-col justify-between rounded-[6px] border p-8 transition-colors md:p-10" style={{ borderColor: C.line }}>
                <div>
                  <p className="text-[12px] font-bold tracking-[0.2em]" style={{ color: C.sub }}>{s.en}</p>
                  <h3 className="mt-3 text-[24px] font-bold tracking-[-0.03em] md:text-[28px]">{s.t}</h3>
                  <p className="mt-4 max-w-[460px]" style={{ color: C.sub }}>{s.d}</p>
                </div>
                <p className="mt-10 inline-flex items-center gap-1.5 text-[15px] font-bold" style={{ color: C.accent }}>
                  자세히 보기
                  <ArrowRight size={16} aria-hidden />
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 pb-24 md:px-8 md:pb-32">
        <div className="mx-auto grid max-w-[1240px] overflow-hidden rounded-[8px] lg:grid-cols-2" style={{ background: C.navy }}>
          <div className="relative min-h-[320px] lg:min-h-[560px]">
            <Image src={`${IMG}/a-doc.jpg`} alt="대리석 책상 위에 놓인 재무 보고서" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div className="px-7 py-14 text-white md:px-14 md:py-16">
            <p className="text-[13px] font-bold tracking-[0.24em]" style={{ color: C.mint }}>MONTHLY REPORT</p>
            <h2 className="mt-4 text-[28px] font-bold leading-[1.4] tracking-[-0.03em] md:text-[38px]">
              매달 10일,
              <br />
              한 장짜리 경영 리포트
            </h2>
            <ul className="mt-10 grid gap-5">
              {[
                ["이번 달 손익", "매출, 비용, 영업이익을 전월, 전년과 비교합니다."],
                ["예상 세액", "다음 부가세와 법인세 예상액을 미리 알려 드립니다."],
                ["놓친 공제", "증빙이 빠진 지출과 받을 수 있는 공제를 짚어 드립니다."],
              ].map(([t, d]) => (
                <li key={t} className="border-t border-white/15 pt-5">
                  <p className="text-[18px] font-bold">{t}</p>
                  <p className="mt-1 text-[15px] text-white/70">{d}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="px-5 py-24 md:px-8 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1240px]">
          <p className="text-[13px] font-bold tracking-[0.24em]" style={{ color: C.accent }}>PROCESS</p>
          <h2 className="mt-4 text-[30px] font-bold tracking-[-0.03em] md:text-[46px]">기장 이관은 이렇게 진행됩니다</h2>
          <ol className="mt-14 grid gap-4 md:grid-cols-4">
            {[
              ["무료 진단", "지난 신고서와 장부를 보고 개선할 점을 먼저 말씀드립니다."],
              ["계약, 자료 이관", "기존 세무사무소에서 받을 자료 목록을 저희가 정리합니다."],
              ["첫 결산", "이관 첫 달에 지난 장부의 오류를 함께 바로잡습니다."],
              ["월간 리포트", "다음 달부터 매달 10일 리포트를 받아 보십니다."],
            ].map(([t, d], i) => (
              <li key={t} className="rounded-[6px] bg-white p-7">
                <p className="text-[14px] font-bold tabular-nums" style={{ color: C.accent }}>STEP {i + 1}</p>
                <h3 className="mt-3 text-[20px] font-bold">{t}</h3>
                <p className="mt-2 text-[15px]" style={{ color: C.sub }}>{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="relative overflow-hidden px-5 py-24 text-white md:px-8 md:py-32" style={{ background: C.navy }}>
        <Image src={`${IMG}/a-room.jpg`} alt="유리벽으로 둘러싸인 회의실" fill sizes="100vw" className="object-cover opacity-25" />
        <div className="relative mx-auto flex max-w-[1240px] flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-[30px] font-bold leading-[1.35] tracking-[-0.03em] md:text-[46px]">
              지금 장부,
              <br />
              무료로 진단해 드립니다
            </h2>
            <p className="mt-4 text-white/70">지난 1년 신고서만 있으면 됩니다. 진단 결과는 3영업일 안에 보내 드립니다.</p>
          </div>
          <div className="flex flex-col gap-3 md:items-end">
            <span className="inline-flex h-[58px] items-center gap-2 rounded-[4px] px-8 text-[17px] font-bold" style={{ background: C.accent }}>
              무료 진단 신청
              <ArrowRight size={18} aria-hidden />
            </span>
            <span className="text-[22px] font-bold tabular-nums">{TEL}</span>
          </div>
        </div>
      </section>

      <footer className="px-5 py-10 text-[14px] md:px-8" style={{ color: C.sub }}>
        <div className="mx-auto flex max-w-[1240px] flex-col gap-2 md:flex-row md:justify-between">
          <p>세무법인 신우, 서울특별시 강남구 테헤란로 일대</p>
          <p>상담 문의 {TEL}</p>
        </div>
      </footer>
    </div>
  );
}
