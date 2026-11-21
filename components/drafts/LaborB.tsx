"use client";

import Image from "next/image";
import { ArrowRight, Clock } from "lucide-react";

// 노무사 시안 B 근로자 상담형(11-22 사례 분석: 더하다 법률사무소처럼 사건별 카드와 상담 방법을 앞에. 근로자는 부당해고, 임금체불, 산재로 찾아오고 신청 기한을 먼저 궁금해한다). 흰 바탕, 짙은 초록. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/lab/b-*)
const IMG = "/images/drafts/lab";
const C = { ink: "#14201c", sub: "#5d6a65", line: "#e3eae7", soft: "#f2f6f4", green: "#1d5c4a", greenSoft: "#e4f0eb", red: "#c4472f" };

const CASES = [
  { t: "부당해고", d: "해고 통지서를 받으셨다면", due: "해고일부터 3개월 안 구제신청" },
  { t: "임금체불", d: "월급, 퇴직금, 연장수당을 못 받으셨다면", due: "임금채권 3년 시효" },
  { t: "산업재해", d: "일하다 다치거나 병을 얻으셨다면", due: "요양급여 3년 안 청구" },
  { t: "직장 내 괴롭힘", d: "신고 뒤 조사, 불리한 처우 대응", due: "회사 신고 후 조사 의무" },
];

export function LaborB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[70px] max-w-[1200px] items-center justify-between px-5 md:px-8">
          <p className="text-[20px] font-bold tracking-[-0.03em]">
            바로 <span style={{ color: C.green }}>노무사사무소</span>
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#3e4944" }}>
            {["사건별 상담", "진행 순서", "비용 안내", "오시는 길"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center rounded-full px-5 text-[15px] font-bold text-white" style={{ background: C.green }}>
            상담 예약
          </span>
        </div>
      </header>

      <section className="px-5 pb-16 pt-10 md:px-8 md:pb-24 md:pt-14">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
          <div>
            <p className="text-[15px] font-bold" style={{ color: C.green }}>공인노무사 직접 상담</p>
            <h1 className="mt-4 text-[36px] font-bold leading-[1.24] tracking-[-0.045em] md:text-[56px]">
              해고, 체불, 산재
              <br />
              기한부터 확인하세요
            </h1>
            <p className="mt-5 max-w-[460px] text-[17px] md:text-[18px]" style={{ color: C.sub }}>
              노동 사건은 신청 기한이 지나면 다투기 어렵습니다. 근로계약서와 급여명세서를 가지고 오시면 첫 상담에서 가능 여부를 말씀드립니다.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
            <Image src={`${IMG}/b-hero.jpg`} alt="큰 창이 있는 상담실의 둥근 회의 테이블" fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">사건별 상담</h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {CASES.map((c) => (
              <li key={c.t} className="flex flex-col rounded-[22px] bg-white p-7 md:p-8">
                <h3 className="text-[23px] font-bold tracking-[-0.03em]">{c.t}</h3>
                <p className="mt-1" style={{ color: C.sub }}>{c.d}</p>
                <p className="mt-6 flex items-center gap-2 text-[15px] font-bold" style={{ color: C.red }}>
                  <Clock size={16} aria-hidden /> {c.due}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 md:grid-cols-[1fr_1.1fr] md:gap-16">
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">진행 순서</h2>
            <ol className="mt-8 grid gap-5">
              {[
                ["첫 상담", "30분, 사건 가능 여부와 기한 확인"],
                ["자료 정리", "근로계약서, 급여 내역, 문자와 녹음"],
                ["신청서 작성", "노동위원회, 노동청, 근로복지공단 제출"],
                ["심문, 조사 출석", "노무사가 함께 출석해 진술을 돕습니다"],
              ].map(([k, v], i) => (
                <li key={k} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[15px] font-bold text-white" style={{ background: C.green }}>{i + 1}</span>
                  <div>
                    <p className="text-[18px] font-bold">{k}</p>
                    <p className="text-[15px]" style={{ color: C.sub }}>{v}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[24px]">
            <Image src={`${IMG}/b-docs.jpg`} alt="책상 위에 펼쳐진 서류와 노트북" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto grid max-w-[1200px] gap-6 rounded-[28px] p-8 text-white md:grid-cols-[1.2fr_1fr] md:p-12" style={{ background: C.green }}>
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">비용 안내</h2>
            <p className="mt-3 text-white/75">착수금과 성공보수는 사건마다 계약서에 적어 드립니다. 첫 상담 30분은 비용을 받지 않습니다.</p>
            <p className="mt-6 inline-flex items-center gap-1.5 font-bold">
              상담 예약 <ArrowRight size={17} aria-hidden />
            </p>
          </div>
          <dl className="grid gap-2.5">
            {[
              ["상담 시간", "평일 09:00 ~ 19:00"],
              ["야간 상담", "화, 목 21:00까지 (예약)"],
              ["전화", "031-000-0000"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-white/20 pb-2.5">
                <dt className="text-white/70">{k}</dt>
                <dd className="text-right font-bold tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 md:flex-row md:justify-between">
          <p>바로 노무사사무소, 경기도 수원시 영통구 일대. 공인노무사, 사업자등록번호 000-00-00000</p>
          <p>상담 예약 031-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
