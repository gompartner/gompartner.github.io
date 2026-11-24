"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

// 태권도장 시안 B 품새, 겨루기 심사형(11-22 사례 분석: 아임웹 사례 없음. 초등 고학년, 중등 보호자는 띠 순서, 국기원 심사 시기, 시합반 여부를 묻는다). 흰 바탕에 검정 첫 화면, 빨강. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/tk/b-*)
const IMG = "/images/drafts/tk";
const C = { ink: "#111", sub: "#666", line: "#e6e6e6", soft: "#f4f4f4", red: "#d92b2b" };

const BELTS = [
  ["흰띠", "#ffffff", "기본 서기, 지르기"],
  ["노란띠", "#f5c518", "태극 1장"],
  ["초록띠", "#2f9e44", "태극 2 ~ 3장"],
  ["파란띠", "#1c6fd1", "태극 4 ~ 5장"],
  ["빨간띠", "#d92b2b", "태극 6 ~ 8장"],
  ["품띠, 검은띠", "#111111", "고려, 국기원 승품, 승단 심사"],
];

export function TkB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="absolute inset-x-0 z-20 text-white">
        <div className="mx-auto flex h-[78px] max-w-[1320px] items-center justify-between px-5 md:px-10">
          <p className="text-[19px] font-bold tracking-[-0.02em]">
            한결 <span style={{ color: C.red }}>태권도</span>
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-10 text-[15px] font-medium text-white/85 lg:flex">
            {["띠 순서", "승품 심사", "시합반", "시간표"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-10 items-center px-5 text-[14px] font-bold text-white" style={{ background: C.red }}>
            상담 신청
          </span>
        </div>
      </header>

      <section className="relative flex min-h-[600px] items-end overflow-hidden bg-black text-white md:h-[90svh]">
        <Image src={`${IMG}/b-hero.jpg`} alt="긴 그림자가 드리운 노란 체육관 바닥과 주황 선" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/40" aria-hidden />
        <div className="relative mx-auto w-full max-w-[1320px] px-5 pb-16 md:px-10 md:pb-24">
          <p className="text-[14px] font-bold tracking-[0.22em]" style={{ color: C.red }}>POOMSAE &amp; KYORUGI</p>
          <h1 className="mt-5 text-[40px] font-bold leading-[1.2] tracking-[-0.045em] md:text-[76px]">
            검은띠까지,
            <br />
            단계마다 심사합니다
          </h1>
          <p className="mt-6 max-w-[520px] text-white/75">품새는 동작 하나하나를 영상으로 찍어 고칩니다. 겨루기 시합반은 전자호구로 실전처럼 연습합니다.</p>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1320px]">
          <h2 className="text-[32px] font-bold tracking-[-0.04em] md:text-[46px]">띠 순서</h2>
          <p className="mt-3" style={{ color: C.sub }}>도장 심사는 2 ~ 3개월마다, 품, 단 심사는 국기원 일정에 맞춥니다.</p>
          <ol className="mt-12 grid gap-px sm:grid-cols-2 lg:grid-cols-3" style={{ background: C.line }}>
            {BELTS.map(([t, color, d], i) => (
              <li key={t} className="flex items-center gap-5 bg-white p-6 md:p-8">
                <span className="h-4 w-14 shrink-0 rounded-sm border" style={{ background: color, borderColor: "#d0d0d0" }} aria-hidden />
                <div>
                  <p className="text-[13px] font-bold tabular-nums" style={{ color: C.sub }}>STEP {i + 1}</p>
                  <h3 className="text-[21px] font-bold tracking-[-0.03em]">{t}</h3>
                  <p className="text-[15px]" style={{ color: C.sub }}>{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-5 md:px-10" style={{ background: C.soft }}>
        <div className="mx-auto grid max-w-[1320px] gap-10 py-20 md:grid-cols-2 md:gap-16 md:py-28">
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">국기원 승품, 승단 심사</h2>
            <dl className="mt-7 border-t" style={{ borderColor: C.ink }}>
              {[
                ["1품", "빨간띠 뒤 수련 1년 안팎, 만 15세 미만"],
                ["2품", "1품 취득 1년 뒤"],
                ["1단", "만 15세 이상, 또는 품을 단으로 전환"],
                ["준비반", "심사 2개월 전부터 주 2회 추가 수업"],
              ].map(([k, v]) => (
                <div key={k} className="grid gap-1 border-b py-4 sm:grid-cols-[96px_1fr]" style={{ borderColor: C.line }}>
                  <dt className="font-bold">{k}</dt>
                  <dd style={{ color: C.sub }}>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="flex flex-col justify-between gap-8 bg-black p-8 text-white md:p-10">
            <div>
              <p className="text-[14px] font-bold tracking-[0.2em]" style={{ color: C.red }}>KYORUGI TEAM</p>
              <h2 className="mt-4 text-[26px] font-bold tracking-[-0.04em] md:text-[32px]">겨루기 시합반</h2>
              <ul className="mt-5 grid gap-2.5 text-white/75">
                <li>초등 3학년 이상, 파란띠부터</li>
                <li>화, 목 19:00 ~ 20:30, 토요일 오전</li>
                <li>전자호구 연습, 지역 대회 연 4회 출전</li>
              </ul>
            </div>
            <p className="inline-flex items-center gap-1.5 font-bold">
              시합반 상담 <ArrowRight size={17} aria-hidden />
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-10" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2 md:flex-row md:justify-between">
          <p>한결 태권도, 경기도 용인시 수지구 일대. 국기원 공인 도장, 체육도장업 신고번호 000</p>
          <p>031-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
