"use client";

import Image from "next/image";


// 네일 시안 A 컬러 갤러리형(11-21 사례 분석: 네일샵 사이트는 "고객이 네일 디자인을 쉽게 찾아보도록" 메인 이미지와 디자인 묶음을 크게 둔다). 인물, 손 사진 없이 색과 병 사진으로. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/nail/a-*)
const IMG = "/images/drafts/nail";
const C = { ink: "#1a1718", sub: "#6e6769", line: "#ece7e8", soft: "#f5f3f3" };

const COLORS = [
  { n: "버건디", c: "#6d1f2c" },
  { n: "모카 브라운", c: "#8a6551" },
  { n: "누드 베이지", c: "#e2c3b0" },
  { n: "딥 그린", c: "#1f4a3d" },
  { n: "실버 펄", c: "#c9c9cf" },
  { n: "체리 레드", c: "#b3182b" },
];

const MENU = [
  ["젤 원컬러", "손 45,000 / 발 55,000"],
  ["그라데이션, 프렌치", "55,000"],
  ["이달의 아트", "65,000"],
  ["연장 (10개)", "80,000 ~"],
  ["케어만", "20,000"],
  ["젤 제거", "10,000 (다른 샵 시술 15,000)"],
];

export function NailA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="border-b bg-white" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[76px] max-w-[1280px] items-center justify-between px-5 md:px-10">
          <p className="text-[18px] font-bold tracking-[0.26em]">손끝네일</p>
          <nav aria-label="주 메뉴" className="hidden gap-10 text-[15px] font-medium lg:flex" style={{ color: C.sub }}>
            {["이달의 컬러", "디자인", "가격", "오시는 길"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
        </div>
      </header>

      <section className="px-5 md:px-10">
        <div className="mx-auto grid max-w-[1280px] items-center gap-10 py-14 lg:grid-cols-[1fr_1.3fr] lg:gap-16 lg:py-20">
          <div>
            <p className="text-[13px] font-bold tracking-[0.26em]" style={{ color: C.sub }}>WINTER 2026</p>
            <h1 className="mt-5 text-[40px] font-bold leading-[1.2] tracking-[-0.045em] md:text-[64px]">
              손끝에
              <br />
              계절을 바릅니다
            </h1>
            <p className="mt-6 max-w-[420px] text-[16px] md:text-[18px]" style={{ color: C.sub }}>젤 컬러 320가지를 갖추고 있습니다. 피부 톤에 맞는 색을 직접 손에 대어 보고 고르세요.</p>
          </div>
          <div className="relative aspect-[4/3]">
            <Image src={`${IMG}/a-hero.jpg`} alt="여러 색의 젤 네일 병이 선반에 줄지어 놓인 모습" fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1280px]">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[13px] font-bold tracking-[0.26em]" style={{ color: C.sub }}>COLOR OF THE MONTH</p>
              <h2 className="mt-4 text-[30px] font-bold tracking-[-0.04em] md:text-[46px]">12월의 컬러</h2>
            </div>
            <p className="text-[15px]" style={{ color: C.sub }}>이달의 컬러로 원컬러를 하시면 아트 한 개를 서비스로 해 드립니다.</p>
          </div>
          <ul className="mt-12 grid grid-cols-3 gap-4 md:grid-cols-6 md:gap-6">
            {COLORS.map((c) => (
              <li key={c.n} className="flex flex-col items-center gap-3">
                <span className="aspect-[3/4] w-full rounded-t-full rounded-b-[18px] shadow-[inset_0_-12px_24px_rgba(0,0,0,0.12)]" style={{ background: c.c }} aria-hidden />
                <span className="text-[14px] font-semibold md:text-[15px]">{c.n}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1280px] gap-10 md:grid-cols-[1fr_1.2fr] md:gap-16">
          <div className="relative aspect-[4/5]">
            <Image src={`${IMG}/a-bottles.jpg`} alt="흰 바탕 위의 여러 색 매니큐어 병" fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
          </div>
          <div className="self-center">
            <p className="text-[13px] font-bold tracking-[0.26em]" style={{ color: C.sub }}>PRICE</p>
            <h2 className="mt-4 text-[30px] font-bold tracking-[-0.04em] md:text-[46px]">가격</h2>
            <dl className="mt-8 border-t" style={{ borderColor: C.ink }}>
              {MENU.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b py-4" style={{ borderColor: C.line }}>
                  <dt className="font-semibold">{k}</dt>
                  <dd className="text-right font-bold tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 text-[15px]" style={{ color: C.sub }}>시술 후 7일 안에 들뜨면 무료로 보수합니다.</p>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-10 md:pb-28">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-8 py-12 text-white md:flex-row md:items-center md:justify-between md:px-14 md:py-16" style={{ background: C.ink }}>
          <div>
            <h2 className="text-[26px] font-bold leading-[1.4] tracking-[-0.04em] md:text-[36px]">원하는 디자인 사진을 보내 주세요</h2>
            <p className="mt-2 text-white/70">가능 여부와 가격, 걸리는 시간을 미리 알려 드립니다.</p>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-10" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1280px] flex-col gap-2 md:flex-row md:justify-between">
          <p>손끝네일, 서울특별시 마포구 연남동 일대, 매일 11:00 ~ 21:00</p>
          <p>대표전화 02-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
