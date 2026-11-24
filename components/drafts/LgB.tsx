"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

// 물류 대행 시안 B 기업 3PL형(11-22 사례 분석: 영케이3PL처럼 B2B 사업자 대상. 제조사, 유통사 물류 담당자는 팔레트 보관 규모, 기업 납품(마트, 대리점) 배송, 수출입 컨테이너 작업, 재고 보고 방식을 묻는다). 흰 바탕, 검정과 노랑. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/lg/b-*)
const IMG = "/images/drafts/lg";
const C = { ink: "#141414", sub: "#646464", line: "#e8e8e8", soft: "#f5f5f3", yellow: "#f5b301" };

const SERVICES = [
  ["팔레트 보관", "상온 4,000 팔레트, 지게차 하역"],
  ["기업 납품", "대형마트, 대리점 정기 배송, 차량 배차"],
  ["컨테이너 작업", "20, 40피트 적입, 적출, 검수"],
  ["유통가공", "세트 구성, 라벨 부착, 재포장"],
];

export function LgB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between px-5 md:px-10">
          <p className="text-[18px] font-bold tracking-[0.04em]">
            한길<span style={{ color: "#c08a00" }}>로지스</span>
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#444" }}>
            {["서비스", "센터", "재고 보고", "견적 문의"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center px-5 text-[15px] font-bold" style={{ background: C.yellow, color: C.ink }}>
            견적 문의
          </span>
        </div>
      </header>

      <section className="px-5 pt-12 md:px-10 md:pt-20">
        <div className="mx-auto max-w-[1320px]">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h1 className="text-[38px] font-bold leading-[1.2] tracking-[-0.05em] md:text-[72px]">
              팔레트 단위로
              <br />
              받고, 쌓고, 보냅니다
            </h1>
            <p className="max-w-[380px]" style={{ color: C.sub }}>
              제조사와 수입사의 기업 물류를 맡습니다. 컨테이너 입고부터 마트 납품까지 한 계약으로 처리합니다.
            </p>
          </div>
          <div className="relative mt-10 aspect-[4/3] overflow-hidden md:aspect-[21/9]">
            <Image src={`${IMG}/b-hero.jpg`} alt="야적장에 높이 쌓인 나무 팔레트" fill priority sizes="100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1320px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">서비스</h2>
          <ul className="mt-10 border-t" style={{ borderColor: C.ink }}>
            {SERVICES.map(([t, d]) => (
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
        <div className="mx-auto grid max-w-[1320px] items-center gap-10 py-20 md:grid-cols-2 md:gap-16 md:py-28">
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image src={`${IMG}/b-container.jpg`} alt="문이 열린 파란 컨테이너 안 상자와 팔레트" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">센터</h2>
            <dl className="mt-7 border-t" style={{ borderColor: C.ink }}>
              {[
                ["위치", "경기 평택, 평택항 15분, 경부고속도로 10분"],
                ["규모", "연면적 16,500㎡, 도크 12면"],
                ["보관", "상온 4,000 팔레트, 저온 600 팔레트"],
                ["운영", "평일 07:00 ~ 22:00, 토요일 오전"],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[64px_1fr] gap-3 border-b py-4" style={{ borderColor: "#dededa" }}>
                  <dt className="font-bold">{k}</dt>
                  <dd style={{ color: C.sub }}>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1320px] gap-4 md:grid-cols-2">
          <div className="border p-8 md:p-10" style={{ borderColor: C.line }}>
            <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">재고 보고</h2>
            <ul className="mt-5 grid gap-2.5" style={{ color: C.sub }}>
              <li className="border-b pb-2.5" style={{ borderColor: C.line }}>매일 아침 8시 품목별, 로트별 재고표 메일 발송</li>
              <li className="border-b pb-2.5" style={{ borderColor: C.line }}>유통기한 90일 이내 품목 따로 표시</li>
              <li>월말 실사 1회, 차이 내역 보고</li>
            </ul>
          </div>
          <div className="flex flex-col justify-between gap-8 bg-black p-8 text-white md:p-10">
            <div>
              <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">견적 문의</h2>
              <p className="mt-3 text-white/70">품목 수, 월 입출고 팔레트 수, 납품처를 알려 주시면 센터 견학 일정과 견적을 함께 드립니다.</p>
            </div>
            <p className="text-[28px] font-bold tabular-nums" style={{ color: C.yellow }}>031-000-0000</p>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-10" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2 md:flex-row md:justify-between">
          <p>(주)한길로지스, 경기도 평택시 일대. 사업자등록번호 000-00-00000, 화물자동차운송주선사업 허가</p>
          <p>031-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
