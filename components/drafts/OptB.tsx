"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

// 안경원 시안 B 안경테 셀렉트숍형(11-22 사례 분석: 아임웹 납품 사례 없음. 동네 안경원과 달리 테 소재와 디자인으로 고르는 손님은 소재별 테, 도수 선글라스, 제작 시간을 묻는다). 흰 바탕, 검정. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/opt/b-*)
const IMG = "/images/drafts/opt";
const C = { ink: "#111", sub: "#6a6a6a", line: "#e7e7e7", soft: "#f5f5f5", amber: "#b4782f" };

const FRAMES = [
  ["티타늄", "가볍고 땀에 강함, 얇은 금속테", "16g 안팎"],
  ["아세테이트", "뿔테, 색과 무늬가 다양", "24g 안팎"],
  ["베타 티타늄", "탄성이 있어 코받침 자국이 적음", "12g 안팎"],
  ["콤비", "윗부분 뿔테, 아랫부분 금속", "20g 안팎"],
];

export function OptB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="absolute inset-x-0 z-20 text-white">
        <div className="mx-auto flex h-[76px] max-w-[1320px] items-center justify-between px-5 md:px-10">
          <p className="text-[18px] font-bold tracking-[0.08em]">OPTIQUE SOL</p>
          <nav aria-label="주 메뉴" className="hidden gap-10 text-[14px] font-semibold md:flex">
            {["안경테", "선글라스", "시력 검사", "매장"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="text-[14px] font-semibold md:hidden">메뉴</span>
        </div>
      </header>

      <section className="relative flex min-h-[600px] items-end overflow-hidden text-white md:h-[92svh]">
        <Image src={`${IMG}/b-hero.jpg`} alt="조명 아래 칸마다 선글라스가 놓인 진열장" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/30" aria-hidden />
        <div className="relative mx-auto flex w-full max-w-[1320px] flex-col gap-6 px-5 pb-14 md:flex-row md:items-end md:justify-between md:px-10 md:pb-20">
          <h1 className="text-[38px] font-bold leading-[1.22] tracking-[-0.045em] md:text-[66px]">
            얼굴에 맞는 테를
            <br />
            고르는 곳
          </h1>
          <p className="max-w-[380px] text-white/80">국내외 하우스 브랜드 안경테 600여 종. 얼굴 폭과 코 높이를 재고 맞는 테부터 꺼내 드립니다.</p>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1320px]">
          <div className="flex items-end justify-between border-b pb-4" style={{ borderColor: C.ink }}>
            <h2 className="text-[14px] font-bold ">안경테</h2>
            <span className="text-[14px]" style={{ color: C.sub }}>소재별</span>
          </div>
          <ul className="mt-2">
            {FRAMES.map(([t, d, w]) => (
              <li key={t} className="grid gap-1 border-b py-6 md:grid-cols-[1fr_2fr_auto] md:items-center md:gap-6" style={{ borderColor: C.line }}>
                <h3 className="text-[24px] font-bold tracking-[-0.03em]">{t}</h3>
                <p style={{ color: C.sub }}>{d}</p>
                <p className="text-[15px] font-bold tabular-nums" style={{ color: C.amber }}>{w}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 md:px-10">
        <div className="mx-auto grid max-w-[1320px] gap-3 md:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image src={`${IMG}/b-rack.jpg`} alt="흰 선반에 나란히 놓인 검은 테 선글라스" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
          <div className="flex flex-col justify-center p-2 md:p-12">
            <h2 className="text-[14px] font-bold ">선글라스</h2>
            <p className="mt-4 text-[28px] font-bold leading-[1.4] tracking-[-0.04em] md:text-[36px]">선글라스에도 도수를 넣습니다</p>
            <ul className="mt-6 grid gap-2" style={{ color: C.sub }}>
              <li>짙은 색, 편광, 변색 렌즈 선택</li>
              <li>운전용은 신호등 색이 바뀌지 않는 회색 계열 권장</li>
              <li>커브가 큰 테는 넣을 수 있는 도수 범위를 먼저 확인합니다</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1320px] items-center gap-10 md:grid-cols-[1.2fr_1fr] md:gap-16">
          <div>
            <h2 className="text-[14px] font-bold ">시력 검사</h2>
            <p className="mt-4 text-[28px] font-bold leading-[1.4] tracking-[-0.04em] md:text-[36px]">검사부터 받아 가기까지</p>
            <dl className="mt-8 border-t" style={{ borderColor: C.ink }}>
              {[
                ["시력 검사", "20분, 안경사 직접 검사"],
                ["일반 렌즈", "당일 1시간 안 제작"],
                ["주문 렌즈", "누진, 고굴절은 3 ~ 5일"],
                ["피팅 조정", "구매 매장에서 언제든 무료"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b py-4" style={{ borderColor: C.line }}>
                  <dt style={{ color: C.sub }}>{k}</dt>
                  <dd className="text-right font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image src={`${IMG}/b-sun.jpg`} alt="따뜻한 조명 아래 나무 탁자 위 선글라스" fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-10 md:pb-28">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-6 p-8 text-white md:flex-row md:items-center md:justify-between md:p-12" style={{ background: C.ink }}>
          <div>
            <h2 className="text-[14px] font-bold text-white/60">매장</h2>
            <p className="mt-3 text-[24px] font-bold md:text-[30px]">성수동, 매일 11:00 ~ 20:00</p>
          </div>
          <p className="inline-flex items-center gap-1.5 text-[18px] font-bold">
            02-000-0000 <ArrowUpRight size={18} aria-hidden />
          </p>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-10" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2 md:flex-row md:justify-between">
          <p>옵티크 솔, 서울특별시 성동구 일대. 안경사, 사업자등록번호 000-00-00000</p>
          <p>02-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
