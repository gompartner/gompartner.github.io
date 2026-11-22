"use client";

import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";

// 변리사 시안 B 상표 출원형(11-22 사례 분석: 사례 사이트는 기술 특허 위주. 소상공인, 쇼핑몰 대표는 "이 이름 등록될까, 몇 류에 내야 하나, 얼마나 걸리나"를 묻는다). 흰 바탕, 주황. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/pat/b-*)
const IMG = "/images/drafts/pat";
const C = { ink: "#1c1714", sub: "#675e57", line: "#ece6e1", soft: "#f8f5f2", orange: "#d9541e", orangeSoft: "#fdeee6" };

const CLASSES = [
  ["화장품", "3류", "스킨케어, 향수, 비누"],
  ["식품, 음료", "29, 30, 32류", "가공식품, 커피, 음료"],
  ["의류, 잡화", "25류, 18류", "옷, 신발, 가방"],
  ["카페, 식당", "43류", "음식점업, 카페업"],
  ["온라인 쇼핑몰", "35류", "도소매업, 판매 대행"],
  ["앱, 소프트웨어", "9류, 42류", "앱, SaaS 서비스"],
];

export function PatB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[70px] max-w-[1200px] items-center justify-between px-5 md:px-8">
          <p className="text-[20px] font-bold tracking-[-0.03em]">
            보람 <span style={{ color: C.orange }}>특허사무소</span>
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#4a423c" }}>
            {["상표 출원", "상품류 안내", "진행 기간", "디자인"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center rounded-full px-5 text-[15px] font-bold text-white" style={{ background: C.orange }}>
            무료 검토
          </span>
        </div>
      </header>

      <section className="px-5 pb-16 pt-10 md:px-8 md:pb-24 md:pt-14">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
          <div>
            <p className="inline-flex rounded-full px-3 py-1 text-[14px] font-bold" style={{ background: C.orangeSoft, color: C.orange }}>변리사 직접 검토</p>
            <h1 className="mt-5 text-[36px] font-bold leading-[1.24] tracking-[-0.045em] md:text-[56px]">
              브랜드 이름,
              <br />
              간판 달기 전에 등록하세요
            </h1>
            <p className="mt-5 max-w-[460px] text-[17px] md:text-[18px]" style={{ color: C.sub }}>
              먼저 출원한 사람이 권리를 가집니다. 이름과 판매할 상품을 알려 주시면 비슷한 상표가 있는지 영업일 1일 안에 회신합니다.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
            <Image src={`${IMG}/b-hero.jpg`} alt="분홍 상자와 흰 크림 튜브 화장품 패키지" fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">업종별 상품류</h2>
          <p className="mt-3" style={{ color: C.sub }}>상표는 상품류마다 따로 출원합니다. 업종별로 많이 내는 류입니다.</p>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CLASSES.map(([t, c, d]) => (
              <li key={t} className="rounded-[20px] bg-white p-6 md:p-7">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-[20px] font-bold tracking-[-0.03em]">{t}</h3>
                  <span className="shrink-0 text-[15px] font-bold" style={{ color: C.orange }}>{c}</span>
                </div>
                <p className="mt-1 text-[15px]" style={{ color: C.sub }}>{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 md:grid-cols-[1.05fr_1fr] md:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[24px]">
            <Image src={`${IMG}/b-pack.jpg`} alt="초록색 원통형 음료 용기 두 개" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">출원 전 검토하는 것</h2>
            <ul className="mt-7 grid gap-3">
              {[
                "같거나 비슷한 상표가 먼저 출원됐는지",
                "흔한 단어, 지명, 품질 표시만으로 된 이름인지",
                "로고와 글자를 따로 낼지 함께 낼지",
                "해외 판매 계획이 있으면 국제 출원 시기",
              ].map((x) => (
                <li key={x} className="flex items-start gap-3 border-b pb-3" style={{ borderColor: C.line }}>
                  <Check size={18} className="mt-[5px] shrink-0" style={{ color: C.orange }} aria-hidden />
                  {x}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto grid max-w-[1200px] gap-8 rounded-[28px] p-8 text-white md:grid-cols-[1.2fr_1fr] md:p-12" style={{ background: C.ink }}>
          <div>
            <h2 className="text-[26px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[34px]">진행 기간</h2>
            <ol className="mt-6 grid gap-4">
              {[
                ["검토, 출원", "회신 후 2 ~ 3일 안 출원"],
                ["심사", "보통 1년 안팎, 우선심사 시 2 ~ 3개월"],
                ["출원 공고", "2개월 이의신청 기간"],
                ["등록", "등록료 납부 후 10년, 갱신 가능"],
              ].map(([k, v], i) => (
                <li key={k} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[14px] font-bold" style={{ background: C.orange }}>{i + 1}</span>
                  <div>
                    <p className="font-bold">{k}</p>
                    <p className="text-[15px] text-white/65">{v}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-7 inline-flex items-center gap-1.5 font-bold" style={{ color: "#ffb48f" }}>
              상표 이름 보내기 <ArrowRight size={18} aria-hidden />
            </p>
          </div>
          <div className="relative min-h-[260px] overflow-hidden rounded-[20px]">
            <Image src={`${IMG}/b-draw.jpg`} alt="벽에 걸린 오래된 특허 도면 액자" fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 md:flex-row md:justify-between">
          <p>보람 특허사무소, 경기도 성남시 분당구 일대. 변리사, 사업자등록번호 000-00-00000</p>
          <p>평일 09:00 ~ 18:00, 031-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
