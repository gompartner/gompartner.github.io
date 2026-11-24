"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

// 로스터리 시안 B 카페 매장형(11-21 사례 분석: Vibe Coffee, 아이캔커피처럼 메뉴마다 사진과 짧은 설명, 매장 안내를 크게. 동네 손님은 메뉴판과 원두 구매, 영업시간을 먼저 본다). 흰 바탕, 짙은 갈색 포인트. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/cof/b-*)
const IMG = "/images/drafts/cof";
const C = { ink: "#1c1714", sub: "#6b625b", line: "#ebe5e0", soft: "#f5f2ef", brown: "#5b3a24", orange: "#d9772b" };

const MENU: { g: string; rows: [string, string, string][] }[] = [
  { g: "에스프레소", rows: [["아메리카노", "4,500", "하우스 블렌드 또는 싱글 오리진 (+1,000)"], ["카페 라테", "5,000", "우유 대신 오트 가능"], ["플랫 화이트", "5,300", "더블 리스트레토"]] },
  { g: "브루잉", rows: [["오늘의 핸드드립", "6,000", "이번 주 원두 3종 중 선택"], ["콜드브루", "5,500", "12시간 추출"], ["드립백 10개", "15,000", "포장 판매"]] },
];

export function CoffeeB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[70px] max-w-[1200px] items-center justify-between px-5 md:px-8">
          <p className="text-[20px] font-bold tracking-[-0.03em]">아침볕 로스터리</p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#453c36" }}>
            {["메뉴", "원두", "매장", "오시는 길"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center rounded-full px-5 text-[15px] font-bold text-white" style={{ background: C.brown }}>
            원두 주문
          </span>
        </div>
      </header>

      <section className="px-5 pb-16 pt-10 md:px-8 md:pb-24 md:pt-14">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
          <div>
            <p className="text-[15px] font-bold" style={{ color: C.orange }}>매장에서 직접 볶는 커피</p>
            <h1 className="mt-4 text-[38px] font-bold leading-[1.22] tracking-[-0.045em] md:text-[60px]">
              오늘 마신 원두,
              <br />
              그대로 사 가세요
            </h1>
            <p className="mt-5 max-w-[460px] text-[17px] md:text-[19px]" style={{ color: C.sub }}>
              카운터 뒤 로스터에서 매주 볶습니다. 마셔 보고 마음에 든 원두는 원하는 굵기로 갈아 드립니다.
            </p>
            <p className="mt-9 inline-flex items-center gap-1.5 text-[16px] font-bold" style={{ color: C.brown }}>
              메뉴 보기 <ArrowRight size={17} aria-hidden />
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
            <Image src={`${IMG}/b-hero.jpg`} alt="에스프레소 머신에서 두 잔으로 추출되는 에스프레소" fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">메뉴</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {MENU.map((m) => (
              <div key={m.g} className="rounded-[24px] bg-white p-7 md:p-9">
                <h3 className="text-[20px] font-bold" style={{ color: C.brown }}>{m.g}</h3>
                <ul className="mt-4">
                  {m.rows.map(([n, p, d]) => (
                    <li key={n} className="border-b py-4" style={{ borderColor: C.line }}>
                      <div className="flex justify-between gap-4">
                        <span className="text-[18px] font-semibold">{n}</span>
                        <span className="font-bold tabular-nums">{p}</span>
                      </div>
                      <p className="text-[14px]" style={{ color: C.sub }}>{d}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">원두</h2>
          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              { img: "b-bag", alt: "나무 판 위의 원두와 분쇄한 커피", t: "하우스 블렌드", d: "고소하고 단맛이 긴 라테용", p: "200g 12,000" },
              { img: "b-drip", alt: "유리 서버에 내린 핸드드립 커피", t: "이번 주 싱글 오리진", d: "산미가 밝은 드립용 3종", p: "200g 15,000 ~" },
              { img: "b-latte", alt: "나무 판 위의 라테 두 잔", t: "디카페인", d: "저녁에도 마시는 콜롬비아", p: "200g 14,000" },
            ].map((b) => (
              <li key={b.t}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-[20px]">
                  <Image src={`${IMG}/${b.img}.jpg`} alt={b.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
                </div>
                <h3 className="mt-5 text-[21px] font-bold tracking-[-0.03em]">{b.t}</h3>
                <p className="text-[15px]" style={{ color: C.sub }}>{b.d}</p>
                <p className="mt-2 font-bold tabular-nums">{b.p}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto grid max-w-[1200px] gap-6 rounded-[28px] p-8 text-white md:grid-cols-[1.2fr_1fr] md:p-12" style={{ background: C.brown }}>
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">매장 안내</h2>
            <p className="mt-3 text-white/75">좌석 28석, 콘센트 자리 10석. 로스팅하는 화요일, 금요일 오전에는 볶는 냄새가 납니다.</p>
          </div>
          <dl className="grid gap-3">
            {[
              ["평일", "08:00 ~ 20:00"],
              ["주말", "10:00 ~ 20:00"],
              ["위치", "대전광역시 유성구 일대, 1층"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-white/15 pb-3">
                <dt className="text-white/65">{k}</dt>
                <dd className="text-right font-bold">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 md:flex-row md:justify-between">
          <p>아침볕 로스터리, 대전광역시 유성구 일대</p>
          <p>원두 문의 042-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
