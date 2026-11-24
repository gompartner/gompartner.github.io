"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

// 재고 관리 SaaS 시안 B 업종별 도입형(11-22 사례 분석: 채널톡처럼 고객사 로고 띠 대신 업종별 쓰는 법을 보여 주고, 매장 수에 따라 바뀌는 요금표. 여러 매장 운영자는 우리 업종에 맞는지, 매장 늘면 얼마인지, POS, 쇼핑몰과 붙는지를 묻는다). 흰 바탕, 검정과 주황. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/sa/b-*)
const IMG = "/images/drafts/sa";
const C = { ink: "#121212", sub: "#636363", line: "#e7e7e7", soft: "#f5f5f5", orange: "#ea580c" };

const INDUSTRIES = [
  ["카페와 베이커리", "원두, 우유, 포장재처럼 자주 떨어지는 소모품 알림"],
  ["편의점과 마트", "유통기한 임박 품목 목록, 폐기 기록"],
  ["의류와 잡화", "색상, 사이즈별 재고와 매장 간 이동"],
  ["온라인 셀러", "쇼핑몰 주문이 들어오면 재고 자동 차감"],
];

const PRICE = [
  ["1 ~ 2곳", "월 19,000원"],
  ["3 ~ 5곳", "매장당 월 15,000원"],
  ["6 ~ 20곳", "매장당 월 12,000원"],
  ["21곳 이상", "별도 견적"],
];

export function SaB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between px-5 md:px-10">
          <p className="text-[18px] font-bold tracking-[0.06em]">
            STOCK<span style={{ color: C.orange }}>LY</span>
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#444" }}>
            {["업종별", "매장 수별 요금", "연동", "도입 문의"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center px-5 text-[15px] font-bold text-white" style={{ background: C.ink }}>
            도입 문의
          </span>
        </div>
      </header>

      <section className="px-5 pt-12 md:px-10 md:pt-20">
        <div className="mx-auto max-w-[1320px]">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h1 className="text-[38px] font-bold leading-[1.2] tracking-[-0.05em] md:text-[72px]">
              매장이 늘어도
              <br />
              재고표는 하나
            </h1>
            <p className="max-w-[380px]" style={{ color: C.sub }}>
              본사와 매장이 같은 재고를 봅니다. 어느 매장에 무엇이 남았는지, 어디로 옮기면 되는지 바로 압니다.
            </p>
          </div>
          <div className="relative mt-10 aspect-[4/3] overflow-hidden md:aspect-[21/9]">
            <Image src={`${IMG}/b-hero.jpg`} alt="과일이 칸마다 가득 진열된 매장 선반" fill priority sizes="100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1320px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">업종별로 이렇게 씁니다</h2>
          <ul className="mt-10 border-t" style={{ borderColor: C.ink }}>
            {INDUSTRIES.map(([t, d]) => (
              <li key={t} className="grid gap-1 border-b py-6 md:grid-cols-[1fr_2.2fr_auto] md:items-center md:gap-6" style={{ borderColor: C.line }}>
                <h3 className="text-[23px] font-bold tracking-[-0.03em]">{t}</h3>
                <p style={{ color: C.sub }}>{d}</p>
                <ArrowRight size={20} className="hidden md:block" aria-hidden />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 md:px-10" style={{ background: C.soft }}>
        <div className="mx-auto grid max-w-[1320px] gap-10 py-20 md:grid-cols-2 md:gap-16 md:py-28">
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">매장 수별 요금</h2>
            <dl className="mt-7 border-t" style={{ borderColor: C.ink }}>
              {PRICE.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[110px_1fr] gap-3 border-b py-4" style={{ borderColor: "#dcdcdc" }}>
                  <dt className="font-bold tabular-nums">{k}</dt>
                  <dd className="font-semibold tabular-nums" style={{ color: C.orange }}>{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[15px]" style={{ color: C.sub }}>모든 요금에 품목 무제한, 직원 계정 무제한. 연 결제 15% 할인, 부가세 별도.</p>
          </div>
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">연동</h2>
            <ul className="mt-7 flex flex-wrap gap-2">
              {["POS 판매 데이터", "스마트스토어", "자사몰 주문", "엑셀 내보내기", "세금계산서 품목", "바코드 스캐너"].map((m) => (
                <li key={m} className="rounded-full border bg-white px-4 py-1.5 font-semibold" style={{ borderColor: C.line }}>{m}</li>
              ))}
            </ul>
            <p className="mt-6 text-[15px]" style={{ color: C.sub }}>판매가 찍히면 재고가 빠지고, 입고는 바코드로 찍어 넣습니다.</p>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-6 bg-black p-8 text-white md:flex-row md:items-center md:justify-between md:p-12">
          <div>
            <h2 className="text-[26px] font-bold tracking-[-0.04em] md:text-[34px]">도입 문의</h2>
            <p className="mt-2 text-white/70">매장 수와 쓰시는 POS를 알려 주시면 30분 화상 시연으로 실제 화면을 보여 드립니다.</p>
          </div>
          <p className="inline-flex shrink-0 items-center gap-2 text-[22px] font-bold tabular-nums" style={{ color: C.orange }}>
            1600-0000 <ArrowRight size={20} aria-hidden />
          </p>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-10" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2 md:flex-row md:justify-between">
          <p>(주)스톡리, 경기도 성남시 분당구 판교 일대. 사업자등록번호 000-00-00000</p>
          <p>1600-0000</p>
        </div>
      </footer>
    </div>
  );
}
