"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

// 베이커리 시안 B 대형 베이커리 카페형(11-22 사례 분석: 커피진심베이커리처럼 커피와 빵을 함께, 로스팅과 공간을 강점으로 둔다. 주말 나들이 손님은 좌석 수, 주차, 아이와 가도 되는지, 대표 메뉴를 묻는다). 흰 바탕, 검정과 금색. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/bk/b-*)
const IMG = "/images/drafts/bk";
const C = { ink: "#151311", sub: "#67615b", line: "#e8e4df", soft: "#f5f3f0", gold: "#a77a3a" };

const MENU = [
  ["시그니처 크루아상", "버터, 아몬드, 햄치즈", "4,800원부터"],
  ["화덕 치아바타", "올리브, 감자, 바질", "5,500원부터"],
  ["핸드드립", "매장 로스팅 원두 4종", "6,500원"],
  ["바닐라빈 라테", "직접 끓인 바닐라 시럽", "6,800원"],
];

export function BkB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between px-5 md:px-10">
          <p className="text-[18px] font-bold tracking-[0.08em]">
            HEARTH <span style={{ color: C.gold }}>BAKERY</span>
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#4a4540" }}>
            {["메뉴", "공간", "이용 안내", "오시는 길"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center px-5 text-[15px] font-bold text-white" style={{ background: C.ink }}>
            단체 문의
          </span>
        </div>
      </header>

      <section className="px-5 pt-12 md:px-10 md:pt-20">
        <div className="mx-auto max-w-[1320px]">
          <p className="text-[14px] font-bold tracking-[0.2em]" style={{ color: C.gold }}>BAKERY &amp; ROASTERY</p>
          <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h1 className="text-[38px] font-bold leading-[1.2] tracking-[-0.05em] md:text-[72px]">
              화덕에서 굽고
              <br />
              옆에서 볶습니다
            </h1>
            <p className="max-w-[380px]" style={{ color: C.sub }}>
              빵은 장작 화덕에서, 커피는 매장 안 로스터에서. 2층까지 좌석 140석입니다.
            </p>
          </div>
          <div className="relative mt-10 aspect-[4/3] overflow-hidden md:aspect-[21/9]">
            <Image src={`${IMG}/b-hero.jpg`} alt="밝은 벽과 원목 의자가 놓인 빈 카페 홀" fill priority sizes="100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1320px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">대표 메뉴</h2>
          <ul className="mt-10 border-t" style={{ borderColor: C.ink }}>
            {MENU.map(([t, d, p]) => (
              <li key={t} className="grid gap-1 border-b py-6 md:grid-cols-[1.2fr_1.6fr_0.8fr_auto] md:items-center md:gap-6" style={{ borderColor: C.line }}>
                <h3 className="text-[23px] font-bold tracking-[-0.03em]">{t}</h3>
                <p style={{ color: C.sub }}>{d}</p>
                <p className="font-bold tabular-nums" style={{ color: C.gold }}>{p}</p>
                <ArrowRight size={20} className="hidden md:block" aria-hidden />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 md:px-10" style={{ background: C.soft }}>
        <div className="mx-auto grid max-w-[1320px] items-center gap-10 py-20 md:grid-cols-2 md:gap-16 md:py-28">
          <div className="grid grid-cols-2 gap-3">
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image src={`${IMG}/b-oven.jpg`} alt="장작 화덕 안에서 익는 빵" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image src={`${IMG}/b-pastry.jpg`} alt="진열대에 가득 놓인 크루아상" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
          </div>
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">층별 공간</h2>
            <dl className="mt-7 border-t" style={{ borderColor: C.ink }}>
              {[
                ["1층", "빵 진열대, 화덕, 주문대, 60석"],
                ["2층", "로스터리 창가석, 단체석 12인, 80석"],
                ["정원", "봄부터 가을까지 테라스 20석"],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[72px_1fr] gap-3 border-b py-4" style={{ borderColor: "#dcd6cf" }}>
                  <dt className="font-bold">{k}</dt>
                  <dd style={{ color: C.sub }}>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1320px] gap-4 md:grid-cols-2">
          <div className="border p-8 md:p-10" style={{ borderColor: C.line }}>
            <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">이용 안내</h2>
            <ul className="mt-5 grid gap-2.5" style={{ color: C.sub }}>
              <li className="border-b pb-2.5" style={{ borderColor: C.line }}>매일 10:00 ~ 22:00, 빵은 11:00부터</li>
              <li className="border-b pb-2.5" style={{ borderColor: C.line }}>주차 50대, 2시간 무료</li>
              <li className="border-b pb-2.5" style={{ borderColor: C.line }}>유아 의자, 수유실 1층</li>
              <li>반려견은 정원 테라스만</li>
            </ul>
          </div>
          <div className="flex flex-col justify-between gap-8 bg-black p-8 text-white md:p-10">
            <div>
              <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">단체, 선물 세트</h2>
              <p className="mt-3 text-white/70">15인 이상 단체석과 빵 선물 상자는 이틀 전까지 전화로 받습니다. 김포 한강신도시, 운양역에서 차로 7분.</p>
            </div>
            <p className="text-[28px] font-bold tabular-nums" style={{ color: C.gold }}>031-000-0000</p>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-10" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2 md:flex-row md:justify-between">
          <p>HEARTH BAKERY 하스 베이커리, 경기도 김포시 일대. 사업자등록번호 000-00-00000</p>
          <p>031-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
