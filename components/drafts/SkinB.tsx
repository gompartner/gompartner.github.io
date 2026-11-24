"use client";

import Image from "next/image";
import { ArrowRight, Clock, MapPin, ShieldCheck } from "lucide-react";

// 피부과 시안 B 진료 안내형(11-21 사례 분석: 동네 피부과는 질환 진료와 미용 시술을 나누고, 이번 달 안내와 진료 시간을 메인에 크게 둔다). 흰 바탕, 장미색 포인트. 메인 한 장, 기능 없음.
// 가격은 의료광고 심의 대상이라 시안에서는 안내 문구만 둔다. 사진: Unsplash 무료 라이선스(public/images/drafts/skin/b-*)
const IMG = "/images/drafts/skin";
const C = { ink: "#22191b", sub: "#6d6264", line: "#efe6e7", soft: "#f7f3f3", rose: "#d14d6a", roseSoft: "#fbe9ed" };

export function SkinB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[70px] max-w-[1200px] items-center justify-between px-5 md:px-8">
          <p className="text-[20px] font-bold tracking-[-0.03em]">고운날피부과의원</p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#4a3f41" }}>
            {["피부 질환", "피부 미용", "이달의 안내", "진료 시간", "오시는 길"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center rounded-full px-5 text-[15px] font-bold text-white" style={{ background: C.rose }}>
            예약 문의
          </span>
        </div>
      </header>

      <section className="px-5 pb-14 pt-10 md:px-8 md:pb-20 md:pt-14">
        <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-[32px]">
          <div className="relative aspect-[4/5] sm:aspect-[16/10] md:aspect-[21/9]">
            <Image src={`${IMG}/b-hero.jpg`} alt="분홍 배경 위에 정돈된 화장품과 상자" fill priority sizes="(min-width: 1200px) 1200px, 100vw" className="object-cover object-right" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(251,243,244,0.98) 0%, rgba(251,243,244,0.95) 40%, rgba(251,243,244,0.4) 62%, rgba(251,243,244,0) 80%)" }} aria-hidden />
          </div>
          <div className="absolute inset-0 flex items-center p-7 md:p-16">
            <div className="max-w-[520px]">
              <p className="inline-flex rounded-full px-3 py-1 text-[14px] font-bold" style={{ background: C.roseSoft, color: C.rose }}>피부과 전문의 진료</p>
              <h1 className="mt-5 text-[34px] font-bold leading-[1.22] tracking-[-0.045em] md:text-[58px]">
                피부 고민,
                <br />
                진료부터 관리까지
              </h1>
              <p className="mt-4 text-[16px] md:text-[18px]" style={{ color: C.sub }}>질환은 건강보험으로 치료하고, 미용 시술은 상담 후 필요한 만큼만 진행합니다.</p>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-6 grid max-w-[1200px] gap-3 sm:grid-cols-3">
          {[
            [Clock, "오늘 진료", "10:00 ~ 19:00"],
            [ShieldCheck, "건강보험", "피부 질환 진료 적용"],
            [MapPin, "오시는 길", "지하철역 3번 출구 2분"],
          ].map(([Icon, k, v]) => {
            const I = Icon as typeof Clock;
            return (
              <div key={k as string} className="flex items-center gap-4 rounded-[20px] p-5" style={{ background: C.soft }}>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white" style={{ color: C.rose }}>
                  <I size={21} aria-hidden />
                </span>
                <div>
                  <p className="text-[14px]" style={{ color: C.sub }}>{k as string}</p>
                  <p className="text-[18px] font-bold">{v as string}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-[1200px] gap-5 md:grid-cols-2">
          {[
            { t: "피부 질환 진료", s: "건강보험 적용", items: ["여드름, 모낭염", "아토피, 습진", "두드러기, 건선", "사마귀, 티눈"], dark: false },
            { t: "피부 미용 시술", s: "상담 후 진행", items: ["기미, 잡티 레이저", "리프팅, 탄력", "여드름 흉터, 모공", "제모"], dark: true },
          ].map((g) => (
            <article key={g.t} className="flex flex-col justify-between rounded-[28px] p-8 md:p-12" style={g.dark ? { background: C.ink, color: "#fff" } : { background: C.soft }}>
              <div>
                <p className="text-[14px] font-bold" style={{ color: g.dark ? "#f3a3b5" : C.rose }}>{g.s}</p>
                <h2 className="mt-2 text-[28px] font-bold tracking-[-0.04em] md:text-[36px]">{g.t}</h2>
                <ul className="mt-8 grid grid-cols-2 gap-3 text-[16px]">
                  {g.items.map((x) => (
                    <li key={x} className="rounded-[14px] px-4 py-3" style={{ background: g.dark ? "rgba(255,255,255,0.08)" : "#fff" }}>{x}</li>
                  ))}
                </ul>
              </div>
              <p className="mt-10 inline-flex items-center gap-1.5 text-[15px] font-bold">
                진료 안내 보기 <ArrowRight size={16} aria-hidden />
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 overflow-hidden rounded-[32px] md:grid-cols-2" style={{ background: C.roseSoft }}>
          <div className="px-8 py-14 md:px-14 md:py-16">
            <p className="text-[14px] font-bold" style={{ color: C.rose }}>이달의 안내</p>
            <h2 className="mt-2 text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">
              겨울철 건조 피부,
              <br />
              보습 장벽 관리
            </h2>
            <p className="mt-5" style={{ color: C.sub }}>
              난방으로 건조해지는 겨울에는 각질 제거보다 장벽 회복이 먼저입니다. 피부 수분도 측정 후 맞는 관리를 안내합니다.
            </p>
            <p className="mt-6 text-[13px]" style={{ color: C.sub }}>시술 비용과 이벤트는 의료광고 심의를 거쳐 안내합니다.</p>
          </div>
          <div className="relative min-h-[300px] self-stretch md:min-h-[440px]">
            <Image src={`${IMG}/b-product.jpg`} alt="수건과 바구니 옆에 놓인 화장품들" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto grid max-w-[1200px] gap-10 md:grid-cols-[1fr_1.2fr] md:items-center md:gap-16">
          <div>
            <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">진료 시간</h2>
            <p className="mt-3" style={{ color: C.sub }}>예약하지 않으셔도 진료받으실 수 있습니다.</p>
          </div>
          <dl className="grid gap-3">
            {[
              ["평일", "10:00 ~ 19:00"],
              ["화, 목 야간", "10:00 ~ 21:00"],
              ["토요일", "10:00 ~ 15:00"],
              ["일요일, 공휴일", "휴진"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between rounded-[16px] px-6 py-4 text-[17px]" style={{ background: C.soft }}>
                <dt style={{ color: C.sub }}>{k}</dt>
                <dd className="font-bold tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 md:flex-row md:justify-between">
          <p>고운날피부과의원, 경기도 성남시 분당구 일대</p>
          <p>예약 문의 031-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
