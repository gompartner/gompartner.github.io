"use client";

import Image from "next/image";
import { Mail } from "lucide-react";

// 가격 시세 확인(11-25): 비상주 기본형 월 2~5만, 서비스형 5~10만, 상위형 10~15만(k-incorp.org 비상주 사무실 임대 비용).
// 공유오피스 시안 B 비상주 사무실형(11-22 사례 분석: 이스트라운지처럼 젊은 창업자, 프리랜서를 위한 비상주 서비스. 손님은 사업자등록이 되는지, 우편물은 어떻게 받는지, 회의실을 쓸 수 있는지, 필요한 서류를 묻는다). 흰 바탕, 남색과 주황. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/cw/b-*)
const IMG = "/images/drafts/cw";
const C = { ink: "#141a26", sub: "#5e6676", line: "#e3e7ee", soft: "#f2f4f8", navy: "#1f3a6e", orange: "#e9703a" };

const PLANS = [
  ["주소 등록", "사업자등록 주소, 계약서 발급", "월 3만 원"],
  ["우편 대행", "주소 등록 + 우편물 사진 알림", "월 5만 원"],
  ["회의실 포함", "우편 대행 + 회의실 월 4시간", "월 10만 원"],
];

export function CwB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[70px] max-w-[1200px] items-center justify-between px-5 md:px-8">
          <p className="text-[20px] font-bold tracking-[-0.03em]">
            <span style={{ color: C.navy }}>주소</span>라운지
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#40485a" }}>
            {["요금", "우편물", "필요 서류", "문의"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center rounded-full px-5 text-[15px] font-bold text-white" style={{ background: C.navy }}>
            계약 문의
          </span>
        </div>
      </header>

      <section className="px-5 pb-16 pt-10 md:px-8 md:pb-24 md:pt-14">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
          <div>
            <p className="text-[15px] font-bold" style={{ color: C.orange }}>비상주 사무실</p>
            <h1 className="mt-4 text-[36px] font-bold leading-[1.24] tracking-[-0.045em] md:text-[56px]">
              집 주소 대신
              <br />
              사업장 주소를 둡니다
            </h1>
            <p className="mt-5 max-w-[460px] text-[17px] md:text-[18px]" style={{ color: C.sub }}>
              계약한 날 임대차계약서를 드립니다. 세무서에 바로 사업자등록 신청을 하실 수 있습니다.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
            <Image src={`${IMG}/b-hero.jpg`} alt="여러 색으로 칠해진 우편함이 줄지어 달린 벽" fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">요금</h2>
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {PLANS.map(([t, d, p]) => (
              <li key={t} className="flex flex-col rounded-[24px] bg-white p-7 md:p-8">
                <h3 className="text-[23px] font-bold tracking-[-0.03em]">{t}</h3>
                <p className="mt-1 text-[15px]" style={{ color: C.sub }}>{d}</p>
                <p className="mt-6 border-t pt-4 text-[22px] font-bold tabular-nums" style={{ borderColor: C.line, color: C.navy }}>{p}</p>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[15px]" style={{ color: C.sub }}>12개월 계약 기준, 부가세 별도. 6개월 계약은 월 1만 원이 추가됩니다.</p>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 md:grid-cols-[1fr_1.1fr] md:gap-16">
          <div>
            <h2 className="flex items-center gap-3 text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">
              <Mail size={28} style={{ color: C.orange }} aria-hidden /> 우편물은 이렇게
            </h2>
            <ol className="mt-7 grid gap-3">
              {[
                ["도착", "받은 날 봉투 사진을 문자로 보냅니다"],
                ["보관", "개인 우편함에 3개월까지"],
                ["전달", "요청하시면 월 2회 등기로 보내 드립니다"],
                ["등기", "본인 수령이 필요한 우편은 대리 수령 동의서로"],
              ].map(([k, v]) => (
                <li key={k} className="flex gap-4 border-b pb-3" style={{ borderColor: C.line }}>
                  <span className="w-[52px] shrink-0 font-bold" style={{ color: C.orange }}>{k}</span>
                  <span>{v}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[24px]">
            <Image src={`${IMG}/b-room.jpg`} alt="흰 의자가 줄지어 놓인 긴 회의 테이블" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto grid max-w-[1200px] gap-4 md:grid-cols-2">
          <div className="rounded-[28px] border p-8 md:p-10" style={{ borderColor: C.line }}>
            <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">계약할 때 필요한 것</h2>
            <ul className="mt-5 grid gap-2.5" style={{ color: C.sub }}>
              <li>개인: 신분증 사본</li>
              <li>법인: 법인 인감증명서, 등기부등본, 대표 신분증</li>
              <li>업종 확인: 사무실이 꼭 필요한 업종은 계약 전 안내</li>
            </ul>
          </div>
          <div className="flex flex-col justify-between rounded-[28px] p-8 text-white md:p-10" style={{ background: C.navy }}>
            <div>
              <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">계약 문의</h2>
              <p className="mt-3 text-white/80">업종과 사업자 종류를 알려 주시면 등록 가능 여부부터 확인해 드립니다.</p>
            </div>
            <p className="mt-8 text-[30px] font-bold tabular-nums tracking-[-0.02em]">031-000-0000</p>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 md:flex-row md:justify-between">
          <p>주소라운지, 경기도 화성시 동탄 일대. 사업자등록번호 000-00-00000</p>
          <p>031-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
