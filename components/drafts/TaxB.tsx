"use client";

import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";

// 세무회계 시안 B 사장님 친화형(11-21). 밝은 바탕, 개인사업자와 프리랜서 눈높이로 "언제 무엇을 내야 하는지"를 먼저 보여 준다. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/tax/b-*)
const IMG = "/images/drafts/tax";
const C = { ink: "#14171c", sub: "#5d6470", line: "#e6e8ec", soft: "#f6f7f9", green: "#0e9f6e", greenSoft: "#e6f6ef", yellow: "#ffd84d" };
const TEL = "02-000-0000";

const CALENDAR = [
  { m: "1월", t: "부가세 확정신고", who: "일반, 간이과세자" },
  { m: "3월", t: "법인세 신고", who: "12월 결산 법인" },
  { m: "5월", t: "종합소득세 신고", who: "개인사업자, 프리랜서" },
  { m: "7월", t: "부가세 확정신고", who: "일반과세자" },
];

const FOR = [
  { t: "처음 사업자를 냈어요", d: "업종 선택, 간이와 일반과세 판단, 카드 단말기와 홈택스 설정까지 함께합니다." },
  { t: "매출이 늘어 세금이 걱정돼요", d: "경비 처리 기준과 법인 전환 시점을 숫자로 비교해 드립니다." },
  { t: "프리랜서, 3.3% 떼고 받아요", d: "5월 종합소득세에서 돌려받을 수 있는 금액부터 확인해 드립니다." },
];

const PRICE = [
  { t: "간이과세자", p: "월 5만 원부터", d: ["부가세 신고", "종합소득세 신고", "카톡 질문 무제한"] },
  { t: "일반 개인사업자", p: "월 10만 원부터", d: ["월 기장, 부가세 신고", "종합소득세 신고", "직원 1~2명 급여"] },
  { t: "법인", p: "월 15만 원부터", d: ["월 기장, 결산", "법인세 신고", "월간 손익 리포트"] },
];

