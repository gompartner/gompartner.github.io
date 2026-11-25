"use client";

import Image from "next/image";

// 가격 시세 확인(11-25): 가죽공방 2시간 5.5~8만(마이리얼트립 원데이 클래스).
// 가죽 공방 원데이 클래스 신청 랜딩 시안 B 도구 사진형(11-22. 시안 A는 기존 회차 신청, 결제 랜딩. 피버 원데이 클래스 티켓 페이지처럼 수강료, 소요 시간, 정원을 첫 화면에 숫자로, 도구가 놓인 작업대 사진 한 장, 2시간 수업 순서, 이번 주 회차와 남은 자리, 환불 규정을 짧게). 흰 바탕, 가죽 갈색. 인물 없음. 메인 한 장, 신청은 버튼만.
// 사진: Unsplash 무료 라이선스(public/images/drafts/ld/leather-*)
const IMG = "/images/drafts/ld";
const C = { ink: "#1e1712", sub: "#6b6158", line: "#ece5de", soft: "#f7f3ef", brown: "#8a5228" };

const SESSIONS = [
  ["금 19:30", "저녁반", "2자리"],
  ["토 10:30", "오전반", "마감"],
  ["토 14:30", "오후반", "4자리"],
  ["일 14:30", "오후반", "3자리"],
];

export function LdLeatherB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <section className="px-5 pb-14 pt-12 md:px-8 md:pb-20 md:pt-16">
        <div className="mx-auto grid max-w-[1120px] items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="text-[15px] font-bold" style={{ color: C.brown }}>결 가죽공방, 원데이 클래스</p>
            <h1 className="mt-4 text-[36px] font-bold leading-[1.24] tracking-[-0.045em] md:text-[56px]">
              두 시간,
              <br />
              카드지갑 하나
            </h1>
            <p className="mt-5 max-w-[440px]" style={{ color: C.sub }}>처음이어도 됩니다. 바늘 두 개로 한 땀씩, 마지막에 이니셜을 새겨 가져갑니다.</p>
            <dl className="mt-6 grid max-w-[440px] grid-cols-3 gap-px overflow-hidden rounded-xl border text-center" style={{ borderColor: C.line, background: C.line }}>
              {[["수강료", "55,000원"], ["소요", "2시간"], ["정원", "6명"]].map(([k, v]) => (
                <div key={k} className="bg-white px-2 py-3">
                  <dt className="text-[13px]" style={{ color: C.sub }}>{k}</dt>
                  <dd className="font-bold tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[20px]">
            <Image src={`${IMG}/leather-hero.jpg`} alt="작업 매트 위에 가지런히 놓인 가죽 공예 도구" fill priority sizes="(min-width: 1024px) 52vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-16 md:px-8 md:py-24" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1120px]">
          <h2 className="text-[28px] font-bold tracking-[-0.04em] md:text-[40px]">수업 순서</h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["가죽 고르기", "탄, 브라운, 올리브, 버건디"],
              ["재단, 구멍 내기", "본을 대고 자른 뒤 목타로"],
              ["새들 스티치", "바늘 두 개로 한 땀씩"],
              ["마감, 각인", "옆면을 다듬고 이니셜 도장"],
            ].map(([t, d], i) => (
              <li key={t} className="rounded-[20px] bg-white p-6">
                <p className="text-[14px] font-bold tabular-nums" style={{ color: C.brown }}>0{i + 1}</p>
                <h3 className="mt-1 text-[20px] font-bold">{t}</h3>
                <p className="mt-1 text-[15px]" style={{ color: C.sub }}>{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-[1120px] items-center gap-10 md:grid-cols-[1fr_1fr] md:gap-14">
          <div>
            <h2 className="text-[26px] font-bold tracking-[-0.04em] md:text-[34px]">이번 주 회차</h2>
            <ul className="mt-6 border-t-2" style={{ borderColor: C.ink }}>
              {SESSIONS.map(([t, n, s]) => (
                <li key={t} className="grid grid-cols-[1fr_1fr_auto] items-center gap-3 border-b py-4" style={{ borderColor: C.line }}>
                  <span className="font-bold tabular-nums">{t}</span>
                  <span style={{ color: C.sub }}>{n}</span>
                  <span className="font-bold" style={{ color: s === "마감" ? "#9b9187" : C.brown }}>{s}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[15px]" style={{ color: C.sub }}>회차당 6명. 마감된 회차는 대기 신청을 받습니다.</p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[20px]">
            <Image src={`${IMG}/leather-goods.jpg`} alt="여러 색 가죽 카드지갑과 동전지갑" fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto grid max-w-[1120px] gap-4 md:grid-cols-[1fr_1.2fr]">
          <div className="rounded-[24px] border p-8" style={{ borderColor: C.line }}>
            <h2 className="text-[22px] font-bold tracking-[-0.04em] md:text-[26px]">환불 규정</h2>
            <dl className="mt-4 text-[15px]">
              {[
                ["5일 전까지", "전액 환불"],
                ["2 ~ 4일 전", "50% 환불"],
                ["전날, 당일", "환불 없음"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 border-b py-2.5 last:border-b-0" style={{ borderColor: C.line }}>
                  <dt style={{ color: C.sub }}>{k}</dt>
                  <dd className="font-bold">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="flex flex-col justify-between gap-6 rounded-[24px] p-8 text-white md:p-10" style={{ background: C.brown }}>
            <div>
              <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">클래스 신청</h2>
              <p className="mt-2 text-white/80">회차와 가죽 색, 각인 이니셜을 골라 신청합니다. 카드 또는 계좌이체.</p>
            </div>
            <button type="button" className="h-14 rounded-xl bg-white text-[17px] font-bold" style={{ color: C.brown }}>
              회차 고르기
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto max-w-[1120px]">결 가죽공방, 서울특별시 마포구 연남동 일대. 주차는 건물 뒤 공영주차장을 이용해 주세요.</div>
      </footer>
    </div>
  );
}
