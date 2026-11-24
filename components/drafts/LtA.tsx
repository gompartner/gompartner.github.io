"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

// 조명 가게 시안 A 조명 쇼룸형(11-22 사례 분석: 아임웹 조명 매장 사례는 드물고 인테리어 업체 사이트처럼 흰 바탕과 큰 공간 사진이 기본. 쇼룸 손님은 종류별 제품, 색온도, 인테리어와 맞춘 조명 계획, 방문 시간을 묻는다). 흰 바탕, 검정과 앰버. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/lt/a-*)
const IMG = "/images/drafts/lt";
const C = { ink: "#141312", sub: "#67635e", line: "#e8e5e1", soft: "#f5f3f1", amber: "#c27a1a" };

const KINDS = [
  ["펜던트", "식탁과 아일랜드 위", "120종"],
  ["스탠드", "거실과 침실 구석", "80종"],
  ["벽등", "복도와 침대 머리", "60종"],
  ["매입등과 레일", "천장 전체 조명", "40종"],
];

const KELVIN = [
  ["2700K", "#ffb35c", "침실과 거실 저녁"],
  ["3000K", "#ffcf87", "식탁, 카페 같은 분위기"],
  ["4000K", "#fff2d6", "주방 작업대, 서재"],
  ["5000K", "#f4f7ff", "드레스룸과 작업실"],
];

export function LtA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between px-5 md:px-10">
          <p className="text-[18px] font-bold tracking-[0.12em]">LUMEN ROOM</p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#4a4743" }}>
            {["제품", "색온도", "조명 계획", "쇼룸"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center px-5 text-[15px] font-bold text-white" style={{ background: C.ink }}>
            조명 상담
          </span>
        </div>
      </header>

      <section className="px-5 pt-12 md:px-10 md:pt-20">
        <div className="mx-auto max-w-[1320px]">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h1 className="text-[38px] font-bold leading-[1.2] tracking-[-0.05em] md:text-[72px]">
              불을 켜 보고
              <br />
              고르는 쇼룸
            </h1>
            <p className="max-w-[380px]" style={{ color: C.sub }}>
              300여 종을 실제로 걸어 두었습니다. 디머로 밝기를 바꿔 보며 집에서 어떻게 보일지 확인합니다.
            </p>
          </div>
          <div className="relative mt-10 aspect-[4/3] overflow-hidden md:aspect-[21/9]">
            <Image src={`${IMG}/a-hero.jpg`} alt="유리구 펜던트가 걸린 어두운 톤의 다이닝 공간" fill priority sizes="100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1320px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">제품</h2>
          <ul className="mt-10 border-t" style={{ borderColor: C.ink }}>
            {KINDS.map(([t, d, n]) => (
              <li key={t} className="grid gap-1 border-b py-6 md:grid-cols-[1.2fr_1.6fr_0.5fr_auto] md:items-center md:gap-6" style={{ borderColor: C.line }}>
                <h3 className="text-[23px] font-bold tracking-[-0.03em]">{t}</h3>
                <p style={{ color: C.sub }}>{d}</p>
                <p className="font-bold tabular-nums" style={{ color: C.amber }}>{n}</p>
                <ArrowRight size={20} className="hidden md:block" aria-hidden />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 md:px-10" style={{ background: C.soft }}>
        <div className="mx-auto grid max-w-[1320px] items-center gap-10 py-20 md:grid-cols-2 md:gap-16 md:py-28">
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">방마다 맞는 색온도</h2>
            <ul className="mt-7 grid gap-3">
              {KELVIN.map(([k, color, d]) => (
                <li key={k} className="flex items-center gap-4 border-b pb-3" style={{ borderColor: "#dedad5" }}>
                  <span className="h-8 w-8 shrink-0 rounded-full border" style={{ background: color, borderColor: "#d8d3cc" }} aria-hidden />
                  <span className="w-[64px] shrink-0 font-bold tabular-nums">{k}</span>
                  <span style={{ color: C.sub }}>{d}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[15px]" style={{ color: C.sub }}>연색성 CRI 90 이상 광원만 씁니다.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image src={`${IMG}/a-pendant.jpg`} alt="주황 벽 앞 둥근 펜던트 조명" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image src={`${IMG}/a-lamp.jpg`} alt="밝은 벽 앞 작은 원목 스탠드" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1320px] gap-4 md:grid-cols-2">
          <div className="border p-8 md:p-10" style={{ borderColor: C.line }}>
            <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">조명 계획</h2>
            <ol className="mt-5 grid gap-2.5" style={{ color: C.sub }}>
              <li>1. 도면이나 방 사진을 보내 주세요</li>
              <li>2. 방마다 조도와 색온도, 제품을 제안합니다</li>
              <li>3. 인테리어 업체 전기 기사님께 배선 위치 전달</li>
            </ol>
          </div>
          <div className="flex flex-col justify-between gap-8 bg-black p-8 text-white md:p-10">
            <div>
              <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">쇼룸</h2>
              <p className="mt-3 text-white/70">화 ~ 일 11:00 ~ 20:00, 월요일 쉽니다. 논현동 가구거리 2층, 건물 뒤 주차 2시간.</p>
            </div>
            <p className="text-[28px] font-bold tabular-nums" style={{ color: C.amber }}>02-000-0000</p>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-10" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2 md:flex-row md:justify-between">
          <p>LUMEN ROOM 루멘룸, 서울특별시 강남구 논현동 일대. 사업자등록번호 000-00-00000</p>
          <p>02-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