export function TaxB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[70px] max-w-[1200px] items-center justify-between px-5 md:px-8">
          <p className="text-[20px] font-bold tracking-[-0.03em]">든든세무회계</p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#3a404a" }}>
            {["이런 분께", "세금 달력", "기장료", "상담 후기", "오시는 길"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center rounded-[12px] px-5 text-[15px] font-bold text-white" style={{ background: C.green }}>
            카톡 상담
          </span>
        </div>
      </header>

      <section className="px-5 pb-16 pt-12 md:px-8 md:pb-24 md:pt-20">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid items-end gap-8 lg:grid-cols-[1.2fr_1fr]">
            <h1 className="text-[40px] font-bold leading-[1.18] tracking-[-0.05em] md:text-[72px]">
              세금은 맡기고,
              <br />
              <span className="relative inline-block">
                <span className="absolute inset-x-0 bottom-[0.08em] h-[0.32em]" style={{ background: C.yellow }} aria-hidden />
                <span className="relative">장사에 집중하세요</span>
              </span>
            </h1>
            <div className="lg:pb-3">
              <p className="text-[17px] md:text-[19px]" style={{ color: C.sub }}>
                개인사업자, 프리랜서, 작은 법인의 기장과 신고를 맡습니다. 신고 기간마다 홈택스와 씨름하지 않으셔도 됩니다.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-4">
                <span className="inline-flex h-[54px] items-center gap-2 rounded-[14px] px-7 text-[17px] font-bold text-white" style={{ background: C.green }}>
                  내 기장료 알아보기
                  <ArrowRight size={18} aria-hidden />
                </span>
                <span className="text-[18px] font-bold tabular-nums">{TEL}</span>
              </div>
            </div>
          </div>
          <div className="relative mt-12 aspect-[16/9] overflow-hidden rounded-[28px] md:mt-16 md:aspect-[21/8]">
            <Image src={`${IMG}/b-hero.jpg`} alt="계산기와 파일이 놓인 밝은 책상" fill priority sizes="(min-width: 1200px) 1200px, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">이런 분들이 많이 찾으십니다</h2>
          <ul className="mt-12 grid gap-4 md:grid-cols-3">
            {FOR.map((f) => (
              <li key={f.t} className="rounded-[22px] bg-white p-8">
                <span className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: C.greenSoft, color: C.green }}>
                  <Check size={22} aria-hidden />
                </span>
                <h3 className="mt-6 text-[22px] font-bold tracking-[-0.03em]">{f.t}</h3>
                <p className="mt-3 text-[15px]" style={{ color: C.sub }}>{f.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <div>
            <h2 className="text-[30px] font-bold leading-[1.3] tracking-[-0.04em] md:text-[44px]">
              놓치면 가산세,
              <br />
              올해 세금 달력
            </h2>
            <p className="mt-4" style={{ color: C.sub }}>신고 2주 전에 필요한 자료를 카톡으로 먼저 알려 드립니다.</p>
            <div className="relative mt-10 hidden aspect-[4/3] overflow-hidden rounded-[22px] lg:block">
              <Image src={`${IMG}/b-calc.jpg`} alt="흰 책상 위의 계산기와 필기구" fill sizes="40vw" className="object-cover" />
            </div>
          </div>
          <ul className="border-t-2" style={{ borderColor: C.ink }}>
            {CALENDAR.map((c) => (
              <li key={c.m + c.t} className="grid grid-cols-[72px_1fr] items-center gap-4 border-b py-7 md:grid-cols-[110px_1fr_auto]" style={{ borderColor: C.line }}>
                <span className="text-[28px] font-bold tracking-[-0.03em] md:text-[36px]" style={{ color: C.green }}>{c.m}</span>
                <span className="text-[19px] font-bold md:text-[22px]">{c.t}</span>
                <span className="col-start-2 text-[14px] md:col-start-auto md:text-[15px]" style={{ color: C.sub }}>{c.who}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">기장료는 미리 정해 둡니다</h2>
          <p className="mt-3" style={{ color: C.sub }}>매출 구간과 직원 수에 따라 달라지며, 계약 전에 금액을 확정합니다.</p>
          <ul className="mt-12 grid gap-4 md:grid-cols-3">
            {PRICE.map((p, i) => (
              <li key={p.t} className="rounded-[22px] bg-white p-8" style={i === 1 ? { outline: `2px solid ${C.green}` } : undefined}>
                <h3 className="text-[18px] font-bold" style={{ color: C.sub }}>{p.t}</h3>
                <p className="mt-2 text-[30px] font-bold tracking-[-0.03em]">{p.p}</p>
                <ul className="mt-6 grid gap-2.5 border-t pt-6 text-[15px]" style={{ borderColor: C.line }}>
                  {p.d.map((x) => (
                    <li key={x} className="flex items-center gap-2">
                      <Check size={17} style={{ color: C.green }} aria-hidden />
                      {x}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-[28px] px-7 py-14 md:px-16 md:py-20" style={{ background: C.ink, color: "#fff" }}>
          <Image src={`${IMG}/b-lobby.jpg`} alt="" fill sizes="100vw" className="object-cover opacity-25" />
          <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[42px]">사업자등록증만 보내 주세요</h2>
              <p className="mt-3 text-white/70">업종과 매출 규모를 보고 기장료와 절세 포인트를 하루 안에 답해 드립니다.</p>
            </div>
            <span className="inline-flex h-[58px] shrink-0 items-center gap-2 self-start rounded-[14px] px-8 text-[17px] font-bold md:self-auto" style={{ background: C.yellow, color: C.ink }}>
              카톡으로 상담하기
              <ArrowRight size={18} aria-hidden />
            </span>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 md:flex-row md:justify-between">
          <p>든든세무회계, 서울특별시 마포구 일대</p>
          <p>상담 문의 {TEL}</p>
        </div>
      </footer>
    </div>
  );
}
