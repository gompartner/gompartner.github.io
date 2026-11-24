"use client";

import Image from "next/image";
import { ArrowRight, Phone } from "lucide-react";

// 법률사무소 시안 A 다크 프리미엄(11-21). 메인 한 장만, 기능 없이 첫인상과 구성만 보여 준다.
// 사진: Unsplash 무료 라이선스(public/images/drafts/law/a-*)
const IMG = "/images/drafts/law";
const C = { bg: "#0e1116", panel: "#151a21", line: "#262d37", text: "#e9ecf1", sub: "#9aa3b0", gold: "#c8a96a" };
const TEL = "02-000-0000";

const AREAS = [
  { en: "CIVIL", t: "민사, 손해배상", d: "대여금, 공사대금, 손해배상 청구와 가압류, 강제집행까지 맡습니다." },
  { en: "CRIMINAL", t: "형사", d: "수사 단계 조사 동행부터 공판 변론, 피해자 고소 대리까지 진행합니다." },
  { en: "FAMILY", t: "이혼, 가사", d: "재산분할, 양육권, 위자료를 협의와 소송 양쪽으로 준비합니다." },
  { en: "REAL ESTATE", t: "부동산, 임대차", d: "보증금 반환, 명도, 재개발 조합 분쟁을 다룹니다." },
  { en: "CORPORATE", t: "기업 자문", d: "계약서 검토, 채권 회수, 주주 분쟁을 월 자문으로 관리합니다." },
  { en: "LABOR", t: "노동", d: "부당해고, 임금체불 사건에서 근로자와 사업주를 대리합니다." },
];

const CASES = [
  { cat: "부동산", t: "임대차 보증금 반환 청구", r: "보증금 전액과 지연이자 인용" },
  { cat: "형사", t: "업무상 횡령 혐의 수사 단계 변호", r: "불송치 결정" },
  { cat: "이혼", t: "혼인 기간 20년 재산분할", r: "기여도 50% 인정" },
  { cat: "기업", t: "공사대금 미지급 소송", r: "청구 금액 전부 인용, 가압류로 회수" },
];

