"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

// 로스터리 시안 A 원두 브랜드형(11-21 사례 분석: 아하커피, 로스팅 시고처럼 어두운 커피 사진과 한 줄, 원두를 상품처럼 산지, 무게, 가격으로 나열). 로스팅 날짜와 카페 납품 창구를 더했다. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/cof/a-*)
const IMG = "/images/drafts/cof";
const C = { ink: "#16110e", sub: "#6e655e", line: "#e8e3df", soft: "#f4f1ee", brown: "#7a4a2a" };

const BEANS = [
  { n: "에티오피아 예가체프", o: "워시드, 해발 2,000m", note: "자스민, 레몬, 홍차", r: "라이트", p: "16,000" },
  { n: "콜롬비아 우일라", o: "워시드, 카투라", note: "붉은 사과, 캐러멜", r: "미디엄", p: "15,000" },
  { n: "하우스 블렌드", o: "브라질, 과테말라", note: "다크초콜릿, 견과", r: "미디엄 다크", p: "13,000" },
];

export function CoffeeA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="absolute inset-x-0 z-20 text-white">
        <div className="mx-auto flex h-[78px] max-w-[1320px] items-center justify-between px-5 md:px-10">
          <p className="text-[17px] font-bold tracking-[0.28em]">검은콩 로스터리</p>
          <nav aria-label="주 메뉴" className="hidden gap-10 text-[15px] font-medium text-white/85 lg:flex">
            {["원두", "로스팅 일정", "카페 납품", "매장"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-10 items-center border border-white/70 px-5 text-[14px] font-bold">원두 구매</span>
        </div>
      </header>

      <section className="relative flex min-h-[640px] items-end overflow-hidden text-white md:h-[100svh]">
        <Image src={`${IMG}/a-hero.jpg`} alt="로스터 냉각판 위에서 섞이는 갓 볶은 원두" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.75) 100%)" }} aria-hidden />
        <div className="relative mx-auto flex w-full max-w-[1320px] flex-col gap-8 px-5 pb-16 md:flex-row md:items-end md:justify-between md:px-10 md:pb-24">
          <h1 className="text-[42px] font-bold leading-[1.18] tracking-[-0.045em] md:text-[78px]">
            볶은 지
            <br />
            일주일 안의 원두만
          </h1>
          <p className="max-w-[380px] text-[16px] text-white/85 md:text-[17px]">화요일과 금요일에 볶아 그날 보냅니다. 봉투마다 로스팅 날짜를 적습니다.</p>
        </div>
      </section>

      <section className="px-5 py-24 md:px-10 md:py-36">
        <div className="mx-auto max-w-[1320px]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[13px] font-bold tracking-[0.26em]" style={{ color: C.sub }}>THIS WEEK</p>
              <h2 className="mt-4 text-[32px] font-bold tracking-[-0.04em] md:text-[50px]">이번 주 원두</h2>
            </div>
            <p className="text-[15px]" style={{ color: C.sub }}>200g 가격입니다. 500g, 1kg은 상세에서 고릅니다.</p>
          </div>
          <ul className="mt-14 grid gap-px md:grid-cols-3" style={{ background: C.line }}>
            {BEANS.map((b) => (
              <li key={b.n} className="flex flex-col bg-white p-8 md:p-10">
                <p className="text-[14px] font-bold" style={{ color: C.brown }}>{b.r}</p>
                <h3 className="mt-2 text-[24px] font-bold tracking-[-0.03em]">{b.n}</h3>
                <p className="text-[15px]" style={{ color: C.sub }}>{b.o}</p>
                <p className="mt-6 flex-1 border-t pt-5 text-[17px] font-semibold" style={{ borderColor: C.line }}>{b.note}</p>
                <p className="mt-8 flex items-center justify-between">
                  <span className="text-[24px] font-bold tabular-nums">{b.p}원</span>
                  <ArrowRight size={20} aria-hidden />
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 md:px-10">
        <div className="mx-auto grid max-w-[1320px] gap-5 md:grid-cols-[1fr_1.3fr]">
          <div className="flex flex-col justify-center gap-6 p-8 md:p-12" style={{ background: C.soft }}>
            <p className="text-[13px] font-bold tracking-[0.26em]" style={{ color: C.sub }}>ROASTING</p>
            <h2 className="text-[28px] font-bold leading-[1.4] tracking-[-0.03em] md:text-[36px]">
              생두는 산지별로,
              <br />
              볶기 전에 한 번 더 고릅니다
            </h2>
            <dl className="grid gap-3">
              {[
                ["로스팅", "매주 화, 금"],
                ["발송", "로스팅 당일 오후 3시"],
                ["보관 권장", "로스팅 후 4주 안"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b pb-3" style={{ borderColor: C.line }}>
                  <dt style={{ color: C.sub }}>{k}</dt>
                  <dd className="font-bold">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[500px]">
            <Image src={`${IMG}/a-sack.jpg`} alt="삼베 자루에 담긴 원두" fill sizes="(min-width: 768px) 55vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-24 md:px-10 md:py-32">
        <div className="relative mx-auto max-w-[1320px] overflow-hidden px-8 py-14 text-white md:px-16 md:py-20" style={{ background: C.ink }}>
          <Image src={`${IMG}/a-bag.jpg`} alt="" fill sizes="100vw" className="object-cover opacity-35" />
          <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[13px] font-bold tracking-[0.26em] text-white/60">WHOLESALE</p>
              <h2 className="mt-3 text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[40px]">카페 원두 납품</h2>
              <p className="mt-3 max-w-[520px] text-white/75">월 10kg부터 받습니다. 샘플 원두 3종을 보내 드리고, 매장 머신에 맞춰 추출 레시피를 함께 잡습니다.</p>
            </div>
            <span className="inline-flex h-[58px] shrink-0 items-center gap-2 self-start bg-white px-8 text-[17px] font-bold md:self-auto" style={{ color: C.ink }}>
              납품 상담
              <ArrowRight size={18} aria-hidden />
            </span>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-10" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2 md:flex-row md:justify-between">
          <p>검은콩 로스터리, 서울특별시 성동구 성수동 일대, 로스팅실 겸 매장</p>
          <p>납품 문의 02-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
