"use client";

import Image from "next/image";
import { Clock } from "lucide-react";

// 물류 대행 시안 A 풀필먼트형(11-22 사례 분석: 라라로지스처럼 "단 1건이라도" 중소 판매자 대상, 영케이3PL처럼 하루 출고 시간표. 온라인 판매자는 몇 시까지 주문이 당일 나가는지, 입고, 보관, 출고 비용이 각각 얼마인지, 어느 택배를 쓰는지 묻는다). 흰 바탕, 남색과 하늘색. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/lg/a-*)
const IMG = "/images/drafts/lg";
const C = { ink: "#0f1a2c", sub: "#5a6578", line: "#e1e7ef", soft: "#f1f5fa", navy: "#12345e", sky: "#2f8fdc" };

const DAY = [
  ["09:00", "전날 주문 수집, 송장 출력"],
  ["11:00", "1차 출고, 택배사 집하"],
  ["14:00", "당일 출고 주문 마감"],
  ["16:00", "2차 출고, 택배사 집하"],
  ["17:00", "반품 검수, 재고 반영"],
];

const FEE = [
  ["입고", "박스당 500원", "수량, 상태 검수 포함"],
  ["보관", "팔레트당 월 25,000원", "상온, 소량은 선반 칸 단위"],
  ["출고", "건당 900원", "합포장 1개 추가마다 200원"],
  ["택배", "건당 2,100원부터", "60cm 이하, 계약 단가"],
  ["반품", "건당 1,500원", "검수 뒤 재입고 또는 폐기"],
];

export function LgA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="absolute inset-x-0 z-20 text-white">
        <div className="mx-auto flex h-[78px] max-w-[1320px] items-center justify-between px-5 md:px-10">
          <p className="text-[18px] font-bold tracking-[0.06em]">
            BOXGO <span style={{ color: "#8fc6f2" }}>풀필먼트</span>
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-10 text-[15px] font-medium text-white/85 lg:flex">
            {["출고 일정", "요금", "물류센터", "도입 상담"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-10 items-center border border-white/70 px-5 text-[14px] font-bold">도입 상담</span>
        </div>
      </header>

      <section className="relative flex min-h-[600px] items-end overflow-hidden bg-black text-white md:h-[90svh]">
        <Image src={`${IMG}/a-hero.jpg`} alt="상자가 가득 쌓인 높은 물류 선반 사이 통로" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/40" aria-hidden />
        <div className="relative mx-auto w-full max-w-[1320px] px-5 pb-16 md:px-10 md:pb-24">
          <p className="text-[14px] font-bold tracking-[0.2em]" style={{ color: "#8fc6f2" }}>FULFILLMENT</p>
          <h1 className="mt-5 text-[40px] font-bold leading-[1.2] tracking-[-0.045em] md:text-[72px]">
            오후 2시 주문까지
            <br />
            오늘 출고합니다
          </h1>
          <p className="mt-6 max-w-[540px] text-white/75">하루 10건부터 맡길 수 있습니다. 입고, 보관, 포장, 택배, 반품을 한 센터에서 처리하고 재고는 실시간으로 보여 드립니다.</p>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1320px] gap-10 md:grid-cols-[1fr_1.2fr] md:gap-16">
          <div>
            <h2 className="flex items-center gap-3 text-[32px] font-bold tracking-[-0.04em] md:text-[46px]">
              <Clock size={32} style={{ color: C.sky }} aria-hidden /> 하루 출고 일정
            </h2>
            <p className="mt-3" style={{ color: C.sub }}>평일 기준, 토요일은 11시 1차 출고만 합니다.</p>
          </div>
          <ol className="border-t" style={{ borderColor: C.ink }}>
            {DAY.map(([t, d]) => (
              <li key={t} className="grid grid-cols-[80px_1fr] gap-3 border-b py-4" style={{ borderColor: C.line }}>
                <span className="text-[19px] font-bold tabular-nums" style={{ color: t === "14:00" ? C.sky : C.ink }}>{t}</span>
                <span style={{ color: t === "14:00" ? C.ink : C.sub, fontWeight: t === "14:00" ? 700 : 400 }}>{d}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-5 md:px-10" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1320px] py-20 md:py-28">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">항목별 이용 요금</h2>
          <ul className="mt-10 bg-white">
            {FEE.map(([t, p, d]) => (
              <li key={t} className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 border-b px-6 py-5 last:border-b-0 md:grid-cols-[0.6fr_1fr_1.4fr] md:items-center md:px-8" style={{ borderColor: C.line }}>
                <span className="text-[19px] font-bold">{t}</span>
                <span className="text-right font-bold tabular-nums md:text-left" style={{ color: C.navy }}>{p}</span>
                <span className="col-span-2 text-[15px] md:col-span-1" style={{ color: C.sub }}>{d}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[15px]" style={{ color: C.sub }}>월 기본료 없음, 부가세 별도. 월 3,000건 이상은 단가를 따로 정합니다.</p>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1320px] gap-4 md:grid-cols-2">
          <div className="overflow-hidden border" style={{ borderColor: C.line }}>
            <div className="relative aspect-[16/9]">
              <Image src={`${IMG}/a-box.jpg`} alt="흰 라벨을 붙인 택배 상자 두 개" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
            </div>
            <div className="p-8">
              <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[28px]">물류센터</h2>
              <p className="mt-3" style={{ color: C.sub }}>경기 이천, 연면적 9,900㎡. 상온 보관, 랙 2,400칸, CCTV 24시간.</p>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-8 p-8 text-white md:p-10" style={{ background: C.navy }}>
            <div>
              <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">도입 상담</h2>
              <p className="mt-3 text-white/75">하루 주문 건수, 상품 크기, 쓰시는 쇼핑몰을 알려 주시면 예상 월 비용을 계산해 드립니다. 입고는 상담 뒤 3일이면 시작합니다.</p>
            </div>
            <p className="text-[28px] font-bold tabular-nums">031-000-0000</p>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-10" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2 md:flex-row md:justify-between">
          <p>(주)박스고, 경기도 이천시 일대. 사업자등록번호 000-00-00000</p>
          <p>031-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
