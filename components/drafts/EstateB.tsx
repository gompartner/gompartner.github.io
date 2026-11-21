"use client";

import Image from "next/image";
import { ArrowRight, Building, Building2, FileSearch, Home, ShieldCheck, Store } from "lucide-react";

// 공인중개사 시안 B 매물 상담형(11-21 사례 분석: 토지뱅크처럼 서비스 카드와 급매물을 메인에 두고, 크몽 부동산 상품처럼 법정 표시사항을 자동으로 적는다. 세입자는 전세 계약 안전 확인을 먼저 찾는다). 흰 바탕, 파랑 포인트. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/re/b-*)
const IMG = "/images/drafts/re";
const C = { ink: "#141a22", sub: "#5f6874", line: "#e3e8ee", soft: "#f2f5f9", blue: "#2563eb", blueSoft: "#e8f0fe" };

const NEW = [
  { k: "전세", t: "아파트 59㎡", a: "역 도보 5분, 2018년 준공", p: "3억 8,000만", d: "오늘" },
  { k: "월세", t: "오피스텔 33㎡", a: "복층, 주차 1대", p: "1,000 / 75", d: "오늘" },
  { k: "매매", t: "아파트 84㎡", a: "초등학교 배정, 남향", p: "7억 4,000만", d: "어제" },
  { k: "임대", t: "1층 상가 46㎡", a: "대로변, 권리금 없음", p: "3,000 / 230", d: "2일 전" },
];

export function EstateB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[70px] max-w-[1200px] items-center justify-between px-5 md:px-8">
          <p className="text-[20px] font-bold tracking-[-0.03em]">부동산 공인중개사사무소</p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#3c4450" }}>
            {["매물", "전세 안전 확인", "매도, 임대 의뢰", "오시는 길"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center rounded-[10px] px-5 text-[15px] font-bold text-white" style={{ background: C.blue }}>
            매물 문의
          </span>
        </div>
      </header>

      <section className="relative overflow-hidden px-5 pb-16 pt-12 md:px-8 md:pb-24 md:pt-16">
        <div className="absolute inset-x-0 top-0 h-[420px] md:h-[520px]">
          <Image src={`${IMG}/b-hero.jpg`} alt="강 건너로 보이는 아파트 단지" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(10,20,40,0.55) 0%, rgba(10,20,40,0.35) 60%, #ffffff 100%)" }} aria-hidden />
        </div>
        <div className="relative mx-auto max-w-[1200px]">
          <div className="text-white">
            <p className="text-[15px] font-bold text-white/80">성동구 한강변 아파트</p>
            <h1 className="mt-3 text-[36px] font-bold leading-[1.22] tracking-[-0.045em] md:text-[60px]">
              찾는 집 조건만 말씀하세요
            </h1>
            <p className="mt-4 max-w-[520px] text-[16px] text-white/85 md:text-[18px]">예산과 입주일, 꼭 필요한 것 세 가지면 충분합니다. 맞는 매물을 골라 같은 날 보여 드립니다.</p>
          </div>
          <ul className="mt-12 grid grid-cols-2 gap-3 md:mt-20 md:grid-cols-4">
            {[
              [Building2, "아파트", "매매, 전세"],
              [Building, "오피스텔", "월세, 전세"],
              [Home, "원룸, 투룸", "월세"],
              [Store, "상가, 사무실", "임대, 매매"],
            ].map(([Icon, t, s]) => {
              const I = Icon as typeof Home;
              return (
                <li key={t as string} className="flex flex-col gap-3 rounded-[20px] bg-white p-6 shadow-[0_10px_30px_rgba(20,30,50,0.1)]">
                  <span className="flex h-12 w-12 items-center justify-center rounded-[14px]" style={{ background: C.blueSoft, color: C.blue }}>
                    <I size={24} aria-hidden />
                  </span>
                  <div>
                    <p className="text-[19px] font-bold">{t as string}</p>
                    <p className="text-[14px]" style={{ color: C.sub }}>{s as string}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto max-w-[1200px]">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">새로 나온 매물</h2>
            <p className="inline-flex items-center gap-1.5 text-[15px] font-bold" style={{ color: C.blue }}>
              전체 매물 <ArrowRight size={16} aria-hidden />
            </p>
          </div>
          <ul className="mt-10 overflow-hidden rounded-[22px] border" style={{ borderColor: C.line }}>
            {NEW.map((n, i) => (
              <li key={n.t} className={`grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-1 px-6 py-5 md:grid-cols-[70px_1.2fr_1.5fr_1fr_80px] md:gap-6 ${i ? "border-t" : ""}`} style={{ borderColor: C.line }}>
                <span className="row-span-2 inline-flex justify-center rounded-[8px] px-2.5 py-1 text-[14px] font-bold md:row-span-1" style={{ background: C.blueSoft, color: C.blue }}>{n.k}</span>
                <span className="text-[18px] font-bold">{n.t}</span>
                <span className="text-[15px] md:text-[16px]" style={{ color: C.sub }}>{n.a}</span>
                <span className="col-start-2 text-[19px] font-bold tabular-nums md:col-start-auto">{n.p}</span>
                <span className="hidden text-right text-[14px] md:block" style={{ color: C.sub }}>{n.d}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto grid max-w-[1200px] gap-10 md:grid-cols-[1fr_1.2fr] md:items-center md:gap-16">
          <div>
            <p className="inline-flex items-center gap-2 text-[15px] font-bold" style={{ color: C.blue }}>
              <ShieldCheck size={18} aria-hidden />
              전세 안전 확인
            </p>
            <h2 className="mt-3 text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[40px]">보증금을 지키는 확인, 계약 전에 같이 봅니다</h2>
            <p className="mt-4" style={{ color: C.sub }}>확인 결과는 계약서 특약과 중개대상물 확인설명서에 그대로 적습니다.</p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              ["등기부등본", "소유자, 근저당, 가압류 확인"],
              ["선순위 보증금", "다가구는 먼저 들어온 보증금 합계"],
              ["건축물대장", "위반건축물, 용도 확인"],
              ["보증보험 가입", "전세보증금 반환보증 가능 여부"],
            ].map(([t, d]) => (
              <li key={t} className="rounded-[18px] bg-white p-6">
                <FileSearch size={22} style={{ color: C.blue }} aria-hidden />
                <p className="mt-3 text-[18px] font-bold">{t}</p>
                <p className="mt-1 text-[15px]" style={{ color: C.sub }}>{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 md:grid-cols-2 md:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[24px]">
            <Image src={`${IMG}/b-room.jpg`} alt="흰 소파와 원목 바닥이 있는 밝은 거실" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[40px]">집을 내놓으실 분</h2>
            <p className="mt-4" style={{ color: C.sub }}>사진 촬영과 매물 등록은 저희가 합니다. 집을 보러 오는 날은 미리 연락드리고, 방문 뒤 반응을 전해 드립니다.</p>
            <span className="mt-8 inline-flex h-[56px] items-center gap-2 rounded-[12px] px-7 text-[16px] font-bold text-white" style={{ background: C.blue }}>
              매도, 임대 의뢰하기
              <ArrowRight size={18} aria-hidden />
            </span>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto grid max-w-[1200px] gap-1.5">
          <p className="font-bold" style={{ color: C.ink }}>부동산 공인중개사사무소</p>
          <p>소재지 서울특별시 성동구 일대 | 중개사무소 등록번호 제00000-0000-00000호 | 대표 공인중개사</p>
          <p>전화 02-000-0000 | 사업자등록번호 000-00-00000</p>
        </div>
      </footer>
    </div>
  );
}
