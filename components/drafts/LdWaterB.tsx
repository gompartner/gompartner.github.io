"use client";

import Image from "next/image";
import { Check } from "lucide-react";

// 가격 시세 확인(11-25): 정수 전용 16,900~27,900, 냉온 25,900~39,900(glasswallet.com 정수기 렌탈 가격 비교), 공기청정기 1.6~5만(glasswallet.com 공기청정기 렌탈).
// 정수기 렌탈 랜딩 시안 B 요금표 우선형(11-22. 시안 A는 기존 상담 신청 랜딩. 렌탈 비교 페이지처럼 첫 화면에 월 요금과 의무 기간을 먼저 두고, 방문 관리와 위약금 같은 걱정을 바로 아래에서 푼다). 흰 바탕, 파랑. 인물 없음. 메인 한 장, 신청 폼은 모양만.
// 사진: Unsplash 무료 라이선스(public/images/drafts/ld/water-*)
const IMG = "/images/drafts/ld";
const C = { ink: "#0f1b2d", sub: "#5a6577", line: "#e1e7ef", soft: "#f1f6fb", blue: "#1f6fe0", blueSoft: "#e6f0fd" };

const PLANS = [
  ["직수 정수기 S", "정수, 냉수", "월 19,900원", "4개월마다 방문"],
  ["냉온정수기 M", "정수, 냉수, 온수", "월 29,900원", "4개월마다 방문"],
  ["공기청정기 A", "거실 30평형", "월 22,900원", "6개월마다 방문"],
];

export function LdWaterB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="border-b" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between px-5 md:px-8">
          <p className="text-[19px] font-bold tracking-[-0.03em]">
            맑은물 <span style={{ color: C.blue }}>렌탈</span>
          </p>
          <span className="text-[15px] font-bold tabular-nums">1588-0000</span>
        </div>
      </header>

      <section className="px-5 pb-14 pt-10 md:px-8 md:pb-20 md:pt-14">
        <div className="mx-auto grid max-w-[1120px] items-center gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="inline-flex rounded-full px-3 py-1 text-[14px] font-bold" style={{ background: C.blueSoft, color: C.blue }}>이번 달 신청, 설치비 0원</p>
            <h1 className="mt-5 text-[36px] font-bold leading-[1.24] tracking-[-0.045em] md:text-[54px]">
              물통 없이,
              <br />
              월 19,900원부터
            </h1>
            <p className="mt-5 max-w-[440px]" style={{ color: C.sub }}>필터는 기사님이 방문해서 갈아 드립니다. 상담을 남기시면 오늘 안에 전화드립니다.</p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[24px]">
            <Image src={`${IMG}/water-hero.jpg`} alt="유리컵에 맑은 물을 따르는 모습" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-16 md:px-8 md:py-24" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1120px]">
          <h2 className="text-[28px] font-bold tracking-[-0.04em] md:text-[40px]">제품별 월 렌탈료</h2>
          <p className="mt-2" style={{ color: C.sub }}>의무 사용 5년 기준, 3년은 월 4,000원이 더해집니다.</p>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {PLANS.map(([t, f, p, v]) => (
              <li key={t} className="flex flex-col rounded-[20px] bg-white p-7">
                <h3 className="text-[21px] font-bold">{t}</h3>
                <p className="text-[15px]" style={{ color: C.sub }}>{f}</p>
                <p className="mt-5 text-[28px] font-bold tabular-nums tracking-[-0.02em]" style={{ color: C.blue }}>{p}</p>
                <p className="mt-1 text-[15px] font-semibold">{v}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-[1120px] items-center gap-10 md:grid-cols-[1fr_1.1fr] md:gap-14">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[20px]">
            <Image src={`${IMG}/water-tap.jpg`} alt="타일 벽 앞 싱크대 수전" fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
          </div>
          <div>
            <h2 className="text-[26px] font-bold tracking-[-0.04em] md:text-[34px]">신청 전에 많이 묻는 것</h2>
            <ul className="mt-6 grid gap-3">
              {[
                "상담 뒤 보통 3일 안에 설치합니다",
                "같은 지역 이사는 이전 설치 1회 무료",
                "의무 기간이 끝나면 제품은 고객님 소유",
                "중도 해지 위약금은 남은 렌탈료의 10%",
              ].map((x) => (
                <li key={x} className="flex gap-3 border-b pb-3" style={{ borderColor: C.line }}>
                  <Check size={20} className="mt-1 shrink-0" style={{ color: C.blue }} aria-hidden /> {x}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto max-w-[1120px] rounded-[24px] p-8 text-white md:p-12" style={{ background: C.blue }}>
          <h2 className="text-[26px] font-bold tracking-[-0.04em] md:text-[34px]">상담 신청</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-4">
            {["이름", "휴대폰 번호", "관심 제품", "통화 가능 시간"].map((f) => (
              <div key={f} className="rounded-xl bg-white/12 px-4 py-3 text-[15px] text-white/80">{f}</div>
            ))}
          </div>
          <button type="button" className="mt-5 h-14 w-full rounded-xl bg-white text-[17px] font-bold md:w-auto md:px-10" style={{ color: C.blue }}>
            오늘 안에 전화 받기
          </button>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto max-w-[1120px]">맑은물 렌탈, 사업자등록번호 000-00-00000. 렌탈료는 제휴 카드 할인 전 금액입니다.</div>
      </footer>
    </div>
  );
}