export function LawFirmA() {
  return (
    <div className="min-h-screen text-[16px] leading-[1.75] md:text-[17px]" style={{ background: C.bg, color: C.text }}>
      <header className="absolute inset-x-0 z-20">
        <div className="mx-auto flex h-[76px] max-w-[1240px] items-center justify-between px-5 md:px-8">
          <p className="flex items-baseline gap-2">
            <span className="text-[20px] font-bold tracking-[-0.02em]">법률사무소 정도</span>
            <span className="text-[11px] font-bold tracking-[0.2em]" style={{ color: C.gold }}>LAW OFFICE</span>
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-10 text-[15px] font-semibold lg:flex">
            {["사무소 소개", "업무분야", "업무 사례", "상담 안내", "오시는 길"].map((m) => (
              <span key={m} style={{ color: "#d5dae2" }}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-10 items-center gap-2 border px-4 text-[14px] font-bold" style={{ borderColor: C.gold, color: C.gold }}>
            <Phone size={15} aria-hidden />
            {TEL}
          </span>
        </div>
      </header>

      <section className="relative flex min-h-[680px] items-end overflow-hidden md:h-[100svh]">
        <Image src={`${IMG}/a-hero.jpg`} alt="해 질 녘 서울 도심 전경" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(14,17,22,0.55) 0%, rgba(14,17,22,0.2) 40%, rgba(14,17,22,0.95) 100%)" }} aria-hidden />
        <div className="relative mx-auto w-full max-w-[1240px] px-5 pb-20 md:px-8 md:pb-28">
          <p className="text-[13px] font-bold tracking-[0.24em]" style={{ color: C.gold }}>SEOUL LAW OFFICE</p>
          <h1 className="mt-5 max-w-[900px] text-[36px] font-bold leading-[1.25] tracking-[-0.035em] md:text-[64px]">
            처음 상담한 변호사가
            <br />
            판결까지 맡습니다
          </h1>
          <p className="mt-6 max-w-[560px] text-[16px] md:text-[19px]" style={{ color: "#c3c9d2" }}>
            사건을 사무장에게 넘기지 않습니다. 기록 검토, 서면 작성, 법정 변론을 담당 변호사가 직접 합니다.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <span className="inline-flex h-[54px] items-center gap-2 px-7 font-bold" style={{ background: C.gold, color: C.bg }}>
              상담 문의
              <ArrowRight size={18} aria-hidden />
            </span>
            <span className="inline-flex h-[54px] items-center border px-7 font-bold" style={{ borderColor: "rgba(255,255,255,0.4)" }}>
              업무분야 보기
            </span>
          </div>
        </div>
      </section>

      <section className="px-5 py-24 md:px-8 md:py-36">
        <div className="mx-auto max-w-[1240px]">
          <div className="grid gap-6 md:grid-cols-[1fr_1.4fr] md:items-end">
            <div>
              <p className="text-[13px] font-bold tracking-[0.24em]" style={{ color: C.gold }}>PRACTICE AREAS</p>
              <h2 className="mt-4 text-[30px] font-bold leading-[1.3] tracking-[-0.03em] md:text-[46px]">업무분야</h2>
            </div>
            <p className="max-w-[520px] md:justify-self-end" style={{ color: C.sub }}>
              분야마다 같은 유형의 사건을 반복해 온 변호사가 맡습니다. 처음 상담에서 예상 기간과 비용을 먼저 말씀드립니다.
            </p>
          </div>
          <ul className="mt-14 grid gap-px border-y md:grid-cols-2 lg:grid-cols-3" style={{ background: C.line, borderColor: C.line }}>
            {AREAS.map((a) => (
              <li key={a.en} className="px-1 py-9 md:px-8" style={{ background: C.bg }}>
                <p className="text-[12px] font-bold tracking-[0.2em]" style={{ color: C.gold }}>{a.en}</p>
                <h3 className="mt-3 text-[22px] font-bold tracking-[-0.02em] md:text-[24px]">{a.t}</h3>
                <p className="mt-3 text-[15px] leading-[1.8]" style={{ color: C.sub }}>{a.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <div className="grid md:grid-cols-2">
          <div className="relative min-h-[360px] md:min-h-[620px]">
            <Image src={`${IMG}/a-pen.jpg`} alt="어두운 책상 위의 만년필" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
          <div className="flex items-center px-5 py-20 md:px-16" style={{ background: C.panel }}>
            <div className="max-w-[480px]">
              <p className="text-[13px] font-bold tracking-[0.24em]" style={{ color: C.gold }}>OUR PRINCIPLE</p>
              <h2 className="mt-4 text-[28px] font-bold leading-[1.4] tracking-[-0.03em] md:text-[38px]">
                이길 수 있는 사건과
                <br />
                어려운 사건을 구분해 말씀드립니다
              </h2>
              <ul className="mt-10 grid gap-7">
                {[
                  ["담당 변호사 직접 상담", "첫 상담부터 사건을 맡을 변호사가 직접 듣고 판단합니다."],
                  ["진행 상황 서면 보고", "기일마다 무엇이 오갔는지 다음 날까지 정리해 보내 드립니다."],
                  ["비용은 계약 전에 확정", "착수금과 성공보수 기준을 계약서에 숫자로 적습니다."],
                ].map(([t, d]) => (
                  <li key={t} className="border-l-2 pl-5" style={{ borderColor: C.gold }}>
                    <p className="text-[18px] font-bold">{t}</p>
                    <p className="mt-1 text-[15px]" style={{ color: C.sub }}>{d}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="relative px-5 py-24 md:px-8 md:py-32">
        <Image src={`${IMG}/a-books.jpg`} alt="법률 서적이 꽂힌 서가" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0" style={{ background: "rgba(14,17,22,0.88)" }} aria-hidden />
        <div className="relative mx-auto max-w-[1240px]">
          <p className="text-[13px] font-bold tracking-[0.24em]" style={{ color: C.gold }}>CASES</p>
          <h2 className="mt-4 text-[30px] font-bold tracking-[-0.03em] md:text-[46px]">업무 사례</h2>
          <ul className="mt-12 grid gap-px md:grid-cols-2" style={{ background: C.line }}>
            {CASES.map((c) => (
              <li key={c.t} className="p-8 md:p-10" style={{ background: "rgba(21,26,33,0.92)" }}>
                <p className="text-[13px] font-bold" style={{ color: C.gold }}>{c.cat}</p>
                <h3 className="mt-2 text-[20px] font-bold md:text-[22px]">{c.t}</h3>
                <p className="mt-4 text-[26px] font-bold tracking-[-0.02em] md:text-[30px]">{c.r}</p>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[13px]" style={{ color: C.sub }}>의뢰인 동의를 받은 사건만 싣고, 개인을 알 수 있는 내용은 지웠습니다.</p>
        </div>
      </section>

      <section className="px-5 py-24 md:px-8 md:py-32">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-10 md:flex-row md:items-center md:justify-between">
          <h2 className="text-[30px] font-bold leading-[1.35] tracking-[-0.03em] md:text-[44px]">
            사건 기록을 보기 전에는
            <br />
            결과를 약속하지 않습니다
          </h2>
          <div className="flex flex-col gap-3 md:items-end">
            <span className="inline-flex h-[58px] items-center gap-2 px-8 text-[17px] font-bold" style={{ background: C.gold, color: C.bg }}>
              상담 문의
              <ArrowRight size={18} aria-hidden />
            </span>
            <span className="text-[22px] font-bold tabular-nums tracking-[0.02em]">{TEL}</span>
            <span className="text-[14px]" style={{ color: C.sub }}>평일 09:00 ~ 18:00, 야간 상담은 예약제</span>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1240px] flex-col gap-2 md:flex-row md:justify-between">
          <p>법률사무소 정도, 서울특별시 서초구 서초동 법조타운</p>
          <p>상담 문의 02-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
