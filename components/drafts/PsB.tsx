"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

// 아파트 분양 시안 B 프리미엄 단지형(11-22 사례 분석: 상지카일룸 블랙처럼 어두운 색과 고급 이미지, 개봉 루브루처럼 라이프스타일 문구와 커뮤니티. 중대형 수요자는 단지 특화 설계, 커뮤니티 시설, 마감재를 본다). 흰 바탕에 어두운 첫 화면, 검정과 금색. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/ps/b-*)
const IMG = "/images/drafts/ps";
const C = { ink: "#121212", sub: "#666", line: "#e7e5e1", soft: "#f6f5f2", gold: "#a8874a" };

const COMMUNITY = [
  ["피트니스, 골프 연습장", "지하 1층, 타석 12석"],
  ["실내 수영장", "25m 4레인, 유아 풀"],
  ["스카이 라운지", "29층, 한강 조망 카페"],
  ["게스트 하우스", "방문 가족 숙박 4실"],
];

export function PsB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="absolute inset-x-0 z-20 text-white">
        <div className="mx-auto flex h-[78px] max-w-[1320px] items-center justify-between px-5 md:px-10">
          <p className="text-[17px] font-bold tracking-[0.16em]">
            THE <span style={{ color: C.gold }}>NOBLE</span> 서초
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-10 text-[15px] font-medium text-white/85 lg:flex">
            {["프리미엄", "커뮤니티", "세대", "분양안내"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-10 items-center border px-4 text-[14px] font-bold" style={{ borderColor: C.gold, color: C.gold }}>
            분양문의
          </span>
        </div>
      </header>

      <section className="relative flex min-h-[620px] items-end overflow-hidden bg-black text-white md:h-[96svh]">
        <Image src={`${IMG}/b-hero.jpg`} alt="해 질 녘 불이 켜진 아파트 외관" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40" aria-hidden />
        <div className="relative mx-auto flex w-full max-w-[1320px] flex-col gap-6 px-5 pb-16 md:flex-row md:items-end md:justify-between md:px-10 md:pb-24">
          <h1 className="text-[38px] font-bold leading-[1.22] tracking-[-0.045em] md:text-[68px]">
            한 층 두 세대,
            <br />
            전 세대 남향
          </h1>
          <p className="max-w-[380px] text-white/75">전용 114㎡부터 168㎡까지 218세대. 엘리베이터 한 대를 두 세대만 씁니다.</p>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1320px]">
          <h2 className="text-[32px] font-bold tracking-[-0.04em] md:text-[46px]">설계 특화</h2>
          <div className="mt-12 grid gap-px md:grid-cols-3" style={{ background: C.line }}>
            {[
              ["천장고 2.6m", "일반 아파트보다 30cm 높게"],
              ["3면 개방 코너 창", "거실과 주방 모두 바깥을 봅니다"],
              ["세대 창고", "지하 1층, 세대별 4㎡"],
            ].map(([t, d]) => (
              <div key={t} className="bg-white p-6 md:p-8">
                <h3 className="text-[23px] font-bold tracking-[-0.03em]">{t}</h3>
                <p className="mt-1" style={{ color: C.sub }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 md:px-10" style={{ background: C.soft }}>
        <div className="mx-auto grid max-w-[1320px] items-center gap-10 py-20 md:grid-cols-2 md:gap-16 md:py-28">
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image src={`${IMG}/b-living.jpg`} alt="아치 창과 원목 식탁이 있는 거실과 주방" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">커뮤니티</h2>
            <ul className="mt-7 border-t" style={{ borderColor: C.ink }}>
              {COMMUNITY.map(([t, d]) => (
                <li key={t} className="grid gap-1 border-b py-4 sm:grid-cols-[1fr_1fr] sm:items-center" style={{ borderColor: "#dcd8d0" }}>
                  <span className="text-[18px] font-bold">{t}</span>
                  <span style={{ color: C.sub }}>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1320px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">세대</h2>
          <ul className="mt-10 border-t" style={{ borderColor: C.ink }}>
            {[
              ["114㎡", "4베이, 방 4개", "96세대"],
              ["138㎡", "3면 개방, 방 4개", "84세대"],
              ["168㎡", "복층 펜트하우스, 테라스", "38세대"],
            ].map(([t, d, n]) => (
              <li key={t} className="grid gap-1 border-b py-6 md:grid-cols-[0.8fr_2fr_0.6fr_auto] md:items-center md:gap-6" style={{ borderColor: C.line }}>
                <h3 className="text-[26px] font-bold tabular-nums tracking-[-0.03em]">{t}</h3>
                <p style={{ color: C.sub }}>{d}</p>
                <p className="font-bold tabular-nums" style={{ color: C.gold }}>{n}</p>
                <ArrowRight size={20} className="hidden md:block" aria-hidden />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-10 md:pb-28">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-6 bg-black p-8 text-white md:flex-row md:items-center md:justify-between md:p-12">
          <div>
            <h2 className="text-[26px] font-bold tracking-[-0.04em] md:text-[34px]">분양안내</h2>
            <p className="mt-2 text-white/70">견본주택은 사전 방문 신청 뒤 관람하실 수 있습니다. 서초구 서초동 일대, 매일 10:00 ~ 18:00.</p>
          </div>
          <p className="shrink-0 text-[26px] font-bold tabular-nums" style={{ color: C.gold }}>1600-0000</p>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[13px] md:px-10" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2">
          <p>시행 (주)노블디앤씨, 시공 서진건설. 사진과 이미지는 이해를 돕기 위한 것으로 실제와 다를 수 있으며, 정확한 내용은 입주자모집공고를 따릅니다.</p>
          <p>분양문의 1600-0000</p>
        </div>
      </footer>
    </div>
  );
}
