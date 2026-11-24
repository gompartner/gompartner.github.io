"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

// 공인중개사 시안 A 단지 전문형(11-21 사례 분석: 실제 중개사무소 사이트는 지역 단지, 학교, 교통 정보를 메인에 두고, 법정 표시사항을 모든 화면에 적는다). 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/re/a-*)
const IMG = "/images/drafts/re";
const C = { ink: "#14181d", sub: "#646b74", line: "#e4e7eb", soft: "#f3f5f7", navy: "#1d3557" };

const LISTINGS = [
  { k: "매매", t: "역세권 대단지 84㎡", f: "15층 / 25층, 남향", p: "9억 2,000만" },
  { k: "전세", t: "초등학교 앞 단지 59㎡", f: "8층 / 20층, 확장", p: "4억 3,000만" },
  { k: "월세", t: "신축 단지 49㎡", f: "11층 / 29층, 풀옵션", p: "3,000 / 120" },
  { k: "매매", t: "공원 앞 단지 114㎡", f: "21층 / 30층, 탑층 아래", p: "13억 5,000만" },
];

export function EstateA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="border-b bg-white" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[76px] max-w-[1280px] items-center justify-between px-5 md:px-10">
          <p className="text-[20px] font-bold tracking-[-0.03em]">푸른단지 공인중개사사무소</p>
          <nav aria-label="주 메뉴" className="hidden gap-10 text-[15px] font-medium lg:flex" style={{ color: C.sub }}>
            {["단지 정보", "추천 매물", "중개 과정", "오시는 길"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="text-[15px] font-bold tabular-nums">02-000-0000</span>
        </div>
      </header>

      <section className="px-5 md:px-10">
        <div className="mx-auto grid max-w-[1280px] items-center gap-10 py-14 lg:grid-cols-[1fr_1.25fr] lg:gap-16 lg:py-20">
          <div>
            <p className="text-[15px] font-bold" style={{ color: C.navy }}>용산구 아파트 단지 전문</p>
            <h1 className="mt-5 text-[38px] font-bold leading-[1.22] tracking-[-0.045em] md:text-[60px]">
              이 동네 단지만
              <br />
              15년째 중개합니다
            </h1>
            <p className="mt-6 max-w-[440px] text-[16px] md:text-[18px]" style={{ color: C.sub }}>
              동마다 일조와 소음, 같은 평형의 최근 거래가를 알고 있습니다. 현장에서 직접 보여 드리고 설명합니다.
            </p>
            <dl className="mt-10 grid max-w-[440px] grid-cols-3 border-t pt-7" style={{ borderColor: C.ink }}>
              {[
                ["12개", "담당 단지"],
                ["1.8만", "세대"],
                ["15년", "같은 자리"],
              ].map(([v, k]) => (
                <div key={k}>
                  <dt className="text-[26px] font-bold tracking-[-0.03em] md:text-[32px]">{v}</dt>
                  <dd className="text-[14px]" style={{ color: C.sub }}>{k}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative aspect-[4/3] lg:aspect-[5/4]">
            <Image src={`${IMG}/a-hero.jpg`} alt="남산 아래로 늘어선 아파트 단지" fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1280px]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">추천 매물</h2>
            <p className="inline-flex items-center gap-1.5 text-[15px] font-bold">
              매물 전체 보기 <ArrowRight size={16} aria-hidden />
            </p>
          </div>
          <ul className="mt-10 grid gap-px md:grid-cols-4" style={{ background: C.line }}>
            {LISTINGS.map((l) => (
              <li key={l.t} className="bg-white p-7">
                <span className="inline-flex px-2.5 py-0.5 text-[13px] font-bold text-white" style={{ background: l.k === "매매" ? C.navy : l.k === "전세" ? "#3f7d6e" : "#9a6a2f" }}>{l.k}</span>
                <h3 className="mt-4 text-[20px] font-bold tracking-[-0.03em]">{l.t}</h3>
                <p className="mt-1 text-[15px]" style={{ color: C.sub }}>{l.f}</p>
                <p className="mt-6 text-[24px] font-bold tracking-[-0.03em] tabular-nums">{l.p}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[14px]" style={{ color: C.sub }}>매물 정보는 등기부와 현장 확인을 거쳐 올리며, 거래가 끝나면 바로 내립니다.</p>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1280px] gap-10 md:grid-cols-[1.2fr_1fr] md:items-center md:gap-16">
          <div className="relative aspect-[4/3]">
            <Image src={`${IMG}/a-room.jpg`} alt="큰 창으로 빛이 드는 빈 거실" fill sizes="(min-width: 768px) 55vw, 100vw" className="object-cover" />
          </div>
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[40px]">계약서 쓰기 전에 먼저 확인합니다</h2>
            <ol className="mt-8 border-t" style={{ borderColor: C.ink }}>
              {[
                ["등기부 확인", "소유자, 근저당, 압류를 계약 당일 다시 뗍니다."],
                ["시세 비교", "같은 단지, 같은 평형의 최근 실거래가를 함께 봅니다."],
                ["특약 정리", "수리, 입주일, 잔금 조건을 특약 문구로 적어 둡니다."],
                ["잔금, 입주", "잔금일 등기 이전과 관리비 정산까지 챙깁니다."],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-5 border-b py-5" style={{ borderColor: C.line }}>
                  <span className="text-[14px] font-bold tabular-nums" style={{ color: C.sub }}>0{i + 1}</span>
                  <div>
                    <p className="font-bold">{t}</p>
                    <p className="text-[15px]" style={{ color: C.sub }}>{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-10 md:pb-28">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-8 py-12 text-white md:flex-row md:items-center md:justify-between md:px-14 md:py-16" style={{ background: C.navy }}>
          <div>
            <h2 className="text-[26px] font-bold leading-[1.4] tracking-[-0.04em] md:text-[36px]">집을 내놓으실 계획이신가요?</h2>
            <p className="mt-2 text-white/75">단지와 평형만 알려 주시면 최근 거래가와 예상 기간을 알려 드립니다.</p>
          </div>
          <span className="inline-flex h-[56px] shrink-0 items-center gap-2 self-start bg-white px-7 text-[16px] font-bold md:self-auto" style={{ color: C.navy }}>
            매도, 임대 의뢰
            <ArrowRight size={18} aria-hidden />
          </span>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-10" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto grid max-w-[1280px] gap-1.5">
          <p className="font-bold" style={{ color: C.ink }}>푸른단지 공인중개사사무소</p>
          <p>소재지 서울특별시 용산구 일대 상가 1층 | 중개사무소 등록번호 제00000-0000-00000호 | 대표 공인중개사</p>
          <p>전화 02-000-0000 | 사업자등록번호 000-00-00000</p>
        </div>
      </footer>
    </div>
  );
}
